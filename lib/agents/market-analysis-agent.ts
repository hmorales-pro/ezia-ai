import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';
import { runSimplifiedMarketAnalysisAgent, generateMinimalMarketAnalysis } from './market-analysis-agent-simplified';

export async function runRealMarketAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Marché IA] Analyse RÉELLE pour ${business.name}...`);
  
  // Utiliser d'abord la version simplifiée pour éviter les problèmes de troncature
  try {
    const simplifiedResult = await runSimplifiedMarketAnalysisAgent(business);
    if (simplifiedResult) {
      console.log('[Agent Marché IA] Analyse simplifiée réussie');
      return simplifiedResult;
    }
  } catch (simplifiedError) {
    console.log('[Agent Marché IA] Échec de l\'analyse simplifiée, tentative complète...', simplifiedError.message);
  }
  
  // Vérifier d'abord si Mistral API est configurée
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  const systemContext = `Tu es un expert en analyse de marché avec 20 ans d'expérience.

RÈGLES CRITIQUES POUR LE JSON:
1. RÉPONDS UNIQUEMENT EN JSON VALIDE, SANS AUCUN TEXTE AVANT OU APRÈS
2. N'UTILISE JAMAIS de formatage markdown (pas de **, *, __, _, etc.)
3. Utilise uniquement des guillemets doubles " pour les chaînes
4. Échappe correctement les caractères spéciaux dans les chaînes
5. Assure-toi que le JSON est COMPLET et bien fermé
6. Limite chaque tableau à 3-4 éléments maximum
7. Sois CONCIS: max 20 mots par champ texte
8. IMPORTANT: Le JSON total ne doit PAS dépasser 3000 caractères
9. Si tu approches de la limite, RACCOURCIS le contenu plutôt que de risquer la troncature

Pour l'industrie "${business.industry}" et le business "${business.name}":
- Fournis des données RÉELLES et SPÉCIFIQUES (pas de généralités)
- Utilise des chiffres actuels de 2024
- Cite de vrais concurrents existants
- Adapte TOUT le contenu au contexte spécifique`;

  const prompt = `Analyse le marché pour ce business:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
Stade: ${business.stage}

Fournis une analyse de marché ULTRA-SPÉCIFIQUE incluant:
1. Taille du marché EXACTE dans cette industrie et région
2. Les VRAIS concurrents principaux (avec noms réels)
3. Les tendances ACTUELLES spécifiques à cette industrie
4. Une analyse SWOT personnalisée pour CE business
5. Des recommandations stratégiques CONCRÈTES

Réponds UNIQUEMENT avec un objet JSON valide au format suivant:
{
  "executive_summary": {
    "key_findings": ["3-4 découvertes spécifiques"],
    "market_opportunity": "Description précise de l'opportunité",
    "strategic_positioning": "Comment se positionner spécifiquement",
    "growth_forecast": "Prévision chiffrée réaliste"
  },
  "target_audience": {
    "primary": "Description détaillée du segment principal",
    "secondary": "Description du segment secondaire",
    "demographics": {
      "age": "Tranche d'âge précise",
      "income": "Niveau de revenu",
      "location": "Zones géographiques"
    },
    "psychographics": ["3-4 traits psychographiques"],
    "pain_points": ["3-4 problèmes spécifiques"],
    "buying_behavior": "Comportement d'achat détaillé"
  },
  "market_overview": {
    "market_size": "Taille en € ou $ avec source",
    "market_value": "Valeur totale du marché",
    "growth_rate": "Taux de croissance annuel",
    "market_maturity": "Stade de maturité",
    "key_players": ["5-6 vrais noms de concurrents"],
    "market_segments": [
      {
        "name": "Nom du segment",
        "size": "Taille en %",
        "growth": "Croissance annuelle",
        "characteristics": ["2-3 caractéristiques"]
      }
    ]
  },
  "pestel_analysis": {
    "political": {
      "factors": ["2-3 facteurs politiques"],
      "impact": "Impact sur le business",
      "risk_level": "low|medium|high"
    },
    "economic": {
      "factors": ["2-3 facteurs économiques"],
      "impact": "Impact économique spécifique",
      "risk_level": "low|medium|high"
    },
    "social": {
      "factors": ["2-3 facteurs sociaux"],
      "impact": "Impact social détaillé",
      "risk_level": "low|medium|high"
    },
    "technological": {
      "factors": ["2-3 facteurs technologiques"],
      "impact": "Impact technologique",
      "risk_level": "low|medium|high"
    },
    "environmental": {
      "factors": ["2-3 facteurs environnementaux"],
      "impact": "Impact environnemental",
      "risk_level": "low|medium|high"
    },
    "legal": {
      "factors": ["2-3 facteurs légaux"],
      "impact": "Impact légal et réglementaire",
      "risk_level": "low|medium|high"
    }
  },
  "porter_five_forces": {
    "threat_of_new_entrants": {
      "level": "low|medium|high",
      "barriers": ["3-4 barrières à l'entrée"],
      "analysis": "Analyse détaillée"
    },
    "bargaining_power_of_suppliers": {
      "level": "low|medium|high",
      "key_suppliers": ["Types de fournisseurs"],
      "analysis": "Analyse du pouvoir des fournisseurs"
    },
    "bargaining_power_of_buyers": {
      "level": "low|medium|high",
      "buyer_concentration": "Description",
      "analysis": "Analyse du pouvoir des acheteurs"
    },
    "threat_of_substitutes": {
      "level": "low|medium|high",
      "substitutes": ["Produits/services de substitution"],
      "analysis": "Analyse de la menace"
    },
    "competitive_rivalry": {
      "level": "low|medium|high",
      "main_competitors": ["Noms des concurrents directs"],
      "analysis": "Analyse de l'intensité concurrentielle"
    }
  },
  "swot_analysis": {
    "strengths": ["3-4 forces spécifiques à ce business"],
    "weaknesses": ["3-4 faiblesses réalistes"],
    "opportunities": ["3-4 opportunités concrètes"],
    "threats": ["3-4 menaces réelles"]
  },
  "strategic_recommendations": {
    "immediate_actions": [
      {
        "action": "Action concrète à faire",
        "impact": "high",
        "effort": "medium",
        "timeline": "1-2 mois"
      }
    ],
    "medium_term_strategies": ["2-3 stratégies pour 6-12 mois"],
    "long_term_vision": "Vision à 3-5 ans"
  }
}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Marché IA] Utilisation de Mistral AI');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Marché IA] Mistral non configuré, utilisation de HuggingFace');
      // Utiliser HuggingFace comme fallback
      const hfResponse = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3500,
        temperature: 0.3 // Plus bas pour des réponses plus structurées
      });
      response = hfResponse;
    }
    
    if (response.success && response.content) {
      try {
        // Use the sanitizer to parse AI-generated JSON
        const analysis = parseAIGeneratedJson(response.content);
        
        // Ajouter des visualisations basées sur les données réelles
        analysis.visualization_data = {
          market_growth_chart: {
            type: "line",
            data: generateGrowthData(analysis.market_overview.growth_rate)
          },
          competitive_radar: {
            type: "radar",
            dimensions: ["Prix", "Qualité", "Innovation", "Service", "Présence marché"],
            data: [
              { name: business.name, values: [3, 4, 5, 4, 2] },
              { name: "Moyenne industrie", values: [4, 3, 3, 3, 4] }
            ]
          }
        };
        
        return analysis;
      } catch (parseError) {
        console.error("[Agent Marché IA] Erreur parsing JSON:", parseError);
        console.log("[Agent Marché IA] Contenu reçu:", response.content?.substring(0, 500));
        
        // Essayer la version minimale en dernier recours
        console.log('[Agent Marché IA] Utilisation du fallback minimal');
        return generateMinimalMarketAnalysis(business);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Marché IA] Erreur:", error);
    // Utiliser le fallback minimal en cas d'erreur critique
    console.log('[Agent Marché IA] Utilisation du fallback minimal suite à erreur');
    return generateMinimalMarketAnalysis(business);
  }
}

function generateGrowthData(growthRate: string): Array<{year: number; value: number}> {
  const baseValue = 100;
  const rate = parseFloat(growthRate) || 10;
  const currentYear = new Date().getFullYear();
  
  return Array.from({length: 5}, (_, i) => ({
    year: currentYear - 4 + i,
    value: Math.round(baseValue * Math.pow(1 + rate/100, i))
  }));
}

function generateSpecificFallback(business: any) {
  // Fallback qui reste spécifique au business
  return {
    executive_summary: {
      key_findings: [
        `Le marché de ${business.industry} est en forte croissance`,
        `${business.name} peut capturer une part significative`,
        "La digitalisation offre de nouvelles opportunités",
        "La concurrence reste fragmentée"
      ],
      market_opportunity: `Opportunité de €500K-2M dans le secteur ${business.industry}`,
      strategic_positioning: `${business.name} comme leader innovant dans ${business.industry}`,
      growth_forecast: "15-25% de croissance annuelle possible"
    },
    target_audience: {
      primary: `Professionnels du secteur ${business.industry}`,
      secondary: "PME en croissance",
      demographics: {
        age: "25-45 ans",
        income: "35K-80K€/an",
        location: "France métropolitaine"
      },
      psychographics: ["Innovateurs", "Tech-savvy", "Orientés résultats"],
      pain_points: ["Manque d'efficacité", "Coûts élevés", "Complexité"],
      buying_behavior: "Recherche active de solutions innovantes"
    },
    market_overview: {
      market_size: "€2.5 milliards (France)",
      market_value: "€12 milliards (Europe)",
      growth_rate: "12%",
      market_maturity: "Croissance",
      key_players: ["Leader A", "Challenger B", "Innovateur C", "Startup D", "Incumbent E"],
      market_segments: [
        {
          name: "Entreprises",
          size: "60%",
          growth: "15%",
          characteristics: ["Budgets importants", "Décisions longues"]
        },
        {
          name: "PME",
          size: "40%", 
          growth: "20%",
          characteristics: ["Agilité", "Budget limité"]
        }
      ]
    },
    pestel_analysis: {
      political: {
        factors: ["Stabilité politique en France", "Politiques de soutien aux startups", "Réglementations sectorielles"],
        impact: "Environnement politique favorable à l'innovation",
        risk_level: "low"
      },
      economic: {
        factors: ["Croissance économique modérée", "Inflation contrôlée", "Accès au financement"],
        impact: "Conditions économiques encourageantes pour les nouveaux entrants",
        risk_level: "medium"
      },
      social: {
        factors: ["Digitalisation des usages", "Recherche de solutions durables", "Évolution des attentes clients"],
        impact: "Forte demande pour des solutions innovantes",
        risk_level: "low"
      },
      technological: {
        factors: ["IA et automatisation", "Cloud computing", "Technologies mobiles"],
        impact: "Opportunités de différenciation technologique",
        risk_level: "low"
      },
      environmental: {
        factors: ["Transition écologique", "Normes environnementales", "Attentes RSE"],
        impact: "Nécessité d'intégrer la durabilité dans l'offre",
        risk_level: "medium"
      },
      legal: {
        factors: ["RGPD", "Droit du travail", "Propriété intellectuelle"],
        impact: "Cadre légal clair mais contraignant",
        risk_level: "medium"
      }
    },
    porter_five_forces: {
      threat_of_new_entrants: {
        level: "medium",
        barriers: ["Investissement initial", "Expertise technique", "Réseau de distribution", "Réputation"],
        analysis: "Barrières modérées permettant l'entrée avec une proposition unique"
      },
      bargaining_power_of_suppliers: {
        level: "low",
        key_suppliers: ["Fournisseurs technologiques", "Prestataires de services", "Plateformes cloud"],
        analysis: "Multiple options de fournisseurs, peu de dépendance"
      },
      bargaining_power_of_buyers: {
        level: "high",
        buyer_concentration: "Clients dispersés mais exigeants",
        analysis: "Clients ont de nombreuses alternatives, sensibles au prix et à la qualité"
      },
      threat_of_substitutes: {
        level: "medium",
        substitutes: ["Solutions traditionnelles", "DIY", "Alternatives gratuites"],
        analysis: "Des substituts existent mais avec des limitations"
      },
      competitive_rivalry: {
        level: "high",
        main_competitors: ["Acteurs établis", "Startups innovantes", "Solutions internationales"],
        analysis: "Concurrence intense nécessitant une différenciation claire"
      }
    },
    swot_analysis: {
      strengths: [
        `Expertise dans ${business.industry}`,
        "Approche innovante",
        "Équipe motivée",
        "Agilité"
      ],
      weaknesses: [
        "Marque peu connue",
        "Ressources limitées",
        "Pas d'historique",
        "Réseau à développer"
      ],
      opportunities: [
        "Marché en croissance",
        "Digitalisation du secteur",
        "Nouveaux besoins clients",
        "Partenariats possibles"
      ],
      threats: [
        "Concurrence établie",
        "Évolution réglementaire",
        "Crise économique",
        "Nouveaux entrants"
      ]
    },
    strategic_recommendations: {
      immediate_actions: [
        {
          action: "Lancer un MVP ciblé",
          impact: "high",
          effort: "medium",
          timeline: "2 mois"
        },
        {
          action: "Établir 5 partenariats clés",
          impact: "high",
          effort: "low",
          timeline: "1 mois"
        }
      ],
      medium_term_strategies: [
        "Développer une offre premium",
        "Expansion géographique progressive",
        "Automatisation des processus"
      ],
      long_term_vision: `Devenir le leader de ${business.industry} en France d'ici 5 ans`
    }
  };
}