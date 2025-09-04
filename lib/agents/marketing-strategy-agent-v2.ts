import { generateWithMistralAPI } from '../mistral-ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

export async function runMarketingStrategyAgentV2(business: any, marketAnalysis?: any): Promise<any> {
  const marketContext = marketAnalysis ? `
Contexte marché:
- Taille: ${marketAnalysis.market_size?.value || 'Non définie'}
- Croissance: ${marketAnalysis.growth_rate || 'Non définie'}
- Principaux concurrents: ${marketAnalysis.main_competitors?.map((c: any) => c.name).join(', ') || 'Non définis'}
` : '';

  // Prompt simplifié pour éviter les réponses tronquées
  const prompt = `Crée une stratégie marketing SIMPLIFIÉE pour:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
${marketContext}

IMPORTANT: Limite ta réponse à l'essentiel. Pas de longs textes.

Réponds avec un JSON compact:
{
  "vision": "Vision en 1 phrase",
  "mission": "Mission en 1 phrase",
  "proposition_valeur": "UVP claire en 1 phrase",
  "cibles": {
    "principale": {
      "nom": "Nom du segment",
      "age": "25-45",
      "besoins": ["Besoin 1", "Besoin 2"]
    }
  },
  "objectifs": [
    {
      "nom": "Augmenter notoriété",
      "kpi": "Followers",
      "cible": "+50%",
      "delai": "6 mois"
    },
    {
      "nom": "Générer leads",
      "kpi": "Leads/mois",
      "cible": "100",
      "delai": "3 mois"
    }
  ],
  "actions": [
    {
      "nom": "Campagne social media",
      "canaux": ["Instagram", "LinkedIn"],
      "budget": "5000€",
      "duree": "3 mois"
    },
    {
      "nom": "Content marketing",
      "type": "Blog + Newsletter",
      "frequence": "2/semaine",
      "budget": "3000€/mois"
    }
  ],
  "budget_total": "30000€/an",
  "roi_attendu": "200%"
}`;

  const systemContext = `Tu es un expert en marketing digital. 
Fournis des stratégies CONCISES et ACTIONNABLES.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Limite chaque section à l'essentiel.`;

  try {
    const response = await generateWithMistralAPI(prompt, systemContext);
    
    if (response.success && response.content) {
      try {
        // Extraire le JSON
        let jsonContent = response.content;
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        const strategy = parseAIGeneratedJson(jsonContent);
        
        // Enrichir avec une structure complète mais avec les données simplifiées
        return {
          executive_summary: {
            vision: strategy.vision,
            mission: strategy.mission,
            unique_value_proposition: strategy.proposition_valeur,
            target_roi: strategy.roi_attendu
          },
          brand_positioning: {
            brand_essence: business.name,
            brand_promise: strategy.mission,
            brand_personality: ["Innovant", "Professionnel", "Accessible"],
            brand_values: ["Excellence", "Innovation", "Impact"]
          },
          target_segments: [{
            name: strategy.cibles.principale.nom,
            age_range: strategy.cibles.principale.age,
            pain_points: strategy.cibles.principale.besoins,
            size: "10K+ prospects"
          }],
          marketing_objectives: strategy.objectifs,
          campaigns: strategy.actions.map((action: any) => ({
            name: action.nom,
            channels: action.canaux || [action.type],
            budget: action.budget,
            duration: action.duree || action.frequence,
            expected_results: `${strategy.roi_attendu} ROI`
          })),
          budget_allocation: {
            total_budget: strategy.budget_total,
            by_channel: {
              Digital: 60,
              Content: 25,
              Events: 10,
              Other: 5
            }
          },
          visual_assets: {
            logo_concepts: ["Moderne", "Minimaliste", "Bold"],
            social_templates: ["Story", "Post carré", "Carousel"],
            ad_mockups: ["Facebook", "Google", "LinkedIn"]
          }
        };
      } catch (parseError) {
        console.error("[Marketing V2] Erreur parsing:", parseError);
        throw parseError;
      }
    }
    
    throw new Error("Pas de réponse IA");
  } catch (error) {
    console.error("[Marketing V2] Erreur:", error);
    // Fallback simple
    return {
      executive_summary: {
        vision: `Faire de ${business.name} le leader de son marché`,
        mission: `Offrir des solutions innovantes dans ${business.industry}`,
        unique_value_proposition: "Excellence et innovation au service de nos clients",
        target_roi: "150%"
      },
      brand_positioning: {
        brand_essence: "Innovation",
        brand_promise: "Des solutions qui transforment",
        brand_personality: ["Innovant", "Fiable", "Accessible"],
        brand_values: ["Excellence", "Innovation", "Impact"]
      },
      target_segments: [{
        name: "Professionnels actifs",
        age_range: "25-45",
        pain_points: ["Manque de temps", "Besoin d'efficacité"],
        size: "5K+ prospects"
      }],
      marketing_objectives: [
        {
          nom: "Augmenter la notoriété",
          kpi: "Taux de notoriété",
          cible: "+30%",
          delai: "6 mois"
        }
      ],
      campaigns: [
        {
          name: "Lancement digital",
          channels: ["Social media", "Email"],
          budget: "10000€",
          duration: "3 mois",
          expected_results: "100 leads/mois"
        }
      ],
      budget_allocation: {
        total_budget: "30000€/an",
        by_channel: { Digital: 70, Content: 20, Events: 10 }
      },
      visual_assets: {
        logo_concepts: ["Moderne"],
        social_templates: ["Template de base"],
        ad_mockups: ["Bannière simple"]
      }
    };
  }
}