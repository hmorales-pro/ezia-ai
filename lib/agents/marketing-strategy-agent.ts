import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

export async function runRealMarketingStrategyAgent(business: any, marketAnalysis: any): Promise<any> {
  console.log(`[Agent Marketing IA] Stratégie RÉELLE pour ${business.name}...`);
  
  const systemContext = `Tu es un directeur marketing avec 15 ans d'expérience en stratégie digitale.
Tu dois créer une stratégie marketing ULTRA-SPÉCIFIQUE pour ce business.
IMPORTANT:
- Sois EXTRÊMEMENT spécifique à "${business.name}" dans l'industrie "${business.industry}"
- Propose des actions CONCRÈTES avec des exemples précis
- Utilise des canaux et tactiques adaptés à 2024
- Donne des budgets réalistes et des KPIs mesurables
- AUCUNE généralité - tout doit être actionnable immédiatement`;

  const marketContext = marketAnalysis ? `
Contexte marché:
- Cible principale: ${marketAnalysis.target_audience?.primary || 'À définir'}
- Concurrents: ${marketAnalysis.market_overview?.key_players?.join(', ') || 'À analyser'}
- Opportunités: ${marketAnalysis.swot_analysis?.opportunities?.join(', ') || 'À identifier'}
` : '';

  const prompt = `Crée une stratégie marketing complète pour:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
Stade: ${business.stage}
${marketContext}

Fournis une stratégie marketing OPÉRATIONNELLE incluant:
1. Positionnement unique et proposition de valeur claire
2. Mix marketing digital détaillé (canaux, messages, budgets)
3. Plan de contenu concret sur 3 mois
4. Campagnes spécifiques avec créatifs
5. KPIs et plan de mesure

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "executive_summary": {
    "vision": "Vision marketing spécifique",
    "mission": "Mission claire",
    "unique_value_proposition": "UVP différenciante",
    "target_roi": "ROI attendu réaliste (ex: 300% sur 12 mois)"
  },
  "brand_positioning": {
    "brand_essence": "Essence de marque en 2-4 mots",
    "brand_promise": "Promesse de marque claire",
    "brand_personality": ["3-4 traits de personnalité"],
    "brand_values": ["3-4 valeurs fondamentales"],
    "positioning_statement": "Pour [cible], [marque] est [catégorie] qui [bénéfice unique] car [raison de croire]",
    "competitive_advantages": ["3-4 avantages compétitifs clairs"]
  },
  "target_segments": [
    {
      "name": "Nom du segment",
      "description": "Description détaillée",
      "size": "Taille estimée (ex: 10K prospects)",
      "characteristics": ["3-4 caractéristiques clés"],
      "pain_points": ["2-3 points de douleur"],
      "preferred_channels": ["Canaux préférés"],
      "budget": "Budget moyen"
    }
  ],
  "marketing_mix": {
    "product": {
      "core_offerings": ["Offres principales"],
      "unique_features": ["Caractéristiques uniques"]
    },
    "price": {
      "strategy": "Stratégie de prix (ex: Premium, Pénétration)",
      "positioning": "Positionnement prix",
      "tactics": ["Tactiques de prix"]
    },
    "place": {
      "distribution_channels": ["Canaux de distribution"],
      "online_presence": ["Points de présence en ligne"]
    },
    "promotion": {
      "key_messages": ["3-4 messages clés"],
      "promotional_tactics": ["Tactiques promotionnelles"]
    }
  },
  "customer_journey": {
    "awareness": {
      "touchpoints": ["Points de contact"],
      "content_types": ["Types de contenu"],
      "channels": ["Canaux"]
    },
    "consideration": {
      "touchpoints": ["Points de contact"],
      "content_types": ["Types de contenu"],
      "channels": ["Canaux"]
    },
    "decision": {
      "touchpoints": ["Points de contact"],
      "content_types": ["Types de contenu"],
      "channels": ["Canaux"]
    },
    "retention": {
      "touchpoints": ["Points de contact"],
      "content_types": ["Types de contenu"],
      "channels": ["Canaux"]
    }
  },
  "channel_strategy": [
    {
      "channel": "Nom du canal",
      "priority": "high/medium/low",
      "objectives": ["2-3 objectifs"],
      "kpis": ["2-3 KPIs"],
      "budget_allocation": 30
    }
  ],
  "campaign_ideas": [
    {
      "name": "Nom de campagne créatif",
      "objective": "Objectif précis",
      "target_segment": "Segment ciblé",
      "key_message": "Message principal percutant",
      "channels": ["Canaux utilisés"],
      "duration": "Durée (ex: 3 mois)",
      "budget_estimate": "10,000€ - 15,000€",
      "expected_results": "Résultats mesurables attendus"
    }
  ],
  "content_strategy": {
    "content_calendar": {
      "frequency": "Fréquence de publication",
      "themes_by_month": {
        "Janvier": ["Thème 1", "Thème 2"],
        "Février": ["Thème 1", "Thème 2"]
      }
    },
    "content_types": [
      {
        "type": "Type de contenu",
        "frequency": "Fréquence",
        "distribution": ["Canaux de distribution"]
      }
    ]
  },
  "implementation_roadmap": [
    {
      "phase": "Phase 1: Fondations",
      "duration": "1-2 mois",
      "objectives": ["Objectifs de la phase"],
      "budget": "5,000€ - 10,000€",
      "success_criteria": ["Critères de succès"]
    }
  ],
  "budget_allocation": {
    "total_budget": "60,000€ - 100,000€ annuel",
    "by_channel": {
      "Digital": 40,
      "Content": 30,
      "Events": 20,
      "Other": 10
    },
    "by_objective": {
      "Acquisition": 50,
      "Retention": 30,
      "Branding": 20
    },
    "by_quarter": {
      "Q1": 20,
      "Q2": 25,
      "Q3": 25,
      "Q4": 30
    }
  },
  "risk_mitigation": [
    {
      "risk": "Risque identifié",
      "probability": "high/medium/low",
      "impact": "high/medium/low",
      "mitigation_strategy": "Stratégie d'atténuation"
    }
  ]
}`;

  try {
    const response = await generateWithMistralAPI(prompt, systemContext);
    
    if (response.success && response.content) {
      try {
        let jsonContent = response.content;
        
        // Extraire le JSON du contenu
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        // Nettoyer le JSON des erreurs courantes
        jsonContent = jsonContent
          .replace(/,\s*}/g, '}') // Enlever les virgules avant les accolades fermantes
          .replace(/,\s*]/g, ']') // Enlever les virgules avant les crochets fermants
          .replace(/}\s*{/g, '},{') // Ajouter des virgules entre objets
          .replace(/]\s*\[/g, '],[') // Ajouter des virgules entre tableaux
          .replace(/"\s*\n\s*"/g, '",\n"') // Ajouter des virgules entre chaînes sur plusieurs lignes
          .replace(/,\s*,/g, ',') // Enlever les virgules doubles
          .replace(/\n\s*\n/g, '\n'); // Enlever les lignes vides multiples
        
        // Vérifier si le JSON est tronqué et essayer de le réparer
        if (jsonContent) {
          console.log(`[Agent Marketing IA] Taille du JSON reçu: ${jsonContent.length} caractères`);
          
          if (!jsonContent.trim().endsWith('}')) {
            console.warn("[Agent Marketing IA] JSON tronqué détecté, tentative de réparation...");
            
            // Trouver la dernière position valide avant la troncature
            let lastValidPos = jsonContent.length;
            let inString = false;
            let escaped = false;
            
            for (let i = 0; i < jsonContent.length; i++) {
              const char = jsonContent[i];
              
              if (escaped) {
                escaped = false;
                continue;
              }
              
              if (char === '\\') {
                escaped = true;
                continue;
              }
              
              if (char === '"') {
                inString = !inString;
              }
            }
            
            // Si on est dans une chaîne, la fermer
            let repaired = jsonContent;
            if (inString) {
              repaired += '"';
            }
            
            // Compter les accolades et crochets ouverts
            const openBraces = (repaired.match(/{/g) || []).length;
            const closeBraces = (repaired.match(/}/g) || []).length;
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/]/g) || []).length;
            
            // Ajouter une virgule si nécessaire
            const lastChar = repaired.trim().slice(-1);
            if (lastChar !== ',' && lastChar !== '{' && lastChar !== '[' && 
                (openBrackets > closeBrackets || openBraces > closeBraces)) {
              repaired += ',';
            }
            
            // Fermer les tableaux
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              repaired += ']';
            }
            
            // Fermer les objets
            for (let i = 0; i < openBraces - closeBraces; i++) {
              repaired += '}';
            }
            
            jsonContent = repaired;
            console.log("[Agent Marketing IA] JSON réparé, nouvelle taille:", jsonContent.length);
          }
        }
        
        const strategy = JSON.parse(jsonContent);
        
        // Enrichir avec des éléments visuels
        strategy.visual_assets = {
          logo_concepts: ["Concept moderne", "Concept minimaliste", "Concept bold"],
          social_templates: ["Template story", "Template post", "Template carousel"],
          ad_mockups: ["Facebook ad", "Google ad", "LinkedIn ad"]
        };
        
        return strategy;
      } catch (parseError: any) {
        console.error("[Agent Marketing IA] Erreur parsing:", parseError);
        console.error("[Agent Marketing IA] JSON problématique:", response.content?.substring(0, 500));
        
        // Si le JSON contient au moins quelques données, essayer de les extraire
        try {
          const partialMatch = response.content?.match(/\{[\s\S]*?"executive_summary"[\s\S]*?}/);
          if (partialMatch) {
            const partialStrategy = JSON.parse(partialMatch[0] + '}');
            return {
              ...generateMarketingFallback(business),
              ...partialStrategy
            };
          }
        } catch (e) {
          // Ignorer l'erreur et utiliser le fallback
        }
        
        return generateMarketingFallback(business);
      }
    }
    
    throw new Error("Pas de réponse IA");
    
  } catch (error) {
    console.error("[Agent Marketing IA] Erreur:", error);
    return generateMarketingFallback(business);
  }
}

function generateMarketingFallback(business: any) {
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString('fr-FR', { month: 'long' });
  
  return {
    executive_summary: {
      vision: `Faire de ${business.name} la référence incontournable dans ${business.industry}`,
      mission: `Offrir des solutions innovantes et accessibles qui transforment positivement ${business.industry}`,
      unique_value_proposition: `La seule solution qui combine expertise pointue, innovation technologique et accompagnement humain dans ${business.industry}`,
      target_roi: "300% sur 12 mois"
    },
    brand_positioning: {
      brand_essence: "Innovation accessible",
      brand_promise: `Nous rendons ${business.industry} plus simple, plus efficace et plus rentable`,
      brand_personality: ["Innovant", "Accessible", "Expert", "Humain"],
      brand_values: ["Excellence", "Innovation", "Transparence", "Impact positif"],
      positioning_statement: `Pour les entreprises ambitieuses, ${business.name} est le partenaire ${business.industry} qui garantit croissance et performance car nous combinons expertise éprouvée et innovation continue`,
      competitive_advantages: [
        "Technologie de pointe adaptée aux besoins spécifiques",
        "Accompagnement personnalisé par des experts",
        "ROI garanti et mesurable",
        "Communauté active et entraide"
      ]
    },
    target_segments: [
      {
        name: "Innovateurs précoces",
        description: "Entreprises en croissance cherchant à se démarquer",
        size: "5K prospects qualifiés",
        characteristics: [
          "Chiffre d'affaires entre 1M€ et 10M€",
          "Equipe de 10-50 personnes",
          "Forte appétence digitale",
          "Budget innovation alloué"
        ],
        pain_points: [
          "Difficulté à se différencier",
          "Processus manuels chronophages",
          "Manque de visibilité sur la performance"
        ],
        preferred_channels: ["LinkedIn", "Email", "Webinaires"],
        budget: "5K-20K€/an"
      },
      {
        name: "Entreprises établies",
        description: "Organisations cherchant à optimiser et moderniser",
        size: "3K prospects",
        characteristics: [
          "Chiffre d'affaires > 10M€",
          "Plus de 50 employés",
          "Systèmes existants à moderniser",
          "Décision par comité"
        ],
        pain_points: [
          "Systèmes obsolètes",
          "Résistance au changement",
          "Coûts opérationnels élevés"
        ],
        preferred_channels: ["Commercial direct", "Evénements", "Références"],
        budget: "20K-100K€/an"
      }
    ],
    marketing_mix: {
      product: {
        core_offerings: [
          "Solution SaaS complète et modulaire",
          "Accompagnement personnalisé",
          "Formation et certification",
          "Communauté et networking"
        ],
        unique_features: [
          "IA intégrée pour automatisation",
          "Interface intuitive no-code",
          "Intégrations natives",
          "Analytics avancés en temps réel"
        ]
      },
      price: {
        strategy: "Value-based pricing avec freemium",
        positioning: "Premium accessible - meilleur rapport qualité/prix",
        tactics: [
          "Essai gratuit 30 jours",
          "Réduction volume et engagement annuel",
          "Prix évolutif selon usage",
          "Options de financement flexibles"
        ]
      },
      place: {
        distribution_channels: [
          "Vente directe en ligne (self-service)",
          "Inside sales pour comptes moyens",
          "Enterprise sales pour grands comptes",
          "Réseau de partenaires certifiés"
        ],
        online_presence: [
          "Site web optimisé conversion",
          "App marketplace integrations",
          "Présence réseaux sociaux B2B",
          "Communauté en ligne active"
        ]
      },
      promotion: {
        key_messages: [
          `Transformez votre ${business.industry} en avantage compétitif`,
          "De l'idée à l'impact en temps record",
          "La croissance sans la complexité",
          "Vos succès sont nos succès"
        ],
        promotional_tactics: [
          "Content marketing SEO",
          "Paid search & social",
          "Email nurturing",
          "Webinaires éducatifs",
          "Programme ambassadeurs"
        ]
      }
    },
    customer_journey: {
      awareness: {
        touchpoints: ["Recherche Google", "Réseaux sociaux", "Recommandations"],
        content_types: ["Articles blog SEO", "Infographies", "Vidéos courtes"],
        channels: ["SEO", "LinkedIn", "YouTube"]
      },
      consideration: {
        touchpoints: ["Site web", "Démo produit", "Webinaires"],
        content_types: ["Études de cas", "Comparatifs", "Démos"],
        channels: ["Email", "Retargeting", "Sales"]
      },
      decision: {
        touchpoints: ["Essai gratuit", "Call commercial", "Proposition"],
        content_types: ["ROI calculator", "Témoignages", "Garanties"],
        channels: ["Email direct", "Téléphone", "Meetings"]
      },
      retention: {
        touchpoints: ["Onboarding", "Support", "Success manager"],
        content_types: ["Formations", "Best practices", "Nouveautés"],
        channels: ["In-app", "Email", "Communauté"]
      }
    },
    channel_strategy: [
      {
        channel: "Content Marketing & SEO",
        priority: "high",
        objectives: ["Générer 1000 leads/mois", "Position top 3 mots-clés"],
        kpis: ["Trafic organique", "Conversion rate", "Lead quality score"],
        budget_allocation: 30
      },
      {
        channel: "LinkedIn & Social Selling",
        priority: "high",
        objectives: ["Développer thought leadership", "500 leads qualifiés/mois"],
        kpis: ["Engagement rate", "Message response rate", "Pipeline généré"],
        budget_allocation: 25
      },
      {
        channel: "Google Ads & Paid Social",
        priority: "medium",
        objectives: ["Capture demande active", "ROAS 4:1"],
        kpis: ["Cost per lead", "Conversion rate", "ROAS"],
        budget_allocation: 25
      },
      {
        channel: "Email Marketing & Automation",
        priority: "high",
        objectives: ["Nurturing efficace", "20% taux conversion"],
        kpis: ["Open rate", "Click rate", "Lead to customer rate"],
        budget_allocation: 20
      }
    ],
    campaign_ideas: [
      {
        name: `"${business.name}: La Révolution ${business.industry}"`,
        objective: "Lancement et notoriété de marque",
        target_segment: "Innovateurs précoces",
        key_message: `"Rejoignez les leaders qui transforment ${business.industry}"`,
        channels: ["LinkedIn", "Google Ads", "Email", "PR"],
        duration: "3 mois",
        budget_estimate: "15,000€ - 20,000€",
        expected_results: "500 leads qualifiés, 50 demos, 15 nouveaux clients"
      },
      {
        name: "Challenge 30 Jours",
        objective: "Génération de leads et engagement",
        target_segment: "PME en croissance",
        key_message: "30 jours pour transformer votre business",
        channels: ["Email", "Social Media", "Webinaires"],
        duration: "2 mois",
        budget_estimate: "8,000€ - 12,000€",
        expected_results: "1000 participants, 200 conversions essai"
      },
      {
        name: "Success Stories Tour",
        objective: "Social proof et conversions",
        target_segment: "Entreprises établies",
        key_message: "Découvrez comment vos pairs réussissent",
        channels: ["Événements", "Vidéo", "LinkedIn"],
        duration: "4 mois",
        budget_estimate: "20,000€ - 30,000€",
        expected_results: "100 grands comptes touchés, 30 opportunités"
      }
    ],
    content_strategy: {
      content_calendar: {
        frequency: "4-5 contenus par semaine multi-formats",
        themes_by_month: {
          [currentMonth]: ["Lancement et présentation", "Quick wins"],
          [nextMonth]: ["Success stories", "Bonnes pratiques"],
          "Mars": ["Tendances industrie", "Innovation"],
          "Avril": ["ROI et performance", "Témoignages"]
        }
      },
      content_types: [
        {
          type: "Articles blog long-form",
          frequency: "2 par semaine",
          distribution: ["Site web", "Newsletter", "LinkedIn"]
        },
        {
          type: "Vidéos tutoriels",
          frequency: "1 par semaine",
          distribution: ["YouTube", "Site", "Email"]
        },
        {
          type: "Infographies",
          frequency: "2 par mois",
          distribution: ["Social media", "Blog", "Sales"]
        },
        {
          type: "Webinaires live",
          frequency: "1 par mois",
          distribution: ["Zoom", "Email", "Site"]
        }
      ]
    },
    implementation_roadmap: [
      {
        phase: "Phase 1: Fondations (Mois 1-2)",
        duration: "2 mois",
        objectives: [
          "Setup infrastructure marketing",
          "Création assets de base",
          "Lancement site et présence digitale"
        ],
        budget: "10,000€ - 15,000€",
        success_criteria: [
          "Site web live avec taux conversion > 2%",
          "100 premiers leads générés",
          "Système CRM opérationnel"
        ]
      },
      {
        phase: "Phase 2: Croissance (Mois 3-6)",
        duration: "4 mois",
        objectives: [
          "Scaling acquisition canaux",
          "Optimisation conversion",
          "Développement communauté"
        ],
        budget: "20,000€ - 30,000€",
        success_criteria: [
          "500 leads/mois",
          "CAC < 200€",
          "Communauté active 1000+ membres"
        ]
      },
      {
        phase: "Phase 3: Expansion (Mois 7-12)",
        duration: "6 mois",
        objectives: [
          "Nouveaux marchés/segments",
          "Partenariats stratégiques",
          "International readiness"
        ],
        budget: "30,000€ - 50,000€",
        success_criteria: [
          "1000+ leads/mois",
          "3+ partenariats actifs",
          "Ready for Series A"
        ]
      }
    ],
    budget_allocation: {
      total_budget: "80,000€ - 120,000€ première année",
      by_channel: {
        "Digital Marketing": 40,
        "Content Creation": 25,
        "Events & PR": 20,
        "Tools & Tech": 15
      },
      by_objective: {
        "Acquisition": 50,
        "Conversion": 25,
        "Retention": 15,
        "Branding": 10
      },
      by_quarter: {
        "Q1": 20,
        "Q2": 25,
        "Q3": 30,
        "Q4": 25
      }
    },
    risk_mitigation: [
      {
        risk: "Saturation du marché publicitaire",
        probability: "medium",
        impact: "high",
        mitigation_strategy: "Diversification canaux organiques et communauté"
      },
      {
        risk: "Lenteur adoption marché",
        probability: "medium",
        impact: "medium",
        mitigation_strategy: "Programme early adopters avec incentives forts"
      },
      {
        risk: "Concurrence prix agressive",
        probability: "high",
        impact: "medium",
        mitigation_strategy: "Focus valeur unique et expérience client premium"
      }
    ]
  };
}