import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

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

    let result;
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const business = await memoryDB.findOne({
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
      
      const interactions = business.ezia_interactions || [];
      interactions.push(interaction);
      
      result = await memoryDB.update(
        { business_id: businessId },
        { ezia_interactions: interactions }
      );
    } else {
      await dbConnect();
      result = await Business.findOneAndUpdate(
        {
          business_id: businessId,
          user_id: user.id,
          is_active: true
        },
        {
          $push: {
            ezia_interactions: interaction
          }
        },
        { new: true }
      );
    }

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Failed to add interaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Interaction added successfully"
    });
  } catch (error) {
    console.error("Error adding interaction:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to add interaction" },
      { status: 500 }
    );
  }
}