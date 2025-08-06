import { NextResponse } from "next/server";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

// Test endpoint pour créer et lister des business sans authentification
// NE PAS UTILISER EN PRODUCTION

// GET /api/test/business - Liste les business de test
export async function GET() {
  const testUserId = "test_user_123";
  
  try {
    let businesses;
    
    if (isUsingMemoryDB()) {
      console.log("Using in-memory database for test");
      const memoryDB = getMemoryDB();
      businesses = await memoryDB.find({
        user_id: testUserId,
        is_active: true
      });
    } else {
      await dbConnect();
      businesses = await Business.find({
        user_id: testUserId,
        is_active: true
      })
        .sort({ _createdAt: -1 })
        .limit(50)
        .select('-__v')
        .lean();
    }

    return NextResponse.json({
      ok: true,
      businesses,
      count: businesses.length,
      test: true
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch test businesses" },
      { status: 500 }
    );
  }
}

// POST /api/test/business - Créer un business de test
export async function POST(request: Request) {
  const testUserId = "test_user_123";
  
  try {
    const body = await request.json();
    const { name, description, industry, stage } = body;

    if (!name || !description || !industry || !stage) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const businessData = {
      user_id: testUserId,
      business_id: `test_biz_${Date.now()}`,
      name,
      description,
      industry,
      stage,
      is_active: true,
      social_media: {},
      market_analysis: {
        target_audience: "",
        value_proposition: "",
        competitors: [],
        opportunities: [],
        threats: []
      },
      marketing_strategy: {
        positioning: "",
        key_messages: [],
        channels: [],
        content_calendar: []
      },
      ezia_interactions: [{
        timestamp: new Date(),
        agent: "Ezia",
        type: "business_creation",
        summary: `Business de test "${name}" créé`,
        recommendations: []
      }],
      metrics: {},
      goals: []
    };

    let createdBusiness;
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      createdBusiness = await memoryDB.create(businessData);
    } else {
      await dbConnect();
      const business = await Business.create(businessData);
      createdBusiness = await Business.findById(business._id)
        .select('-__v')
        .lean();
    }

    return NextResponse.json({
      ok: true,
      business: createdBusiness,
      message: "Test business created successfully",
      test: true
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating test business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create test business" },
      { status: 500 }
    );
  }
}