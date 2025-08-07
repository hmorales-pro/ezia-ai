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
  
  // Chercher les sections de recommandations (incluant les formats markdown)
  const recPatterns = [
    /##\s*(?:📌\s*)?(?:Recommandations?|Recommandations?\s+stratégiques?)\s*\n([\s\S]*?)(?:\n##|$)/gi,
    /##\s*(?:🎯\s*)?(?:Prochaines?\s+étapes?|Actions?\s+recommandées?)\s*\n([\s\S]*?)(?:\n##|$)/gi,
    /recommandations?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi,
    /actions?\s+recommandées?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi,
    /prochaines?\s+étapes?\s*:?\s*\n([\s\S]*?)(?:\n\n|$)/gi
  ];

  for (const pattern of recPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // Traiter les listes numérotées et à puces
      const lines = match[1].split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Accepter les lignes qui commencent par -, •, *, ou un nombre suivi d'un point
          return line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/) || 
                 (line.startsWith('✅') || line.startsWith('→'));
        })
        .map(line => {
          // Nettoyer les marqueurs de liste
          return line
            .replace(/^[-•*]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^[✅→]\s*/, '')
            .trim();
        })
        .filter(line => line.length > 0);
      
      recommendations.push(...lines);
    }
  }

  // Dédupliquer et limiter à 5 recommandations max
  const uniqueRecommendations = [...new Set(recommendations)];
  return uniqueRecommendations.slice(0, 5);
}

// Mettre à jour les données du business selon le type d'action
async function updateBusinessData(businessId: string, actionType: string, content: string, memoryDB: any) {
  const updates: any = {};

  switch (actionType) {
    case "market_analysis":
      // Extraire les données d'analyse de marché - gérer les formats markdown
      let targetAudience = "";
      let valueProposition = "";
      
      // Chercher dans le format markdown avec sections
      const marketSectionMatch = content.match(/##\s*(?:🎯\s*)?(?:Marché cible|Market cible|Audience cible|Cible)\s*\n([\s\S]*?)(?:\n##|$)/i);
      if (marketSectionMatch) {
        // Extraire le contenu de la section et nettoyer
        const sectionContent = marketSectionMatch[1];
        // Prendre les premières lignes significatives
        const lines = sectionContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('-'));
        if (lines.length > 0) {
          targetAudience = lines[0].trim();
        }
      }
      
      // Chercher la proposition de valeur dans différents formats
      const valuePropMatch = content.match(/(?:##\s*)?(?:💡\s*)?(?:Proposition de valeur|Value proposition|Positionnement)\s*:?\s*\n?([\s\S]*?)(?:\n##|\n\n|$)/i);
      if (valuePropMatch) {
        const lines = valuePropMatch[1].split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          valueProposition = lines[0].trim().replace(/^[-•*]\s*/, '');
        }
      }
      
      // Fallback sur les anciens patterns
      if (!targetAudience) {
        const targetAudienceMatch = content.match(/audience cible\s*:?\s*([^\n]+)/i);
        targetAudience = targetAudienceMatch?.[1]?.trim() || "";
      }
      
      if (!valueProposition) {
        const valuePropositionMatch = content.match(/proposition de valeur\s*:?\s*([^\n]+)/i);
        valueProposition = valuePropositionMatch?.[1]?.trim() || "";
      }
      
      if (targetAudience || valueProposition) {
        updates.market_analysis = {
          target_audience: targetAudience,
          value_proposition: valueProposition,
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
      // Même logique de parsing que updateBusinessData
      let targetAudience = "";
      let valueProposition = "";
      
      // Chercher dans le format markdown avec sections
      const marketSectionMatch = content.match(/##\s*(?:🎯\s*)?(?:Marché cible|Market cible|Audience cible|Cible)\s*\n([\s\S]*?)(?:\n##|$)/i);
      if (marketSectionMatch) {
        const sectionContent = marketSectionMatch[1];
        const lines = sectionContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('-'));
        if (lines.length > 0) {
          targetAudience = lines[0].trim();
        }
      }
      
      // Chercher la proposition de valeur
      const valuePropMatch = content.match(/(?:##\s*)?(?:💡\s*)?(?:Proposition de valeur|Value proposition|Positionnement)\s*:?\s*\n?([\s\S]*?)(?:\n##|\n\n|$)/i);
      if (valuePropMatch) {
        const lines = valuePropMatch[1].split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          valueProposition = lines[0].trim().replace(/^[-•*]\s*/, '');
        }
      }
      
      // Fallback
      if (!targetAudience) {
        const targetAudienceMatch = content.match(/audience cible\s*:?\s*([^\n]+)/i);
        targetAudience = targetAudienceMatch?.[1]?.trim() || "";
      }
      
      if (!valueProposition) {
        const valuePropositionMatch = content.match(/proposition de valeur\s*:?\s*([^\n]+)/i);
        valueProposition = valuePropositionMatch?.[1]?.trim() || "";
      }
      
      updates["market_analysis.target_audience"] = targetAudience;
      updates["market_analysis.value_proposition"] = valueProposition;
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