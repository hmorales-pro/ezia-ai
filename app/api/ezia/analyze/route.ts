import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import { generateWithMistralAPI } from "@/lib/mistral-ai-service";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, actionType, userPrompt } = await request.json();

    // Récupérer le business
    let business;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      business = await Business.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    }

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Plus besoin de token HuggingFace, on utilise Mistral API directement

    // Préparer le contexte selon le type d'action
    const contexts: Record<string, string> = {
      market_analysis: "Tu es Ezia, experte en analyse de marché. Fournis une analyse détaillée en français.",
      marketing_strategy: "Tu es Ezia, experte en stratégie marketing. Crée une stratégie complète en français.",
      competitor_analysis: "Tu es Ezia, analyste concurrentielle. Fournis une analyse approfondie en français.",
      content_calendar: "Tu es Ezia, experte en content marketing. Crée un calendrier éditorial en français.",
      branding: "Tu es Ezia, experte en branding. Développe une stratégie de marque en français.",
      social_media: "Tu es Ezia, experte en réseaux sociaux. Crée une stratégie social media en français."
    };

    const systemContext = contexts[actionType] || contexts.market_analysis;
    
    const businessContext = `
Business: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
Stade: ${business.stage}
${business.website_url ? `Site web: ${business.website_url}` : ''}

${userPrompt ? `Demande spécifique: ${userPrompt}` : 'Fournis une analyse complète.'}`;

    // Générer la réponse avec Mistral API ou réponses par défaut
    const response = await generateWithMistralAPI(
      businessContext,
      systemContext
    );

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || "Erreur lors de la génération" },
        { status: 500 }
      );
    }

    // Sauvegarder l'interaction
    const interaction = {
      timestamp: new Date(),
      agent: "Ezia",
      interaction_type: actionType,
      summary: `Analyse ${actionType.replace(/_/g, ' ')} générée`,
      content: response.content,
      recommendations: extractRecommendations(response.content || "")
    };

    // Mettre à jour le business avec l'interaction
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      await memoryDB.updateBusinessInteraction(businessId, interaction);
      
      // Mettre à jour les données spécifiques selon le type d'action
      await updateBusinessData(businessId, actionType, response.content || "", memoryDB);
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        {
          $push: { ezia_interactions: interaction },
          $set: await getBusinessUpdates(actionType, response.content || "")
        }
      );
    }

    return NextResponse.json({
      success: true,
      content: response.content,
      interaction: interaction
    });

  } catch (error) {
    console.error("Ezia analyze error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse" },
      { status: 500 }
    );
  }
}

// Extraire les recommandations du contenu
function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  
  // Chercher les sections de recommandations
  const recPatterns = [
    /recommandations?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi,
    /actions?\s+recommandées?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi,
    /prochaines?\s+étapes?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi
  ];

  for (const pattern of recPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const lines = match[1].split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);
      
      recommendations.push(...lines);
    }
  }

  // Limiter à 5 recommandations max
  return recommendations.slice(0, 5);
}

// Mettre à jour les données du business selon le type d'action
async function updateBusinessData(businessId: string, actionType: string, content: string, memoryDB: any) {
  const updates: any = {};

  switch (actionType) {
    case "market_analysis":
      // Extraire les données d'analyse de marché
      const targetAudienceMatch = content.match(/audience cible\s*:?\s*([^\n]+)/i);
      const valuePropositionMatch = content.match(/proposition de valeur\s*:?\s*([^\n]+)/i);
      
      if (targetAudienceMatch || valuePropositionMatch) {
        updates.market_analysis = {
          target_audience: targetAudienceMatch?.[1]?.trim() || "",
          value_proposition: valuePropositionMatch?.[1]?.trim() || "",
          last_updated: new Date()
        };
      }
      break;

    case "marketing_strategy":
      // Extraire les données de stratégie marketing
      const positioningMatch = content.match(/positionnement\s*:?\s*([^\n]+)/i);
      const channelsMatch = content.match(/canaux?\s*(?:marketing|prioritaires?)?\s*:?\s*([^\n]+)/i);
      
      if (positioningMatch || channelsMatch) {
        updates.marketing_strategy = {
          positioning: positioningMatch?.[1]?.trim() || "",
          channels: channelsMatch?.[1]?.split(',').map(c => c.trim()) || [],
          last_updated: new Date()
        };
      }
      break;

    // Ajouter d'autres cas selon les besoins
  }

  if (Object.keys(updates).length > 0) {
    await memoryDB.updateBusiness(businessId, updates);
  }
}

// Obtenir les mises à jour pour MongoDB
async function getBusinessUpdates(actionType: string, content: string): Promise<any> {
  const updates: any = {};

  switch (actionType) {
    case "market_analysis":
      const targetAudienceMatch = content.match(/audience cible\s*:?\s*([^\n]+)/i);
      const valuePropositionMatch = content.match(/proposition de valeur\s*:?\s*([^\n]+)/i);
      
      updates["market_analysis.target_audience"] = targetAudienceMatch?.[1]?.trim() || "";
      updates["market_analysis.value_proposition"] = valuePropositionMatch?.[1]?.trim() || "";
      updates["market_analysis.last_updated"] = new Date();
      break;

    case "marketing_strategy":
      const positioningMatch = content.match(/positionnement\s*:?\s*([^\n]+)/i);
      const channelsMatch = content.match(/canaux?\s*(?:marketing|prioritaires?)?\s*:?\s*([^\n]+)/i);
      
      updates["marketing_strategy.positioning"] = positioningMatch?.[1]?.trim() || "";
      updates["marketing_strategy.channels"] = channelsMatch?.[1]?.split(',').map(c => c.trim()) || [];
      updates["marketing_strategy.last_updated"] = new Date();
      break;
  }

  return updates;
}