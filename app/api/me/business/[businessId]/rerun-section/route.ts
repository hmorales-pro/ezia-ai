import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { getDB } from '@/lib/database';
import { runAgentForAnalysis } from "@/lib/agents";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mapping des sections vers les types d'analyse
const SECTION_TO_ANALYSIS_MAP: Record<string, string> = {
  'executive_summary': 'market_analysis',
  'market_overview': 'market_analysis',
  'trends': 'market_analysis',
  'target_audience': 'market_analysis',
  'pestel': 'market_analysis',
  'porter': 'market_analysis',
  'swot': 'market_analysis',
  'recommendations': 'market_analysis',
  'competitive': 'competitor_analysis',
  'marketing': 'marketing_strategy',
  'website': 'website_prompt'
};

export async function POST(
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

    const { section, mode = 'rerun' } = await request.json();
    
    if (!section) {
      return NextResponse.json({ error: "Section is required" }, { status: 400 });
    }

    // Mapper la section au type d'analyse
    const analysisType = SECTION_TO_ANALYSIS_MAP[section];
    if (!analysisType) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const db = getDB();
    const business = await db.findBusinessById(businessId);

    if (!business || business.user_id !== userId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Lancer l'analyse de manière asynchrone
    setTimeout(async () => {
      try {
        console.log(`[Rerun Section] Mode: ${mode}, Section: ${section}, Analysis: ${analysisType}`);
        
        // Pour le mode "deepen", on passe l'analyse existante pour contexte
        let existingData = null;
        if (mode === 'deepen' && business[analysisType]) {
          existingData = business[analysisType];
        }

        // Générer l'analyse (avec contexte si mode deepen)
        const analysisResult = await runAgentForAnalysis(
          analysisType,
          business.name,
          business.industry,
          business.stage,
          business.description,
          existingData // Passer les données existantes pour approfondissement
        );

        // Si c'est une section spécifique, on peut merger avec l'existant
        let finalResult = analysisResult;
        if (mode === 'deepen' && existingData) {
          // Merger intelligemment les nouvelles données avec les anciennes
          finalResult = mergeAnalysisData(existingData, analysisResult, section);
        }

        // Mettre à jour la base de données
        await db.updateBusiness(businessId, {
          [analysisType]: finalResult,
          agents_status: {
            ...business.agents_status,
            [analysisType]: 'completed'
          }
        });
        
        console.log(`[Rerun Section] Successfully updated ${section} (${analysisType})`);
        
      } catch (error) {
        console.error(`[Rerun Section] Error:`, error);
        await db.updateBusiness(businessId, {
          agents_status: {
            ...business.agents_status,
            [analysisType]: 'failed'
          }
        });
      }
    }, 100);

    return NextResponse.json({ 
      success: true,
      message: mode === 'deepen' 
        ? `Approfondissement de ${section} lancé`
        : `Relance de l'analyse ${section} lancée`
    });

  } catch (error) {
    console.error("Error in rerun-section:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fonction pour merger intelligemment les données
function mergeAnalysisData(existing: any, newData: any, section: string): any {
  // Pour l'instant, on remplace simplement
  // TODO: Implémenter une logique de merge plus sophistiquée selon la section
  return {
    ...existing,
    ...newData,
    // Ajouter un marqueur pour indiquer que c'est approfondi
    _deepened: true,
    _deepenedAt: new Date().toISOString()
  };
}