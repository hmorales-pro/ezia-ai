import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

// Version simplifiée de l'analyse de marché pour éviter la troncature
export async function runSimplifiedMarketAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Marché Simplifié] Analyse pour ${business.name}...`);
  console.log(`[Agent Marché Simplifié] Business data:`, { name: business.name, industry: business.industry, description: business.description?.substring(0, 100) });
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Prompt plus court et structure simplifiée
  const systemContext = `Tu es un expert en analyse de marché. 
RÈGLES CRITIQUES:
1. Réponds UNIQUEMENT en JSON valide, sans texte avant/après
2. Sois ULTRA CONCIS (max 10 mots par champ)
3. Limite TOUS les tableaux à 2 éléments MAXIMUM
4. Utilise uniquement des guillemets doubles "
5. Pas de markdown, pas d'émojis, pas de caractères spéciaux
6. JSON total DOIT être < 1000 caractères
7. TERMINE TOUJOURS le JSON correctement avec }`;

  const prompt = `Analyse pour: ${business.name} (${business.industry})

JSON requis (max 10 mots/champ, 2 items/tableau):
{
  "executive_summary": {
    "key_findings": ["Point 1", "Point 2"],
    "market_opportunity": "Opportunité",
    "growth_forecast": "15%"
  },
  "target_audience": "Clients cibles",
  "market_overview": {
    "market_size": "X M€",
    "growth_rate": "X%",
    "key_players": ["Leader 1", "Leader 2"]
  },
  "swot_analysis": {
    "strengths": ["Force 1", "Force 2"],
    "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
    "opportunities": ["Opportunité 1", "Opportunité 2"],
    "threats": ["Menace 1", "Menace 2"]
  },
  "strategic_recommendations": {
    "immediate_actions": [{
      "action": "Priorité",
      "impact": "high",
      "timeline": "2m"
    }]
  }
}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Marché Simplifié] Utilisation de Mistral AI');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Marché Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 1500, // Limité pour forcer des réponses concises
        temperature: 0.3
      });
    }
    
    if (response.success && response.content) {
      try {
        const analysis = parseAIGeneratedJson(response.content);
        
        // Ajouter quelques données de visualisation simples
        analysis.visualization_data = {
          market_growth_chart: {
            type: "line",
            data: [
              { year: 2022, value: 100 },
              { year: 2023, value: 110 },
              { year: 2024, value: 125 }
            ]
          }
        };
        
        // Transformer pour correspondre au schéma MongoDB
        const transformedAnalysis = {
          ...analysis,
          // Convertir target_audience en string si c'est un objet
          target_audience: typeof analysis.target_audience === 'string' 
            ? analysis.target_audience 
            : `${analysis.target_audience?.primary || 'Public cible'}, ${analysis.target_audience?.demographics?.age || '25-55 ans'}, ${analysis.target_audience?.demographics?.income || 'revenus moyens à élevés'}, ${analysis.target_audience?.demographics?.location || 'France'}`,
          
          // S'assurer que les autres champs existent
          value_proposition: analysis.value_proposition || `Solution innovante pour ${business.industry}`,
          competitors: Array.isArray(analysis.competitors) ? analysis.competitors : 
            (analysis.market_overview?.key_players || ["Concurrent 1", "Concurrent 2", "Concurrent 3"]),
          opportunities: Array.isArray(analysis.opportunities) ? analysis.opportunities :
            (analysis.swot_analysis?.opportunities || ["Opportunité 1", "Opportunité 2", "Opportunité 3"]),
          threats: Array.isArray(analysis.threats) ? analysis.threats :
            (analysis.swot_analysis?.threats || ["Menace 1", "Menace 2", "Menace 3"])
        };
        
        return transformedAnalysis;
      } catch (parseError) {
        console.error("[Agent Marché Simplifié] Erreur parsing JSON:", parseError);
        console.log("[Agent Marché Simplifié] Contenu reçu:", response.content?.substring(0, 500));
        throw new Error(`Impossible de parser la réponse: ${parseError.message}`);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Marché Simplifié] Erreur:", error);
    console.error("[Agent Marché Simplifié] Stack:", error.stack);
    // Retourner une analyse minimale en cas d'erreur
    console.log('[Agent Marché Simplifié] Utilisation du fallback minimal suite à erreur');
    const minimalAnalysis = generateMinimalMarketAnalysis(business);
    console.log('[Agent Marché Simplifié] Fallback analysis:', JSON.stringify(minimalAnalysis).substring(0, 200));
    return minimalAnalysis;
  }
}

// Version encore plus simplifiée pour les cas d'urgence
export function generateMinimalMarketAnalysis(business: any): any {
  const currentYear = new Date().getFullYear();
  
  const industryName = business.industry || "votre secteur";
  const businessName = business.name || "votre entreprise";
  
  return {
    executive_summary: {
      key_findings: [
        `Marché ${industryName} en croissance`,
        "Fort potentiel digital"
      ],
      market_opportunity: `Croissance dans ${industryName}`,
      strategic_positioning: `Innovation dans ${industryName}`,
      growth_forecast: "15-25%"
    },
    // Format string pour MongoDB - IMPORTANT
    target_audience: `PME et pros ${industryName}, 25-50 ans, France`,
    value_proposition: `Solutions pour ${industryName}`,
    competitors: ["Leader marché", "Challenger"],
    opportunities: ["Digital", "Nouveaux besoins"],
    threats: ["Concurrence", "Réglementation"],
    market_overview: {
      market_size: "2-5 Mds€",
      growth_rate: "8%",
      key_players: ["Leader 1", "Leader 2"]
    },
    swot_analysis: {
      strengths: ["Innovation", "Agilité", "Vision claire"],
      weaknesses: ["Ressources limitées", "Marque nouvelle", "Réseau à construire"],
      opportunities: ["Digitalisation", "Nouveaux besoins", "Partenariats"],
      threats: ["Concurrence établie", "Régulations", "Économie"]
    },
    strategic_recommendations: {
      immediate_actions: [
        {
          action: "Valider le marché",
          impact: "high",
          timeline: "1-2 mois"
        },
        {
          action: "Développer MVP",
          impact: "high", 
          timeline: "3 mois"
        },
        {
          action: "Premiers clients",
          impact: "medium",
          timeline: "4-6 mois"
        }
      ],
      long_term_vision: `Leader innovant en ${business.industry} d'ici 3-5 ans`
    },
    visualization_data: {
      market_growth_chart: {
        type: "line",
        data: [
          { year: currentYear - 1, value: 100 },
          { year: currentYear, value: 108 },
          { year: currentYear + 1, value: 117 }
        ]
      }
    }
  };
}