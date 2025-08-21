import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Business } from '@/models/Business';
import dbConnect from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { messages, extractedData, timestamp } = await request.json();
    
    await dbConnect();
    
    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: userId
    });
    
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    
    // Créer un résumé de la conversation
    const conversationSummary = summarizeConversation(messages, extractedData);
    
    // Ajouter l'interaction à l'historique
    business.ezia_interactions.push({
      timestamp: new Date(timestamp),
      agent: "Ezia",
      interaction_type: "deep_conversation",
      summary: conversationSummary,
      content: JSON.stringify({
        messages: messages.slice(-10), // Garder les 10 derniers messages
        extractedData: extractedData
      }),
      recommendations: generateRecommendations(extractedData)
    });
    
    // Limiter l'historique à 50 interactions
    if (business.ezia_interactions.length > 50) {
      business.ezia_interactions = business.ezia_interactions.slice(-50);
    }
    
    await business.save();
    
    console.log(`[Save Conversation] Saved conversation for business ${businessId}`);
    
    return NextResponse.json({
      success: true,
      message: "Conversation saved"
    });
    
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function summarizeConversation(messages: any[], extractedData: any): string {
  let summary = "Discussion approfondie avec l'utilisateur. ";
  
  // Résumer les données collectées
  if (extractedData.business_model?.type) {
    summary += `Type de business: ${extractedData.business_model.type}. `;
  }
  
  if (extractedData.offerings?.length > 0) {
    const mainOffer = extractedData.offerings[0];
    summary += `Offre principale: ${mainOffer.name || 'produit/service'} à ${mainOffer.price}€. `;
    
    if (mainOffer.cost_breakdown) {
      const totalCost = Object.values(mainOffer.cost_breakdown).reduce((sum: number, cost: any) => sum + (cost || 0), 0);
      if (totalCost > 0) {
        const margin = ((mainOffer.price - totalCost) / mainOffer.price * 100).toFixed(1);
        summary += `Marge: ${margin}%. `;
      }
    }
  }
  
  if (extractedData.customer_insights?.ideal_customer_profile) {
    summary += `Client cible: ${extractedData.customer_insights.ideal_customer_profile}. `;
  }
  
  if (extractedData.financial_info?.target_monthly_revenue) {
    summary += `Objectif CA: ${extractedData.financial_info.target_monthly_revenue}€/mois. `;
  }
  
  // Compter les sujets abordés
  const topics = [];
  if (extractedData.business_model?.unique_selling_points?.length > 0) topics.push("USPs");
  if (extractedData.customer_insights?.customer_pain_points?.length > 0) topics.push("pain points");
  if (extractedData.financial_info?.pricing_strategy) topics.push("stratégie prix");
  if (extractedData.resources?.team_size) topics.push("ressources");
  
  if (topics.length > 0) {
    summary += `Sujets approfondis: ${topics.join(', ')}.`;
  }
  
  return summary;
}

function generateRecommendations(extractedData: any): string[] {
  const recommendations = [];
  
  // Recommandations basées sur les marges
  if (extractedData.offerings?.length > 0) {
    const mainOffer = extractedData.offerings[0];
    if (mainOffer.cost_breakdown) {
      const totalCost = Object.values(mainOffer.cost_breakdown).reduce((sum: number, cost: any) => sum + (cost || 0), 0);
      if (totalCost > 0) {
        const margin = ((mainOffer.price - totalCost) / mainOffer.price * 100);
        
        if (margin < 30) {
          recommendations.push("Optimiser les coûts ou augmenter les prix pour améliorer la rentabilité");
        } else if (margin > 60) {
          recommendations.push("Explorer une stratégie de volume avec des prix plus compétitifs");
        }
      }
    }
  }
  
  // Recommandations sur les canaux d'acquisition
  if (!extractedData.customer_insights?.acquisition_channels?.length) {
    recommendations.push("Définir une stratégie multi-canal pour l'acquisition client");
  }
  
  // Recommandations sur les objectifs
  if (extractedData.financial_info?.target_monthly_revenue && extractedData.offerings?.[0]?.price) {
    const salesNeeded = Math.ceil(extractedData.financial_info.target_monthly_revenue / extractedData.offerings[0].price);
    recommendations.push(`Développer un plan pour atteindre ${salesNeeded} ventes mensuelles`);
  }
  
  // Recommandations sur le positionnement
  if (extractedData.business_model?.unique_selling_points?.length > 0) {
    recommendations.push("Créer du contenu mettant en avant vos points différenciants");
  }
  
  return recommendations.slice(0, 5); // Limiter à 5 recommandations
}