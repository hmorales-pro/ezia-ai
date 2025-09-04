import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { runAllAgentsForBusiness } from '@/lib/agents';
import { getDB } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    
    // Utiliser le système de database unifié
    const db = getDB();
    const businesses = await db.findBusinesses(decoded.userId);
    
    return NextResponse.json({
      ok: true,
      businesses
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
    const db = getDB();
    
    // Créer le business
    const businessId = `bus_${Date.now()}`;
    const newBusiness = {
      business_id: businessId,
      user_id: decoded.userId,
      name: data.name,
      description: data.description,
      industry: data.industry,
      stage: data.stage,
      hasWebsite: data.hasWebsite || 'no',
      wantsWebsite: data.wantsWebsite || 'no',
      existingWebsiteUrl: data.existingWebsiteUrl || '',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
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
      }
    };
    
    // Sauvegarder dans la base de données
    const createdBusiness = await db.createBusiness(newBusiness);
    
    // Lancer les analyses de manière asynchrone
    setTimeout(async () => {
      console.log(`[Business Creation] Lancement des analyses pour ${newBusiness.name}`);
      
      try {
        // Mettre à jour le statut des analyses en "in_progress"
        await db.updateBusiness(businessId, {
          agents_status: {
            market_analysis: 'in_progress',
            competitor_analysis: 'in_progress',
            marketing_strategy: 'in_progress',
            website_prompt: 'in_progress'
          }
        });
        
        // Ajouter une interaction
        await db.addBusinessInteraction(businessId, {
          timestamp: new Date().toISOString(),
          agent: "Ezia",
          interaction_type: "analysis_started",
          summary: "Nos agents ont commencé l'analyse approfondie de votre business",
          status: "in_progress"
        });
        
        // Lancer les analyses
        const analyses = await runAllAgentsForBusiness(newBusiness);
        console.log(`[Business Creation] Analyses terminées pour ${newBusiness.name}`);
        
        // Mettre à jour avec les résultats
        await db.updateBusiness(businessId, {
          ...analyses,
          agents_status: {
            market_analysis: 'completed',
            competitor_analysis: 'completed',
            marketing_strategy: 'completed',
            website_prompt: 'completed'
          },
          completion_score: 60
        });
        
        // Ajouter les interactions pour chaque analyse
        const interactions = [
          {
            timestamp: new Date().toISOString(),
            agent: "Agent Marché",
            interaction_type: "market_analysis",
            summary: "Analyse de marché complétée",
            content: JSON.stringify(analyses.market_analysis)
          },
          {
            timestamp: new Date().toISOString(),
            agent: "Agent Concurrence",
            interaction_type: "competitor_analysis",
            summary: "Analyse de la concurrence complétée",
            content: JSON.stringify(analyses.competitor_analysis)
          },
          {
            timestamp: new Date().toISOString(),
            agent: "Agent Marketing",
            interaction_type: "marketing_strategy",
            summary: "Stratégie marketing définie",
            content: JSON.stringify(analyses.marketing_strategy)
          },
          {
            timestamp: new Date().toISOString(),
            agent: "Agent Website",
            interaction_type: "website_prompt",
            summary: "Prompt pour le site web généré",
            content: analyses.website_prompt?.prompt,
            recommendations: analyses.website_prompt?.key_features
          }
        ];
        
        for (const interaction of interactions) {
          await db.addBusinessInteraction(businessId, interaction);
        }
        
        // Si l'utilisateur veut générer un site automatiquement
        if (newBusiness.wantsWebsite === 'yes' && newBusiness.hasWebsite === 'no') {
          console.log(`[Business Creation] Génération automatique du site web pour ${newBusiness.name}`);
          
          try {
            const websiteResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/business/${businessId}/generate-website`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.value}`
              }
            });
            
            if (websiteResponse.ok) {
              console.log(`[Business Creation] Site web généré avec succès pour ${newBusiness.name}`);
              
              await db.updateBusiness(businessId, {
                hasWebsite: 'yes',
                websiteGeneratedAt: new Date().toISOString(),
                completion_score: 80
              });
              
              await db.addBusinessInteraction(businessId, {
                timestamp: new Date().toISOString(),
                agent: "Ezia",
                interaction_type: "website_generation",
                summary: "Site web généré automatiquement",
                status: "completed"
              });
            }
          } catch (error) {
            console.error(`[Business Creation] Exception lors de la génération du site:`, error);
            await db.addBusinessInteraction(businessId, {
              timestamp: new Date().toISOString(),
              agent: "Ezia",
              interaction_type: "website_generation",
              summary: "Exception lors de la génération du site web",
              status: "failed"
            });
          }
        }
      } catch (error) {
        console.error(`[Business Creation] Erreur lors des analyses pour ${newBusiness.name}:`, error);
        // Mettre à jour le statut en cas d'erreur
        await db.updateBusiness(businessId, {
          agents_status: {
            market_analysis: 'failed',
            competitor_analysis: 'failed',
            marketing_strategy: 'failed',
            website_prompt: 'failed'
          }
        });
        
        await db.addBusinessInteraction(businessId, {
          timestamp: new Date().toISOString(),
          agent: "Ezia",
          interaction_type: "analysis_error",
          summary: "Une erreur s'est produite lors de l'analyse",
          status: "failed",
          content: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
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