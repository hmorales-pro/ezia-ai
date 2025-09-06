// Helper functions pour générer des analyses spécifiques par industrie

export function generatePestelForIndustry(industry: string) {
  const industryLower = industry.toLowerCase();
  
  // Restauration
  if (industryLower.includes('restaura') || industryLower.includes('food')) {
    return {
      political: {
        factors: [
          "Réglementation sanitaire stricte et contrôles fréquents",
          "Politiques de soutien au secteur post-COVID",
          "Tensions sur les licences et autorisations",
          "Évolution du droit du travail restauration"
        ],
        impact: "Environnement réglementaire complexe mais stable",
        risk_level: "medium"
      },
      economic: {
        factors: [
          "Inflation sur les matières premières alimentaires",
          "Évolution du pouvoir d'achat par segment",
          "Coûts immobiliers en hausse dans les zones prime",
          "Pénurie et coût de la main d'œuvre qualifiée"
        ],
        impact: "Pression sur les marges nécessitant optimisation",
        risk_level: "high"
      },
      social: {
        factors: [
          "Recherche d'expériences uniques et authentiques",
          "Montée des préoccupations santé et durabilité",
          "Impact des réseaux sociaux sur les choix",
          "Évolution des habitudes post-pandémie"
        ],
        impact: "Opportunités pour concepts innovants et responsables",
        risk_level: "low"
      },
      technological: {
        factors: [
          "Digitalisation complète du parcours client",
          "Solutions de gestion et analytics avancées",
          "Innovations en cuisine et conservation",
          "Automatisation de certains processus"
        ],
        impact: "La tech comme levier de performance et différenciation",
        risk_level: "low"
      },
      environmental: {
        factors: [
          "Exigences croissantes de durabilité",
          "Gestion obligatoire des déchets alimentaires",
          "Sourcing local et circuits courts valorisés",
          "Bilan carbone scruté par les consommateurs"
        ],
        impact: "Contraintes devenant avantages concurrentiels",
        risk_level: "medium"
      },
      legal: {
        factors: [
          "Complexité du droit du travail spécifique",
          "Normes d'hygiène et sécurité strictes",
          "Protection des données clients (RGPD)",
          "Responsabilité en cas d'intoxication"
        ],
        impact: "Risques juridiques élevés nécessitant vigilance",
        risk_level: "high"
      }
    };
  }
  
  // Tech / Digital
  if (industryLower.includes('tech') || industryLower.includes('digital') || industryLower.includes('logiciel')) {
    return {
      political: {
        factors: [
          "Régulation croissante du numérique (DSA, DMA)",
          "Souveraineté numérique et localisation données",
          "Politiques de soutien à l'innovation (CIR, JEI)",
          "Tensions géopolitiques sur les technologies"
        ],
        impact: "Cadre réglementaire en évolution rapide",
        risk_level: "medium"
      },
      economic: {
        factors: [
          "Accès au financement (VC, dette) fluctuant",
          "Guerre des talents et inflation salariale",
          "Pression sur la rentabilité vs croissance",
          "Consolidation du marché en cours"
        ],
        impact: "Environnement exigeant une gestion rigoureuse",
        risk_level: "high"
      },
      social: {
        factors: [
          "Adoption massive des outils digitaux",
          "Préoccupations privacy et éthique IA",
          "Besoin de personnalisation extrême",
          "Digital natives devenant décideurs"
        ],
        impact: "Marché mature avec clients exigeants",
        risk_level: "low"
      },
      technological: {
        factors: [
          "IA générative révolutionnant les usages",
          "Cloud et edge computing démocratisés",
          "Cybersécurité critique et coûteuse",
          "Obsolescence technologique rapide"
        ],
        impact: "Innovation constante obligatoire",
        risk_level: "medium"
      },
      environmental: {
        factors: [
          "Pression sur l'empreinte carbone du numérique",
          "Green IT et éco-conception exigés",
          "Consommation énergétique data centers",
          "Recyclage et durabilité hardware"
        ],
        impact: "RSE devenant facteur de choix",
        risk_level: "low"
      },
      legal: {
        factors: [
          "RGPD et réglementations données strictes",
          "Propriété intellectuelle complexe",
          "Contrats SaaS et responsabilités",
          "Conformité multi-juridictionnelle"
        ],
        impact: "Compliance coûteuse mais différenciante",
        risk_level: "high"
      }
    };
  }
  
  // E-commerce
  if (industryLower.includes('commerce') || industryLower.includes('retail') || industryLower.includes('vente')) {
    return {
      political: {
        factors: [
          "Régulation e-commerce et marketplaces",
          "Fiscalité du digital en évolution",
          "Protection consommateurs renforcée",
          "Normes import/export complexes"
        ],
        impact: "Cadre légal protecteur mais contraignant",
        risk_level: "medium"
      },
      economic: {
        factors: [
          "Inflation et pression sur pouvoir d'achat",
          "Coûts logistiques en forte hausse",
          "Taux de change et approvisionnement",
          "Investissements tech nécessaires"
        ],
        impact: "Marges sous pression constante",
        risk_level: "high"
      },
      social: {
        factors: [
          "Omnicanalité devenue la norme",
          "Exigence de livraison rapide et gratuite",
          "Sensibilité prix et comparaison facile",
          "Montée du commerce responsable"
        ],
        impact: "Client roi exigeant excellence opérationnelle",
        risk_level: "medium"
      },
      technological: {
        factors: [
          "IA pour personnalisation et prédiction",
          "Automatisation logistique avancée",
          "Réalité augmentée pour l'expérience",
          "Paiements innovants (BNPL, crypto)"
        ],
        impact: "Tech comme facteur clé de succès",
        risk_level: "low"
      },
      environmental: {
        factors: [
          "Pression sur packaging et livraisons",
          "Économie circulaire et seconde main",
          "Bilan carbone du e-commerce scruté",
          "Retours produits problématiques"
        ],
        impact: "Durabilité devient avantage concurrentiel",
        risk_level: "medium"
      },
      legal: {
        factors: [
          "Droit de rétractation et garanties",
          "RGPD et cookies complexes",
          "Contrefaçon et propriété intellectuelle",
          "Responsabilité plateformes vs vendeurs"
        ],
        impact: "Risques juridiques multiples à maîtriser",
        risk_level: "high"
      }
    };
  }
  
  // Santé / Healthcare
  if (industryLower.includes('santé') || industryLower.includes('health') || industryLower.includes('medical')) {
    return {
      political: {
        factors: [
          "Régulation stricte des dispositifs médicaux",
          "Politiques de santé publique évolutives",
          "Remboursements et nomenclatures",
          "Souveraineté sanitaire post-COVID"
        ],
        impact: "Environnement hyper-régulé mais opportunités",
        risk_level: "high"
      },
      economic: {
        factors: [
          "Contraintes budgétaires système de santé",
          "Investissements R&D considérables",
          "Consolidation des acteurs en cours",
          "Financement innovation santé dynamique"
        ],
        impact: "Modèles économiques sous tension",
        risk_level: "medium"
      },
      social: {
        factors: [
          "Vieillissement population et chronicité",
          "Patients acteurs de leur santé",
          "Inégalités d'accès aux soins",
          "Prévention et bien-être prioritaires"
        ],
        impact: "Demande croissante pour solutions innovantes",
        risk_level: "low"
      },
      technological: {
        factors: [
          "IA et diagnostic assisté",
          "Télémédecine généralisée",
          "Données de santé et interopérabilité",
          "Thérapies géniques et personnalisées"
        ],
        impact: "Révolution technologique en cours",
        risk_level: "low"
      },
      environmental: {
        factors: [
          "Impact environnemental des soins",
          "Gestion déchets médicaux",
          "Pharmacorésistance et pollution",
          "Santé environnementale émergente"
        ],
        impact: "Nouveaux enjeux santé-environnement",
        risk_level: "low"
      },
      legal: {
        factors: [
          "Responsabilité médicale complexe",
          "Protection données de santé (HDS)",
          "Essais cliniques et éthique",
          "Brevets et propriété intellectuelle"
        ],
        impact: "Cadre juridique protecteur mais lourd",
        risk_level: "high"
      }
    };
  }
  
  // Default générique
  return {
    political: {
      factors: [
        "Évolution réglementaire du secteur",
        "Politiques publiques de soutien",
        "Stabilité politique et institutionnelle",
        "Relations internationales et commerce"
      ],
      impact: "Environnement politique relativement stable",
      risk_level: "medium"
    },
    economic: {
      factors: [
        "Croissance économique et inflation",
        "Accès au financement et taux",
        "Coût des ressources et main d'œuvre",
        "Pouvoir d'achat des clients cibles"
      ],
      impact: "Contexte économique exigeant vigilance",
      risk_level: "medium"
    },
    social: {
      factors: [
        "Évolution démographique et sociétale",
        "Changements comportements consommateurs",
        "Attentes RSE et impact social",
        "Tendances culturelles émergentes"
      ],
      impact: "Opportunités dans l'adaptation aux évolutions",
      risk_level: "low"
    },
    technological: {
      factors: [
        "Digitalisation accélérée du secteur",
        "Innovations disruptives émergentes",
        "Cybersécurité et protection données",
        "Automatisation et intelligence artificielle"
      ],
      impact: "Transformation digitale incontournable",
      risk_level: "medium"
    },
    environmental: {
      factors: [
        "Réglementation environnementale",
        "Attentes de durabilité croissantes",
        "Risques climatiques sur l'activité",
        "Économie circulaire et ressources"
      ],
      impact: "Transition écologique source d'innovation",
      risk_level: "medium"
    },
    legal: {
      factors: [
        "Conformité réglementaire complexe",
        "Protection propriété intellectuelle",
        "Droit du travail et social",
        "Responsabilités et litiges potentiels"
      ],
      impact: "Cadre juridique nécessitant expertise",
      risk_level: "medium"
    }
  };
}

export function generatePorterForIndustry(industry: string) {
  const industryLower = industry.toLowerCase();
  
  // Restauration
  if (industryLower.includes('restaura') || industryLower.includes('food')) {
    return {
      threat_of_new_entrants: {
        level: "medium",
        factors: [
          "Investissement initial élevé (300K€+ à Paris)",
          "Difficultés d'accès aux bons emplacements",
          "Nécessité d'une réputation établie",
          "Complexité réglementaire (licences, normes)"
        ],
        barriers: [
          "Capital financier conséquent",
          "Expertise culinaire reconnue",
          "Réseau fournisseurs premium",
          "Conformité sanitaire stricte"
        ]
      },
      bargaining_power_of_suppliers: {
        level: "high",
        factors: [
          "Concentration fournisseurs produits premium",
          "Dépendance saisonnalité et disponibilité",
          "Exclusivités difficiles à négocier",
          "Qualité non négociable sur le haut de gamme"
        ],
        key_suppliers: [
          "Producteurs AOP/Bio exclusifs",
          "Grossistes spécialisés premium",
          "Viticulteurs et cavistes réputés",
          "Équipementiers cuisine professionnelle"
        ]
      },
      bargaining_power_of_buyers: {
        level: "medium",
        factors: [
          "Clients informés et exigeants",
          "Comparaison facile via apps/sites",
          "Sensibilité aux avis en ligne",
          "Fidélité difficile à construire"
        ],
        buyer_concentration: "Clientèle fragmentée mais influenceurs puissants"
      },
      threat_of_substitutes: {
        level: "medium",
        factors: [
          "Livraison premium en croissance",
          "Dark kitchens et concepts virtuels",
          "Meal kits et cours de cuisine",
          "Autres loisirs et expériences"
        ],
        substitutes: [
          "Delivery haut de gamme",
          "Chefs à domicile",
          "Épiceries fines et traiteurs",
          "Bars à vins et tapas"
        ]
      },
      competitive_rivalry: {
        level: "high",
        factors: [
          "Saturation en zones prime",
          "Guerre des talents (chefs, sommeliers)",
          "Course à l'innovation constante",
          "Pression sur les marges"
        ],
        main_competitors: [
          "Restaurants étoilés établis",
          "Bistronomie moderne",
          "Chaînes premium en expansion",
          "Concepts innovants émergents"
        ]
      }
    };
  }
  
  // Tech / Digital
  if (industryLower.includes('tech') || industryLower.includes('digital') || industryLower.includes('logiciel')) {
    return {
      threat_of_new_entrants: {
        level: "high",
        factors: [
          "Barrières techniques relativement faibles",
          "Accès au financement facilité",
          "Talents tech mobiles et disponibles",
          "Cloud réduisant coûts infrastructure"
        ],
        barriers: [
          "Acquisition clients coûteuse",
          "Construction de la confiance",
          "Conformité et certifications",
          "Effet réseau à créer"
        ]
      },
      bargaining_power_of_suppliers: {
        level: "low",
        factors: [
          "Multiple fournisseurs cloud",
          "Open source largement disponible",
          "APIs et services standardisés",
          "Concurrence entre prestataires"
        ],
        key_suppliers: [
          "Fournisseurs cloud (AWS, Azure, GCP)",
          "Services tiers (paiement, auth)",
          "Agences et freelances tech",
          "Éditeurs de solutions métier"
        ]
      },
      bargaining_power_of_buyers: {
        level: "high",
        factors: [
          "Coût de switch faible",
          "Transparence totale des prix",
          "Essais gratuits généralisés",
          "Alternatives nombreuses"
        ],
        buyer_concentration: "Marché fragmenté avec quelques grands comptes clés"
      },
      threat_of_substitutes: {
        level: "medium",
        factors: [
          "Solutions internes/DIY",
          "Alternatives open source",
          "Modèles low-code/no-code",
          "Consultants et agences"
        ],
        substitutes: [
          "Développement interne",
          "Solutions open source",
          "Plateformes no-code",
          "Services managés"
        ]
      },
      competitive_rivalry: {
        level: "high",
        factors: [
          "Innovation rapide nécessaire",
          "Guerre des prix sur certains segments",
          "Consolidation en cours",
          "Winner-takes-all dynamics"
        ],
        main_competitors: [
          "Leaders établis du marché",
          "Scale-ups bien financées",
          "GAFA entrant sur le segment",
          "Startups disruptives"
        ]
      }
    };
  }
  
  // Default générique
  return {
    threat_of_new_entrants: {
      level: "medium",
      factors: [
        "Investissements initiaux variables",
        "Accès aux canaux de distribution",
        "Économies d'échelle nécessaires",
        "Réglementation sectorielle"
      ],
      barriers: [
        "Capital requis",
        "Expertise métier",
        "Réseau et réputation",
        "Conformité réglementaire"
      ]
    },
    bargaining_power_of_suppliers: {
      level: "medium",
      factors: [
        "Concentration des fournisseurs",
        "Coûts de changement",
        "Importance des volumes",
        "Différenciation des inputs"
      ],
      key_suppliers: [
        "Fournisseurs matières premières",
        "Prestataires de services",
        "Équipementiers",
        "Partenaires technologiques"
      ]
    },
    bargaining_power_of_buyers: {
      level: "medium",
      factors: [
        "Sensibilité prix",
        "Coût de changement",
        "Information disponible",
        "Concentration acheteurs"
      ],
      buyer_concentration: "Marché diversifié"
    },
    threat_of_substitutes: {
      level: "medium",
      factors: [
        "Solutions alternatives",
        "Rapport qualité/prix",
        "Coût de changement",
        "Propension à substituer"
      ],
      substitutes: [
        "Produits alternatifs",
        "Services substituables",
        "Solutions DIY",
        "Non-consommation"
      ]
    },
    competitive_rivalry: {
      level: "medium",
      factors: [
        "Nombre de concurrents",
        "Croissance du marché",
        "Différenciation possible",
        "Barrières à la sortie"
      ],
      main_competitors: [
        "Leaders du marché",
        "Challengers agressifs",
        "Spécialistes de niche",
        "Nouveaux entrants"
      ]
    }
  };
}