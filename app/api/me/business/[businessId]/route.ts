import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

// Utiliser le même stockage en mémoire que business-simple
declare global {
  var businesses: any[];
}

if (!global.businesses) {
  global.businesses = [];
}

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
      console.log("Using global.businesses for business fetch");
      // Utiliser global.businesses au lieu de MemoryDB
      business = global.businesses.find(
        b => b.business_id === businessId && b.userId === user.id
      );
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
      // Utiliser global.businesses au lieu de MemoryDB pour la cohérence
      const businessIndex = global.businesses.findIndex(
        b => b.business_id === businessId && b.userId === user.id
      );
      
      if (businessIndex === -1) {
        return NextResponse.json(
          { ok: false, error: "Business not found in memory" },
          { status: 404 }
        );
      }
      
      // Préparer les mises à jour
      const updateFields: any = { _updatedAt: new Date().toISOString() };
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields[key] = updates[key];
        }
      });
      
      // Mettre à jour le business
      global.businesses[businessIndex] = {
        ...global.businesses[businessIndex],
        ...updateFields
      };
      
      updatedBusiness = global.businesses[businessIndex];
    } else {
      await dbConnect();
      // Utiliser $set pour éviter les problèmes de validation sur les champs non modifiés
      const updateFields: any = { _updatedAt: new Date() };
      
      // Préparer les champs à mettre à jour avec $set
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields[key] = updates[key];
        }
      });
      
      updatedBusiness = await Business.findOneAndUpdate(
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
      // Utiliser global.businesses
      const businessIndex = global.businesses.findIndex(
        b => b.business_id === businessId && b.userId === user.id
      );
      
      if (businessIndex === -1) {
        return NextResponse.json(
          { ok: false, error: "Business not found" },
          { status: 404 }
        );
      }
      
      // Marquer comme inactif au lieu de supprimer
      global.businesses[businessIndex].is_active = false;
      global.businesses[businessIndex]._updatedAt = new Date().toISOString();
      result = true;
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