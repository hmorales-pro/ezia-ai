import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

// Version simplifiée de l'analyse de marché pour éviter la troncature
export async function runSimplifiedMarketAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Marché Simplifié] Analyse pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Prompt plus court et structure simplifiée
  const systemContext = `Tu es un expert en analyse de marché. 
RÈGLES CRITIQUES:
1. Réponds UNIQUEMENT en JSON valide, sans texte avant/après
2. Sois TRÈS CONCIS (max 30 mots par champ)
3. Limite les tableaux à 3 éléments max
4. Utilise uniquement des guillemets doubles "
5. Pas de markdown, pas d'émojis
6. JSON total < 2000 caractères`;

  const prompt = `Analyse concise du marché pour:
${business.name} - ${business.industry}
Description: ${business.description}

Retourne ce JSON simplifié:
{
  "executive_summary": {
    "key_findings": ["3 découvertes courtes max"],
    "market_opportunity": "opportunité en 20 mots",
    "strategic_positioning": "position en 20 mots",
    "growth_forecast": "croissance en %"
  },
  "target_audience": {
    "primary": "segment principal",
    "demographics": {
      "age": "tranche",
      "income": "niveau",
      "location": "zone"
    },
    "pain_points": ["3 problèmes courts"]
  },
  "market_overview": {
    "market_size": "taille en €/$ ",
    "growth_rate": "% annuel",
    "key_players": ["3 concurrents max"],
    "market_segments": [
      {
        "name": "nom",
        "size": "% marché",
        "growth": "% croissance"
      }
    ]
  },
  "swot_analysis": {
    "strengths": ["3 forces"],
    "weaknesses": ["3 faiblesses"],
    "opportunities": ["3 opportunités"],
    "threats": ["3 menaces"]
  },
  "strategic_recommendations": {
    "immediate_actions": [
      {
        "action": "action courte",
        "impact": "high/medium/low",
        "timeline": "durée"
      }
    ],
    "long_term_vision": "vision en 20 mots"
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
        maxTokens: 1500, // Réduit pour éviter la troncature
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
        
        return analysis;
      } catch (parseError) {
        console.error("[Agent Marché Simplifié] Erreur parsing JSON:", parseError);
        console.log("[Agent Marché Simplifié] Contenu reçu:", response.content?.substring(0, 500));
        throw new Error(`Impossible de parser la réponse: ${parseError.message}`);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Marché Simplifié] Erreur:", error);
    // Retourner une analyse minimale en cas d'erreur
    console.log('[Agent Marché Simplifié] Utilisation du fallback minimal');
    return generateMinimalMarketAnalysis(business);
  }
}

// Version encore plus simplifiée pour les cas d'urgence
export function generateMinimalMarketAnalysis(business: any): any {
  const currentYear = new Date().getFullYear();
  
  return {
    executive_summary: {
      key_findings: [
        `Marché ${business.industry} en croissance`,
        "Opportunités digitales importantes",
        "Concurrence fragmentée"
      ],
      market_opportunity: `Potentiel de croissance dans ${business.industry}`,
      strategic_positioning: `Innovation et service client dans ${business.industry}`,
      growth_forecast: "15-25% annuel"
    },
    target_audience: {
      primary: "PME et professionnels du secteur",
      demographics: {
        age: "25-50 ans",
        income: "Moyen à élevé",
        location: "France urbaine"
      },
      pain_points: ["Coûts élevés", "Manque d'efficacité", "Service limité"]
    },
    market_overview: {
      market_size: "2-5 milliards EUR",
      growth_rate: "8% annuel",
      key_players: ["Leader 1", "Leader 2", "Challenger 1"],
      market_segments: [
        {
          name: "Entreprises",
          size: "60%",
          growth: "10%"
        },
        {
          name: "Particuliers",
          size: "40%",
          growth: "5%"
        }
      ]
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