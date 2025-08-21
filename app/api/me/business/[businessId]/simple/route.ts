import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utiliser le même stockage en mémoire que business-simple
declare global {
  var businesses: any[];
}

if (!global.businesses) {
  global.businesses = [];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Await params
    const { businessId } = await params;
    
    // Trouver le business
    const business = global.businesses.find(
      b => b.business_id === businessId && b.userId === decoded.userId
    );
    
    if (!business) {
      // Créer un business de démonstration si aucun n'existe
      const demoBusiness = {
        _id: businessId,
        business_id: businessId,
        userId: decoded.userId,
        name: "Business de Démonstration",
        description: "Un business créé pour la démonstration",
        industry: "technology",
        stage: "startup",
        _createdAt: new Date().toISOString(),
        completion_score: 20,
        ezia_interactions: [{
          timestamp: new Date().toISOString(),
          agent: "Ezia",
          interaction_type: "business_creation",
          summary: "Business de démonstration créé"
        }],
        metrics: {
          website_visitors: 0,
          conversion_rate: 0,
          monthly_growth: 0,
          task_completion: 20
        },
        agents_status: {
          market_analysis: 'pending',
          competitor_analysis: 'pending',
          marketing_strategy: 'pending',
          website_prompt: 'pending'
        }
      };
      global.businesses.push(demoBusiness);
      
      // Importer et lancer les agents pour le business de démo
      import('@/lib/agents').then(({ runAllAgentsForBusiness }) => {
        runAllAgentsForBusiness(demoBusiness).then(analyses => {
          const idx = global.businesses.findIndex(b => b.business_id === businessId);
          if (idx !== -1) {
            global.businesses[idx] = {
              ...global.businesses[idx],
              ...analyses,
              agents_status: {
                market_analysis: 'completed',
                competitor_analysis: 'completed',
                marketing_strategy: 'completed',
                website_prompt: 'completed'
              },
              completion_score: 60
            };
          }
        });
      });
      
      return NextResponse.json({ ok: true, business: demoBusiness });
    }
    
    return NextResponse.json({ ok: true, business });
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const updates = await req.json();
    
    // Await params
    const { businessId } = await params;
    
    // Trouver et mettre à jour le business
    const businessIndex = global.businesses.findIndex(
      b => b.business_id === businessId && b.userId === decoded.userId
    );
    
    if (businessIndex === -1) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }
    
    global.businesses[businessIndex] = {
      ...global.businesses[businessIndex],
      ...updates,
      _updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      ok: true, 
      business: global.businesses[businessIndex]
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}