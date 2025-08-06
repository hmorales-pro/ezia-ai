import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { nanoid } from "nanoid";

// GET /api/me/business - Liste tous les business de l'utilisateur
export async function GET(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const businesses = await Business.find({
      user_id: user.id,
      is_active: true
    })
      .sort({ _createdAt: -1 })
      .limit(50)
      .select('-__v')
      .lean();

    return NextResponse.json({
      ok: true,
      businesses,
      count: businesses.length
    });
  } catch (error: any) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch businesses" },
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

    await dbConnect();

    // Vérifier le nombre de business existants (limite à 10 par utilisateur)
    const existingCount = await Business.countDocuments({
      user_id: user.id,
      is_active: true
    });

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
        type: "business_creation",
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

    const business = await Business.create(businessData);

    // Retourner le business créé
    const createdBusiness = await Business.findById(business._id)
      .select('-__v')
      .lean();

    return NextResponse.json({
      ok: true,
      business: createdBusiness,
      message: "Business created successfully"
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating business:", error);
    
    // Gérer les erreurs de duplication
    if (error.code === 11000) {
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