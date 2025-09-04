import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { nanoid } from "nanoid";
import { getDB } from "@/lib/database";

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
    const db = getDB();
    
    const business = await db.findBusinessById(businessId);
    
    // Vérifier que le business appartient à l'utilisateur
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }


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

    const db = getDB();
    
    // Vérifier que le business existe et appartient à l'utilisateur
    const business = await db.findBusinessById(businessId);
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Ajouter le nouvel objectif
    const goals = business.goals || [];
    goals.push(newGoal);
    
    // Ajouter une interaction Ezia
    const interaction = {
      timestamp: new Date(),
      agent: "Ezia",
      interaction_type: "goal_creation",
      summary: `Nouvel objectif créé : "${title}"`,
      recommendations: [
        "Définissez des jalons intermédiaires",
        "Suivez régulièrement votre progression",
        "Ajustez vos actions pour atteindre cet objectif"
      ]
    };
    
    // Ajouter l'interaction Ezia
    const ezia_interactions = business.ezia_interactions || [];
    ezia_interactions.push(interaction);
    
    // Mettre à jour le business avec les nouveaux objectifs et interactions
    await db.updateBusiness(businessId, {
      goals: goals,
      ezia_interactions: ezia_interactions
    });

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

    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id
      });
      
      if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      const goalIndex = business.goals?.findIndex((g: any) => g.goal_id === goal_id);
      if (goalIndex === -1 || goalIndex === undefined) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      // Mettre à jour l'objectif
      if (progress !== undefined) {
        business.goals[goalIndex].progress = update.progress;
      }
      if (status) {
        business.goals[goalIndex].status = status;
        if (status === 'completed') {
          business.goals[goalIndex].completed_at = new Date();
        }
      }
      
      // Ajouter la mise à jour à l'historique
      business.goals[goalIndex].updates = business.goals[goalIndex].updates || [];
      business.goals[goalIndex].updates.push(update);

      // Ajouter un jalon si fourni
      if (milestone) {
        business.goals[goalIndex].milestones = business.goals[goalIndex].milestones || [];
        business.goals[goalIndex].milestones.push({
          ...milestone,
          achieved_at: new Date()
        });
      }

      await memoryDB.updateBusiness(businessId, { goals: business.goals });
    } else {
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
    }

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