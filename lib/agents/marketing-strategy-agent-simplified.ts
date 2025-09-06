import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';

export async function runSimplifiedMarketingStrategyAgent(business: any, marketAnalysis: any): Promise<any> {
  console.log(`[Agent Marketing Simplifié] Génération pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Structure JSON simplifiée mais professionnelle
  const exampleJson = {
    vision: "Devenir la référence des expériences gastronomiques éphémères en Europe d'ici 2028",
    mission: "Réinventer la haute gastronomie avec une rotation mensuelle de chefs étoilés",
    unique_value_proposition: "Le seul restaurant où chaque mois est une première mondiale culinaire",
    positioning: "Premium exclusif - Entre tradition gastronomique et innovation expérientielle",
    target_segments: [
      {
        name: "Gastronomes Collectionneurs CSP++",
        description: "Passionnés qui collectionnent les expériences culinaires uniques",
        size: "25,000 individus à Paris",
        budget_moyen: "300-500€/repas"
      },
      {
        name: "Entreprises & Événementiel Premium",
        description: "CAC40 et agences pour événements exclusifs",
        size: "500 entreprises cibles",
        budget_moyen: "10,000-25,000€/event"
      }
    ],
    key_messages: [
      "Chaque mois, une première et dernière mondiale",
      "Là où les plus grands chefs deviennent artistes éphémères",
      "Une collection d'expériences gastronomiques irrépétables",
      "Réservez maintenant ou regrettez pour toujours"
    ],
    channels: [
      {
        name: "PR & Relations Presse Premium",
        priority: "high",
        tactics: [
          "Dossiers presse exclusifs par chef mensuel",
          "Preview media VIP une semaine avant ouverture",
          "Partenariats éditoriaux Vogue, Financial Times, Figaro",
          "Reportages TV haut de gamme (50' Inside, C à Vous)"
        ],
        budget: "150,000€/an"
      },
      {
        name: "Marketing Direct Ultra-Ciblé",
        priority: "high",
        tactics: [
          "Base VIP avec invitations physiques luxueuses",
          "Conciergeries hôtels 5* et cartes black",
          "Programme ambassadeurs avec célébrités",
          "Events preview exclusifs pour top clients"
        ],
        budget: "180,000€/an"
      },
      {
        name: "Digital & Social Media Premium",
        priority: "high",
        tactics: [
          "Instagram storytelling façon magazine luxe",
          "Site web immersif avec réservation exclusive",
          "YouTube documentaires mensuels des chefs",
          "App mobile VIP avec avantages membres"
        ],
        budget: "120,000€/an"
      },
      {
        name: "Partenariats Stratégiques Luxe",
        priority: "medium",
        tactics: [
          "Hotels palaces pour packages séjour",
          "Maisons champagne/vins pour exclusivités",
          "Marques luxe non-compétitives (joaillerie, auto)",
          "Tour opérateurs gastronomiques internationaux"
        ],
        budget: "90,000€/an"
      }
    ],
    content_pillars: [
      "Behind the Scenes: L'intimité créative des chefs étoilés",
      "Ingredients Stories: La quête des produits d'exception",
      "Countdown Culture: L'urgence de l'expérience éphémère",
      "Guest Moments: Témoignages VIP et célébrités",
      "Chef Philosophy: L'art et la vision de chaque invité"
    ],
    immediate_actions: [
      {
        action: "Sécuriser les 3 premiers chefs étoilés de renom international",
        timeline: "1 mois",
        budget: "50,000€",
        expected_outcome: "Garantir un lancement avec impact maximal"
      },
      {
        action: "Créer teasing campaign mystère dans media luxe",
        timeline: "2 mois avant ouverture",
        budget: "30,000€",
        expected_outcome: "Générer 1000+ inscriptions liste attente VIP"
      },
      {
        action: "Organiser soirée preview influenceurs gastronomie",
        timeline: "1 semaine avant launch",
        budget: "20,000€",
        expected_outcome: "50+ posts Instagram premium, 10M+ reach"
      },
      {
        action: "Activer partenariats conciergeries luxe",
        timeline: "1 mois avant ouverture",
        budget: "10,000€",
        expected_outcome: "Accès direct à 5000+ clients ultra-premium"
      },
      {
        action: "Lancer programme early-bird VIP collectors",
        timeline: "6 semaines avant",
        budget: "15,000€",
        expected_outcome: "100 membres fondateurs à 3000€/an"
      }
    ],
    kpis: [
      {
        metric: "Taux de remplissage",
        target: "95%+ dès le 3ème mois",
        frequency: "Quotidien"
      },
      {
        metric: "Prix moyen par couvert",
        target: "350€ (incluant vins)",
        frequency: "Hebdomadaire"
      },
      {
        metric: "Net Promoter Score",
        target: "9+/10",
        frequency: "Après chaque expérience"
      },
      {
        metric: "Taux de rétention annuel",
        target: "60% reviennent 3+ fois/an",
        frequency: "Trimestriel"
      },
      {
        metric: "Couverture media premium",
        target: "20+ articles/mois dans presse A",
        frequency: "Mensuel"
      }
    ],
    budget_summary: {
      year_1_total: "600,000€",
      breakdown: {
        "PR & Influence": "25%",
        "Direct Marketing": "30%",
        "Digital & Content": "20%",
        "Partenariats": "15%",
        "Events & Activations": "10%"
      },
      expected_roi: "350% sur 24 mois"
    }
  };
  
  const systemContext = `Tu es un directeur marketing senior spécialisé dans le secteur ${business.industry} avec 15 ans d'expérience.

Tu DOIS créer une stratégie marketing PROFESSIONNELLE et ACTIONNABLE en respectant ces règles:
1. Réponds UNIQUEMENT avec un objet JSON valide
2. Utilise la structure EXACTE de l'exemple fourni
3. Adapte spécifiquement à ${business.name} dans ${business.industry}
4. Fournis des tactiques CONCRÈTES et RÉALISABLES
5. Donne des budgets et KPIs CRÉDIBLES
6. Reste dans le format JSON fourni, sans ajouter de champs`;

  const prompt = `Crée une stratégie marketing COMPLÈTE pour:

Entreprise: ${business.name}
Secteur: ${business.industry}
Description: ${business.description}

BASE ta stratégie sur:
- Le positionnement unique du business
- Les canaux marketing adaptés au secteur
- Des tactiques modernes et efficaces
- Des KPIs mesurables et pertinents
- Un budget réaliste pour le secteur

Structure JSON EXACTE à suivre (adapte le contenu mais garde la structure):
${JSON.stringify(exampleJson, null, 2)}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Marketing Simplifié] Utilisation de Mistral AI avec format JSON');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Marketing Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3000,
        temperature: 0.4
      });
    }
    
    if (response.success && response.content) {
      try {
        // Parser directement le JSON (devrait être valide grâce à response_format)
        const strategy = JSON.parse(response.content);
        console.log('[Agent Marketing Simplifié] JSON parsé avec succès');
        return strategy;
      } catch (parseError) {
        console.error('[Agent Marketing Simplifié] Erreur parsing:', parseError);
        // Fallback basique
        return generateMinimalStrategy(business);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error('[Agent Marketing Simplifié] Erreur:', error);
    return generateMinimalStrategy(business);
  }
}

function generateMinimalStrategy(business: any): any {
  const industryName = business.industry || "votre secteur";
  const isRestaurant = industryName.toLowerCase().includes('restaura');
  
  if (isRestaurant) {
    return {
      vision: "Devenir la référence des expériences gastronomiques uniques à Paris puis en Europe",
      mission: "Offrir des expériences culinaires éphémères inoubliables avec les meilleurs chefs du monde",
      unique_value_proposition: "Le seul restaurant où chaque mois offre une expérience gastronomique qui ne se reproduira jamais",
      positioning: "Ultra-premium expérientiel - Au-delà du Michelin, l'art culinaire éphémère",
      target_segments: [
        {
          name: "Gastronomes Passionnés Premium",
          description: "Amateurs éclairés recherchant l'exceptionnel",
          size: "30,000 personnes à Paris",
          budget_moyen: "250-400€/repas"
        },
        {
          name: "Tourisme Gastronomique International",
          description: "Voyageurs luxe visitant Paris pour la gastronomie",
          size: "200,000 visiteurs/an",
          budget_moyen: "300-600€/repas"
        }
      ],
      key_messages: [
        "Une expérience qui ne se reproduira jamais",
        "Les plus grands chefs du monde, un mois seulement",
        "Réservez maintenant ou regrettez à jamais",
        "Collectionnez les moments gastronomiques uniques"
      ],
      channels: [
        {
          name: "Relations Presse Gastronomique",
          priority: "high",
          tactics: [
            "Exclusivités Le Figaro, Le Monde, Gault&Millau",
            "Reportages France 2, TF1 grands formats",
            "Partenariats Guide Michelin et La Liste",
            "Influenceurs gastronomie triés (100K+ followers)"
          ],
          budget: "120,000€/an"
        },
        {
          name: "Marketing VIP Direct",
          priority: "high",
          tactics: [
            "Base de données clients restaurants étoilés",
            "Partenariat AmEx Centurion et Visa Infinite",
            "Conciergeries Mandarin, Four Seasons, Ritz",
            "Clubs privés (Cercle de l'Union, Jockey Club)"
          ],
          budget: "150,000€/an"
        },
        {
          name: "Digital Premium & Social",
          priority: "high",
          tactics: [
            "Site web expérience immersive avec résa exclusive",
            "Instagram haute couture gastronomique",
            "YouTube mini-documentaires mensuels",
            "Newsletter VIP avec accès prioritaire"
          ],
          budget: "100,000€/an"
        },
        {
          name: "Partenariats Luxe",
          priority: "medium",
          tactics: [
            "Dom Pérignon pour cuvees exclusives",
            "Hôtels palaces pour packages weekend",
            "Compagnies aériennes first class",
            "Marques luxe pour co-branding events"
          ],
          budget: "80,000€/an"
        }
      ],
      content_pillars: [
        "Chef Stories: L'homme derrière le génie culinaire",
        "Ingredient Journeys: De la source à l'assiette",
        "Behind the Pass: Les coulisses de la création",
        "Last Chance: L'urgence de l'éphémère",
        "Guest Chronicles: Célébrités et moments uniques"
      ],
      immediate_actions: [
        {
          action: "Signer 3 premiers chefs Michelin internationaux",
          timeline: "1 mois",
          budget: "40,000€",
          expected_outcome: "Crédibilité immédiate et PR mondial"
        },
        {
          action: "Campagne teasing 'Something Extraordinary Coming'",
          timeline: "2 mois avant",
          budget: "25,000€",
          expected_outcome: "1000+ inscriptions liste VIP"
        },
        {
          action: "Event preview 50 influenceurs clés",
          timeline: "1 semaine avant",
          budget: "15,000€",
          expected_outcome: "Buzz massif et réservations complètes"
        },
        {
          action: "Activer réseau conciergeries luxe",
          timeline: "1 mois avant",
          budget: "10,000€",
          expected_outcome: "30% réservations via ce canal"
        }
      ],
      kpis: [
        {
          metric: "Taux occupation",
          target: "98%+ à partir du mois 3",
          frequency: "Quotidien"
        },
        {
          metric: "Ticket moyen",
          target: "380€ (avec vins et extras)",
          frequency: "Hebdomadaire"
        },
        {
          metric: "Net Promoter Score",
          target: "9.5+/10",
          frequency: "Post-visite"
        },
        {
          metric: "Taux clients répétition",
          target: "65% dans l'année",
          frequency: "Mensuel"
        },
        {
          metric: "Earned media value",
          target: "500K€+/mois",
          frequency: "Mensuel"
        }
      ],
      budget_summary: {
        year_1_total: "500,000€",
        breakdown: {
          "PR & Influence": "24%",
          "Direct Marketing": "30%",
          "Digital & Content": "20%",
          "Partenariats": "16%",
          "Events & Activations": "10%"
        },
        expected_roi: "400% sur 18 mois"
      }
    };
  }
  
  // Fallback générique pour autres industries
  return {
    vision: `Devenir le leader innovant du secteur ${industryName} en 5 ans`,
    mission: `Offrir des solutions d'excellence qui transforment ${industryName}`,
    unique_value_proposition: `La seule solution qui combine innovation, qualité et service exceptionnel en ${industryName}`,
    positioning: "Premium accessible avec le meilleur rapport qualité/valeur",
    target_segments: [
      {
        name: "Entreprises Innovantes",
        description: "PME en croissance recherchant l'excellence",
        size: "10,000 entreprises potentielles",
        budget_moyen: "10K-50K€/an"
      },
      {
        name: "Grandes Entreprises",
        description: "Grands comptes exigeants",
        size: "500 entreprises cibles",
        budget_moyen: "50K-200K€/an"
      }
    ],
    key_messages: [
      "L'innovation qui fait la différence",
      "Un partenaire, pas juste un fournisseur",
      "ROI garanti et mesurable",
      "L'excellence à chaque étape"
    ],
    channels: [
      {
        name: "Marketing B2B Digital",
        priority: "high",
        tactics: [
          "LinkedIn thought leadership et ads ciblées",
          "Content marketing SEO spécialisé",
          "Webinaires experts mensuels",
          "Email nurturing personnalisé"
        ],
        budget: "80,000€/an"
      },
      {
        name: "Sales Enablement",
        priority: "high",
        tactics: [
          "CRM et automatisation commerciale",
          "Outils d'aide à la vente digitaux",
          "Programme de référencement clients",
          "Démos personnalisées"
        ],
        budget: "60,000€/an"
      },
      {
        name: "Events & PR B2B",
        priority: "medium",
        tactics: [
          "Salons professionnels clés",
          "Conférences et speaking ops",
          "Relations presse spécialisée",
          "Awards et certifications"
        ],
        budget: "50,000€/an"
      }
    ],
    content_pillars: [
      "Thought Leadership: Vision du secteur",
      "Success Stories: Cas clients concrets",
      "Innovation Insights: Tendances et futur",
      "How-To Guides: Expertise partagée",
      "Company Culture: L'humain derrière la tech"
    ],
    immediate_actions: [
      {
        action: "Refonte site web orienté conversion",
        timeline: "2 mois",
        budget: "15,000€",
        expected_outcome: "Taux conversion x2"
      },
      {
        action: "Lancer programme early adopters",
        timeline: "1 mois",
        budget: "10,000€",
        expected_outcome: "20 clients pilotes"
      },
      {
        action: "Campagne LinkedIn ABM",
        timeline: "6 semaines",
        budget: "8,000€",
        expected_outcome: "100 leads qualifiés"
      }
    ],
    kpis: [
      {
        metric: "Leads qualifiés",
        target: "200+/mois",
        frequency: "Hebdomadaire"
      },
      {
        metric: "Taux conversion",
        target: "15%",
        frequency: "Mensuel"
      },
      {
        metric: "Coût acquisition client",
        target: "<500€",
        frequency: "Trimestriel"
      },
      {
        metric: "Customer Lifetime Value",
        target: "25K€+",
        frequency: "Trimestriel"
      }
    ],
    budget_summary: {
      year_1_total: "250,000€",
      breakdown: {
        "Digital Marketing": "32%",
        "Sales Enablement": "24%",
        "Content & SEO": "20%",
        "Events & PR": "20%",
        "Tools & Tech": "4%"
      },
      expected_roi: "300% sur 24 mois"
    }
  };
}