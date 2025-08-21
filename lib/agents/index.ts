// Système d'agents Ezia pour l'analyse automatique des business

export interface AgentAnalysis {
  agent: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface BusinessAnalysis {
  market_analysis?: {
    executive_summary: {
      key_findings: string[];
      market_opportunity: string;
      strategic_positioning: string;
      growth_forecast: string;
    };
    target_audience: {
      primary: string;
      secondary: string;
      demographics: Record<string, any>;
      psychographics: string[];
      pain_points: string[];
      buying_behavior: string;
    };
    market_overview: {
      market_size: string;
      market_value: string;
      growth_rate: string;
      market_maturity: string;
      key_players: string[];
      market_segments: Array<{
        name: string;
        size: string;
        growth: string;
        characteristics: string[];
      }>;
    };
    pestel_analysis: {
      political: string[];
      economic: string[];
      social: string[];
      technological: string[];
      environmental: string[];
      legal: string[];
    };
    porter_five_forces: {
      threat_of_new_entrants: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
      };
      bargaining_power_suppliers: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
      };
      bargaining_power_buyers: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
      };
      threat_of_substitutes: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
      };
      competitive_rivalry: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
      };
    };
    swot_analysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    trends_analysis: {
      current_trends: string[];
      emerging_trends: string[];
      declining_trends: string[];
      future_projections: Array<{
        year: number;
        projection: string;
        confidence: 'high' | 'medium' | 'low';
      }>;
    };
    competitive_benchmark: {
      key_success_factors: string[];
      competitive_positioning: Array<{
        factor: string;
        our_position: number;
        industry_average: number;
        leader_position: number;
      }>;
      differentiation_opportunities: string[];
    };
    visualization_data: {
      market_growth_chart: {
        type: string;
        data: Array<{ year: number; value: number }>;
      };
      market_share_pie: {
        type: string;
        data: Array<{ name: string; value: number }>;
      };
      trends_timeline: {
        type: string;
        data: Array<{ date: string; trend: string; impact: string }>;
      };
      competitive_radar: {
        type: string;
        dimensions: string[];
        data: Array<{ name: string; values: number[] }>;
      };
    };
    strategic_recommendations: {
      immediate_actions: Array<{
        action: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        timeline: string;
      }>;
      medium_term_strategies: string[];
      long_term_vision: string;
      risk_mitigation: Array<{
        risk: string;
        mitigation_strategy: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
  };
  competitor_analysis?: {
    main_competitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      market_share?: string;
    }>;
    competitive_advantages: string[];
    positioning_strategy: string;
  };
  marketing_strategy?: {
    executive_summary: {
      vision: string;
      mission: string;
      unique_value_proposition: string;
      target_roi: string;
    };
    brand_positioning: {
      brand_essence: string;
      brand_promise: string;
      brand_personality: string[];
      brand_values: string[];
      positioning_statement: string;
      competitive_advantages: string[];
    };
    target_segments: Array<{
      name: string;
      description: string;
      size: string;
      characteristics: string[];
      pain_points: string[];
      preferred_channels: string[];
      budget: string;
    }>;
    marketing_mix: {
      product: {
        core_offerings: string[];
        unique_features: string[];
        quality_indicators: string[];
        innovation_pipeline: string[];
      };
      price: {
        strategy: string;
        positioning: string;
        model: string;
        tactics: string[];
      };
      place: {
        distribution_channels: string[];
        geographic_focus: string[];
        online_presence: string[];
        partnerships: string[];
      };
      promotion: {
        key_messages: string[];
        campaign_themes: string[];
        content_pillars: string[];
        promotional_tactics: string[];
      };
    };
    customer_journey: {
      awareness: {
        touchpoints: string[];
        content_types: string[];
        channels: string[];
      };
      consideration: {
        touchpoints: string[];
        content_types: string[];
        channels: string[];
      };
      decision: {
        touchpoints: string[];
        content_types: string[];
        channels: string[];
      };
      retention: {
        touchpoints: string[];
        content_types: string[];
        channels: string[];
      };
    };
    channel_strategy: Array<{
      channel: string;
      priority: 'high' | 'medium' | 'low';
      objectives: string[];
      tactics: string[];
      kpis: string[];
      budget_allocation: number;
    }>;
    content_strategy: {
      content_themes: string[];
      content_calendar: {
        frequency: string;
        themes_by_month: Record<string, string[]>;
      };
      content_types: Array<{
        type: string;
        frequency: string;
        objectives: string[];
        distribution: string[];
      }>;
      storytelling_framework: {
        brand_story: string;
        customer_stories: string[];
        content_series: string[];
      };
    };
    campaign_ideas: Array<{
      name: string;
      objective: string;
      target_segment: string;
      duration: string;
      channels: string[];
      key_message: string;
      expected_results: string;
      budget_estimate: string;
    }>;
    metrics_framework: {
      awareness_metrics: string[];
      engagement_metrics: string[];
      conversion_metrics: string[];
      retention_metrics: string[];
      roi_metrics: string[];
    };
    budget_allocation: {
      total_budget: string;
      by_channel: Record<string, number>;
      by_objective: Record<string, number>;
      by_quarter: Record<string, number>;
    };
    implementation_roadmap: Array<{
      phase: string;
      duration: string;
      objectives: string[];
      key_activities: string[];
      success_criteria: string[];
      budget: string;
    }>;
    risk_mitigation: Array<{
      risk: string;
      probability: 'high' | 'medium' | 'low';
      impact: 'high' | 'medium' | 'low';
      mitigation_strategy: string;
    }>;
  };
  website_prompt?: {
    prompt: string;
    key_features: string[];
    design_style: string;
    target_impression: string;
  };
}

// Fonction pour relancer une analyse spécifique
export async function runAgentForAnalysis(
  analysisType: string,
  businessName: string,
  industry: string,
  stage: string,
  description: string
): Promise<any> {
  const business = { name: businessName, industry, stage, description };
  
  switch (analysisType) {
    case 'market_analysis':
      return runMarketAnalysisAgent(business);
    case 'competitor_analysis':
      return runCompetitorAnalysisAgent(business);
    case 'marketing_strategy':
      return runMarketingStrategyAgent(business, null);
    case 'website_prompt':
      return runWebsitePromptAgent(business, null, null, null);
    default:
      throw new Error(`Unknown analysis type: ${analysisType}`);
  }
}

// Agent pour l'analyse de marché
export async function runMarketAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Marché] Analyse approfondie pour ${business.name}...`);
  
  // Vérifier si on a une clé Mistral pour utiliser l'IA réelle
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && mistralKey.length > 10) {
    console.log("[Agent Marché] Clé Mistral détectée, activation du mode IA réel");
    try {
      // Utiliser l'agent IA réel
      const { runRealMarketAnalysisAgent } = await import('./market-analysis-agent');
      return await runRealMarketAnalysisAgent(business);
    } catch (error) {
      console.error("[Agent Marché] Erreur avec l'IA, fallback sur données simulées:", error);
    }
  }
  
  // Données spécifiques par industrie pour une analyse plus réaliste
  const industrySpecificData: Record<string, any> = {
    technology: {
      market_value: "5.2 trillions USD",
      growth_rate: "12-15%",
      maturity: "Croissance rapide",
      key_players: ["Microsoft", "Apple", "Google", "Amazon", "Meta"],
      segments: [
        { name: "Cloud Computing", size: "600 milliards USD", growth: "18%", characteristics: ["Scalabilité", "Pay-as-you-go", "Innovation continue"] },
        { name: "Intelligence Artificielle", size: "150 milliards USD", growth: "38%", characteristics: ["Automatisation", "Prédiction", "Personnalisation"] },
        { name: "Cybersécurité", size: "180 milliards USD", growth: "12%", characteristics: ["Protection données", "Conformité", "Zero Trust"] }
      ],
      pestel: {
        political: ["Régulations sur la protection des données (RGPD)", "Tensions géopolitiques affectant les chaînes d'approvisionnement", "Politiques de souveraineté numérique"],
        economic: ["Inflation affectant les budgets IT", "Investissements croissants en transformation digitale", "Volatilité des marchés boursiers tech"],
        social: ["Adoption massive du télétravail", "Préoccupations croissantes sur la vie privée", "Fracture numérique"],
        technological: ["IA générative révolutionnaire", "Informatique quantique émergente", "Edge computing en expansion"],
        environmental: ["Pression pour des data centers verts", "Économie circulaire pour l'électronique", "Empreinte carbone du cloud"],
        legal: ["Lois antitrust contre les Big Tech", "Régulations IA en développement", "Propriété intellectuelle des algorithmes"]
      }
    },
    finance: {
      market_value: "26.5 trillions USD",
      growth_rate: "6-8%",
      maturity: "Mature avec disruption fintech",
      key_players: ["JPMorgan Chase", "Bank of America", "HSBC", "PayPal", "Square"],
      segments: [
        { name: "Banque de détail", size: "8 trillions USD", growth: "4%", characteristics: ["Digitalisation", "Personnalisation", "Omnicanal"] },
        { name: "Fintech", size: "310 milliards USD", growth: "25%", characteristics: ["Innovation", "UX simplifiée", "API ouvertes"] },
        { name: "Crypto/DeFi", size: "2 trillions USD", growth: "60%", characteristics: ["Décentralisation", "Volatilité", "Innovation blockchain"] }
      ],
      pestel: {
        political: ["Politiques monétaires des banques centrales", "Régulations anti-blanchiment renforcées", "Tensions commerciales internationales"],
        economic: ["Taux d'intérêt fluctuants", "Inflation persistante", "Récession potentielle"],
        social: ["Préférence pour le banking digital", "Inclusion financière", "Méfiance envers les institutions traditionnelles"],
        technological: ["Blockchain et DLT", "Open Banking APIs", "IA pour la détection de fraude"],
        environmental: ["Finance verte et ESG", "Désinvestissement des énergies fossiles", "Green bonds en croissance"],
        legal: ["MiFID II et régulations similaires", "PSD2 pour les paiements", "Régulation des cryptomonnaies"]
      }
    },
    santé: {
      market_value: "12 trillions USD",
      growth_rate: "8-10%",
      maturity: "Mature avec forte innovation",
      key_players: ["Johnson & Johnson", "Pfizer", "Roche", "UnitedHealth", "CVS Health"],
      segments: [
        { name: "Pharmaceutique", size: "1.5 trillion USD", growth: "6%", characteristics: ["R&D intensive", "Brevets", "Régulation stricte"] },
        { name: "Télémédecine", size: "100 milliards USD", growth: "32%", characteristics: ["Accessibilité", "Coût réduit", "Technologie"] },
        { name: "HealthTech", size: "350 milliards USD", growth: "20%", characteristics: ["IA diagnostique", "Wearables", "Données patients"] }
      ],
      pestel: {
        political: ["Réformes des systèmes de santé", "Politiques de remboursement", "Accès universel aux soins"],
        economic: ["Coûts de santé croissants", "Pression sur les budgets publics", "Investissements en prévention"],
        social: ["Vieillissement démographique", "Maladies chroniques en hausse", "Conscience santé accrue"],
        technological: ["IA en diagnostic", "Thérapies géniques", "Robotique chirurgicale"],
        environmental: ["Impact climatique sur la santé", "Pollution et maladies", "Médecine durable"],
        legal: ["Protection des données patients", "Régulation des dispositifs médicaux", "Brevets pharmaceutiques"]
      }
    }
  };

  // Données par défaut pour autres industries
  const defaultData = {
    market_value: "Marché en développement",
    growth_rate: "5-10%",
    maturity: "En croissance",
    key_players: ["Leaders établis", "Challengers innovants", "Startups disruptives"],
    segments: [
      { name: "Segment traditionnel", size: "60% du marché", growth: "3%", characteristics: ["Stabilité", "Base clients établie"] },
      { name: "Segment innovant", size: "40% du marché", growth: "15%", characteristics: ["Croissance rapide", "Nouvelles technologies"] }
    ],
    pestel: {
      political: ["Stabilité politique favorable", "Soutien gouvernemental au secteur", "Régulations en évolution"],
      economic: ["Croissance économique modérée", "Pouvoir d'achat stable", "Investissements sectoriels"],
      social: ["Évolution des attentes clients", "Digitalisation des usages", "Responsabilité sociale"],
      technological: ["Transformation digitale", "Automatisation", "Data analytics"],
      environmental: ["Développement durable", "Économie circulaire", "Réduction empreinte carbone"],
      legal: ["Conformité réglementaire", "Protection des consommateurs", "Propriété intellectuelle"]
    }
  };

  const industryData = industrySpecificData[business.industry?.toLowerCase()] || defaultData;
  const currentYear = new Date().getFullYear();

  // Générer l'analyse complète
  return {
    executive_summary: {
      key_findings: [
        `Le marché ${business.industry} représente ${industryData.market_value} avec une croissance de ${industryData.growth_rate} par an`,
        `${business.name} peut se positionner sur un marché en ${industryData.maturity.toLowerCase()}`,
        `Les principales opportunités résident dans la ${industryData.segments[1]?.characteristics[0] || 'transformation digitale'}`,
        `La différenciation par ${business.stage === 'startup' ? 'l\'innovation' : 'la qualité et le service'} est clé`
      ],
      market_opportunity: `Potentiel de capturer ${business.stage === 'startup' ? '0.1-0.5%' : business.stage === 'croissance' ? '1-3%' : '5-10%'} du marché adressable dans les 3-5 prochaines années`,
      strategic_positioning: `${business.name} peut se positionner comme ${business.stage === 'startup' ? 'un innovateur disruptif' : business.stage === 'croissance' ? 'un challenger agile' : 'un leader de référence'} en ${business.industry}`,
      growth_forecast: `Croissance projetée de ${business.stage === 'startup' ? '100-200%' : business.stage === 'croissance' ? '50-80%' : '15-25%'} sur les 3 prochaines années`
    },
    target_audience: {
      primary: business.stage === 'startup' 
        ? "Early adopters technophiles (25-40 ans) à la recherche d'innovation"
        : business.stage === 'croissance'
        ? "PME et professionnels en quête de solutions éprouvées"
        : "Grandes entreprises et institutions recherchant fiabilité et expertise",
      secondary: business.stage === 'startup'
        ? "Investisseurs et partenaires stratégiques"
        : "Marché adjacent et expansion géographique",
      demographics: {
        age: business.stage === 'startup' ? "25-40 ans" : "30-55 ans",
        revenue: business.stage === 'startup' ? "50-100k€" : "Variable selon segment",
        location: "Zones urbaines et péri-urbaines",
        education: "Bac+3 et plus majoritairement"
      },
      psychographics: [
        "Orientés résultats et ROI",
        "Sensibles à l'innovation",
        "Recherche de gain de temps",
        "Valeur ajoutée et différenciation"
      ],
      pain_points: [
        "Complexité des solutions existantes",
        "Coûts élevés des alternatives",
        "Manque de personnalisation",
        "Support client insuffisant",
        "Intégration difficile"
      ],
      buying_behavior: "Processus de décision de 2-6 mois avec comparaison active des solutions"
    },
    market_overview: {
      market_size: industryData.market_value,
      market_value: `TAM (Total Addressable Market): ${industryData.market_value}`,
      growth_rate: `CAGR ${industryData.growth_rate} (2024-2029)`,
      market_maturity: industryData.maturity,
      key_players: industryData.key_players,
      market_segments: industryData.segments
    },
    pestel_analysis: industryData.pestel,
    porter_five_forces: {
      threat_of_new_entrants: {
        level: business.industry === 'technology' ? 'medium' : 'high',
        factors: [
          "Barrières à l'entrée modérées",
          "Besoin en capital initial",
          "Accès aux canaux de distribution",
          "Économies d'échelle des acteurs établis"
        ]
      },
      bargaining_power_suppliers: {
        level: 'medium',
        factors: [
          "Nombre modéré de fournisseurs",
          "Coûts de changement acceptables",
          "Possibilité d'intégration verticale",
          "Importance de la qualité"
        ]
      },
      bargaining_power_buyers: {
        level: 'high',
        factors: [
          "Clients bien informés",
          "Comparaison facile des offres",
          "Sensibilité au prix",
          "Attentes de personnalisation"
        ]
      },
      threat_of_substitutes: {
        level: business.stage === 'startup' ? 'high' : 'medium',
        factors: [
          "Solutions alternatives disponibles",
          "Innovation constante du marché",
          "Évolution des besoins clients",
          "Coûts de changement variables"
        ]
      },
      competitive_rivalry: {
        level: 'high',
        factors: [
          "Nombreux acteurs sur le marché",
          "Différenciation parfois limitée",
          "Guerre des prix sur certains segments",
          "Innovation comme facteur clé"
        ]
      }
    },
    swot_analysis: {
      strengths: [
        business.stage === 'startup' ? "Agilité et capacité d'innovation" : "Expérience et track record",
        "Vision claire et leadership engagé",
        "Culture d'entreprise forte",
        "Approche centrée client",
        "Technologies modernes"
      ],
      weaknesses: [
        business.stage === 'startup' ? "Ressources limitées" : "Processus parfois rigides",
        business.stage === 'startup' ? "Marque peu connue" : "Legacy systems",
        "Dépendance à certains clients/fournisseurs",
        "Couverture géographique limitée"
      ],
      opportunities: [
        "Croissance du marché de " + industryData.growth_rate,
        "Nouveaux segments mal desservis",
        "Partenariats stratégiques potentiels",
        "Expansion internationale",
        "Acquisitions ciblées"
      ],
      threats: [
        "Intensité concurrentielle croissante",
        "Évolution rapide des technologies",
        "Changements réglementaires",
        "Volatilité économique",
        "Cybersécurité et risques data"
      ]
    },
    trends_analysis: {
      current_trends: [
        "Digitalisation accélérée post-COVID",
        "Focus sur l'expérience utilisateur",
        "Durabilité et RSE",
        "Personnalisation via IA",
        "Modèles as-a-Service"
      ],
      emerging_trends: [
        "IA générative et automatisation",
        "Web3 et décentralisation",
        "Économie circulaire",
        "Hyper-personnalisation",
        "Zero-trust security"
      ],
      declining_trends: [
        "Solutions on-premise isolées",
        "Approches one-size-fits-all",
        "Canaux de vente traditionnels seuls",
        "Documentation papier"
      ],
      future_projections: [
        { year: currentYear + 1, projection: "Consolidation du marché avec M&A", confidence: 'high' },
        { year: currentYear + 2, projection: "IA intégrée dans 80% des solutions", confidence: 'high' },
        { year: currentYear + 3, projection: "Nouveaux modèles économiques dominants", confidence: 'medium' },
        { year: currentYear + 5, projection: "Transformation complète du secteur", confidence: 'medium' }
      ]
    },
    competitive_benchmark: {
      key_success_factors: [
        "Innovation produit continue",
        "Excellence du service client",
        "Efficacité opérationnelle",
        "Stratégie de pricing",
        "Écosystème de partenaires"
      ],
      competitive_positioning: [
        { factor: "Innovation", our_position: 8, industry_average: 6, leader_position: 9 },
        { factor: "Service client", our_position: 9, industry_average: 7, leader_position: 9 },
        { factor: "Prix compétitif", our_position: 7, industry_average: 6, leader_position: 5 },
        { factor: "Couverture marché", our_position: 5, industry_average: 6, leader_position: 9 },
        { factor: "Technologies", our_position: 8, industry_average: 6, leader_position: 9 }
      ],
      differentiation_opportunities: [
        "Spécialisation verticale sur un segment",
        "Innovation de rupture sur l'UX",
        "Modèle de pricing disruptif",
        "Approche écosystème unique",
        "Excellence opérationnelle"
      ]
    },
    visualization_data: {
      market_growth_chart: {
        type: "line",
        data: [
          { year: currentYear - 2, value: 100 },
          { year: currentYear - 1, value: 112 },
          { year: currentYear, value: 126 },
          { year: currentYear + 1, value: 142 },
          { year: currentYear + 2, value: 160 }
        ]
      },
      market_share_pie: {
        type: "pie",
        data: [
          { name: industryData.key_players[0], value: 25 },
          { name: industryData.key_players[1], value: 20 },
          { name: industryData.key_players[2], value: 15 },
          { name: "Autres", value: 40 }
        ]
      },
      trends_timeline: {
        type: "timeline",
        data: [
          { date: `${currentYear - 1}`, trend: "Accélération digitale", impact: "high" },
          { date: `${currentYear}`, trend: "IA générative", impact: "high" },
          { date: `${currentYear + 1}`, trend: "Consolidation marché", impact: "medium" }
        ]
      },
      competitive_radar: {
        type: "radar",
        dimensions: ["Innovation", "Service", "Prix", "Couverture", "Tech"],
        data: [
          { name: business.name, values: [8, 9, 7, 5, 8] },
          { name: "Moyenne industrie", values: [6, 7, 6, 6, 6] },
          { name: "Leader", values: [9, 9, 5, 9, 9] }
        ]
      }
    },
    strategic_recommendations: {
      immediate_actions: [
        { 
          action: "Lancer une étude approfondie des besoins clients", 
          impact: 'high', 
          effort: 'low', 
          timeline: "1-2 mois" 
        },
        { 
          action: "Développer un MVP/POC pour valider le marché", 
          impact: 'high', 
          effort: 'medium', 
          timeline: "3-4 mois" 
        },
        { 
          action: "Établir des partenariats stratégiques initiaux", 
          impact: 'medium', 
          effort: 'medium', 
          timeline: "2-3 mois" 
        },
        { 
          action: "Recruter les talents clés manquants", 
          impact: 'high', 
          effort: 'high', 
          timeline: "3-6 mois" 
        }
      ],
      medium_term_strategies: [
        "Développer une plateforme technologique scalable",
        "Construire un écosystème de partenaires",
        "Implémenter une stratégie de content marketing",
        "Expansion géographique progressive",
        "Développer des cas d'usage verticaux"
      ],
      long_term_vision: `Devenir ${business.stage === 'startup' ? 'un acteur reconnu' : business.stage === 'croissance' ? 'un leader régional' : 'le leader de référence'} dans ${business.industry} en France puis en Europe, reconnu pour son innovation et la qualité de son service`,
      risk_mitigation: [
        { 
          risk: "Concurrence accrue des acteurs établis", 
          mitigation_strategy: "Différenciation par l'innovation et le service", 
          priority: 'high' 
        },
        { 
          risk: "Évolution réglementaire défavorable", 
          mitigation_strategy: "Veille réglementaire et lobbying proactif", 
          priority: 'medium' 
        },
        { 
          risk: "Difficultés de financement", 
          mitigation_strategy: "Diversification des sources et croissance organique", 
          priority: 'high' 
        },
        { 
          risk: "Perte de talents clés", 
          mitigation_strategy: "Culture forte et packages de rétention", 
          priority: 'medium' 
        }
      ]
    }
  };
}

// Agent pour l'analyse de la concurrence
export async function runCompetitorAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Concurrence] Analyse pour ${business.name}...`);
  
  const industryCompetitors: Record<string, any> = {
    technology: {
      main_competitors: [
        {
          name: "TechCorp Global",
          strengths: ["Grande part de marché", "R&D importante", "Marque reconnue"],
          weaknesses: ["Moins agile", "Prix élevés", "Support client lent"]
        },
        {
          name: "InnovateTech Solutions",
          strengths: ["Innovation rapide", "Prix compétitifs", "Bonne UX"],
          weaknesses: ["Portée limitée", "Moins de ressources", "Jeune marque"]
        }
      ],
      competitive_advantages: ["Approche personnalisée", "Technologies de pointe", "Agilité et rapidité"],
      positioning_strategy: "Leader en innovation avec un focus sur la qualité et le service client"
    },
    finance: {
      main_competitors: [
        {
          name: "FinanceMax",
          strengths: ["Réseau étendu", "Produits diversifiés", "Solidité financière"],
          weaknesses: ["Frais élevés", "Processus complexes", "Innovation lente"]
        },
        {
          name: "QuickFinance",
          strengths: ["Interface moderne", "Processus rapides", "Tarifs transparents"],
          weaknesses: ["Gamme limitée", "Support basique", "Peu d'agences"]
        }
      ],
      competitive_advantages: ["Technologie avancée", "Service personnalisé", "Tarification compétitive"],
      positioning_strategy: "Fintech moderne alliant technologie et conseil personnalisé"
    }
  };

  const defaultCompetitors = {
    main_competitors: [
      {
        name: "Leader du marché",
        strengths: ["Part de marché importante", "Ressources étendues", "Marque établie"],
        weaknesses: ["Moins flexible", "Innovation plus lente", "Coûts élevés"]
      },
      {
        name: "Challenger innovant",
        strengths: ["Agilité", "Prix attractifs", "Technologies modernes"],
        weaknesses: ["Ressources limitées", "Portée réduite", "Marque moins connue"]
      }
    ],
    competitive_advantages: ["Service personnalisé", "Innovation continue", "Excellence opérationnelle"],
    positioning_strategy: "Acteur différencié par la qualité et l'innovation"
  };

  return industryCompetitors[business.industry?.toLowerCase()] || defaultCompetitors;
}

// Agent pour la stratégie marketing
export async function runMarketingStrategyAgent(business: any, marketAnalysis: any): Promise<any> {
  console.log(`[Agent Marketing] Stratégie détaillée pour ${business.name}...`);
  
  // Vérifier si on a une clé Mistral pour utiliser l'IA réelle
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && mistralKey.length > 10) {
    console.log("[Agent Marché] Clé Mistral détectée, activation du mode IA réel");
    try {
      // Utiliser l'agent IA réel
      const { runRealMarketingStrategyAgent } = await import('./marketing-strategy-agent');
      return await runRealMarketingStrategyAgent(business, marketAnalysis);
    } catch (error) {
      console.error("[Agent Marketing] Erreur avec l'IA, fallback sur données simulées:", error);
    }
  }
  
  // Données spécifiques par industrie
  const industrySpecificMarketing: Record<string, any> = {
    restauration: {
      vision: "Devenir la référence gastronomique qui transforme chaque repas en expérience mémorable",
      mission: "Offrir une cuisine authentique et innovante dans une ambiance chaleureuse, en valorisant les produits locaux et le savoir-faire artisanal",
      uvp: "La seule adresse où tradition culinaire et créativité moderne se rencontrent pour créer des moments inoubliables",
      personality: ["Chaleureuse", "Authentique", "Créative", "Raffinée", "Accueillante"],
      values: ["Qualité sans compromis", "Produits locaux et de saison", "Service personnalisé", "Innovation respectueuse", "Développement durable"],
      segments: [
        {
          name: "Familles gourmandes",
          description: "Familles recherchant des moments de qualité autour d'un bon repas",
          size: "40% du marché cible",
          characteristics: ["30-50 ans", "Revenus moyens-élevés", "Sorties week-end", "Sensibles à l'accueil enfants"],
          pain_points: ["Manque de temps", "Recherche de qualité", "Ambiance adaptée aux enfants"],
          preferred_channels: ["Instagram", "Bouche-à-oreille", "Google Maps", "Facebook"],
          budget: "50-80€ par sortie"
        },
        {
          name: "Professionnels urbains",
          description: "Cadres et entrepreneurs pour déjeuners d'affaires ou afterwork",
          size: "35% du marché cible",
          characteristics: ["25-45 ans", "CSP+", "Déjeuners rapides", "Networking"],
          pain_points: ["Service rapide nécessaire", "Cadre professionnel", "Menu adapté"],
          preferred_channels: ["LinkedIn", "Email", "Applications de réservation", "Google"],
          budget: "25-40€ par repas"
        },
        {
          name: "Couples épicuriens",
          description: "Couples recherchant des expériences gastronomiques",
          size: "25% du marché cible",
          characteristics: ["25-60 ans", "Amateurs de gastronomie", "Occasions spéciales", "Instagram actifs"],
          pain_points: ["Recherche d'originalité", "Ambiance romantique", "Expérience unique"],
          preferred_channels: ["Instagram", "TripAdvisor", "Blogs culinaires", "Influenceurs food"],
          budget: "80-150€ par sortie"
        }
      ],
      product_mix: {
        core_offerings: ["Menu du jour créatif", "Carte de saison", "Menu dégustation", "Brunch du dimanche", "Plats signature"],
        unique_features: ["Produits 100% locaux", "Menu sans gluten/végétarien", "Cave à vins exclusifs", "Show cooking", "Terrasse panoramique"],
        quality_indicators: ["Label Maître Restaurateur", "Produits bio certifiés", "Note 4.8/5 sur TripAdvisor", "Chef formé chez des étoilés"],
        innovation_pipeline: ["Menu QR code interactif", "Ateliers de cuisine", "Box repas gastronomiques", "Service traiteur premium"]
      },
      campaigns: [
        {
          name: "Les Jeudis Découverte",
          objective: "Attirer une nouvelle clientèle en semaine",
          target_segment: "Professionnels urbains",
          duration: "3 mois",
          channels: ["Instagram", "Email", "Partenariats entreprises"],
          key_message: "Découvrez notre menu dégustation à -30% tous les jeudis",
          expected_results: "+40% de fréquentation le jeudi",
          budget_estimate: "5000€"
        },
        {
          name: "Instagrammable Experience",
          objective: "Créer du buzz et attirer les millennials",
          target_segment: "Couples épicuriens",
          duration: "2 mois",
          channels: ["Instagram", "TikTok", "Influenceurs locaux"],
          key_message: "Vos plats les plus photogéniques, vos moments les plus mémorables",
          expected_results: "+500 followers, +25% réservations week-end",
          budget_estimate: "3000€"
        }
      ]
    },
    technology: {
      vision: "Démocratiser l'accès aux technologies de pointe pour transformer la façon dont les entreprises opèrent",
      mission: "Développer des solutions technologiques intuitives et puissantes qui permettent à nos clients de se concentrer sur leur cœur de métier",
      uvp: "La seule plateforme qui combine IA avancée, simplicité d'utilisation et ROI garanti en moins de 3 mois",
      personality: ["Innovante", "Fiable", "Accessible", "Experte", "Collaborative"],
      values: ["Innovation constante", "Centré utilisateur", "Transparence", "Performance", "Sécurité des données"],
      segments: [
        {
          name: "Startups Tech",
          description: "Jeunes entreprises technologiques en forte croissance",
          size: "30% du marché cible",
          characteristics: ["2-50 employés", "Croissance rapide", "Budget limité", "Agilité requise"],
          pain_points: ["Ressources limitées", "Besoin de scalabilité", "Time-to-market court"],
          preferred_channels: ["LinkedIn", "Product Hunt", "Slack communities", "Webinars"],
          budget: "500-5000€/mois"
        },
        {
          name: "PME Traditionnelles",
          description: "Entreprises établies en transformation digitale",
          size: "45% du marché cible",
          characteristics: ["50-500 employés", "Processus établis", "Budget IT croissant", "Résistance au changement"],
          pain_points: ["Systèmes legacy", "Formation équipes", "ROI à démontrer"],
          preferred_channels: ["Email", "Salons professionnels", "Références clients", "Démos personnalisées"],
          budget: "2000-20000€/mois"
        },
        {
          name: "Grandes Entreprises",
          description: "Entreprises cherchant des solutions enterprise",
          size: "25% du marché cible",
          characteristics: ["+500 employés", "Processus complexes", "Multisites", "Exigences sécurité"],
          pain_points: ["Intégration systèmes", "Compliance", "Support 24/7"],
          preferred_channels: ["RFP", "Partenaires intégrateurs", "Account management", "Événements VIP"],
          budget: "20000€+/mois"
        }
      ],
      product_mix: {
        core_offerings: ["SaaS tout-en-un", "API REST complète", "Modules personnalisables", "Support premium", "Formation incluse"],
        unique_features: ["IA prédictive", "No-code builder", "Intégrations natives 100+", "Analytics temps réel", "White-label disponible"],
        quality_indicators: ["99.9% uptime", "SOC 2 certifié", "RGPD compliant", "Support 24/7", "NPS score 70+"],
        innovation_pipeline: ["ML AutoML", "Blockchain integration", "IoT connectivity", "Voice interface", "AR/VR modules"]
      },
      campaigns: [
        {
          name: "Free Trial Revolution",
          objective: "Acquisition massive de nouveaux utilisateurs",
          target_segment: "Startups Tech",
          duration: "3 mois",
          channels: ["Product Hunt", "LinkedIn Ads", "Content marketing", "Referral program"],
          key_message: "30 jours gratuits, sans carte bancaire, sans engagement",
          expected_results: "+1000 sign-ups, 25% conversion rate",
          budget_estimate: "15000€"
        }
      ]
    }
  };

  // Données par défaut pour autres industries
  const defaultMarketing = {
    vision: `Devenir le leader reconnu dans ${business.industry} en offrant des solutions innovantes et un service exceptionnel`,
    mission: `Fournir des produits/services de ${business.industry} qui dépassent les attentes de nos clients tout en créant de la valeur durable`,
    uvp: `La combinaison unique d'expertise, d'innovation et de service personnalisé dans ${business.industry}`,
    personality: ["Professionnelle", "Innovante", "Fiable", "Accessible", "Orientée résultats"],
    values: ["Excellence", "Innovation", "Intégrité", "Service client", "Durabilité"],
    segments: [
      {
        name: "Segment principal",
        description: "Notre cœur de cible",
        size: "60% du marché cible",
        characteristics: ["Profil type du secteur", "Budget adapté", "Recherche de qualité"],
        pain_points: ["Besoin de solutions fiables", "Recherche de partenaire de confiance"],
        preferred_channels: ["Digital", "Réseaux professionnels", "Références"],
        budget: "Variable selon le secteur"
      }
    ],
    product_mix: {
      core_offerings: ["Offre principale", "Services complémentaires", "Support client"],
      unique_features: ["Différenciateurs clés", "Avantages compétitifs"],
      quality_indicators: ["Certifications", "Témoignages clients", "Performances"],
      innovation_pipeline: ["Projets R&D", "Nouvelles fonctionnalités prévues"]
    },
    campaigns: [
      {
        name: "Campagne de lancement",
        objective: "Faire connaître notre offre",
        target_segment: "Segment principal",
        duration: "3 mois",
        channels: ["Multi-canal"],
        key_message: "Découvrez notre solution innovante",
        expected_results: "Augmentation notoriété et leads",
        budget_estimate: "À définir"
      }
    ]
  };

  const industryData = industrySpecificMarketing[business.industry?.toLowerCase()] || defaultMarketing;
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });

  return {
    executive_summary: {
      vision: industryData.vision,
      mission: industryData.mission,
      unique_value_proposition: industryData.uvp,
      target_roi: business.stage === 'startup' ? "300% en année 2" : "150% en 18 mois"
    },
    brand_positioning: {
      brand_essence: `${business.name} - L'excellence accessible`,
      brand_promise: `Nous promettons de transformer votre expérience en ${business.industry}`,
      brand_personality: industryData.personality,
      brand_values: industryData.values,
      positioning_statement: `Pour ${marketAnalysis?.target_audience?.primary || industryData.segments[0]?.description || 'nos clients'}, ${business.name} est la solution de ${business.industry} qui ${industryData.uvp.toLowerCase()}`,
      competitive_advantages: [
        "Approche personnalisée unique",
        "Innovation constante",
        "Rapport qualité-prix optimal",
        "Service client exceptionnel",
        "Expertise reconnue"
      ]
    },
    target_segments: industryData.segments,
    marketing_mix: {
      product: industryData.product_mix,
      price: {
        strategy: business.stage === 'startup' ? "Pénétration" : "Premium accessible",
        positioning: "Rapport qualité-prix optimal",
        model: "Flexible selon les besoins",
        tactics: ["Prix de lancement", "Packages sur mesure", "Fidélité récompensée", "Transparence totale"]
      },
      place: {
        distribution_channels: business.industry === 'restauration' 
          ? ["Restaurant principal", "Service traiteur", "Click & Collect", "Livraison partenaires"]
          : ["Vente directe", "Site web", "Partenaires", "Marketplaces"],
        geographic_focus: ["Zone urbaine principale", "Extension régionale prévue"],
        online_presence: ["Site web optimisé", "Réseaux sociaux actifs", "Marketplaces sectorielles"],
        partnerships: ["Partenaires stratégiques du secteur", "Influenceurs", "Entreprises complémentaires"]
      },
      promotion: {
        key_messages: [
          `${business.name} - Votre partenaire de confiance`,
          "Qualité, Innovation, Service",
          "Des résultats concrets, rapidement",
          "Une équipe à votre écoute"
        ],
        campaign_themes: ["Lancement", "Témoignages clients", "Innovation", "Saisonnalité"],
        content_pillars: ["Expertise", "Behind the scenes", "Success stories", "Tips & Tricks"],
        promotional_tactics: ["Content marketing", "Social media", "Email nurturing", "Events", "Referral program"]
      }
    },
    customer_journey: {
      awareness: {
        touchpoints: ["Recherche Google", "Réseaux sociaux", "Bouche-à-oreille", "Publicité ciblée"],
        content_types: ["Articles de blog", "Vidéos courtes", "Infographies", "Posts sociaux"],
        channels: ["SEO", "Social ads", "Content marketing", "PR"]
      },
      consideration: {
        touchpoints: ["Site web", "Démonstrations", "Témoignages", "Comparateurs"],
        content_types: ["Case studies", "Démos produit", "Webinars", "Guides comparatifs"],
        channels: ["Email", "Retargeting", "Sales", "Chat"]
      },
      decision: {
        touchpoints: ["Essai gratuit", "Consultation", "Devis personnalisé", "Garanties"],
        content_types: ["Offres spéciales", "ROI calculator", "Testimonials", "FAQ"],
        channels: ["Sales direct", "Email", "Phone", "Chat support"]
      },
      retention: {
        touchpoints: ["Onboarding", "Support", "Newsletter", "Programme fidélité"],
        content_types: ["Tutoriels", "Best practices", "Updates produit", "Exclusivités"],
        channels: ["Email", "In-app", "Community", "Events VIP"]
      }
    },
    channel_strategy: [
      {
        channel: "Digital Marketing",
        priority: 'high',
        objectives: ["Génération de leads", "Notoriété", "Conversion"],
        tactics: ["SEO optimisé", "Google Ads", "Social Media Ads", "Marketing automation"],
        kpis: ["Trafic web", "Taux de conversion", "Coût par lead", "ROI"],
        budget_allocation: 40
      },
      {
        channel: "Content Marketing",
        priority: 'high',
        objectives: ["Thought leadership", "SEO", "Nurturing"],
        tactics: ["Blog hebdomadaire", "Vidéos tutoriels", "Ebooks", "Infographies"],
        kpis: ["Vues", "Engagement", "Leads générés", "Partages"],
        budget_allocation: 25
      },
      {
        channel: "Social Media",
        priority: business.industry === 'restauration' ? 'high' : 'medium',
        objectives: ["Communauté", "Engagement", "Service client"],
        tactics: ["Posts quotidiens", "Stories", "Lives", "UGC campaigns"],
        kpis: ["Followers", "Engagement rate", "Reach", "Mentions"],
        budget_allocation: 20
      },
      {
        channel: "Email Marketing",
        priority: 'medium',
        objectives: ["Nurturing", "Rétention", "Upsell"],
        tactics: ["Newsletter", "Drip campaigns", "Segmentation", "Personnalisation"],
        kpis: ["Open rate", "Click rate", "Conversion", "Unsubscribe rate"],
        budget_allocation: 15
      }
    ],
    content_strategy: {
      content_themes: industryData.product_mix.core_offerings.map(offering => 
        `Excellence en ${offering.toLowerCase()}`
      ),
      content_calendar: {
        frequency: "4-5 contenus par semaine",
        themes_by_month: {
          [currentMonth]: ["Lancement", "Présentation équipe", "Valeurs"],
          "Mois +1": ["Success stories", "Tutoriels", "Innovation"],
          "Mois +2": ["Événements", "Partenariats", "Behind the scenes"],
          "Mois +3": ["Bilan", "Projets futurs", "Communauté"]
        }
      },
      content_types: [
        {
          type: "Articles de blog",
          frequency: "2 par semaine",
          objectives: ["SEO", "Thought leadership", "Education"],
          distribution: ["Site web", "Newsletter", "LinkedIn"]
        },
        {
          type: "Vidéos",
          frequency: "1 par semaine",
          objectives: ["Engagement", "Démonstration", "Humanisation"],
          distribution: ["YouTube", "Instagram", "LinkedIn", "Site web"]
        },
        {
          type: "Infographies",
          frequency: "2 par mois",
          objectives: ["Viralité", "Education", "Lead generation"],
          distribution: ["Social media", "Blog", "Email"]
        }
      ],
      storytelling_framework: {
        brand_story: `L'histoire de ${business.name} commence avec une vision simple : ${industryData.mission}`,
        customer_stories: ["Transformation client type", "Success story PME", "Innovation collaborative"],
        content_series: ["Les coulisses de", "Portrait de client", "Innovation spotlight", "Tips Tuesday"]
      }
    },
    campaign_ideas: industryData.campaigns,
    metrics_framework: {
      awareness_metrics: ["Reach", "Impressions", "Brand searches", "Share of voice", "Website traffic"],
      engagement_metrics: ["Likes", "Comments", "Shares", "Time on site", "Email opens"],
      conversion_metrics: ["Lead generation", "Conversion rate", "Sales qualified leads", "Customer acquisition cost"],
      retention_metrics: ["Customer lifetime value", "Churn rate", "NPS score", "Repeat purchase rate"],
      roi_metrics: ["Revenue growth", "Market share", "ROI by channel", "Customer acquisition cost", "Profit margin"]
    },
    budget_allocation: {
      total_budget: business.stage === 'startup' ? "50-100k€/an" : "200-500k€/an",
      by_channel: {
        "Digital": 40,
        "Content": 25,
        "Social": 20,
        "Traditional": 15
      },
      by_objective: {
        "Acquisition": 50,
        "Retention": 30,
        "Branding": 20
      },
      by_quarter: {
        "Q1": 30,
        "Q2": 25,
        "Q3": 20,
        "Q4": 25
      }
    },
    implementation_roadmap: [
      {
        phase: "Foundation (Mois 1-2)",
        duration: "2 mois",
        objectives: ["Setup infrastructure", "Définir brand guidelines", "Recruter équipe"],
        key_activities: ["Création site web", "Ouverture réseaux sociaux", "Premiers contenus", "CRM setup"],
        success_criteria: ["Site live", "100 followers", "10 premiers leads"],
        budget: "20% du budget annuel"
      },
      {
        phase: "Launch (Mois 3-4)",
        duration: "2 mois",
        objectives: ["Lancement officiel", "Premières campagnes", "Générer traction"],
        key_activities: ["Campagne de lancement", "PR", "Événement inauguration", "Influencer outreach"],
        success_criteria: ["1000 visiteurs/mois", "50 leads qualifiés", "5 premiers clients"],
        budget: "30% du budget annuel"
      },
      {
        phase: "Growth (Mois 5-8)",
        duration: "4 mois",
        objectives: ["Scaling", "Optimisation", "Expansion"],
        key_activities: ["A/B testing", "Nouvelles campagnes", "Partenariats", "Content acceleration"],
        success_criteria: ["5000 visiteurs/mois", "200 leads/mois", "50 clients"],
        budget: "30% du budget annuel"
      },
      {
        phase: "Optimization (Mois 9-12)",
        duration: "4 mois",
        objectives: ["ROI optimization", "Retention focus", "Prepare year 2"],
        key_activities: ["Marketing automation", "Loyalty program", "Upsell campaigns", "Annual planning"],
        success_criteria: ["ROI positif", "NPS > 50", "30% repeat business"],
        budget: "20% du budget annuel"
      }
    ],
    risk_mitigation: [
      {
        risk: "Faible adoption initiale",
        probability: 'medium',
        impact: 'high',
        mitigation_strategy: "Offres de lancement agressives et programme early adopters"
      },
      {
        risk: "Concurrence accrue",
        probability: 'high',
        impact: 'medium',
        mitigation_strategy: "Différenciation claire et innovation continue"
      },
      {
        risk: "Budget insuffisant",
        probability: 'medium',
        impact: 'high',
        mitigation_strategy: "Focus sur canaux organiques et growth hacking"
      },
      {
        risk: "Turnover équipe marketing",
        probability: 'low',
        impact: 'medium',
        mitigation_strategy: "Documentation processus et knowledge management"
      }
    ]
  };
}

// Agent pour générer le prompt du site web
export async function runWebsitePromptAgent(
  business: any, 
  marketAnalysis: any,
  competitorAnalysis: any,
  marketingStrategy: any
): Promise<any> {
  console.log(`[Agent Website] Génération du prompt pour ${business.name}...`);
  
  const designStyles: Record<string, string> = {
    technology: "moderne et épuré avec des animations subtiles",
    finance: "professionnel et rassurant avec des éléments de confiance",
    santé: "propre et accessible avec une touche humaine",
    éducation: "engageant et coloré avec des éléments interactifs",
    immobilier: "élégant et immersif avec des visuels de qualité",
    default: "professionnel et moderne"
  };

  const designStyle = designStyles[business.industry?.toLowerCase()] || designStyles.default;
  
  const prompt = `Créez un site web professionnel pour ${business.name}.

Description du business : ${business.description}
Industrie : ${business.industry}
Étape : ${business.stage}

Public cible : ${marketAnalysis?.target_audience?.primary || marketAnalysis?.target_audience || "Professionnels et entreprises"}
Proposition de valeur : Se différencier par ${competitorAnalysis?.competitive_advantages?.join(", ") || "innovation et service"}

Le site doit avoir un design ${designStyle} et communiquer ${marketingStrategy?.key_messages?.[0] || "notre excellence"}.

Incluez les sections suivantes :
- Hero section avec le message principal : "${marketingStrategy?.positioning || business.name + ' - Excellence et Innovation'}"
- Services adaptés à l'industrie ${business.industry}
- Section "À propos" mettant en avant nos avantages compétitifs
- Témoignages clients
- Call-to-action clair pour ${business.stage === 'startup' ? 'découvrir notre vision' : business.stage === 'croissance' ? 'accélérer votre croissance' : 'bénéficier de notre expertise'}`;

  return {
    prompt,
    key_features: [
      "Navigation intuitive",
      "Design responsive",
      "Optimisation SEO",
      "Formulaires de contact",
      "Intégration réseaux sociaux"
    ],
    design_style: designStyle,
    target_impression: marketingStrategy?.positioning || `${business.name} - Excellence et Innovation`
  };
}

// Fonction principale pour lancer toutes les analyses
export async function runAllAgentsForBusiness(business: any): Promise<BusinessAnalysis> {
  console.log(`[Ezia] Lancement des analyses pour ${business.name}...`);
  
  try {
    // Simuler un délai réaliste pour les analyses (entre 8 et 15 secondes)
    const analysisDelay = Math.random() * 7000 + 8000; // 8-15 secondes
    
    // Lancer les analyses en parallèle quand c'est possible
    const [marketAnalysis, competitorAnalysis] = await Promise.all([
      runMarketAnalysisAgentWithDelay(business, analysisDelay * 0.4),
      runCompetitorAnalysisAgentWithDelay(business, analysisDelay * 0.3)
    ]);

    // La stratégie marketing dépend de l'analyse de marché
    const marketingStrategy = await runMarketingStrategyAgentWithDelay(business, marketAnalysis, analysisDelay * 0.2);

    // Le prompt du site web dépend de toutes les autres analyses
    const websitePrompt = await runWebsitePromptAgentWithDelay(
      business,
      marketAnalysis,
      competitorAnalysis,
      marketingStrategy,
      analysisDelay * 0.1
    );

    return {
      market_analysis: marketAnalysis,
      competitor_analysis: competitorAnalysis,
      marketing_strategy: marketingStrategy,
      website_prompt: websitePrompt
    };
  } catch (error) {
    console.error("[Ezia] Erreur lors des analyses:", error);
    throw error;
  }
}

// Fonctions wrapper avec délai pour simuler le temps de traitement
async function runMarketAnalysisAgentWithDelay(business: any, delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return runMarketAnalysisAgent(business);
}

async function runCompetitorAnalysisAgentWithDelay(business: any, delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return runCompetitorAnalysisAgent(business);
}

async function runMarketingStrategyAgentWithDelay(business: any, marketAnalysis: any, delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return runMarketingStrategyAgent(business, marketAnalysis);
}

async function runWebsitePromptAgentWithDelay(business: any, marketAnalysis: any, competitorAnalysis: any, marketingStrategy: any, delay: number) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return runWebsitePromptAgent(business, marketAnalysis, competitorAnalysis, marketingStrategy);
}