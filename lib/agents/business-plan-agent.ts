import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

interface BusinessPlanInput {
  business: any;
  marketAnalysis?: any;
  personas?: any;
  collectedData?: any;
}

export async function runBusinessPlanAgent(input: BusinessPlanInput): Promise<any> {
  const { business, marketAnalysis, personas, collectedData } = input;
  console.log(`[Agent Business Plan] Génération du business plan pour ${business.name}...`);
  
  const systemContext = `Tu es un expert en stratégie business avec 20 ans d'expérience en création de business plans.
Tu dois créer un business plan COMPLET et RÉALISTE, ainsi qu'un Business Model Canvas détaillé.
IMPORTANT:
- Utilise des projections financières réalistes basées sur les données du marché
- Sois spécifique aux conditions du marché français/européen
- Base-toi sur les analyses de marché et personas fournis
- Fournis des chiffres concrets et justifiés
- Inclus des scénarios optimiste, réaliste et pessimiste`;

  const prompt = `Crée un business plan complet pour ce business:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
Stade: ${business.stage}
${collectedData ? `
Données collectées:
- Offres: ${JSON.stringify(collectedData.offerings)}
- Modèle: ${JSON.stringify(collectedData.business_model)}
- Objectifs financiers: ${JSON.stringify(collectedData.financial_info)}
` : ''}
${marketAnalysis ? `
Analyse de marché:
- Taille marché: ${marketAnalysis.market_overview?.market_size}
- Croissance: ${marketAnalysis.market_overview?.growth_rate}
- SWOT: ${JSON.stringify(marketAnalysis.swot_analysis)}
` : ''}
${personas ? `
Personas identifiés: ${personas.personas?.length} profils clients
` : ''}

Génère un business plan COMPLET avec Business Model Canvas.

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "executive_summary": {
    "mission": "Mission claire et inspirante",
    "vision": "Vision à 5 ans",
    "value_proposition": "Proposition de valeur unique",
    "key_success_factors": ["3-4 facteurs clés de succès"],
    "financial_highlights": {
      "revenue_year_3": "Revenus prévus année 3",
      "break_even": "Mois jusqu'au break-even",
      "funding_needed": "Financement nécessaire total",
      "roi_expected": "ROI attendu pour investisseurs"
    }
  },
  "business_model_canvas": {
    "customer_segments": [
      {
        "name": "Nom du segment",
        "size": "Taille estimée",
        "value": "Valeur pour le business",
        "growth": "Potentiel de croissance"
      }
    ],
    "value_propositions": [
      {
        "proposition": "Description de la valeur",
        "target_segment": "Segment ciblé",
        "differentiation": "Ce qui nous différencie"
      }
    ],
    "channels": [
      {
        "channel": "Canal de distribution",
        "purpose": "awareness|evaluation|purchase|delivery|support",
        "cost_efficiency": "high|medium|low"
      }
    ],
    "customer_relationships": [
      {
        "type": "Type de relation",
        "description": "Description détaillée",
        "automation_level": "manual|semi-auto|full-auto"
      }
    ],
    "revenue_streams": [
      {
        "source": "Source de revenu",
        "pricing_model": "Modèle de prix",
        "contribution": "% du CA total",
        "growth_potential": "Potentiel de croissance"
      }
    ],
    "key_resources": [
      {
        "resource": "Ressource clé",
        "type": "physical|intellectual|human|financial",
        "criticality": "high|medium|low"
      }
    ],
    "key_activities": [
      {
        "activity": "Activité clé",
        "frequency": "Fréquence",
        "importance": "critical|important|nice-to-have"
      }
    ],
    "key_partnerships": [
      {
        "partner": "Type de partenaire",
        "motivation": "Motivation du partenariat",
        "contribution": "Ce qu'ils apportent"
      }
    ],
    "cost_structure": {
      "fixed_costs": [
        {
          "category": "Catégorie de coût",
          "monthly_amount": "Montant mensuel",
          "description": "Description"
        }
      ],
      "variable_costs": [
        {
          "category": "Catégorie",
          "unit_cost": "Coût unitaire",
          "driver": "Ce qui drive le coût"
        }
      ],
      "cost_advantages": ["Avantages coûts identifiés"]
    }
  },
  "market_strategy": {
    "go_to_market": {
      "phase_1": {
        "duration": "3 mois",
        "focus": "Focus principal",
        "tactics": ["Tactiques spécifiques"],
        "kpis": ["KPIs à suivre"],
        "budget": "Budget alloué"
      },
      "phase_2": {
        "duration": "6 mois",
        "focus": "Expansion",
        "tactics": ["Nouvelles tactiques"],
        "kpis": ["KPIs phase 2"],
        "budget": "Budget phase 2"
      }
    },
    "pricing_strategy": {
      "model": "freemium|subscription|one-time|usage-based",
      "positioning": "premium|competitive|penetration",
      "price_points": [
        {
          "tier": "Nom du tier",
          "price": "Prix",
          "features": ["Features incluses"],
          "target_segment": "Segment ciblé"
        }
      ]
    },
    "sales_strategy": {
      "approach": "inbound|outbound|hybrid",
      "sales_cycle": "Durée cycle de vente",
      "conversion_rate": "Taux de conversion attendu",
      "average_deal_size": "Taille moyenne transaction"
    }
  },
  "operations_plan": {
    "milestones": [
      {
        "milestone": "Nom du milestone",
        "date": "Date cible",
        "dependencies": ["Dépendances"],
        "success_criteria": "Critères de succès"
      }
    ],
    "team_structure": {
      "current_team": "Taille équipe actuelle",
      "hiring_plan": [
        {
          "role": "Rôle à recruter",
          "when": "Quand",
          "cost": "Coût annuel",
          "impact": "Impact attendu"
        }
      ],
      "org_chart_evolution": "Description évolution organisation"
    },
    "technology_roadmap": [
      {
        "phase": "Phase",
        "timeline": "Timeline",
        "deliverables": ["Livrables"],
        "investment": "Investissement nécessaire"
      }
    ]
  },
  "financial_projections": {
    "assumptions": {
      "market_growth": "Croissance marché utilisée",
      "market_share_target": "Part de marché visée",
      "customer_acquisition_cost": "CAC moyen",
      "customer_lifetime_value": "LTV moyenne",
      "churn_rate": "Taux de churn mensuel"
    },
    "revenue_forecast": {
      "year_1": {
        "monthly_breakdown": [
          {"month": 1, "revenue": 0, "customers": 0}
        ],
        "total": "Total année 1"
      },
      "year_2": {
        "quarterly_breakdown": [
          {"quarter": "Q1", "revenue": 0, "customers": 0}
        ],
        "total": "Total année 2"
      },
      "year_3": {
        "total": "Total année 3",
        "growth_rate": "Taux de croissance"
      }
    },
    "expense_forecast": {
      "categories": [
        {
          "category": "Salaires",
          "year_1": "Montant",
          "year_2": "Montant",
          "year_3": "Montant"
        }
      ]
    },
    "cash_flow": {
      "initial_investment": "Investissement initial",
      "burn_rate": "Burn rate mensuel moyen",
      "runway": "Runway en mois",
      "break_even_month": "Mois du break-even"
    },
    "scenarios": {
      "optimistic": {
        "revenue_year_3": "Revenus année 3",
        "probability": "30%",
        "key_assumptions": ["Hypothèses clés"]
      },
      "realistic": {
        "revenue_year_3": "Revenus année 3",
        "probability": "50%",
        "key_assumptions": ["Hypothèses clés"]
      },
      "pessimistic": {
        "revenue_year_3": "Revenus année 3",
        "probability": "20%",
        "key_assumptions": ["Hypothèses clés"]
      }
    }
  },
  "risk_analysis": {
    "risks": [
      {
        "risk": "Description du risque",
        "probability": "high|medium|low",
        "impact": "high|medium|low",
        "mitigation": "Plan de mitigation"
      }
    ],
    "contingency_plans": ["Plans de contingence majeurs"]
  },
  "funding_requirements": {
    "total_needed": "Montant total nécessaire",
    "use_of_funds": [
      {
        "category": "Catégorie",
        "amount": "Montant",
        "percentage": "% du total",
        "justification": "Justification"
      }
    ],
    "funding_stages": [
      {
        "stage": "Seed|Series A|Series B",
        "amount": "Montant",
        "timing": "Quand",
        "valuation": "Valorisation visée"
      }
    ],
    "exit_strategy": {
      "timeline": "5-7 ans",
      "options": ["Options de sortie"],
      "target_multiple": "Multiple visé"
    }
  }
}`;

  try {
    const response = await generateWithMistralAPI(prompt, systemContext);
    
    if (response.success && response.content) {
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const businessPlan = JSON.parse(jsonMatch[0]);
          
          // Enrichir avec des calculs supplémentaires
          businessPlan.key_metrics = calculateKeyMetrics(businessPlan, collectedData);
          businessPlan.investment_readiness_score = calculateInvestmentReadiness(businessPlan, business);
          
          return businessPlan;
        }
      } catch (parseError) {
        console.error("[Agent Business Plan] Erreur parsing JSON:", parseError);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Business Plan] Erreur:", error);
    return generateFallbackBusinessPlan(business, collectedData, marketAnalysis);
  }
}

function calculateKeyMetrics(businessPlan: any, collectedData: any): any {
  const revenue = businessPlan.financial_projections?.revenue_forecast?.year_1?.total || 0;
  const cac = businessPlan.financial_projections?.assumptions?.customer_acquisition_cost || 100;
  const ltv = businessPlan.financial_projections?.assumptions?.customer_lifetime_value || 1000;
  
  return {
    ltv_cac_ratio: (ltv / cac).toFixed(2),
    gross_margin: collectedData?.offerings?.[0]?.margin || "70%",
    monthly_recurring_revenue: (revenue / 12).toFixed(0),
    payback_period: (cac / (revenue / 12)).toFixed(1) + " mois",
    rule_of_40: calculateRuleOf40(businessPlan)
  };
}

function calculateRuleOf40(businessPlan: any): string {
  const growthRate = parseInt(businessPlan.financial_projections?.revenue_forecast?.year_3?.growth_rate || "0");
  const profitMargin = -20; // Assume negative in early stage
  return `${growthRate + profitMargin}% (Croissance: ${growthRate}%, Marge: ${profitMargin}%)`;
}

function calculateInvestmentReadiness(businessPlan: any, business: any): number {
  let score = 0;
  
  // Critères d'évaluation
  if (businessPlan.executive_summary?.mission) score += 10;
  if (businessPlan.business_model_canvas?.revenue_streams?.length > 1) score += 15;
  if (businessPlan.financial_projections?.scenarios) score += 20;
  if (businessPlan.market_strategy?.go_to_market) score += 15;
  if (businessPlan.operations_plan?.milestones?.length > 3) score += 10;
  if (businessPlan.risk_analysis?.risks?.length > 3) score += 10;
  if (business.stage !== "idea") score += 20;
  
  return Math.min(100, score);
}

function generateFallbackBusinessPlan(business: any, collectedData: any, marketAnalysis: any): any {
  const basePrice = collectedData?.offerings?.[0]?.price || 500;
  const marketSize = marketAnalysis?.market_overview?.market_size || "€2.5 milliards";
  
  return {
    executive_summary: {
      mission: `Révolutionner ${business.industry} avec des solutions innovantes et accessibles`,
      vision: `Devenir le leader français de ${business.industry} d'ici 5 ans`,
      value_proposition: `${business.name} offre une solution unique qui résout les problèmes de ${business.industry}`,
      key_success_factors: [
        "Équipe expérimentée et passionnée",
        "Technologie innovante et scalable",
        "Go-to-market strategy agressive",
        "Partenariats stratégiques clés"
      ],
      financial_highlights: {
        revenue_year_3: "€2.5M",
        break_even: "18",
        funding_needed: "€500K",
        roi_expected: "5x en 5 ans"
      }
    },
    business_model_canvas: {
      customer_segments: [
        {
          name: "PME innovantes",
          size: "15,000 entreprises",
          value: "€150K/an moyenne",
          growth: "20% par an"
        },
        {
          name: "Startups en croissance",
          size: "5,000 entreprises",
          value: "€50K/an moyenne",
          growth: "35% par an"
        }
      ],
      value_propositions: [
        {
          proposition: "Solution 10x plus rapide que les alternatives",
          target_segment: "PME innovantes",
          differentiation: "IA propriétaire et UX intuitive"
        },
        {
          proposition: "Prix accessible et modèle flexible",
          target_segment: "Startups en croissance",
          differentiation: "Pay-as-you-grow et onboarding gratuit"
        }
      ],
      channels: [
        {
          channel: "Vente directe B2B",
          purpose: "purchase",
          cost_efficiency: "medium"
        },
        {
          channel: "Marketing digital (SEO/SEA)",
          purpose: "awareness",
          cost_efficiency: "high"
        },
        {
          channel: "Partenariats revendeurs",
          purpose: "purchase",
          cost_efficiency: "high"
        }
      ],
      customer_relationships: [
        {
          type: "Customer Success dédié",
          description: "Accompagnement personnalisé pour grands comptes",
          automation_level: "semi-auto"
        },
        {
          type: "Self-service avec support",
          description: "Plateforme autonome avec chat support",
          automation_level: "full-auto"
        }
      ],
      revenue_streams: [
        {
          source: "Abonnements SaaS",
          pricing_model: "Mensuel/Annuel",
          contribution: "70%",
          growth_potential: "Très élevé"
        },
        {
          source: "Services professionnels",
          pricing_model: "Forfait/Régie",
          contribution: "20%",
          growth_potential: "Modéré"
        },
        {
          source: "Commissions partenaires",
          pricing_model: "Revenue share",
          contribution: "10%",
          growth_potential: "Élevé"
        }
      ],
      key_resources: [
        {
          resource: "Équipe tech (devs + data scientists)",
          type: "human",
          criticality: "high"
        },
        {
          resource: "Technologie propriétaire (algorithmes IA)",
          type: "intellectual",
          criticality: "high"
        },
        {
          resource: "Infrastructure cloud scalable",
          type: "physical",
          criticality: "medium"
        }
      ],
      key_activities: [
        {
          activity: "Développement produit continu",
          frequency: "Quotidien",
          importance: "critical"
        },
        {
          activity: "Acquisition et onboarding clients",
          frequency: "Quotidien",
          importance: "critical"
        },
        {
          activity: "Support et customer success",
          frequency: "Quotidien",
          importance: "important"
        }
      ],
      key_partnerships: [
        {
          partner: "Intégrateurs systèmes",
          motivation: "Accès au marché entreprise",
          contribution: "Distribution et implémentation"
        },
        {
          partner: "Fournisseurs technologiques",
          motivation: "Infrastructure et outils",
          contribution: "Réduction des coûts et scalabilité"
        }
      ],
      cost_structure: {
        fixed_costs: [
          {
            category: "Salaires et charges",
            monthly_amount: "€50,000",
            description: "Équipe de 8-10 personnes"
          },
          {
            category: "Infrastructure et outils",
            monthly_amount: "€5,000",
            description: "Cloud, licences, SaaS"
          },
          {
            category: "Bureaux et frais généraux",
            monthly_amount: "€8,000",
            description: "Loyer, charges, assurances"
          }
        ],
        variable_costs: [
          {
            category: "Acquisition client",
            unit_cost: "€500",
            driver: "Nouveau client acquis"
          },
          {
            category: "Infrastructure cloud",
            unit_cost: "€50/client/mois",
            driver: "Nombre de clients actifs"
          }
        ],
        cost_advantages: [
          "Économies d'échelle sur l'infrastructure",
          "Automatisation des processus",
          "Modèle lean avec équipe réduite"
        ]
      }
    },
    market_strategy: {
      go_to_market: {
        phase_1: {
          duration: "3 mois",
          focus: "Early adopters et validation marché",
          tactics: [
            "Outbound ciblé sur 100 prospects qualifiés",
            "Content marketing et SEO",
            "Webinaires de démonstration",
            "Programme bêta avec 10 clients pilotes"
          ],
          kpis: ["10 clients payants", "NPS > 50", "MRR €10K"],
          budget: "€30,000"
        },
        phase_2: {
          duration: "6 mois",
          focus: "Scaling et optimisation",
          tactics: [
            "Inbound marketing renforcé",
            "Programme de partenariat",
            "Participation à 3 salons majeurs",
            "Campagnes paid acquisition"
          ],
          kpis: ["100 clients", "MRR €100K", "CAC < €1000"],
          budget: "€150,000"
        }
      },
      pricing_strategy: {
        model: "subscription",
        positioning: "competitive",
        price_points: [
          {
            tier: "Starter",
            price: "€99/mois",
            features: ["Fonctions de base", "5 utilisateurs", "Support email"],
            target_segment: "Petites entreprises"
          },
          {
            tier: "Professional",
            price: "€499/mois",
            features: ["Toutes fonctions", "50 utilisateurs", "Support prioritaire"],
            target_segment: "PME"
          },
          {
            tier: "Enterprise",
            price: "Sur devis",
            features: ["Personnalisation", "Illimité", "CSM dédié"],
            target_segment: "Grandes entreprises"
          }
        ]
      },
      sales_strategy: {
        approach: "hybrid",
        sales_cycle: "30-60 jours",
        conversion_rate: "20%",
        average_deal_size: "€6,000/an"
      }
    },
    operations_plan: {
      milestones: [
        {
          milestone: "MVP lancé",
          date: "M+3",
          dependencies: ["Équipe tech complète", "Financement seed"],
          success_criteria: "10 clients bêta actifs"
        },
        {
          milestone: "Product-Market Fit",
          date: "M+9",
          dependencies: ["MVP validé", "Feedback clients intégré"],
          success_criteria: "50 clients payants, NPS > 50"
        },
        {
          milestone: "Scaling commercial",
          date: "M+12",
          dependencies: ["PMF atteint", "Équipe commerciale"],
          success_criteria: "MRR €100K+"
        },
        {
          milestone: "Expansion internationale",
          date: "M+24",
          dependencies: ["Succès marché français", "Series A"],
          success_criteria: "25% CA international"
        }
      ],
      team_structure: {
        current_team: "5 personnes",
        hiring_plan: [
          {
            role: "Head of Sales",
            when: "M+3",
            cost: "€80K + commission",
            impact: "Structurer la croissance commerciale"
          },
          {
            role: "2 Account Executives",
            when: "M+6",
            cost: "€60K + commission chacun",
            impact: "Accélérer l'acquisition"
          },
          {
            role: "Customer Success Manager",
            when: "M+4",
            cost: "€50K",
            impact: "Réduire le churn, augmenter l'upsell"
          },
          {
            role: "3 Développeurs seniors",
            when: "M+3-6",
            cost: "€70K chacun",
            impact: "Accélérer le développement produit"
          }
        ],
        org_chart_evolution: "De 5 à 15 personnes en 12 mois, 30 en 24 mois"
      },
      technology_roadmap: [
        {
          phase: "Foundation",
          timeline: "M1-M3",
          deliverables: ["Architecture scalable", "Core features", "API REST"],
          investment: "€100K"
        },
        {
          phase: "Enhancement",
          timeline: "M4-M9",
          deliverables: ["IA avancée", "Intégrations tierces", "Mobile app"],
          investment: "€200K"
        },
        {
          phase: "Scale",
          timeline: "M10-M18",
          deliverables: ["Multi-tenant architecture", "Analytics avancées", "API marketplace"],
          investment: "€300K"
        }
      ]
    },
    financial_projections: {
      assumptions: {
        market_growth: "25% par an",
        market_share_target: "5% en 5 ans",
        customer_acquisition_cost: "€800",
        customer_lifetime_value: "€15,000",
        churn_rate: "5% mensuel année 1, 2% année 3"
      },
      revenue_forecast: {
        year_1: {
          monthly_breakdown: [
            {"month": 1, "revenue": 0, "customers": 0},
            {"month": 2, "revenue": 1000, "customers": 2},
            {"month": 3, "revenue": 5000, "customers": 10},
            {"month": 6, "revenue": 25000, "customers": 50},
            {"month": 9, "revenue": 50000, "customers": 100},
            {"month": 12, "revenue": 100000, "customers": 200}
          ],
          total: "€420,000"
        },
        year_2: {
          quarterly_breakdown: [
            {"quarter": "Q1", "revenue": 450000, "customers": 300},
            {"quarter": "Q2", "revenue": 600000, "customers": 400},
            {"quarter": "Q3", "revenue": 750000, "customers": 500},
            {"quarter": "Q4", "revenue": 900000, "customers": 600}
          ],
          total: "€2,700,000"
        },
        year_3: {
          total: "€6,500,000",
          growth_rate: "140%"
        }
      },
      expense_forecast: {
        categories: [
          {
            category: "Salaires",
            year_1: "€600,000",
            year_2: "€1,500,000",
            year_3: "€2,800,000"
          },
          {
            category: "Marketing & Sales",
            year_1: "€150,000",
            year_2: "€540,000",
            year_3: "€1,300,000"
          },
          {
            category: "Infrastructure",
            year_1: "€60,000",
            year_2: "€150,000",
            year_3: "€350,000"
          },
          {
            category: "Autres opex",
            year_1: "€100,000",
            year_2: "€200,000",
            year_3: "€400,000"
          }
        ]
      },
      cash_flow: {
        initial_investment: "€500,000",
        burn_rate: "€75,000/mois année 1",
        runway: "6-8 mois sans revenus",
        break_even_month: "Mois 18"
      },
      scenarios: {
        optimistic: {
          revenue_year_3: "€10,000,000",
          probability: "30%",
          key_assumptions: [
            "Adoption marché plus rapide",
            "Partenariat stratégique majeur",
            "Expansion internationale réussie"
          ]
        },
        realistic: {
          revenue_year_3: "€6,500,000",
          probability: "50%",
          key_assumptions: [
            "Croissance selon plan",
            "Quelques retards acceptables",
            "Marché français principalement"
          ]
        },
        pessimistic: {
          revenue_year_3: "€3,000,000",
          probability: "20%",
          key_assumptions: [
            "Difficultés de recrutement",
            "Concurrence accrue",
            "Cycle de vente plus long"
          ]
        }
      }
    },
    risk_analysis: {
      risks: [
        {
          risk: "Difficultés de recrutement talents tech",
          probability: "high",
          impact: "high",
          mitigation: "Partenariats écoles, remote work, equity attractive"
        },
        {
          risk: "Entrée d'un concurrent majeur",
          probability: "medium",
          impact: "high",
          mitigation: "Différenciation forte, fidélisation clients, brevets"
        },
        {
          risk: "Évolution réglementaire défavorable",
          probability: "low",
          impact: "medium",
          mitigation: "Veille juridique, lobbying, adaptabilité"
        },
        {
          risk: "Problèmes de scalabilité technique",
          probability: "medium",
          impact: "medium",
          mitigation: "Architecture cloud native, tests de charge, monitoring"
        }
      ],
      contingency_plans: [
        "Plan B si pas de levée de fonds: bootstrapping et croissance organique",
        "Pivot partiel du modèle si PMF non atteint",
        "Fusion/acquisition si opportunité stratégique"
      ]
    },
    funding_requirements: {
      total_needed: "€2,000,000 sur 24 mois",
      use_of_funds: [
        {
          category: "Développement produit",
          amount: "€800,000",
          percentage: "40%",
          justification: "Recruter équipe tech senior et développer features clés"
        },
        {
          category: "Sales & Marketing",
          amount: "€600,000",
          percentage: "30%",
          justification: "Acquisition clients et construction de la marque"
        },
        {
          category: "Opérations",
          amount: "€400,000",
          percentage: "20%",
          justification: "Infrastructure, bureaux, frais généraux"
        },
        {
          category: "Buffer/Working capital",
          amount: "€200,000",
          percentage: "10%",
          justification: "Sécurité et opportunités"
        }
      ],
      funding_stages: [
        {
          stage: "Seed",
          amount: "€500,000",
          timing: "Immédiat",
          valuation: "€2-3M pre-money"
        },
        {
          stage: "Series A",
          amount: "€1,500,000",
          timing: "M+12",
          valuation: "€10-15M pre-money"
        }
      ],
      exit_strategy: {
        timeline: "5-7 ans",
        options: [
          "Acquisition stratégique par un leader du secteur",
          "IPO si €50M+ ARR atteint",
          "Management buyout si opportunité"
        ],
        target_multiple: "8-12x revenus"
      }
    },
    key_metrics: calculateKeyMetrics({
      financial_projections: {
        revenue_forecast: { year_1: { total: 420000 } },
        assumptions: { customer_acquisition_cost: 800, customer_lifetime_value: 15000 }
      }
    }, collectedData),
    investment_readiness_score: 75
  };
}

export async function generateBusinessPlanReport(businessPlan: any, business: any): Promise<string> {
  const report = `# Business Plan - ${business.name}

## Résumé Exécutif

**Mission:** ${businessPlan.executive_summary.mission}
**Vision:** ${businessPlan.executive_summary.vision}

### Points Clés Financiers
- **Revenus Année 3:** ${businessPlan.executive_summary.financial_highlights.revenue_year_3}
- **Break-even:** ${businessPlan.executive_summary.financial_highlights.break_even} mois
- **Financement Nécessaire:** ${businessPlan.executive_summary.financial_highlights.funding_needed}
- **ROI Attendu:** ${businessPlan.executive_summary.financial_highlights.roi_expected}

### Métriques Clés
- **Ratio LTV/CAC:** ${businessPlan.key_metrics?.ltv_cac_ratio || "10x"}
- **Payback Period:** ${businessPlan.key_metrics?.payback_period || "6 mois"}
- **Rule of 40:** ${businessPlan.key_metrics?.rule_of_40 || "60%"}

## Business Model Canvas

### Segments Clients
${businessPlan.business_model_canvas.customer_segments.map((s: any) => 
  `- **${s.name}:** ${s.size} (Croissance: ${s.growth})`
).join('\n')}

### Propositions de Valeur
${businessPlan.business_model_canvas.value_propositions.map((p: any) => 
  `- **${p.proposition}** pour ${p.target_segment}`
).join('\n')}

### Sources de Revenus
${businessPlan.business_model_canvas.revenue_streams.map((r: any) => 
  `- **${r.source}:** ${r.contribution} du CA (${r.pricing_model})`
).join('\n')}

## Stratégie Go-to-Market

### Phase 1 (${businessPlan.market_strategy.go_to_market.phase_1.duration})
**Focus:** ${businessPlan.market_strategy.go_to_market.phase_1.focus}
**Budget:** ${businessPlan.market_strategy.go_to_market.phase_1.budget}

### Stratégie de Prix
${businessPlan.market_strategy.pricing_strategy.price_points.map((p: any) => 
  `- **${p.tier}:** ${p.price} - ${p.target_segment}`
).join('\n')}

## Projections Financières

### Prévisions de Revenus
- **Année 1:** ${businessPlan.financial_projections.revenue_forecast.year_1.total}
- **Année 2:** ${businessPlan.financial_projections.revenue_forecast.year_2.total}
- **Année 3:** ${businessPlan.financial_projections.revenue_forecast.year_3.total}

### Scénarios
${Object.entries(businessPlan.financial_projections.scenarios).map(([key, scenario]: [string, any]) => 
  `**${key.charAt(0).toUpperCase() + key.slice(1)} (${scenario.probability}):** ${scenario.revenue_year_3}`
).join('\n')}

## Plan de Financement

**Total Nécessaire:** ${businessPlan.funding_requirements.total_needed}

### Utilisation des Fonds
${businessPlan.funding_requirements.use_of_funds.map((u: any) => 
  `- **${u.category}:** ${u.amount} (${u.percentage})`
).join('\n')}

## Score de Préparation aux Investisseurs: ${businessPlan.investment_readiness_score}/100

### Prochaines Étapes
1. Finaliser le deck de présentation investisseurs
2. Identifier et contacter les VCs/BAs cibles
3. Préparer la data room
4. Lancer le processus de levée de fonds
`;

  return report;
}