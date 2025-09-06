import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateWithMistralSearch } from '@/lib/mistral-search-service';
import { generateAIResponse } from '@/lib/ai-service';

export async function runSimplifiedCompetitorAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Concurrent Simplifié] Analyse pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Structure JSON professionnelle pour l'analyse concurrentielle
  const exampleJson = {
    main_competitors: [
      {
        name: "La Table de Joël Robuchon",
        strengths: [
          "Réputation internationale établie",
          "3 étoiles Michelin maintenues",
          "Emplacement premium dans le 8ème",
          "Service d'excellence reconnu"
        ],
        weaknesses: [
          "Prix très élevés (menu 400€+)",
          "Ambiance formelle peu moderne",
          "Innovation culinaire limitée",
          "Clientèle vieillissante"
        ],
        market_share: "15%",
        threat_level: "high"
      },
      {
        name: "Septime (11ème)",
        strengths: [
          "Concept innovant et tendance",
          "Prix plus accessibles (menu 95€)",
          "Forte présence médias sociaux",
          "Clientèle jeune et internationale"
        ],
        weaknesses: [
          "Capacité limitée (30 couverts)",
          "Réservations difficiles",
          "Localisation moins prestigieuse",
          "Pas d'étoile Michelin"
        ],
        market_share: "8%",
        threat_level: "medium"
      },
      {
        name: "Le Chateaubriand (11ème)",
        strengths: [
          "Menu surprise innovant",
          "Réputation avant-gardiste",
          "Prix moyens (menu 135€)",
          "Ambiance décontractée moderne"
        ],
        weaknesses: [
          "Pas de choix dans le menu",
          "Service parfois inégal",
          "Décor minimaliste polarisant",
          "Localisation excentrée"
        ],
        market_share: "6%",
        threat_level: "medium"
      }
    ],
    competitive_advantages: [
      "Concept unique de restaurant éphémère avec rotation mensuelle",
      "Flexibilité totale sur les menus et concepts",
      "Exclusivité et rareté créant un buzz marketing",
      "Coûts fixes réduits grâce au modèle éphémère",
      "Capacité d'attirer les meilleurs chefs invités"
    ],
    threats: [
      "Difficulté à fidéliser une clientèle régulière",
      "Complexité logistique du changement mensuel",
      "Coûts de marketing élevés pour chaque nouveau concept",
      "Risque de qualité variable selon les chefs",
      "Dépendance aux tendances et à la nouveauté"
    ],
    opportunities: [
      "Marché parisien en recherche d'expériences uniques",
      "Tourisme gastronomique international en hausse",
      "Collaborations avec chefs internationaux renommés",
      "Potentiel de franchise du concept dans d'autres villes",
      "Partenariats avec marques de luxe pour événements"
    ],
    competitive_positioning: {
      current_position: "Nouvel entrant innovant sur le marché gastronomique parisien",
      desired_position: "Leader des expériences gastronomiques éphémères premium",
      key_differentiators: [
        "Seul restaurant gastronomique à rotation mensuelle complète",
        "Expérience exclusive et limitée dans le temps",
        "Prix premium justifiés par la rareté (menu 250€)",
        "Storytelling unique pour chaque chef invité"
      ]
    },
    competitive_strategy: {
      approach: "Stratégie de différenciation par l'innovation et l'exclusivité",
      tactics: [
        "Communication 2 mois avant chaque nouveau chef",
        "Système de réservation par liste d'attente exclusive",
        "Partenariats médias pour couverture de chaque lancement",
        "Prix premium positionnant au niveau 2 étoiles",
        "Focus sur l'expérience client totale, pas seulement la cuisine"
      ],
      timeline: "Lancement dans 2 mois, montée en puissance sur 6 mois"
    },
    sources: [
      {
        name: "Guide Michelin France 2024",
        type: "Guide gastronomique",
        date: "2024",
        credibility: "référence"
      },
      {
        name: "La Liste - Classement mondial",
        type: "Ranking gastronomique",
        date: "2023",
        credibility: "référence"
      },
      {
        name: "Atabula - Veille concurrentielle",
        type: "Média spécialisé",
        date: "2024",
        credibility: "sectoriel"
      },
      {
        name: "TripAdvisor Insights",
        type: "Données consommateurs",
        date: "2023",
        credibility: "participatif"
      }
    ]
  };
  
  const systemContext = `Tu es un consultant senior spécialisé en analyse concurrentielle dans le secteur ${business.industry} avec 20 ans d'expérience.

Tu DOIS fournir une analyse PROFESSIONNELLE et DÉTAILLÉE en suivant ces règles:
1. Réponds UNIQUEMENT avec un objet JSON valide
2. Utilise la structure exacte de l'exemple fourni
3. Fournis des données RÉELLES et VÉRIFIABLES pour ${business.industry}
4. Inclus des noms de concurrents RÉELS et connus
5. Donne des insights ACTIONNABLES et SPÉCIFIQUES
6. Utilise des pourcentages et chiffres réalistes
7. Chaque point doit être précis et professionnel
8. OBLIGATOIRE: Inclure un champ "sources" avec les références utilisées`;

  const prompt = `Réalise une analyse concurrentielle PROFESSIONNELLE et APPROFONDIE pour:

Entreprise: ${business.name}
Secteur: ${business.industry}
Description: ${business.description}

IMPORTANT: 
- Identifie les VRAIS concurrents directs dans ${business.industry}
- Fournis des forces/faiblesses SPÉCIFIQUES et RÉALISTES
- Donne des parts de marché estimées crédibles
- Propose une stratégie de différenciation ACTIONNABLE

Structure JSON EXACTE à suivre:
${JSON.stringify(exampleJson, null, 2)}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Concurrent Simplifié] Utilisation de Mistral AI avec recherche web');
      // Essayer d'abord avec la recherche web
      const searchResponse = await generateWithMistralSearch(
        `Analyse concurrentielle ${business.industry} France 2024 principaux acteurs parts de marché`,
        systemContext
      );
      
      if (searchResponse.success && searchResponse.content) {
        // Vérifier si le contenu est du JSON valide
        try {
          JSON.parse(searchResponse.content);
          response = searchResponse;
          console.log('[Agent Concurrent Simplifié] Données concurrentielles web intégrées avec JSON valide');
        } catch (e) {
          // Si ce n'est pas du JSON valide, utiliser l'API standard avec format JSON
          console.log('[Agent Concurrent Simplifié] Réponse web non-JSON, fallback vers API standard');
          response = await generateWithMistralAPI(prompt, systemContext);
        }
      } else {
        // Fallback vers l'API standard
        response = await generateWithMistralAPI(prompt, systemContext);
      }
    } else {
      console.log('[Agent Concurrent Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3000,
        temperature: 0.4
      });
    }
    
    if (response.success && response.content) {
      try {
        const analysis = JSON.parse(response.content);
        console.log('[Agent Concurrent Simplifié] JSON parsé avec succès');
        
        // Assurer que les sources sont incluses
        if (!analysis.sources) {
          analysis.sources = [
            {
              name: "Analyse concurrentielle synthétisée",
              type: "Synthèse IA",
              date: new Date().getFullYear().toString(),
              credibility: "estimation"
            }
          ];
        }
        
        return analysis;
      } catch (parseError) {
        console.error('[Agent Concurrent Simplifié] Erreur parsing:', parseError);
        return generateMinimalAnalysis(business);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error('[Agent Concurrent Simplifié] Erreur:', error);
    return generateMinimalAnalysis(business);
  }
}

function generateMinimalAnalysis(business: any): any {
  // Version minimale en cas d'échec - SANS DONNÉES EN DUR
  return {
    error: true,
    message: `L'analyse concurrentielle pour ${business.name} n'a pas pu être générée correctement.`,
    retry_needed: true,
    main_competitors: [],
    competitive_advantages: ["Analyse en cours..."],
    threats: ["À identifier"],
    opportunities: ["À analyser"],
    competitive_positioning: {
      current_position: "Analyse nécessaire",
      desired_position: "À définir",
      key_differentiators: []
    },
    competitive_strategy: {
      approach: "Stratégie à développer après analyse",
      tactics: [],
      timeline: "À déterminer"
    },
    sources: [
      {
        name: "Analyse concurrentielle non disponible",
        type: "Erreur système",
        date: new Date().getFullYear().toString(),
        credibility: "estimation"
      }
    ]
  };
}