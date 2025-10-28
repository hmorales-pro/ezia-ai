import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { nanoid } from "nanoid";
import { runAllAgentsForBusiness } from '@/lib/agents';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();

    // Récupérer les business de l'utilisateur depuis MongoDB
    const userBusinesses = await Business.find({
      user_id: decoded.userId,
      is_active: true
    })
      .sort({ _createdAt: -1 })
      .select('-__v')
      .lean();

    console.log(`🏢 [Business-Simple] Loaded ${userBusinesses.length} businesses for user ${decoded.userId} from MongoDB`);

    return NextResponse.json({
      ok: true,
      businesses: userBusinesses
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };

    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    const data = await req.json();

    await dbConnect();

    // Créer le business dans MongoDB
    const businessId = `biz_${nanoid(12)}`;
    const businessData = {
      business_id: businessId,
      user_id: decoded.userId,
      name: data.name,
      description: data.description,
      industry: data.industry,
      stage: data.stage,
      hasWebsite: data.hasWebsite || 'no',
      wantsWebsite: data.wantsWebsite || 'no',
      existingWebsiteUrl: data.existingWebsiteUrl || '',
      completion_score: 20,
      ezia_interactions: [{
        timestamp: new Date(),
        agent: "Ezia",
        interaction_type: "business_creation",
        summary: "Business créé avec succès"
      }],
      agents_status: {
        market_analysis: 'pending',
        competitor_analysis: 'pending',
        marketing_strategy: 'pending',
        website_prompt: 'pending'
      },
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
      metrics: {},
      goals: [],
      is_active: true
    };

    const business = await Business.create(businessData);
    const createdBusiness = await Business.findById(business._id)
      .select('-__v')
      .lean();

    console.log(`✅ [Business-Simple] Business "${data.name}" successfully saved to MongoDB`);
    console.log(`   - Business ID: ${businessId}`);
    console.log(`   - User: ${decoded.userId}`);

    // Lancer les analyses par les agents de manière asynchrone (ne pas bloquer la réponse)
    runAllAgentsForBusiness({
      business_id: businessId,
      user_id: decoded.userId,
      name: data.name,
      description: data.description,
      industry: data.industry,
      stage: data.stage
    }).then(async (analyses) => {
      console.log(`[Business-Simple] Analyses terminées pour ${data.name}`);

      try {
        await dbConnect();
        await Business.findOneAndUpdate(
          { business_id: businessId },
          {
            $set: {
              ...analyses,
              agents_status: {
                market_analysis: 'completed',
                competitor_analysis: 'completed',
                marketing_strategy: 'completed',
                website_prompt: 'completed'
              },
              completion_score: 60
            },
            $push: {
              ezia_interactions: {
                $each: [
                  {
                    timestamp: new Date(),
                    agent: "Agent Marché",
                    interaction_type: "market_analysis",
                    summary: "Analyse de marché complétée"
                  },
                  {
                    timestamp: new Date(),
                    agent: "Agent Concurrence",
                    interaction_type: "competitor_analysis",
                    summary: "Analyse de la concurrence complétée"
                  },
                  {
                    timestamp: new Date(),
                    agent: "Agent Marketing",
                    interaction_type: "marketing_strategy",
                    summary: "Stratégie marketing définie"
                  },
                  {
                    timestamp: new Date(),
                    agent: "Agent Website",
                    interaction_type: "website_prompt",
                    summary: "Prompt pour le site web généré"
                  }
                ]
              }
            }
          }
        );

        console.log(`✅ [Business-Simple] Analyses saved to MongoDB for ${data.name}`);
      } catch (error) {
        console.error(`❌ [Business-Simple] Error saving analyses:`, error);
      }
    }).catch(error => {
      console.error(`[Business-Simple] Erreur lors des analyses pour ${data.name}:`, error);

      // Mettre à jour le statut en cas d'erreur
      Business.findOneAndUpdate(
        { business_id: businessId },
        {
          $set: {
            agents_status: {
              market_analysis: 'failed',
              competitor_analysis: 'failed',
              marketing_strategy: 'failed',
              website_prompt: 'failed'
            }
          }
        }
      ).catch(console.error);
    });

    return NextResponse.json({
      ok: true,
      business: createdBusiness,
      message: "Business créé avec succès. Les analyses sont en cours et seront disponibles dans quelques instants."
    });
  } catch (error) {
    console.error('Create business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
