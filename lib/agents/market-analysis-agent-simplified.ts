import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateWithMistralSearch } from '@/lib/mistral-search-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';
// Removed analysis-helpers import - no hardcoded data

// Version simplifiée de l'analyse de marché pour éviter la troncature
export async function runSimplifiedMarketAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Marché Simplifié] Analyse pour ${business.name}...`);
  console.log(`[Agent Marché Simplifié] Business data:`, { name: business.name, industry: business.industry, description: business.description?.substring(0, 100) });
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Structure JSON professionnelle pour l'analyse de marché
  const exampleJson = {
    executive_summary: {
      market_opportunity: "Marché de la restauration gastronomique parisienne en pleine transformation",
      key_insight: "Forte demande pour des expériences culinaires uniques et exclusives post-COVID",
      recommendation: "Lancer rapidement pour capturer la demande croissante d'expériences éphémères"
    },
    market_size: {
      total_addressable_market: "2.8 milliards € (restauration gastronomique France)",
      serviceable_addressable_market: "450 millions € (gastronomique Paris)",
      serviceable_obtainable_market: "15-20 millions € (segment éphémère premium)",
      growth_rate: "12% annuel (segment expériences uniques)"
    },
    market_dynamics: {
      key_drivers: [
        "Quête d'exclusivité et d'expériences Instagram-worthy",
        "Tourisme gastronomique international en forte reprise (+25%)",
        "Clientèle CSP++ recherchant la nouveauté permanente",
        "FOMO (fear of missing out) créé par le caractère éphémère"
      ],
      barriers: [
        "Fidélisation complexe avec modèle éphémère",
        "Coûts opérationnels élevés du changement mensuel",
        "Recrutement de chefs de renom chaque mois",
        "Gestion des attentes avec concepts variables"
      ],
      trends: [
        "Pop-up restaurants et concepts éphémères en hausse (+40% en 2023)",
        "Digitalisation des réservations (90% en ligne)",
        "Expériences immersives au-delà de la simple restauration",
        "Collaborations chefs internationaux très recherchées",
        "Durabilité et circuits courts devenus essentiels"
      ]
    },
    target_audience: {
      primary: {
        description: "Gastronomes urbains à haut pouvoir d'achat (35-55 ans)",
        size: "150,000 personnes à Paris",
        characteristics: [
          "Revenus > 80K€/an",
          "Fréquentent déjà les restaurants étoilés",
          "Early adopters d'expériences culinaires",
          "Très actifs sur Instagram/réseaux sociaux",
          "Recherchent l'exclusivité et le storytelling"
        ],
        pain_points: [
          "Lassitude des restaurants traditionnels",
          "Difficulté à impressionner leur cercle social",
          "Manque de nouvelles expériences gastronomiques",
          "Recherche constante de nouveauté"
        ]
      },
      secondary: {
        description: "Touristes internationaux premium et corporates",
        size: "500,000 visiteurs/an + 2000 entreprises",
        characteristics: [
          "Touristes d'affaires et loisir haut de gamme",
          "Entreprises pour événements exclusifs",
          "Conciergeries hôtels de luxe",
          "Agences événementielles premium"
        ]
      }
    },
    competitive_landscape: {
      market_maturity: "Marché mature mais en réinvention",
      competitive_intensity: "Haute sur le haut de gamme traditionnel, faible sur l'éphémère",
      key_success_factors: [
        "Capacité à attirer des chefs de renom",
        "Excellence opérationnelle malgré les changements",
        "Marketing créant le désir et l'urgence",
        "Gestion impeccable de l'expérience client",
        "Réseau dans le milieu gastronomique"
      ]
    },
    opportunities: [
      "Premier mover advantage sur le segment restaurant gastronomique éphémère",
      "Potentiel de partenariats avec marques de luxe pour événements",
      "Développement d'une marque média (livre, documentaire, podcast)",
      "Expansion internationale du concept (Londres, New York, Tokyo)",
      "Création d'une liste d'attente exclusive générant des revenus récurrents"
    ],
    risks: [
      "Dépendance à la disponibilité de chefs de qualité",
      "Risque de bad buzz si un mois déçoit",
      "Difficulté à maintenir le niveau d'excellence",
      "Possibilité de copie du concept par des acteurs établis",
      "Sensibilité aux crises (COVID, économique)"
    ],
    market_entry_strategy: {
      positioning: "Le seul restaurant où chaque mois est une première mondiale",
      launch_strategy: "Soft launch avec 3 chefs Michelin confirmés pour créer le buzz",
      pricing_strategy: "Premium positioning - Menu unique 250€ justifié par l'exclusivité",
      distribution: "Réservations exclusives via site propre + conciergeries sélectionnées",
      timeline: "Pré-buzz 2 mois avant, ouverture progressive sur 3 mois"
    },
    visualization_data: {
      market_growth_chart: {
        type: "line",
        data: [
          { year: 2022, value: 100 },
          { year: 2023, value: 112 },
          { year: 2024, value: 126 },
          { year: 2025, value: 141 }
        ]
      }
    },
    pestel_analysis: {
      political: {
        factors: [
          "Réglementation sanitaire stricte (normes HACCP, traçabilité)",
          "Politiques de soutien au tourisme gastronomique",
          "Tensions sur les licences et autorisations temporaires",
          "Régulation du travail dans la restauration (35h, extras)"
        ],
        impact: "Les réglementations strictes favorisent les acteurs organisés et créent des barrières à l'entrée",
        risk_level: "medium"
      },
      economic: {
        factors: [
          "Inflation alimentaire élevée (+12% sur produits premium en 2023)",
          "Pouvoir d'achat segment luxe résilient malgré la crise",
          "Coûts immobiliers Paris très élevés (150€/m²/mois restauration)",
          "Pénurie de main d'oeuvre qualifiée (+15% salaires)"
        ],
        impact: "Pression sur les marges mais clientèle premium peu sensible aux prix",
        risk_level: "high"
      },
      social: {
        factors: [
          "Quête d'expériences uniques et 'instagrammables'",
          "Montée du foodie tourism international",
          "Sensibilité croissante à la durabilité et au local",
          "Culture du FOMO (fear of missing out) chez les millennials"
        ],
        impact: "Forte demande pour des concepts innovants et éphémères",
        risk_level: "low"
      },
      technological: {
        factors: [
          "Digitalisation des réservations (95% en ligne)",
          "Influence des réseaux sociaux sur les choix",
          "Technologies de cuisine moléculaire accessibles",
          "Outils de gestion et analytics sophistiqués"
        ],
        impact: "La tech permet l'optimisation mais crée une dépendance au digital",
        risk_level: "low"
      },
      environmental: {
        factors: [
          "Exigences de sourcing durable et bio",
          "Gestion des déchets alimentaires obligatoire",
          "Bilan carbone scrutinisé par les clients",
          "Saisonnalité des produits limite les menus"
        ],
        impact: "Contraintes opérationnelles mais opportunité de différenciation",
        risk_level: "medium"
      },
      legal: {
        factors: [
          "Droit du travail complexe (CDD, intermittents)",
          "Licences IV limitées et chères",
          "Responsabilité hygiene stricte (fermeture immédiate)",
          "RGPD pour données clients VIP"
        ],
        impact: "Complexité administrative élevée nécessitant expertise",
        risk_level: "high"
      }
    },
    porter_five_forces: {
      threat_of_new_entrants: {
        level: "medium",
        factors: [
          "Barrières capitalistiques élevées (500K€ minimum Paris)",
          "Difficulté d'accès aux emplacements premium",
          "Nécessité d'un réseau dans le milieu gastronomique",
          "Complexité réglementaire décourageante"
        ],
        barriers: [
          "Investissement initial conséquent",
          "Expertise culinaire de haut niveau requise",
          "Réputation à construire dans un milieu fermé"
        ]
      },
      bargaining_power_of_suppliers: {
        level: "high",
        factors: [
          "Fournisseurs premium en position de force",
          "Rareté des produits d'exception",
          "Dépendance aux chefs étoilés invités",
          "Exclusivités difficiles à négocier"
        ],
        key_suppliers: [
          "Producteurs AOP/AOC exclusifs",
          "Maisons de champagne et vins prestigieux",
          "Chefs étoilés et leurs agents",
          "Fournisseurs équipements haute gamme"
        ]
      },
      bargaining_power_of_buyers: {
        level: "medium",
        factors: [
          "Clientèle exigeante mais captive sur le premium",
          "Forte influence des avis en ligne",
          "Comparaison facile entre restaurants étoilés",
          "Fidélité faible sur concepts éphémères"
        ],
        buyer_concentration: "Clientèle fragmentée mais influenceurs clés"
      },
      threat_of_substitutes: {
        level: "low",
        factors: [
          "Peu d'alternatives au dining gastronomique",
          "Expérience unique difficile à reproduire",
          "Chefs privés restent très coûteux",
          "Food tours ne remplacent pas l'expérience"
        ],
        substitutes: [
          "Restaurants étoilés traditionnels",
          "Tables d'hôtes exclusives",
          "Clubs privés avec restauration",
          "Expériences culinaires à domicile"
        ]
      },
      competitive_rivalry: {
        level: "high",
        factors: [
          "Compétition intense pour les meilleures tables",
          "Course aux chefs les plus médiatisés",
          "Innovation constante nécessaire",
          "Guerre des prix impossible sur le premium"
        ],
        main_competitors: [
          "Restaurants 3 étoiles Michelin",
          "Pop-ups de chefs célèbres",
          "Hôtels palaces avec restaurants",
          "Nouveaux concepts gastronomiques"
        ]
      }
    },
    swot_analysis: {
      strengths: [
        "Concept unique d'éphémère gastronomique mensuel",
        "Flexibilité totale sur les menus et expériences",
        "Création de rareté et d'urgence naturelles",
        "Pas de lassitude grâce au renouvellement",
        "Buzz médiatique assuré à chaque rotation"
      ],
      weaknesses: [
        "Coûts opérationnels du changement mensuel",
        "Difficulté à fidéliser sans continuité",
        "Risque de qualité variable selon les chefs",
        "Complexité logistique extrême",
        "Investissement marketing récurrent élevé"
      ],
      opportunities: [
        "Marché des expériences exclusives en boom",
        "Tourisme gastronomique international croissant",
        "Potentiel de franchise du concept",
        "Développement produits dérivés (livre, doc)",
        "Partenariats luxe pour événements privés"
      ],
      threats: [
        "Copie du concept par acteurs établis",
        "Dépendance aux chefs stars disponibles",
        "Sensibilité aux crises (sanitaire, éco)",
        "Risque d'un mois raté = bad buzz",
        "Lassitude possible du concept éphémère"
      ]
    }
  };
  
  const systemContext = `Tu es un consultant senior chez McKinsey spécialisé dans les études de marché pour le secteur ${business.industry}.

Tu DOIS fournir une analyse de marché PROFESSIONNELLE et ACTIONNABLE en respectant ces règles:
1. Réponds UNIQUEMENT avec un objet JSON valide
2. Utilise la structure exacte de l'exemple fourni
3. Fournis des données CHIFFRÉES et VÉRIFIABLES avec leurs SOURCES
4. Base-toi sur des tendances RÉELLES du marché avec des données 2023-2024
5. Donne des insights STRATÉGIQUES exploitables
6. Sois PRÉCIS sur les segments et leurs caractéristiques
7. Chaque recommandation doit être actionnable
8. OBLIGATOIRE: Inclure un champ "sources" avec au moins 4 références crédibles
9. Générer des analyses PESTEL et Porter complètes et PERTINENTES
10. SWOT doit contenir des points SPÉCIFIQUES au business, pas génériques
11. TRÈS IMPORTANT: Le target_audience DOIT contenir primary ET secondary avec:
    - description détaillée et spécifique (pas de générique)
    - size avec des chiffres précis
    - characteristics (au moins 5 points spécifiques)
    - pain_points pour primary (au moins 3 problèmes réels)`;

  const prompt = `Réalise une étude de marché APPROFONDIE et PROFESSIONNELLE pour:

Entreprise: ${business.name}
Secteur: ${business.industry}
Description: ${business.description}

IMPORTANT:
- Fournis des données de marché RÉELLES et CHIFFRÉES
- Identifie les segments de clientèle PRÉCIS avec leurs caractéristiques
- Analyse les tendances ACTUELLES et ÉMERGENTES du secteur
- Donne une stratégie d'entrée sur le marché CONCRÈTE
- Quantifie les opportunités et les risques
- IMPORTANT: Ajoute des sections complètes pour:
  * pestel_analysis: 6 dimensions avec factors, impact et risk_level
  * porter_five_forces: 5 forces avec level, factors et analyses spécifiques
  * swot_analysis: forces, faiblesses, opportunités, menaces PERTINENTES

Structure JSON EXACTE à suivre:
${JSON.stringify(exampleJson, null, 2)}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Marché Simplifié] Utilisation de Mistral AI avec recherche web');
      // Essayer d'abord avec la recherche web pour des données actuelles
      const searchResponse = await generateWithMistralSearch(
        `Étude de marché ${business.industry} France 2024 chiffres statistiques tendances`,
        systemContext
      );
      
      if (searchResponse.success && searchResponse.content) {
        // Vérifier si le contenu est du JSON valide
        try {
          JSON.parse(searchResponse.content);
          response = searchResponse;
          console.log('[Agent Marché Simplifié] Données web intégrées avec JSON valide');
        } catch (e) {
          // Si ce n'est pas du JSON valide, utiliser l'API standard avec format JSON
          console.log('[Agent Marché Simplifié] Réponse web non-JSON, fallback vers API standard');
          response = await generateWithMistralAPI(prompt, systemContext);
        }
      } else {
        // Fallback vers l'API standard
        response = await generateWithMistralAPI(prompt, systemContext);
      }
    } else {
      console.log('[Agent Marché Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3500,
        temperature: 0.4
      });
    }
    
    if (response.success && response.content) {
      try {
        const analysis = parseAIGeneratedJson(response.content);
        
        // Transformer pour correspondre au schéma MongoDB avec toutes les données
        const transformedAnalysis = {
          ...analysis,
          // Garder target_audience comme objet si c'est déjà un objet, sinon créer une structure compatible
          target_audience: analysis.target_audience && typeof analysis.target_audience === 'object' ? 
            analysis.target_audience : 
            {
              primary: {
                description: analysis.target_audience || "Cible principale du secteur",
                size: "À déterminer",
                characteristics: ["À analyser"]
              }
            },
          // Pour la compatibilité MongoDB, on ajoute aussi target_audience_str
          target_audience_str: analysis.target_audience?.primary?.description || analysis.target_audience || "Cible principale du secteur",
          value_proposition: analysis.executive_summary?.key_insight || `Solution innovante pour ${business.industry}`,
          competitors: analysis.competitive_landscape?.key_success_factors?.slice(0, 3) || ["Leader marché", "Challenger digital", "Spécialiste niche"],
          opportunities: analysis.opportunities || ["Digitalisation", "Nouveaux besoins", "Expansion"],
          threats: analysis.risks || ["Concurrence", "Réglementation", "Évolution marché"],
          swot_analysis: analysis.swot_analysis || {
            strengths: ["Innovation", "Agilité", "Vision claire"],
            weaknesses: ["Ressources limitées", "Marque nouvelle", "Réseau à construire"],
            opportunities: analysis.opportunities || ["Digitalisation", "Nouveaux besoins", "Partenariats"],
            threats: analysis.risks || ["Concurrence établie", "Régulations", "Économie"]
          },
          strategic_recommendations: analysis.market_entry_strategy ? {
            immediate_actions: [
              {
                action: analysis.market_entry_strategy.launch_strategy || "Lancer une phase pilote",
                impact: "high",
                timeline: "1-3 mois"
              },
              {
                action: analysis.market_entry_strategy.positioning || "Définir le positionnement unique",
                impact: "high",
                timeline: "Immédiat"
              }
            ],
            long_term_vision: analysis.market_entry_strategy.timeline || "Leadership sur le segment dans 3-5 ans"
          } : {
            immediate_actions: [
              { action: "Valider le concept", impact: "high", timeline: "1 mois" },
              { action: "Développer un MVP", impact: "high", timeline: "3 mois" }
            ],
            long_term_vision: "Devenir leader du secteur"
          },
          pestel_analysis: analysis.pestel_analysis || {
            political: { factors: [], impact: "À générer", risk_level: "unknown" },
            economic: { factors: [], impact: "À générer", risk_level: "unknown" },
            social: { factors: [], impact: "À générer", risk_level: "unknown" },
            technological: { factors: [], impact: "À générer", risk_level: "unknown" },
            environmental: { factors: [], impact: "À générer", risk_level: "unknown" },
            legal: { factors: [], impact: "À générer", risk_level: "unknown" }
          },
          porter_five_forces: analysis.porter_five_forces || {
            threat_of_new_entrants: { level: "unknown", factors: [] },
            bargaining_power_of_suppliers: { level: "unknown", factors: [] },
            bargaining_power_of_buyers: { level: "unknown", factors: [] },
            threat_of_substitutes: { level: "unknown", factors: [] },
            competitive_rivalry: { level: "unknown", factors: [] }
          }
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

// Version minimale en cas d'échec - SANS DONNÉES EN DUR
export function generateMinimalMarketAnalysis(business: any): any {
  const industryName = business.industry || "secteur";
  
  // Retourner une structure minimale qui indique que l'analyse a échoué
  return {
    error: true,
    message: `L'analyse de marché pour ${business.name} n'a pas pu être générée correctement.`,
    retry_needed: true,
    executive_summary: {
      market_opportunity: "Analyse en cours de génération...",
      key_insight: "Veuillez patienter ou relancer l'analyse",
      recommendation: "Une nouvelle analyse est nécessaire"
    },
    target_audience: {
      primary: {
        description: "Analyse du public cible en cours...",
        size: "À déterminer",
        characteristics: ["À analyser"],
        pain_points: ["À identifier"]
      }
    },
    market_overview: {
      market_size: "Données à collecter",
      growth_rate: "À analyser",
      market_maturity: "À déterminer"
    },
    // Structures minimales pour éviter les erreurs d'affichage
    market_dynamics: {
      key_drivers: [],
      barriers: [],
      trends: []
    },
    opportunities: [],
    threats: [],
    swot_analysis: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    },
    competitive_landscape: {
      market_maturity: "À analyser",
      competitive_intensity: "À déterminer",
      key_success_factors: []
    },
    strategic_recommendations: {
      immediate_actions: [],
      long_term_vision: "À définir après analyse complète"
    },
    pestel_analysis: {
      political: { factors: [], impact: "À analyser", risk_level: "unknown" },
      economic: { factors: [], impact: "À analyser", risk_level: "unknown" },
      social: { factors: [], impact: "À analyser", risk_level: "unknown" },
      technological: { factors: [], impact: "À analyser", risk_level: "unknown" },
      environmental: { factors: [], impact: "À analyser", risk_level: "unknown" },
      legal: { factors: [], impact: "À analyser", risk_level: "unknown" }
    },
    porter_five_forces: {
      threat_of_new_entrants: { level: "unknown", factors: [], barriers: [] },
      bargaining_power_of_suppliers: { level: "unknown", factors: [], key_suppliers: [] },
      bargaining_power_of_buyers: { level: "unknown", factors: [], buyer_concentration: "À analyser" },
      threat_of_substitutes: { level: "unknown", factors: [], substitutes: [] },
      competitive_rivalry: { level: "unknown", factors: [], main_competitors: [] }
    },
    sources: [
      {
        name: "Analyse non disponible",
        type: "Erreur système",
        date: new Date().getFullYear().toString(),
        credibility: "estimation"
      }
    ]
  };
}