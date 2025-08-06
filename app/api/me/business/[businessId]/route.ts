import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

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
    let business;
    
    if (isUsingMemoryDB()) {
      console.log("Using in-memory database for business fetch");
      const memoryDB = getMemoryDB();
      business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      business = await Business.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      })
        .select('-__v')
        .lean();
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
    
    let updatedBusiness;
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const existing = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
      
      if (!existing) {
        return NextResponse.json(
          { ok: false, error: "Business not found" },
          { status: 404 }
        );
      }
      
      updatedBusiness = await memoryDB.update(
        { business_id: businessId, user_id: user.id },
        { ...updates, _updatedAt: new Date() }
      );
    } else {
      await dbConnect();
      updatedBusiness = await Business.findOneAndUpdate(
        {
          business_id: businessId,
          user_id: user.id,
          is_active: true
        },
        { ...updates, _updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .select('-__v')
        .lean();
    }

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
    let result;
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const existing = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
      
      if (!existing) {
        return NextResponse.json(
          { ok: false, error: "Business not found" },
          { status: 404 }
        );
      }
      
      result = await memoryDB.update(
        { business_id: businessId, user_id: user.id },
        { is_active: false, _updatedAt: new Date() }
      );
    } else {
      await dbConnect();
      result = await Business.findOneAndUpdate(
        {
          business_id: businessId,
          user_id: user.id,
          is_active: true
        },
        { is_active: false, _updatedAt: new Date() },
        { new: true }
      );
    }

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