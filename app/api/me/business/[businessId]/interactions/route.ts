import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from "@/lib/database";

// POST /api/me/business/[businessId]/interactions - Ajouter une interaction
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
    const interaction = await request.json();
    
    // Ajouter le timestamp si non présent
    if (!interaction.timestamp) {
      interaction.timestamp = new Date();
    }

    const db = getDB();
    
    // Vérifier que le business existe et appartient à l'utilisateur
    const business = await db.findBusinessById(businessId);
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }
    
    // Ajouter l'interaction
    const interactions = business.ezia_interactions || [];
    interactions.push(interaction);
    
    const result = await db.updateBusiness(businessId, {
      ezia_interactions: interactions,
      _updatedAt: new Date()
    });

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Failed to add interaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      interaction,
      message: "Interaction added successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding interaction:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to add interaction" },
      { status: 500 }
    );
  }
}

// GET /api/me/business/[businessId]/interactions - Récupérer les interactions
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
    
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      interactions: business.ezia_interactions || []
    });

  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}