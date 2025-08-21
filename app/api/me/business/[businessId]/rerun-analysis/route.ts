import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { runAgentForAnalysis } from "@/lib/agents";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utiliser le même stockage en mémoire que business-simple
declare global {
  var businesses: any[];
}

if (!global.businesses) {
  global.businesses = [];
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    // Récupérer les params
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { analysisType } = await request.json();
    
    if (!analysisType) {
      return NextResponse.json({ error: "Analysis type is required" }, { status: 400 });
    }

    // Récupérer les données du business depuis la mémoire globale
    const business = global.businesses.find(
      b => b.business_id === businessId && b.userId === userId
    );

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Mettre à jour le statut de l'analyse pour la relancer
    if (!business.agents_status) {
      business.agents_status = {};
    }

    // Réinitialiser le statut de l'analyse spécifique
    business.agents_status[analysisType] = 'pending';
    
    // Effacer les données existantes de cette analyse
    if (analysisType === 'market_analysis') {
      delete business.market_analysis;
    } else if (analysisType === 'marketing_strategy') {
      delete business.marketing_strategy;
    } else if (analysisType === 'competitor_analysis') {
      delete business.competitor_analysis;
    } else if (analysisType === 'website_prompt') {
      delete business.website_prompt;
    }

    // Lancer l'analyse de manière asynchrone
    setTimeout(async () => {
      try {
        // Mettre à jour le statut en "in_progress"
        business.agents_status[analysisType] = 'in_progress';

        // Générer de vraies données avec l'IA en utilisant les VRAIES données du business
        const analysisResult = await runAgentForAnalysis(
          analysisType,
          business.name,
          business.industry,
          business.stage,
          business.description
        );

        // Trouver l'index du business pour le mettre à jour
        const businessIndex = global.businesses.findIndex(
          b => b.business_id === businessId && b.userId === userId
        );
        
        if (businessIndex !== -1) {
          // Sauvegarder les résultats
          global.businesses[businessIndex][analysisType] = analysisResult;
          global.businesses[businessIndex].agents_status[analysisType] = 'completed';
        }
      } catch (error) {
        console.error(`Error running ${analysisType}:`, error);
        // Mettre à jour le statut en cas d'erreur
        const businessIndex = global.businesses.findIndex(
          b => b.business_id === businessId && b.userId === userId
        );
        if (businessIndex !== -1) {
          global.businesses[businessIndex].agents_status[analysisType] = 'failed';
        }
      }
    }, 100);

    return NextResponse.json({ 
      success: true,
      message: `L'analyse ${analysisType} a été relancée avec succès`
    });

  } catch (error) {
    console.error("Error rerunning analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer le statut actuel
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Récupérer les données du business depuis la mémoire globale
    const business = global.businesses.find(
      b => b.business_id === businessId && b.userId === userId
    );

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({
      agents_status: business.agents_status || {},
      market_analysis: business.market_analysis,
      marketing_strategy: business.marketing_strategy,
      competitor_analysis: business.competitor_analysis,
      website_prompt: business.website_prompt
    });

  } catch (error) {
    console.error("Error getting analysis status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}