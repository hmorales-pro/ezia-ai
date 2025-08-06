import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { nanoid } from "nanoid";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

// GET /api/me/business - Liste tous les business de l'utilisateur
export async function GET() {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let businesses;
    
    if (isUsingMemoryDB()) {
      console.log("Using in-memory database for businesses");
      const memoryDB = getMemoryDB();
      businesses = await memoryDB.find({
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      businesses = await Business.find({
        user_id: user.id,
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
      count: businesses.length
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // En production, log plus de détails
    if (process.env.NODE_ENV === "production") {
      console.error("Database type:", isUsingMemoryDB() ? "memory" : "mongodb");
      console.error("MongoDB URI configured:", !!process.env.MONGODB_URI);
    }
    
    return NextResponse.json(
      { 
        ok: false, 
        error: "Failed to fetch businesses",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/me/business - Créer un nouveau business
export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, industry, stage } = body;

    // Validation des champs requis
    if (!name || !description || !industry || !stage) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, description, industry, stage" },
        { status: 400 }
      );
    }

    // Validation du stage
    const validStages = ['idea', 'startup', 'growth', 'established'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { ok: false, error: "Invalid stage. Must be one of: idea, startup, growth, established" },
        { status: 400 }
      );
    }

    let existingCount: number;
    
    if (isUsingMemoryDB()) {
      console.log("Using in-memory database for business creation");
      const memoryDB = getMemoryDB();
      existingCount = await memoryDB.countDocuments({
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      existingCount = await Business.countDocuments({
        user_id: user.id,
        is_active: true
      });
    }

    if (existingCount >= 10) {
      return NextResponse.json(
        { ok: false, error: "Maximum number of businesses reached (10)" },
        { status: 400 }
      );
    }

    // Créer le business
    const businessData = {
      user_id: user.id,
      business_id: `biz_${nanoid(12)}`,
      name: name.trim(),
      description: description.trim(),
      industry: industry.trim(),
      stage,
      // Initialiser avec les valeurs par défaut
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
        interaction_type: "business_creation",
        summary: `Business "${name}" créé avec succès`,
        recommendations: [
          "Compléter l'analyse de marché",
          "Définir votre proposition de valeur",
          "Créer votre premier site web"
        ]
      }],
      metrics: {},
      goals: [],
      is_active: true
    };

    let createdBusiness;
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      createdBusiness = await memoryDB.create(businessData);
    } else {
      const business = await Business.create(businessData);
      createdBusiness = await Business.findById(business._id)
        .select('-__v')
        .lean();
    }

    return NextResponse.json({
      ok: true,
      business: createdBusiness,
      message: "Business created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating business:", error);
    
    // Gérer les erreurs de duplication
    if ((error as Error & {code?: number}).code === 11000) {
      return NextResponse.json(
        { ok: false, error: "A business with this ID already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create business" },
      { status: 500 }
    );
  }
}