import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

// GET /api/me/business/[businessId] - Récupérer un business spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    await dbConnect();

    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    })
      .select('-__v')
      .lean();

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      business
    });

  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

// PUT /api/me/business/[businessId] - Mettre à jour un business
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const updates = await request.json();
    
    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Liste des champs modifiables
    const allowedFields = [
      'name', 'description', 'industry', 'stage',
      'email', 'phone', 'website_url',
      'social_media', 'market_analysis', 'marketing_strategy',
      'goals', 'metrics'
    ];

    // Filtrer uniquement les champs autorisés
    const filteredUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Valider le stage si présent
    if (filteredUpdates.stage) {
      const validStages = ['idea', 'startup', 'growth', 'established'];
      if (!validStages.includes(filteredUpdates.stage as string)) {
        return NextResponse.json(
          { ok: false, error: "Invalid stage value" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le business
    const updatedBusiness = await Business.findOneAndUpdate(
      { business_id: businessId },
      { 
        $set: filteredUpdates,
        $push: {
          ezia_interactions: {
            timestamp: new Date(),
            agent: "Ezia",
            interaction_type: "business_update",
            summary: `Business mis à jour: ${Object.keys(filteredUpdates).join(', ')}`
          }
        }
      },
      { new: true, runValidators: true }
    )
      .select('-__v')
      .lean();

    return NextResponse.json({
      ok: true,
      business: updatedBusiness,
      message: "Business updated successfully"
    });

  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update business" },
      { status: 500 }
    );
  }
}

// DELETE /api/me/business/[businessId] - Désactiver un business (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Soft delete - marquer comme inactif
    await Business.findOneAndUpdate(
      { business_id: businessId },
      { 
        $set: { is_active: false },
        $push: {
          ezia_interactions: {
            timestamp: new Date(),
            agent: "Ezia",
            interaction_type: "business_deletion",
            summary: "Business archivé"
          }
        }
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Business archived successfully"
    });

  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete business" },
      { status: 500 }
    );
  }
}