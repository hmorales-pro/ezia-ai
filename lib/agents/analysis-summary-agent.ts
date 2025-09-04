import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

interface AnalysisSummaryInput {
  business: any;
  marketAnalysis?: any;
  competitorAnalysis?: any;
  personas?: any;
  businessPlan?: any;
  collectedData?: any;
  socialMediaAnalysis?: any;
  contentStrategy?: any;
}

export async function generateExecutiveSummary(input: AnalysisSummaryInput): Promise<any> {
  const { 
    business, 
    marketAnalysis, 
    competitorAnalysis, 
    personas, 
    businessPlan,
    collectedData,
    socialMediaAnalysis,
    contentStrategy
  } = input;
  
  console.log(`[Agent Résumé] Génération du résumé exécutif pour ${business.name}...`);
  
  const systemContext = `Tu es un expert en communication business capable de synthétiser des analyses complexes.
Tu dois créer un résumé ACCESSIBLE et ACTIONNABLE pour tous les agents d'Ezia.
IMPORTANT:
- Utilise un langage clair et simple
- Mets en avant les points clés pour chaque agent
- Structure l'information de manière logique
- Inclus des recommandations concrètes par agent
- Reste factuel mais engageant`;

  const prompt = `Crée un résumé exécutif complet pour ce business:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}

Analyses disponibles:
${marketAnalysis ? `- Analyse de marché complète avec PESTEL et Porter` : ''}
${competitorAnalysis ? `- Analyse concurrentielle détaillée` : ''}
${personas ? `- ${personas.personas?.length || 3} personas clients identifiés` : ''}
${businessPlan ? `- Business plan et projections financières` : ''}
${collectedData ? `- Données business enrichies` : ''}

Génère un résumé STRUCTURÉ et ACCESSIBLE.

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "executive_overview": {
    "business_snapshot": {
      "elevator_pitch": "Pitch de 30 secondes",
      "unique_value": "Ce qui rend ce business unique",
      "market_position": "Position actuelle sur le marché",
      "growth_stage": "Stade de développement",
      "key_challenges": ["3 défis principaux"],
      "key_opportunities": ["3 opportunités majeures"]
    },
    "financial_snapshot": {
      "current_status": "Statut financier actuel",
      "revenue_projection": "Projection de revenus clé",
      "funding_needs": "Besoins de financement",
      "key_metrics": {
        "mrr": "MRR actuel ou projeté",
        "growth_rate": "Taux de croissance",
        "burn_rate": "Burn rate si applicable",
        "runway": "Runway en mois"
      }
    },
    "strategic_priorities": [
      {
        "priority": "Priorité stratégique",
        "timeline": "Court/Moyen/Long terme",
        "impact": "Impact attendu",
        "owner": "Agent responsable"
      }
    ]
  },
  "agent_specific_briefs": {
    "ezia_project_manager": {
      "role": "Coordonner l'ensemble des agents et la stratégie globale",
      "key_insights": ["3-4 insights clés pour Ezia"],
      "immediate_actions": ["Actions à coordonner cette semaine"],
      "coordination_points": ["Points de coordination inter-agents"],
      "success_metrics": ["KPIs à suivre"]
    },
    "market_analysis_agent": {
      "role": "Analyser et surveiller le marché",
      "market_summary": {
        "size": "Taille du marché",
        "growth": "Croissance annuelle",
        "trends": ["3 tendances majeures"],
        "threats": ["Menaces principales"]
      },
      "competitive_landscape": {
        "main_competitors": ["Top 3 concurrents"],
        "market_gaps": ["Opportunités non adressées"],
        "differentiation": "Points de différenciation"
      },
      "recommendations": ["Actions recommandées"]
    },
    "marketing_agent": {
      "role": "Développer et exécuter la stratégie marketing",
      "target_audience": {
        "primary_persona": "Description courte",
        "key_pain_points": ["Points de douleur à adresser"],
        "preferred_channels": ["Canaux marketing prioritaires"]
      },
      "messaging_framework": {
        "value_proposition": "Message principal",
        "key_benefits": ["3 bénéfices clés"],
        "proof_points": ["Preuves à mettre en avant"]
      },
      "campaign_priorities": ["Campagnes à lancer en priorité"]
    },
    "sales_agent": {
      "role": "Optimiser le processus de vente",
      "sales_strategy": {
        "approach": "Approche de vente recommandée",
        "sales_cycle": "Durée du cycle de vente",
        "average_deal_size": "Taille moyenne des deals",
        "conversion_targets": "Objectifs de conversion"
      },
      "objection_handling": {
        "common_objections": ["Objections fréquentes"],
        "responses": ["Réponses préparées"]
      },
      "sales_enablement": ["Outils et contenus nécessaires"]
    },
    "social_media_agent": {
      "role": "Gérer la présence sur les réseaux sociaux",
      "platform_strategy": {
        "priority_platforms": ["Plateformes prioritaires"],
        "content_themes": ["Thèmes de contenu"],
        "posting_frequency": "Fréquence de publication"
      },
      "engagement_tactics": ["Tactiques d'engagement"],
      "community_building": ["Actions pour construire la communauté"]
    },
    "business_development_agent": {
      "role": "Identifier et développer des opportunités de croissance",
      "growth_opportunities": [
        {
          "opportunity": "Description",
          "potential": "Potentiel de revenus",
          "effort": "Effort requis",
          "timeline": "Timeline"
        }
      ],
      "partnership_targets": ["Partenaires potentiels"],
      "expansion_strategy": "Stratégie d'expansion"
    },
    "continuous_improvement_agent": {
      "role": "Optimiser continuellement les processus",
      "improvement_areas": [
        {
          "area": "Domaine à améliorer",
          "current_state": "État actuel",
          "target_state": "État cible",
          "actions": ["Actions d'amélioration"]
        }
      ],
      "kpi_tracking": ["KPIs à monitorer"],
      "optimization_roadmap": "Feuille de route d'optimisation"
    }
  },
  "cross_functional_initiatives": [
    {
      "initiative": "Nom de l'initiative",
      "description": "Description courte",
      "involved_agents": ["Agents impliqués"],
      "timeline": "Timeline",
      "expected_outcome": "Résultat attendu",
      "success_criteria": ["Critères de succès"]
    }
  ],
  "weekly_action_plan": {
    "week_focus": "Focus de la semaine",
    "top_3_priorities": [
      {
        "priority": "Priorité",
        "owner": "Agent responsable",
        "deadline": "Date limite",
        "dependencies": ["Dépendances"]
      }
    ],
    "meetings_needed": [
      {
        "meeting": "Type de réunion",
        "participants": ["Agents participants"],
        "objective": "Objectif",
        "duration": "Durée estimée"
      }
    ]
  },
  "risk_mitigation": {
    "top_risks": [
      {
        "risk": "Description du risque",
        "probability": "high|medium|low",
        "impact": "high|medium|low",
        "mitigation": "Plan de mitigation",
        "owner": "Agent responsable"
      }
    ]
  },
  "success_metrics": {
    "north_star_metric": {
      "metric": "Métrique principale",
      "current": "Valeur actuelle",
      "target": "Objectif",
      "timeline": "Timeline pour l'atteindre"
    },
    "key_metrics": [
      {
        "metric": "Nom de la métrique",
        "current": "Valeur actuelle",
        "target": "Objectif",
        "responsible_agent": "Agent responsable"
      }
    ]
  },
  "communication_guidelines": {
    "internal": {
      "frequency": "Fréquence de communication",
      "channels": ["Canaux à utiliser"],
      "reporting_structure": "Structure de reporting"
    },
    "external": {
      "brand_voice": "Ton de la marque",
      "key_messages": ["Messages clés"],
      "do_not_mention": ["Sujets à éviter"]
    }
  }
}`;

  try {
    const response = await generateWithMistralAPI(prompt, systemContext);
    
    if (response.success && response.content) {
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const summary = parseAIGeneratedJson(jsonMatch[0]);
          
          // Enrichir avec des insights calculés
          summary.insights = generateAdditionalInsights(input);
          summary.quick_wins = identifyQuickWins(input);
          
          return summary;
        }
      } catch (parseError) {
        console.error("[Agent Résumé] Erreur parsing JSON:", parseError);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Résumé] Erreur:", error);
    return generateFallbackSummary(input);
  }
}

function generateAdditionalInsights(input: AnalysisSummaryInput): any {
  const insights = {
    market_fit: calculateMarketFit(input),
    competitive_advantage: assessCompetitiveAdvantage(input),
    growth_potential: evaluateGrowthPotential(input),
    execution_readiness: measureExecutionReadiness(input)
  };
  
  return insights;
}

function calculateMarketFit(input: AnalysisSummaryInput): string {
  let score = 0;
  
  if (input.marketAnalysis?.market_overview?.growth_rate) {
    const growth = parseInt(input.marketAnalysis.market_overview.growth_rate);
    if (growth > 20) score += 30;
    else if (growth > 10) score += 20;
    else score += 10;
  }
  
  if (input.personas?.personas?.length >= 3) score += 20;
  if (input.collectedData?.customer_insights?.customer_pain_points?.length > 0) score += 25;
  if (input.business?.stage !== "idea") score += 25;
  
  if (score >= 80) return "Excellent - Fort alignement marché";
  if (score >= 60) return "Bon - Alignement prometteur";
  if (score >= 40) return "Moyen - À affiner";
  return "Faible - Nécessite validation";
}

function assessCompetitiveAdvantage(input: AnalysisSummaryInput): string {
  const advantages = [];
  
  if (input.marketAnalysis?.swot_analysis?.strengths?.length > 3) {
    advantages.push("Forces distinctives identifiées");
  }
  
  if (input.collectedData?.business_model?.unique_selling_points?.length > 0) {
    advantages.push("USPs clairs");
  }
  
  if (input.competitorAnalysis?.competitive_advantages?.length > 0) {
    advantages.push("Avantages concurrentiels validés");
  }
  
  return advantages.length >= 2 ? "Fort" : "À développer";
}

function evaluateGrowthPotential(input: AnalysisSummaryInput): string {
  const marketSize = input.marketAnalysis?.market_overview?.market_size;
  const growthRate = input.marketAnalysis?.market_overview?.growth_rate;
  
  if (marketSize?.includes("milliard") && parseInt(growthRate || "0") > 15) {
    return "Très élevé - Marché large et croissant";
  } else if (marketSize?.includes("million") && parseInt(growthRate || "0") > 20) {
    return "Élevé - Niche en forte croissance";
  }
  
  return "Modéré - Croissance stable";
}

function measureExecutionReadiness(input: AnalysisSummaryInput): number {
  let readiness = 0;
  
  if (input.businessPlan) readiness += 25;
  if (input.personas?.personas?.length >= 3) readiness += 20;
  if (input.marketAnalysis) readiness += 20;
  if (input.collectedData?.offerings?.length > 0) readiness += 20;
  if (input.business?.stage !== "idea") readiness += 15;
  
  return readiness;
}

function identifyQuickWins(input: AnalysisSummaryInput): any[] {
  const quickWins = [];
  
  // Quick wins basés sur les données disponibles
  if (!input.socialMediaAnalysis) {
    quickWins.push({
      action: "Lancer présence sur les réseaux sociaux",
      impact: "Visibilité immédiate",
      effort: "2-3 jours",
      owner: "Social Media Agent"
    });
  }
  
  if (input.personas?.personas?.length > 0 && !input.contentStrategy) {
    quickWins.push({
      action: "Créer du contenu ciblé pour le persona principal",
      impact: "Engagement audience",
      effort: "1 semaine",
      owner: "Marketing Agent"
    });
  }
  
  if (input.collectedData?.offerings?.length > 0 && !input.collectedData?.offerings[0]?.cost_breakdown) {
    quickWins.push({
      action: "Calculer les marges exactes",
      impact: "Optimisation pricing",
      effort: "1 jour",
      owner: "Business Development Agent"
    });
  }
  
  return quickWins;
}

function generateFallbackSummary(input: AnalysisSummaryInput): any {
  const { business, collectedData } = input;
  
  return {
    executive_overview: {
      business_snapshot: {
        elevator_pitch: `${business.name} révolutionne ${business.industry} avec une approche innovante`,
        unique_value: "Solution unique qui résout les problèmes majeurs du secteur",
        market_position: "Challenger innovant en phase de croissance",
        growth_stage: business.stage || "early-stage",
        key_challenges: [
          "Établir la notoriété de marque",
          "Valider le product-market fit",
          "Structurer la croissance"
        ],
        key_opportunities: [
          "Marché en forte croissance",
          "Demande non satisfaite identifiée",
          "Possibilité de leadership sur la niche"
        ]
      },
      financial_snapshot: {
        current_status: "Phase d'investissement initial",
        revenue_projection: "€500K année 1, €2M année 3",
        funding_needs: "€500K pour 18 mois",
        key_metrics: {
          mrr: "€0 (pré-lancement)",
          growth_rate: "N/A",
          burn_rate: "€50K/mois estimé",
          runway: "10 mois avec financement"
        }
      },
      strategic_priorities: [
        {
          priority: "Lancer le MVP et acquérir les premiers clients",
          timeline: "Court terme",
          impact: "Validation marché",
          owner: "Ezia + Sales Agent"
        },
        {
          priority: "Structurer la stratégie marketing",
          timeline: "Court terme",
          impact: "Génération de leads",
          owner: "Marketing Agent"
        },
        {
          priority: "Établir les partenariats clés",
          timeline: "Moyen terme",
          impact: "Accélération croissance",
          owner: "Business Development Agent"
        }
      ]
    },
    agent_specific_briefs: {
      ezia_project_manager: {
        role: "Coordonner l'ensemble des agents et la stratégie globale",
        key_insights: [
          "Le business est en phase critique de validation",
          "La coordination inter-agents est essentielle",
          "Focus sur l'exécution rapide et agile",
          "Besoin de métriques de suivi dès le début"
        ],
        immediate_actions: [
          "Organiser un kick-off avec tous les agents",
          "Définir les OKRs du trimestre",
          "Mettre en place le reporting hebdomadaire",
          "Prioriser les actions à fort impact"
        ],
        coordination_points: [
          "Alignement Marketing-Sales sur le messaging",
          "Synchronisation Social Media avec le calendrier content",
          "Business Dev en support sur les partenariats"
        ],
        success_metrics: [
          "Nombre de clients acquis",
          "MRR généré",
          "Satisfaction client (NPS)",
          "Vélocité d'exécution"
        ]
      },
      market_analysis_agent: {
        role: "Analyser et surveiller le marché",
        market_summary: {
          size: "€2.5 milliards (estimation)",
          growth: "15-20% par an",
          trends: [
            "Digitalisation accélérée",
            "Recherche de solutions agiles",
            "Focus sur le ROI"
          ],
          threats: [
            "Entrée de grands acteurs",
            "Évolution réglementaire",
            "Saturation potentielle"
          ]
        },
        competitive_landscape: {
          main_competitors: ["Concurrent A", "Concurrent B", "Concurrent C"],
          market_gaps: [
            "Solutions vraiment adaptées aux PME",
            "Onboarding simplifié",
            "Prix transparent et accessible"
          ],
          differentiation: "Approche unique centrée utilisateur"
        },
        recommendations: [
          "Veille concurrentielle hebdomadaire",
          "Analyse des nouveaux entrants",
          "Étude des cas de réussite/échec",
          "Identification des niches sous-exploitées"
        ]
      },
      marketing_agent: {
        role: "Développer et exécuter la stratégie marketing",
        target_audience: {
          primary_persona: "Décideur PME innovante, 35-45 ans",
          key_pain_points: [
            "Manque de temps",
            "Complexité des solutions existantes",
            "Budget limité"
          ],
          preferred_channels: ["LinkedIn", "Email", "Webinaires"]
        },
        messaging_framework: {
          value_proposition: "La solution simple qui fait gagner du temps",
          key_benefits: [
            "ROI en moins de 3 mois",
            "Mise en place en 1 jour",
            "Support dédié inclus"
          ],
          proof_points: [
            "Technologie éprouvée",
            "Équipe experte",
            "Premiers clients satisfaits"
          ]
        },
        campaign_priorities: [
          "Campagne de lancement produit",
          "Content marketing SEO",
          "Nurturing email automatisé",
          "Programme de référencement"
        ]
      },
      sales_agent: {
        role: "Optimiser le processus de vente",
        sales_strategy: {
          approach: "Consultative selling",
          sales_cycle: "30-45 jours",
          average_deal_size: "€5,000-15,000/an",
          conversion_targets: "20% lead to customer"
        },
        objection_handling: {
          common_objections: [
            "Prix trop élevé",
            "Pas le bon moment",
            "Solution actuelle suffisante"
          ],
          responses: [
            "ROI démontré en 3 mois",
            "Accompagnement au changement inclus",
            "Comparatif détaillé des bénéfices"
          ]
        },
        sales_enablement: [
          "Deck de vente professionnel",
          "Démo interactive",
          "Calculateur de ROI",
          "Case studies clients"
        ]
      },
      social_media_agent: {
        role: "Gérer la présence sur les réseaux sociaux",
        platform_strategy: {
          priority_platforms: ["LinkedIn", "Twitter", "YouTube"],
          content_themes: [
            "Expertise sectorielle",
            "Success stories",
            "Conseils pratiques"
          ],
          posting_frequency: "1/jour LinkedIn, 3/jour Twitter"
        },
        engagement_tactics: [
          "Réponse sous 2h",
          "Contenu interactif (polls, Q&A)",
          "User-generated content",
          "Collaborations influenceurs"
        ],
        community_building: [
          "Groupe LinkedIn privé",
          "Webinaires mensuels",
          "Programme ambassadeurs"
        ]
      },
      business_development_agent: {
        role: "Identifier et développer des opportunités de croissance",
        growth_opportunities: [
          {
            opportunity: "Expansion géographique",
            potential: "€2M ARR additionnel",
            effort: "Moyen",
            timeline: "12-18 mois"
          },
          {
            opportunity: "Nouveaux segments",
            potential: "€1M ARR",
            effort: "Élevé",
            timeline: "6-12 mois"
          },
          {
            opportunity: "Upsell/Cross-sell",
            potential: "30% revenue increase",
            effort: "Faible",
            timeline: "3-6 mois"
          }
        ],
        partnership_targets: [
          "Intégrateurs sectoriels",
          "Consultants indépendants",
          "Plateformes complémentaires"
        ],
        expansion_strategy: "Land and expand avec focus sur la rétention"
      },
      continuous_improvement_agent: {
        role: "Optimiser continuellement les processus",
        improvement_areas: [
          {
            area: "Onboarding client",
            current_state: "Manuel, 2 jours",
            target_state: "Automatisé, 2 heures",
            actions: [
              "Documenter le processus",
              "Identifier les automatisations",
              "Implémenter par phases"
            ]
          },
          {
            area: "Reporting interne",
            current_state: "Ad hoc",
            target_state: "Dashboard temps réel",
            actions: [
              "Définir les KPIs",
              "Choisir les outils",
              "Former l'équipe"
            ]
          }
        ],
        kpi_tracking: [
          "Time to value client",
          "Coût d'acquisition",
          "Taux de rétention",
          "Productivité équipe"
        ],
        optimization_roadmap: "Quick wins Q1, Processus clés Q2, Scale Q3-Q4"
      }
    },
    cross_functional_initiatives: [
      {
        initiative: "Launch Excellence Program",
        description: "Programme coordonné pour un lancement réussi",
        involved_agents: ["Tous"],
        timeline: "3 mois",
        expected_outcome: "50 premiers clients acquis",
        success_criteria: [
          "MRR €50K atteint",
          "NPS > 50",
          "Processus documentés"
        ]
      },
      {
        initiative: "Customer Success Factory",
        description: "Construire une machine à satisfaction client",
        involved_agents: ["Sales", "Marketing", "Continuous Improvement"],
        timeline: "6 mois",
        expected_outcome: "95% rétention, 30% upsell",
        success_criteria: [
          "Churn < 5%",
          "CSAT > 4.5/5",
          "Expansion revenue 30%"
        ]
      }
    ],
    weekly_action_plan: {
      week_focus: "Préparation au lancement",
      top_3_priorities: [
        {
          priority: "Finaliser le MVP",
          owner: "Ezia",
          deadline: "Vendredi",
          dependencies: ["Feedback beta testeurs"]
        },
        {
          priority: "Lancer la campagne teasing",
          owner: "Marketing Agent",
          deadline: "Mercredi",
          dependencies: ["Assets créatifs validés"]
        },
        {
          priority: "Préparer l'équipe commerciale",
          owner: "Sales Agent",
          deadline: "Jeudi",
          dependencies: ["Deck de vente finalisé"]
        }
      ],
      meetings_needed: [
        {
          meeting: "Stand-up quotidien",
          participants: ["Tous les agents"],
          objective: "Synchronisation et blocages",
          duration: "15 minutes"
        },
        {
          meeting: "Review produit",
          participants: ["Ezia", "Marketing", "Sales"],
          objective: "Valider les features prioritaires",
          duration: "1 heure"
        }
      ]
    },
    risk_mitigation: {
      top_risks: [
        {
          risk: "Retard dans le développement produit",
          probability: "medium",
          impact: "high",
          mitigation: "Sprint planning serré, resources additionnelles en backup",
          owner: "Ezia"
        },
        {
          risk: "Faible adoption initiale",
          probability: "medium",
          impact: "medium",
          mitigation: "Programme early adopter avec incentives",
          owner: "Marketing Agent"
        },
        {
          risk: "Burn rate trop élevé",
          probability: "low",
          impact: "high",
          mitigation: "Monitoring hebdo, plan B défini",
          owner: "Business Development Agent"
        }
      ]
    },
    success_metrics: {
      north_star_metric: {
        metric: "Monthly Recurring Revenue (MRR)",
        current: "€0",
        target: "€50K",
        timeline: "3 mois"
      },
      key_metrics: [
        {
          metric: "Nombre de clients actifs",
          current: "0",
          target: "50",
          responsible_agent: "Sales Agent"
        },
        {
          metric: "Coût d'acquisition client (CAC)",
          current: "N/A",
          target: "< €1000",
          responsible_agent: "Marketing Agent"
        },
        {
          metric: "Net Promoter Score (NPS)",
          current: "N/A",
          target: "> 50",
          responsible_agent: "Continuous Improvement Agent"
        },
        {
          metric: "Taux de conversion visiteur-lead",
          current: "N/A",
          target: "3%",
          responsible_agent: "Marketing Agent"
        }
      ]
    },
    communication_guidelines: {
      internal: {
        frequency: "Daily stand-ups, Weekly reviews",
        channels: ["Slack pour le quotidien", "Email pour les décisions", "Notion pour la doc"],
        reporting_structure: "Agents → Ezia → Stakeholders"
      },
      external: {
        brand_voice: "Expert mais accessible, enthousiaste mais professionnel",
        key_messages: [
          "Innovation au service de la simplicité",
          "ROI prouvé et rapide",
          "Accompagnement de A à Z"
        ],
        do_not_mention: [
          "Détails techniques complexes",
          "Comparaisons négatives avec concurrents",
          "Promesses non tenues"
        ]
      }
    },
    insights: generateAdditionalInsights(input),
    quick_wins: identifyQuickWins(input)
  };
}

export async function generateAgentBriefings(summary: any, business: any): Promise<Map<string, string>> {
  const briefings = new Map<string, string>();
  
  // Briefing pour chaque agent
  for (const [agentKey, agentBrief] of Object.entries(summary.agent_specific_briefs)) {
    const agentName = agentKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const brief = agentBrief as any;
    
    let briefingText = `# Briefing ${agentName} - ${business.name}\n\n`;
    briefingText += `## Votre Rôle\n${brief.role}\n\n`;
    
    // Ajouter les sections spécifiques à chaque agent
    if (brief.key_insights) {
      briefingText += `## Insights Clés\n${brief.key_insights.map((i: string) => `- ${i}`).join('\n')}\n\n`;
    }
    
    if (brief.immediate_actions) {
      briefingText += `## Actions Immédiates\n${brief.immediate_actions.map((a: string) => `- ${a}`).join('\n')}\n\n`;
    }
    
    if (brief.recommendations) {
      briefingText += `## Recommandations\n${brief.recommendations.map((r: string) => `- ${r}`).join('\n')}\n\n`;
    }
    
    // Ajouter les initiatives cross-fonctionnelles pertinentes
    const relevantInitiatives = summary.cross_functional_initiatives.filter((i: any) => 
      i.involved_agents.includes(agentName) || i.involved_agents.includes("Tous")
    );
    
    if (relevantInitiatives.length > 0) {
      briefingText += `## Initiatives Transversales\n`;
      relevantInitiatives.forEach((init: any) => {
        briefingText += `### ${init.initiative}\n`;
        briefingText += `- Timeline: ${init.timeline}\n`;
        briefingText += `- Résultat attendu: ${init.expected_outcome}\n\n`;
      });
    }
    
    briefings.set(agentKey, briefingText);
  }
  
  return briefings;
}