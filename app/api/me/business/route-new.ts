import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getStorage } from "@/lib/storage/unified-storage";
import { calculateBusinessCompletion } from "@/lib/business-utils";

// GET /api/me/business - Liste tous les business de l'utilisateur
export async function GET() {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const storage = getStorage();
    const businesses = await storage.getAllBusinesses(user.id);

    // Calculer le score de complétion pour chaque business
    const businessesWithScores = businesses.map((business) => {
      const metrics = calculateBusinessCompletion(business);
      return {
        ...business,
        completion_score: metrics.completion_score,
        tasks_completed: metrics.tasks_completed,
        total_tasks: metrics.total_tasks
      };
    });

    return NextResponse.json({
      ok: true,
      businesses: businessesWithScores,
      count: businessesWithScores.length
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Failed to fetch businesses",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
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

    const storage = getStorage();
    const existingBusinesses = await storage.getAllBusinesses(user.id);

    if (existingBusinesses.length >= 10) {
      return NextResponse.json(
        { ok: false, error: "Maximum number of businesses reached (10)" },
        { status: 400 }
      );
    }

    // Créer le business
    const businessData = {
      userId: user.id,
      user_id: user.id, // Pour compatibilité
      business_id: `bus_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      industry: industry.trim(),
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
        timestamp: new Date().toISOString(),
        agent: "Ezia",
        interaction_type: "business_creation",
        summary: `Business "${name}" créé avec succès`,
        recommendations: [
          "Compléter l'analyse de marché",
          "Définir votre proposition de valeur",
          "Créer votre premier site web"
        ]
      }],
      metrics: {
        website_visitors: 0,
        conversion_rate: 0,
        monthly_growth: 0,
        task_completion: 0
      },
      goals: [],
      completion_score: 0
    };

    const createdBusiness = await storage.createBusiness(businessData);

    return NextResponse.json({
      ok: true,
      business: createdBusiness,
      message: "Business created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create business" },
      { status: 500 }
    );
  }
}