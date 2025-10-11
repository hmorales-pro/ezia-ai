import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { runAgentForAnalysis, runAllAgentsForBusiness } from "@/lib/agents";
import { getDB } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Utiliser le système de base de données unifié
    const db = getDB();
    const business = await db.findBusinessById(businessId);

    if (!business || business.user_id !== userId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Si analysisType est "all", relancer toutes les analyses
    if (analysisType === 'all') {
      // Réinitialiser tous les statuts
      await db.updateBusiness(businessId, {
        agents_status: {
          market_analysis: 'pending',
          competitor_analysis: 'pending',
          marketing_strategy: 'pending',
          website_prompt: 'pending'
        },
        market_analysis: null,
        marketing_strategy: null,
        competitor_analysis: null,
        website_prompt: null
      });

      // Lancer toutes les analyses de manière asynchrone
      setTimeout(async () => {
        try {
          console.log(`[Rerun Analysis] Démarrage de toutes les analyses pour ${business.name}`);
          
          // Marquer toutes comme "in_progress"
          await db.updateBusiness(businessId, {
            agents_status: {
              market_analysis: 'in_progress',
              competitor_analysis: 'in_progress',
              marketing_strategy: 'in_progress',
              website_prompt: 'in_progress'
            }
          });
          
          // Utiliser la fonction qui lance toutes les analyses en parallèle
          const analysisResults = await runAllAgentsForBusiness(business);

          console.log(`[Rerun Analysis] Toutes les analyses terminées pour ${business.name}`);
          console.log(`[Rerun Analysis] Résultats obtenus:`, {
            hasMarketAnalysis: !!analysisResults.market_analysis,
            hasMarketingStrategy: !!analysisResults.marketing_strategy,
            hasCompetitorAnalysis: !!analysisResults.competitor_analysis,
            hasWebsitePrompt: !!analysisResults.website_prompt,
            keys: Object.keys(analysisResults)
          });

          // Sauvegarder tous les résultats
          const updateData = {
            ...analysisResults,
            agents_status: {
              market_analysis: 'completed',
              competitor_analysis: 'completed',
              marketing_strategy: 'completed',
              website_prompt: 'completed'
            }
          };

          console.log(`[Rerun Analysis] Données à sauvegarder:`, {
            hasMarketAnalysis: !!updateData.market_analysis,
            hasMarketingStrategy: !!updateData.marketing_strategy,
            agentsStatus: updateData.agents_status
          });

          await db.updateBusiness(businessId, updateData);

          console.log(`[Rerun Analysis] Résultats sauvegardés pour ${business.name}`);
          
        } catch (error) {
          console.error(`[Rerun Analysis] Erreur globale:`, error);
          // En cas d'erreur, marquer toutes comme failed
          await db.updateBusiness(businessId, {
            agents_status: {
              market_analysis: 'failed',
              competitor_analysis: 'failed',
              marketing_strategy: 'failed',
              website_prompt: 'failed'
            }
          });
        }
      }, 100);

      return NextResponse.json({ 
        success: true,
        message: "Toutes les analyses ont été relancées"
      });
    }

    // Préparer les mises à jour
    const updates: any = {
      agents_status: {
        ...business.agents_status,
        [analysisType]: 'pending'
      }
    };
    
    // Effacer les données existantes de cette analyse
    if (analysisType === 'market_analysis') {
      updates.market_analysis = null;
    } else if (analysisType === 'marketing_strategy') {
      updates.marketing_strategy = null;
    } else if (analysisType === 'competitor_analysis') {
      updates.competitor_analysis = null;
    } else if (analysisType === 'website_prompt') {
      updates.website_prompt = null;
    }
    
    // Mettre à jour le business
    await db.updateBusiness(businessId, updates);

    // Lancer l'analyse de manière asynchrone
    setTimeout(async () => {
      try {
        // Get current business state
        let currentBusiness = await db.findBusinessById(businessId);
        
        // Mettre à jour le statut en "in_progress"
        await db.updateBusiness(businessId, {
          agents_status: {
            ...currentBusiness.agents_status,
            [analysisType]: 'in_progress'
          }
        });

        // Générer de vraies données avec l'IA en utilisant les VRAIES données du business
        const analysisResult = await runAgentForAnalysis(
          analysisType,
          business.name,
          business.industry,
          business.stage,
          business.description
        );

        // Get updated business state before final update
        currentBusiness = await db.findBusinessById(businessId);
        
        // Sauvegarder les résultats
        const finalUpdate: any = {
          [analysisType]: analysisResult,
          agents_status: {
            ...currentBusiness.agents_status,
            [analysisType]: 'completed'
          }
        };
        
        await db.updateBusiness(businessId, finalUpdate);
        
      } catch (error) {
        console.error(`Error running ${analysisType}:`, error);
        // Get updated business state for error handling
        const currentBusiness = await db.findBusinessById(businessId);
        // Mettre à jour le statut en cas d'erreur
        await db.updateBusiness(businessId, {
          agents_status: {
            ...currentBusiness.agents_status,
            [analysisType]: 'failed'
          }
        });
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

    // Utiliser le système de base de données unifié
    const db = getDB();
    const business = await db.findBusinessById(businessId);

    if (!business || business.user_id !== userId) {
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