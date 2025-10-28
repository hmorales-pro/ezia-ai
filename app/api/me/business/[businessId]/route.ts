import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

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

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

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

    console.log(`🏢 [Business] Loaded business ${businessId} from MongoDB`);

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

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();

    // Utiliser $set pour éviter les problèmes de validation sur les champs non modifiés
    const updateFields: any = { _updatedAt: new Date() };

    // Préparer les champs à mettre à jour avec $set
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields[key] = updates[key];
      }
    });

    const updatedBusiness = await Business.findOneAndUpdate(
      {
        business_id: businessId,
        user_id: user.id,
        is_active: true
      },
      { $set: updateFields },
      { new: true, runValidators: false } // Désactiver la validation pour éviter les erreurs sur les champs non modifiés
    )
      .select('-__v')
      .lean();

    if (!updatedBusiness) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    console.log(`🏢 [Business] Updated business ${businessId} in MongoDB`);

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

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();
    const result = await Business.findOneAndUpdate(
      {
        business_id: businessId,
        user_id: user.id,
        is_active: true
      },
      { is_active: false, _updatedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    console.log(`🏢 [Business] Soft-deleted business ${businessId} in MongoDB`);

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
