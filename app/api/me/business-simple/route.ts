import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { runAllAgentsForBusiness } from '@/lib/agents';
import { getDB } from '@/lib/database';

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
    
    // Utiliser le système de base de données unifié
    const db = getDB();
    const userBusinesses = await db.findBusinesses(decoded.userId);
    
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
    
    const data = await req.json();
    
    // Créer le business
    const businessId = `bus_${Date.now()}`;
    const newBusiness = {
      _id: businessId,
      business_id: businessId,
      userId: decoded.userId,
      ...data,
      // Inclure les nouvelles informations sur le site web
      hasWebsite: data.hasWebsite || 'no',
      wantsWebsite: data.wantsWebsite || 'no',
      existingWebsiteUrl: data.existingWebsiteUrl || '',
      _createdAt: new Date().toISOString(),
      completion_score: 20,
      ezia_interactions: [{
        timestamp: new Date().toISOString(),
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
      // Ajouter une note pour indiquer que les analyses sont en cours
      analysis_started_at: new Date().toISOString()
    };
    
    // Créer le business dans la base de données
    const db = getDB();
    const createdBusiness = await db.createBusiness(newBusiness);
    
    // Lancer les analyses par les agents de manière asynchrone
    // D'abord mettre à jour le statut pour indiquer que les analyses sont en cours
    setTimeout(async () => {
      // Mettre à jour le statut
      await db.updateBusiness(businessId, {
        agents_status: {
          market_analysis: 'in_progress',
          competitor_analysis: 'in_progress',
          marketing_strategy: 'in_progress',
          website_prompt: 'in_progress'
        }
      });
      
      // Ajouter une interaction pour indiquer le début des analyses
      await db.addBusinessInteraction(businessId, {
        timestamp: new Date(),
        agent: "Ezia",
        interaction_type: "analysis_started",
        summary: "Nos agents ont commencé l'analyse approfondie de votre business",
        status: "in_progress"
      });
      
      // Lancer les analyses APRÈS avoir mis à jour le statut in_progress
      runAllAgentsForBusiness(createdBusiness)
        .then(async analyses => {
          console.log(`[Business Creation] Analyses terminées pour ${createdBusiness.name}`);
          
          // Mettre à jour le business avec les résultats des analyses
          await db.updateBusiness(businessId, {
            ...analyses,
            agents_status: {
              market_analysis: 'completed',
              competitor_analysis: 'completed',
              marketing_strategy: 'completed',
              website_prompt: 'completed'
            },
            completion_score: 60 // Augmenter le score après les analyses
          });
          
          // Ajouter les interactions pour chaque analyse
          const interactions = [
            {
              timestamp: new Date(),
              agent: "Agent Marché",
              interaction_type: "market_analysis",
              summary: "Analyse de marché complétée",
              content: JSON.stringify(analyses.market_analysis)
            },
            {
              timestamp: new Date(),
              agent: "Agent Concurrence",
              interaction_type: "competitor_analysis",
              summary: "Analyse de la concurrence complétée",
              content: JSON.stringify(analyses.competitor_analysis)
            },
            {
              timestamp: new Date(),
              agent: "Agent Marketing",
              interaction_type: "marketing_strategy",
              summary: "Stratégie marketing définie",
              content: JSON.stringify(analyses.marketing_strategy)
            },
            {
              timestamp: new Date(),
              agent: "Agent Website",
              interaction_type: "website_prompt",
              summary: "Prompt pour le site web généré",
              content: analyses.website_prompt?.prompt,
              recommendations: analyses.website_prompt?.key_features
            }
          ];
          
          // Ajouter toutes les interactions
          for (const interaction of interactions) {
            await db.addBusinessInteraction(businessId, interaction);
          }
        
          // Si l'utilisateur veut générer un site automatiquement
          if (createdBusiness.wantsWebsite === 'yes' && createdBusiness.hasWebsite === 'no') {
            console.log(`[Business Creation] Génération automatique du site web pour ${createdBusiness.name}`);
            
            try {
              // Appeler l'API de génération de site web
              const websiteResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/business/${businessId}/generate-website`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token.value}`
                }
              });
              
              if (websiteResponse.ok) {
                console.log(`[Business Creation] Site web généré avec succès pour ${createdBusiness.name}`);
                
                // Ajouter une interaction pour la génération du site
                await db.addBusinessInteraction(businessId, {
                  timestamp: new Date(),
                  agent: "Ezia",
                  interaction_type: "website_generation",
                  summary: "Site web généré automatiquement",
                  status: "completed"
                });
                
                // Mettre à jour le business
                await db.updateBusiness(businessId, {
                  completion_score: 80,
                  hasWebsite: 'yes',
                  websiteGeneratedAt: new Date()
                });
              } else {
                console.error(`[Business Creation] Erreur lors de la génération du site pour ${createdBusiness.name}`);
                await db.addBusinessInteraction(businessId, {
                  timestamp: new Date(),
                  agent: "Ezia",
                  interaction_type: "website_generation",
                  summary: "Échec de la génération automatique du site web",
                  status: "failed"
                });
              }
            } catch (error) {
              console.error(`[Business Creation] Exception lors de la génération du site:`, error);
              await db.addBusinessInteraction(businessId, {
                timestamp: new Date(),
                agent: "Ezia",
                interaction_type: "website_generation",
                summary: "Exception lors de la génération du site web",
                status: "failed"
              });
            }
          }
        }).catch(async error => {
          console.error(`[Business Creation] Erreur lors des analyses pour ${createdBusiness.name}:`, error);
          // Mettre à jour le statut en cas d'erreur
          await db.updateBusiness(businessId, {
            agents_status: {
              market_analysis: 'failed',
              competitor_analysis: 'failed',
              marketing_strategy: 'failed',
              website_prompt: 'failed'
            }
          });
          
          // Ajouter une interaction d'erreur
          await db.addBusinessInteraction(businessId, {
            timestamp: new Date(),
            agent: "Ezia",
            interaction_type: "analysis_error",
            summary: "Une erreur s'est produite lors de l'analyse",
            status: "failed"
          });
        });
    }, 1000); // Délai court pour que le client voie le statut pending d'abord
    
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