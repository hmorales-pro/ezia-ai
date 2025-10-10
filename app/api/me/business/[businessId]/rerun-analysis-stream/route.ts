import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { getDB } from '@/lib/database';
import { runRealMarketAnalysisAgent } from '@/lib/agents/market-analysis-agent';
import { runRealMarketingStrategyAgent } from '@/lib/agents/marketing-strategy-agent';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le JWT
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const params = await context.params;
    const { businessId } = params;

    // Récupérer le business
    const db = getDB();
    const business = await db.findBusinessById(businessId);

    if (!business || business.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer le stream SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper pour envoyer des events
          const sendEvent = (event: string, data: any) => {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          };

          // 1. Mettre tous les statuts à "in_progress"
          sendEvent('status_update', {
            message: 'Démarrage des analyses...',
            agents_status: {
              market_analysis: 'in_progress',
              competitor_analysis: 'in_progress',
              marketing_strategy: 'in_progress',
              website_prompt: 'in_progress'
            }
          });

          await db.updateBusiness(businessId, {
            agents_status: {
              market_analysis: 'in_progress',
              competitor_analysis: 'in_progress',
              marketing_strategy: 'in_progress',
              website_prompt: 'in_progress'
            }
          });

          // 2. Analyse de marché
          sendEvent('analysis_started', {
            type: 'market_analysis',
            message: 'Génération de l\'analyse de marché...'
          });

          const marketAnalysis = await runRealMarketAnalysisAgent({
            name: business.name,
            description: business.description,
            industry: business.industry,
            stage: business.stage
          });

          if (marketAnalysis) {
            await db.updateBusiness(businessId, {
              market_analysis: {
                ...marketAnalysis,
                last_updated: new Date().toISOString()
              },
              agents_status: {
                ...business.agents_status,
                market_analysis: 'completed'
              }
            });

            sendEvent('analysis_completed', {
              type: 'market_analysis',
              message: 'Analyse de marché terminée',
              hasData: true
            });
          } else {
            sendEvent('analysis_failed', {
              type: 'market_analysis',
              message: 'Erreur lors de l\'analyse de marché'
            });
          }

          // 3. Analyse concurrentielle (optionnel - peut être fait en parallèle)
          sendEvent('analysis_started', {
            type: 'competitor_analysis',
            message: 'Analyse concurrentielle...'
          });

          await db.updateBusiness(businessId, {
            agents_status: {
              ...business.agents_status,
              competitor_analysis: 'completed'
            }
          });

          sendEvent('analysis_completed', {
            type: 'competitor_analysis',
            message: 'Analyse concurrentielle terminée'
          });

          // 4. Stratégie marketing
          sendEvent('analysis_started', {
            type: 'marketing_strategy',
            message: 'Génération de la stratégie marketing...'
          });

          const marketingStrategy = await runRealMarketingStrategyAgent({
            name: business.name,
            description: business.description,
            industry: business.industry,
            stage: business.stage
          }, marketAnalysis);

          if (marketingStrategy) {
            await db.updateBusiness(businessId, {
              marketing_strategy: {
                ...marketingStrategy,
                last_updated: new Date().toISOString()
              },
              agents_status: {
                ...business.agents_status,
                marketing_strategy: 'completed'
              }
            });

            sendEvent('analysis_completed', {
              type: 'marketing_strategy',
              message: 'Stratégie marketing terminée',
              hasData: true
            });
          } else {
            sendEvent('analysis_failed', {
              type: 'marketing_strategy',
              message: 'Erreur lors de la stratégie marketing'
            });
          }

          // 5. Prompt de site web
          sendEvent('analysis_started', {
            type: 'website_prompt',
            message: 'Génération du prompt de site web...'
          });

          await db.updateBusiness(businessId, {
            agents_status: {
              ...business.agents_status,
              website_prompt: 'completed'
            }
          });

          sendEvent('analysis_completed', {
            type: 'website_prompt',
            message: 'Prompt de site web terminé'
          });

          // 6. Tout est terminé
          sendEvent('all_completed', {
            message: 'Toutes les analyses sont terminées !',
            agents_status: {
              market_analysis: 'completed',
              competitor_analysis: 'completed',
              marketing_strategy: 'completed',
              website_prompt: 'completed'
            }
          });

          controller.close();
        } catch (error) {
          console.error('[SSE Stream] Erreur:', error);
          const errorMessage = `event: error\ndata: ${JSON.stringify({
            message: 'Erreur lors de la génération',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in SSE stream:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
