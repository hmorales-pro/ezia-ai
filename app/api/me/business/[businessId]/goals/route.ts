import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { nanoid } from "nanoid";

// GET /api/me/business/[businessId]/goals - Liste tous les objectifs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    }).lean();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    console.log(`🎯 [Goals] Loaded ${business.goals?.length || 0} goals for business ${businessId} from MongoDB`);

    return NextResponse.json({
      ok: true,
      goals: business.goals || []
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/me/business/[businessId]/goals - Créer un nouvel objectif
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await request.json();
    const { title, description, target_date, category, metrics } = body;

    // Validation
    if (!title || !description || !target_date || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, target_date, category" },
        { status: 400 }
      );
    }

    // Validation de la catégorie
    const validCategories = ['revenue', 'growth', 'product', 'marketing', 'operations', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const newGoal = {
      goal_id: `goal_${nanoid(12)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      target_date: new Date(target_date),
      created_at: new Date(),
      status: 'active',
      progress: 0,
      metrics: metrics || {},
      milestones: [],
      updates: [{
        date: new Date(),
        note: "Objectif créé",
        progress: 0
      }]
    };

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();
    const result = await Business.findOneAndUpdate(
      { business_id: businessId, user_id: user.id },
      {
        $push: {
          goals: newGoal,
          ezia_interactions: {
            timestamp: new Date(),
            agent: "Ezia",
            interaction_type: "goal_creation",
            summary: `Nouvel objectif créé : "${title}"`,
            recommendations: [
              "Définissez des jalons intermédiaires",
              "Suivez régulièrement votre progression",
              "Ajustez vos actions pour atteindre cet objectif"
            ]
          }
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    console.log(`🎯 [Goals] Created goal "${title}" for business ${businessId} in MongoDB`);

    return NextResponse.json({
      ok: true,
      goal: newGoal,
      message: "Goal created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

// PATCH /api/me/business/[businessId]/goals - Mettre à jour un objectif
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await request.json();
    const { goal_id, progress, status, note, milestone } = body;

    if (!goal_id) {
      return NextResponse.json(
        { error: "goal_id is required" },
        { status: 400 }
      );
    }

    const update: any = {
      date: new Date(),
      updated_by: user.id
    };

    if (progress !== undefined) {
      update.progress = Math.min(100, Math.max(0, progress));
    }
    if (status) {
      const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      update.status = status;
    }
    if (note) {
      update.note = note;
    }

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();

    // Construire la mise à jour MongoDB
    const updateQuery: any = {
      $push: { "goals.$[goal].updates": update }
    };

    if (progress !== undefined) {
      updateQuery.$set = { ...updateQuery.$set, "goals.$[goal].progress": update.progress };
    }
    if (status) {
      updateQuery.$set = { ...updateQuery.$set, "goals.$[goal].status": status };
      if (status === 'completed') {
        updateQuery.$set["goals.$[goal].completed_at"] = new Date();
      }
    }
    if (milestone) {
      updateQuery.$push["goals.$[goal].milestones"] = {
        ...milestone,
        achieved_at: new Date()
      };
    }

    const result = await Business.findOneAndUpdate(
      { business_id: businessId, user_id: user.id },
      updateQuery,
      {
        arrayFilters: [{ "goal.goal_id": goal_id }],
        new: true
      }
    );

    if (!result) {
      return NextResponse.json({ error: "Business or goal not found" }, { status: 404 });
    }

    console.log(`🎯 [Goals] Updated goal ${goal_id} for business ${businessId} in MongoDB`);

    return NextResponse.json({
      ok: true,
      message: "Goal updated successfully"
    });

  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}
