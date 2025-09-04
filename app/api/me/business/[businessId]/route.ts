import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from "@/lib/database";

// GET /api/me/business/[businessId] - Récupérer un business spécifique
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
    if (business && business.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const updates = await request.json();
    
    // Empêcher la modification de certains champs
    delete updates._id;
    delete updates.business_id;
    delete updates.user_id;
    delete updates._createdAt;
    
    const db = getDB();
    
    // Vérifier que le business existe et appartient à l'utilisateur
    const existingBusiness = await db.findBusinessById(businessId);
    if (!existingBusiness || existingBusiness.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }
    
    // Préparer les mises à jour
    const updateFields: any = { _updatedAt: new Date() };
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields[key] = updates[key];
      }
    });
    
    const updatedBusiness = await db.updateBusiness(businessId, updateFields);

    if (!updatedBusiness) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

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

// DELETE /api/me/business/[businessId] - Supprimer un business (soft delete)
export async function DELETE(
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
    
    // Vérifier que le business existe et appartient à l'utilisateur
    const existingBusiness = await db.findBusinessById(businessId);
    if (!existingBusiness || existingBusiness.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }
    
    // Soft delete: marquer comme inactif
    const result = await db.updateBusiness(businessId, {
      is_active: false,
      _updatedAt: new Date()
    });

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Business deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete business" },
      { status: 500 }
    );
  }
}