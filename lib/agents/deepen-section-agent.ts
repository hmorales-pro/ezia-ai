import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateWithMistralSearch } from '@/lib/mistral-search-service';
import { generateAIResponse } from '@/lib/ai-service';

interface DeepenSectionParams {
  business: {
    name: string;
    industry: string;
    description: string;
  };
  section: string;
  analysisType: string;
  existingAnalysis: any;
  existingSection: any;
}

export async function runDeepenSectionAgent(params: DeepenSectionParams): Promise<any> {
  const { business, section, analysisType, existingAnalysis, existingSection } = params;
  
  console.log(`[Agent Approfondissement] ${section} pour ${analysisType} - ${business.name}`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Get the appropriate prompt based on section and analysis type
  const { systemContext, prompt, exampleJson } = getSectionPrompt({
    business,
    section,
    analysisType,
    existingSection
  });
  
  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Approfondissement] Utilisation de Mistral AI avec recherche web');
      
      // Try with web search first for current data
      const searchQuery = getSearchQuery({ business, section, analysisType });
      const searchResponse = await generateWithMistralSearch(searchQuery, systemContext);
      
      if (searchResponse.success && searchResponse.content) {
        try {
          JSON.parse(searchResponse.content);
          response = searchResponse;
          console.log('[Agent Approfondissement] Données web intégrées avec succès');
        } catch (e) {
          // Fallback to standard API if not valid JSON
          console.log('[Agent Approfondissement] Fallback vers API standard');
          response = await generateWithMistralAPI(prompt, systemContext);
        }
      } else {
        response = await generateWithMistralAPI(prompt, systemContext);
      }
    } else {
      console.log('[Agent Approfondissement] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3500,
        temperature: 0.3
      });
    }
    
    if (response.success && response.content) {
      const deepenedSection = JSON.parse(response.content);
      console.log('[Agent Approfondissement] Section approfondie avec succès');
      return deepenedSection;
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error('[Agent Approfondissement] Erreur:', error);
    throw error;
  }
}

function getSectionPrompt({ business, section, analysisType, existingSection }: any) {
  let systemContext = '';
  let prompt = '';
  let exampleJson = {};
  
  // Market Analysis Sections
  if (analysisType === 'market') {
    switch (section) {
      case 'target_audience':
        systemContext = `Tu es un expert en segmentation client et analyse comportementale avec 20 ans d'expérience dans le secteur ${business.industry}.`;
        exampleJson = {
          primary: {
            description: "Cadres urbains passionnés de gastronomie (35-55 ans)",
            size: "150 000 personnes en Île-de-France",
            characteristics: [
              "Revenus > 80K€/an",
              "Fréquentent régulièrement des restaurants étoilés",
              "Early adopters d'expériences culinaires innovantes",
              "Très actifs sur Instagram et réseaux sociaux gastronomiques",
              "Recherchent l'exclusivité et le storytelling",
              "Sensibles à la provenance des produits",
              "Prêts à payer un premium pour des expériences uniques"
            ],
            pain_points: [
              "Lassitude des restaurants traditionnels même étoilés",
              "Difficulté à impressionner leur cercle social sophistiqué",
              "Manque de nouvelles expériences gastronomiques excitantes",
              "Recherche constante de nouveauté et d'exclusivité",
              "Frustration face aux réservations impossibles dans les lieux tendances"
            ],
            motivations: [
              "Vivre des expériences uniques et mémorables",
              "Découvrir de nouveaux talents culinaires",
              "Être parmi les premiers à tester un concept",
              "Partager des moments exclusifs sur les réseaux sociaux"
            ],
            buying_behavior: {
              decision_process: "Recherche active d'avis d'influenceurs et bouche-à-oreille",
              booking_behavior: "Réservation 2-3 mois à l'avance pour les expériences premium",
              price_sensitivity: "Faible - privilégient la qualité et l'unicité",
              loyalty_factors: "Innovation constante et niveau d'exclusivité maintenu"
            }
          },
          secondary: {
            description: "Touristes internationaux premium et entreprises pour événements",
            size: "500 000 visiteurs haut de gamme/an + 2000 entreprises premium",
            characteristics: [
              "Touristes d'affaires séjournant dans hôtels 5 étoiles",
              "Visiteurs recherchant des expériences authentiquement parisiennes",
              "Entreprises du CAC40 pour événements corporate exclusifs",
              "Conciergeries d'hôtels de luxe prescriptrices",
              "Agences événementielles haut de gamme"
            ],
            specific_needs: [
              "Flexibilité pour privatisations",
              "Service en plusieurs langues",
              "Expériences personnalisables",
              "Documentation premium pour clients"
            ]
          },
          personas: [
            {
              name: "Sophie, 42 ans",
              profile: "Directrice Marketing dans le luxe",
              behavior: "Organise des dîners clients exclusifs, recherche constamment des lieux uniques",
              quote: "Je cherche des expériences que mes clients n'ont jamais vécues ailleurs"
            },
            {
              name: "James, 55 ans",
              profile: "CEO fintech internationale",
              behavior: "Visite Paris 6 fois/an, amateur de gastronomie mondiale",
              quote: "Paris doit me surprendre à chaque visite, sinon je vais à Londres"
            }
          ]
        };
        prompt = `Approfondis l'analyse du public cible pour ${business.name} dans le secteur ${business.industry}.

Description: ${business.description}

Analyse existante à approfondir:
${JSON.stringify(existingSection, null, 2)}

IMPORTANT:
- Fournis une analyse TRÈS DÉTAILLÉE et SEGMENTÉE du public cible
- Inclus des personas détaillés avec comportements spécifiques
- Ajoute des insights psychographiques profonds
- Détaille le parcours d'achat et les motivations
- Quantifie précisément chaque segment
- Ajoute des données comportementales réelles

Structure JSON à suivre:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
        
      case 'pestel_analysis':
        systemContext = `Tu es un consultant senior en stratégie spécialisé dans l'analyse macro-environnementale du secteur ${business.industry}.`;
        exampleJson = {
          political: {
            factors: [
              "Nouvelle réglementation sur les dark kitchens entrée en vigueur en 2024",
              "Renforcement des contrôles sanitaires post-COVID avec audits surprises mensuels",
              "Politique de soutien à la gastronomie française (plan France Tourisme 2030)",
              "Tensions sur l'obtention de licences temporaires pour événements",
              "Lobbying actif du secteur pour assouplir les horaires d'ouverture"
            ],
            impact: "Les réglementations créent des barrières mais favorisent la qualité. Le soutien gouvernemental au tourisme gastronomique est une opportunité majeure.",
            risk_level: "medium",
            opportunities: [
              "Labellisation possible 'Expérience Gastronomique d'Excellence'",
              "Subventions pour innovation culinaire durable"
            ],
            threats: [
              "Durcissement possible des normes pour établissements éphémères",
              "Complexité administrative pour chefs internationaux"
            ]
          },
          economic: {
            factors: [
              "Inflation alimentaire +15% sur produits premium (foie gras, truffe, caviar)",
              "Croissance du pouvoir d'achat segment luxe +8% malgré inflation",
              "Loyers commerciaux Paris gastronomie: 150-300€/m²/mois zones premium",
              "Pénurie main d'œuvre qualifiée: +20% coûts salariaux en 2 ans",
              "Euro fort favorise tourisme américain/asiatique haut de gamme"
            ],
            impact: "Contexte économique mixte: coûts en hausse mais clientèle cible résiliente. L'euro fort attire les touristes fortunés.",
            risk_level: "high",
            key_metrics: {
              food_cost_evolution: "+15% annuel sur premium",
              labor_cost_ratio: "38-42% du CA (vs 35% en 2019)",
              average_ticket_premium: "250-400€ stable malgré inflation"
            }
          },
          social: {
            factors: [
              "Génération Z influence les millennials vers expériences 'Instagrammables'",
              "Montée du 'foodie tourism': +40% voyages gastronomiques post-COVID",
              "Sensibilité accrue à la durabilité: 78% veulent connaître l'origine",
              "Culture FOMO amplifie l'attrait pour concepts éphémères",
              "Retour du prestige social lié aux expériences exclusives"
            ],
            impact: "Alignement parfait entre tendances sociales et concept éphémère exclusif",
            risk_level: "low",
            consumer_insights: {
              sustainability_importance: "78% des CSP++ l'exigent",
              social_sharing_rate: "92% partagent expériences premium",
              booking_advance: "2.5 mois en moyenne pour exclusif"
            }
          },
          technological: {
            factors: [
              "IA générative transforme création de menus personnalisés",
              "Réservations 95% digitales, 60% via mobile",
              "NFTs et blockchain pour certificats d'authenticité/exclusivité",
              "Réalité augmentée enrichit storytelling des plats",
              "Automatisation cuisine permet focus sur créativité"
            ],
            impact: "La technologie amplifie l'exclusivité et personnalisation tout en optimisant les opérations",
            risk_level: "low",
            adoption_rates: {
              digital_booking: "95% (100% cible premium)",
              ar_experiences: "35% intéressés, 15% prêts à payer plus",
              blockchain_certificates: "25% valorisent, croissance rapide"
            }
          },
          environmental: {
            factors: [
              "Obligation tri 7 flux et compostage pour tous restaurants",
              "Pression pour circuits courts: 50km max valorisé",
              "Interdiction plastiques usage unique totale en 2025",
              "Bilan carbone scruté: -30% émissions exigé d'ici 2030",
              "Saisonnalité stricte devient argument marketing"
            ],
            impact: "Contraintes environnementales deviennent avantages marketing si bien gérées",
            risk_level: "medium",
            compliance_requirements: {
              waste_sorting: "7 flux obligatoires + compost",
              local_sourcing: "Minimum 60% produits <150km",
              carbon_reporting: "Obligatoire si CA >500k€"
            }
          },
          legal: {
            factors: [
              "Droit travail complexifié: CDD usage limité, CDI intermittents privilégiés",
              "RGPD renforcé pour données clients VIP (amendes jusqu'à 4% CA)",
              "Licences IV limitées: 1 pour 450 habitants Paris",
              "Responsabilité allergènes étendue avec traçabilité totale",
              "Protection propriété intellectuelle recettes complexe"
            ],
            impact: "Cadre légal strict nécessite expertise juridique pointue mais protège la qualité",
            risk_level: "high",
            key_regulations: {
              labor_flexibility: "CDI intermittents solution optimale",
              data_protection: "Consentement explicite + durée conservation",
              licensing: "Anticipation 6 mois pour licence temporaire"
            }
          }
        };
        prompt = `Réalise une analyse PESTEL APPROFONDIE pour ${business.name} dans le secteur ${business.industry}.

Description: ${business.description}

IMPORTANT:
- Fournis des facteurs TRÈS SPÉCIFIQUES et ACTUELS (2024)
- Inclus des DONNÉES CHIFFRÉES et VÉRIFIABLES
- Ajoute opportunities et threats pour chaque dimension
- Quantifie les impacts avec des métriques précises
- Donne des recommandations actionnables

Structure JSON exacte:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
        
      case 'swot_analysis':
        systemContext = `Tu es un expert en analyse stratégique avec 20 ans d'expérience dans le secteur ${business.industry}.`;
        exampleJson = {
          strengths: [
            "Concept unique de restaurant éphémère avec rotation mensuelle de chefs étoilés",
            "Flexibilité totale permettant adaptation instantanée aux tendances",
            "Création naturelle de rareté et urgence (FOMO marketing intégré)",
            "Pas de lassitude client grâce au renouvellement constant",
            "Buzz médiatique garanti à chaque nouveau chef (PR value: 100k€/mois)",
            "Structure de coûts variables réduit risque financier",
            "Attractivité unique pour chefs: liberté créative totale 1 mois",
            "Data insights riches: nouveau concept = nouvelles données client"
          ],
          weaknesses: [
            "Coûts logistiques du changement mensuel (+25% vs restaurant classique)",
            "Impossibilité de fidéliser sur un menu/style spécifique",
            "Risque de qualité variable selon chef invité",
            "Complexité opérationnelle extrême (formation équipe mensuelle)",
            "Investment marketing récurrent élevé (50k€/lancement)",
            "Dépendance à la disponibilité de chefs prestigieux",
            "Pas de signature culinaire propre identifiable",
            "Difficulté à construire une cave/stock cohérent"
          ],
          opportunities: [
            "Marché expériences gastronomiques exclusives: +40% croissance annuelle",
            "Tourisme gastronomique international: 12M visiteurs premium/an Paris",
            "Partenariats marques luxe pour événements (Hermès, Chanel, LVMH)",
            "Développement franchise internationale du concept (Londres, NYC, Tokyo)",
            "Création contenus médias: documentaire Netflix, livre annual, podcast",
            "NFT/blockchain pour certificats dîners collectors",
            "École éphémère: masterclasses avec chefs durant leur mois",
            "Extension traiteur ultra-premium pour événements privés"
          ],
          threats: [
            "Copie du concept par groupes établis (Ducasse, Robuchon, Blanc)",
            "Saturation possible du marché éphémère si trop d'acteurs",
            "Récession impacterait fortement segment luxe non-essentiel",
            "Bad buzz amplifié si un mois déçoit (risque viral négatif)",
            "Guerre des talents: enchères sur chefs étoilés disponibles",
            "Évolution réglementation défavorable aux pop-ups",
            "Lassitude médiatique possible du concept après 18-24 mois",
            "Crise sanitaire/géopolitique stoppe flux touristique premium"
          ],
          strategic_implications: {
            key_success_factors: [
              "Excellence exécution: zéro droit erreur sur expérience",
              "Pipeline chefs: sécuriser 12-18 mois à l'avance",
              "Story-telling unique pour chaque mois",
              "Gestion communauté VIP exclusive"
            ],
            competitive_advantages: [
              "First mover sur niche restaurant gastronomique éphémère",
              "Réseau unique de chefs partenaires",
              "Marque synonyme d'exclusivité éphémère"
            ],
            mitigation_strategies: [
              "Contrats exclusivité avec pool de 20 chefs minimum",
              "Fonds qualité: budget tampon si ajustements nécessaires",
              "Advisory board avec leaders opinion gastronomique"
            ]
          }
        };
        prompt = `Réalise une analyse SWOT TRÈS APPROFONDIE pour ${business.name}.

Secteur: ${business.industry}
Description: ${business.description}

IMPORTANT:
- Fournis minimum 8 points SPÉCIFIQUES par catégorie
- Évite TOUT générique ou poncif
- Inclus des éléments QUANTIFIÉS quand possible
- Ajoute strategic_implications avec actions concrètes
- Base-toi sur la réalité du marché actuel

Structure JSON:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
        
      case 'porter_analysis':
        systemContext = `Tu es Michael Porter himself, analysant en profondeur les forces concurrentielles dans ${business.industry}.`;
        exampleJson = {
          threat_of_new_entrants: {
            level: "medium",
            score: 6.5,
            factors: [
              "Barrières capitalistiques élevées: 500K-1M€ minimum pour lancer à Paris",
              "Accès emplacements premium très limité (taux vacance <2% zones cibles)",
              "Nécessité réseau établi dans milieu gastronomique fermé",
              "Complexité réglementaire décourage nouveaux entrants (6 mois procédures)",
              "Économies d'échelle limitées dans gastronomie premium"
            ],
            barriers: [
              "Capital initial: 500K-1M€ (local, équipement, BFR 3 mois)",
              "Expertise culinaire niveau étoilé (5-10 ans formation)",
              "Réputation à construire (2-3 ans minimum pour reconnaissance)",
              "Accès fournisseurs premium (relations long terme requises)",
              "Obtention licences et autorisations (licence IV rare)"
            ],
            recent_entrants: [
              "Contraste (Septime group): positionnement bistronomie premium",
              "Shabour: concept medio-oriental haut de gamme",
              "Maison Maison: rotation trimestrielle de concepts"
            ],
            entry_likelihood: "2-3 nouveaux entrants crédibles par an sur segment ultra-premium"
          },
          bargaining_power_of_suppliers: {
            level: "high",
            score: 8,
            factors: [
              "Concentration fournisseurs produits exception (5 pour caviar France)",
              "Switching costs élevés pour maintenir qualité constante",
              "Produits AOP/AOC en position monopole local",
              "Chefs étoilés invités = fournisseurs avec pouvoir énorme",
              "Saisonnalité crée tensions sur disponibilité"
            ],
            key_suppliers: [
              "Producteurs AOP/AOC: position monopole, prix non négociables",
              "Maisons champagne/vins prestiges: allocations limitées",
              "Chefs étoilés: honoraires 20-50K€/mois + équipe",
              "Fournisseurs équipements spécialisés: Bragard, Matfer",
              "Importateurs produits rares: truffe, wagyu, fruits mer premium"
            ],
            negotiation_leverage: {
              weak_points: "Dépendance qualité, volumes faibles, relations personnelles",
              strong_points: "Paiement comptant, vitrine prestige, flexibilité dates"
            },
            supplier_concentration: "Top 20 fournisseurs = 60% achats, top 5 = 35%"
          },
          bargaining_power_of_buyers: {
            level: "medium",
            score: 5.5,
            factors: [
              "Clientèle fragmentée mais influenceurs ont impact démesuré",
              "Information asymétrique favorise encore restaurants premium",
              "Switching cost psychologique élevé sur réservations anticipées",
              "Sensibilité prix faible sur segment luxe expérientiel",
              "Pouvoir prescription conciergeries/guides important"
            ],
            buyer_concentration: "Top 1000 clients = 25% CA, aucun >2%",
            buyer_profiles: [
              "Gastronomes passionnés: loyaux mais exigeants sur innovation",
              "Touristes premium: one-shot mais panier moyen élevé",
              "Entreprises événements: volumes mais négociation forte",
              "Influenceurs: pouvoir impact sans payer plein tarif"
            ],
            price_sensitivity_analysis: {
              elastic_segment: "20% clients sensibles au-delà 300€",
              inelastic_segment: "40% clients insensibles jusqu'à 500€",
              sweet_spot: "250-350€ maximise volume x marge"
            }
          },
          threat_of_substitutes: {
            level: "low",
            score: 3.5,
            factors: [
              "Expérience restaurant éphémère premium non substituable",
              "Chefs privés 3x plus chers pour qualité équivalente",
              "Meal kits premium ne recréent pas expérience service",
              "Tables d'hôtes manquent prestige et constance qualité",
              "Voyages gastronomiques complément plus que substitut"
            ],
            substitutes: [
              "Restaurants étoilés classiques: moins exclusif/innovant",
              "Chefs à domicile: 500-1500€/personne, logistique complexe",
              "Clubs privés avec restauration: cotisation annuelle élevée",
              "Expériences virtuelles: émergent mais satisfaction limitée",
              "Croisières gastronomiques: prix prohibitif, contraintes"
            ],
            substitution_risk_assessment: {
              near_term: "Très faible, concept unique protège 2-3 ans",
              medium_term: "Modéré si démocratisation chefs à domicile",
              long_term: "Dépend évolution techno (VR/métavers culinaire)"
            }
          },
          competitive_rivalry: {
            level: "high",
            score: 8.5,
            factors: [
              "Concentration élevée sur segment gastronomique premium Paris",
              "Différenciation difficile au-delà certain niveau qualité",
              "Coûts fixes élevés poussent à remplissage agressif",
              "Barrières sortie élevées (contrats, réputation, invest)",
              "Innovation constante nécessaire pour rester relevant"
            ],
            main_competitors: [
              "3 étoiles Michelin Paris (10): référence absolue qualité/prix",
              "Nouveaux concepts premium: Substance, AT, Géosmine",
              "Pop-ups chefs célèbres: Pierre Sang, Gregory Cohen",
              "Palaces restaurants: Plaza, Meurice, Four Seasons",
              "Bistrots premium nouvelle génération: Bouche, Clamato"
            ],
            competitive_dynamics: {
              price_competition: "Limitée, compétition sur expérience/exclusivité",
              innovation_race: "Intense, nouveauté tous les 6 mois minimum",
              talent_war: "Féroce sur chefs et personnel salle qualifié",
              marketing_battle: "PR et influence critique, budget 15-20% CA"
            },
            market_share_evolution: "Top 10 acteurs = 35% marché, fragmentation reste"
          },
          overall_industry_attractiveness: {
            score: 6.2,
            assessment: "Industrie modérément attractive avec niches haute rentabilité",
            key_success_factors: [
              "Excellence exécution et constance qualité",
              "Innovation continue dans expérience proposée", 
              "Gestion serrée coûts malgré positionnement premium",
              "Construction marque forte et communauté fidèle",
              "Réseau fournisseurs et talents premium"
            ]
          }
        };
        prompt = `Réalise une analyse des 5 FORCES DE PORTER EXPERTE pour ${business.name}.

Secteur: ${business.industry}
Description: ${business.description}

EXIGENCES:
- Score numérique (0-10) pour chaque force
- Minimum 5 facteurs détaillés par force
- Exemples concrets et actuels du marché
- Analyse quantifiée quand possible
- Overall assessment avec success factors

Structure JSON:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
        
      case 'strategic_recommendations':
        systemContext = `Tu es un senior partner McKinsey spécialisé en stratégie ${business.industry}, donnant des recommandations actionnables.`;
        exampleJson = {
          immediate_actions: [
            {
              action: "Sécuriser pipeline de 12 chefs étoilés pour la première année",
              impact: "critical",
              timeline: "2 semaines",
              resources_needed: "CEO + consultant gastronomie",
              success_metrics: "Minimum 8 chefs confirmés, 4 en discussion avancée",
              risk_mitigation: "Prévoir 50% chefs backup en cas désistement"
            },
            {
              action: "Lancer campagne teasing 'Le restaurant qui n'existe qu'un mois'",
              impact: "high", 
              timeline: "1 mois",
              resources_needed: "Agence PR premium + budget 50K€",
              success_metrics: "1000 inscriptions liste attente, 50 articles presse",
              dependencies: "Identité visuelle finalisée, chef mois 1 confirmé"
            },
            {
              action: "Négocier partenariat exclusif American Express Centurion",
              impact: "high",
              timeline: "6 semaines", 
              resources_needed: "BD manager + package VIP défini",
              success_metrics: "Accès base Centurion + co-marketing",
              expected_roi: "30% réservations via Amex, panier moyen +20%"
            }
          ],
          medium_term_strategies: [
            "Développer écosystème autour du restaurant: masterclasses, shop éphémère, éditions limitées",
            "Créer membership exclusif 'Founders Circle' avec privilèges uniques (1000 membres max)",
            "Lancer série documentaire avec plateforme streaming premium sur chaque chef",
            "Implanter système réservation par enchères pour tables plus demandées",
            "Développer offre B2B premium pour privatisations corporate innovantes"
          ],
          long_term_vision: "Devenir la référence mondiale du dining éphémère premium avec 5 adresses dans capitales gastronomiques (Paris, Tokyo, NYC, Londres, Copenhague) et un modèle de franchise ultra-sélectif. Valorisation cible 100M€ en 5 ans.",
          
          quick_wins: [
            {
              initiative: "Compte Instagram avec teasers chefs mystère",
              effort: "low",
              impact: "medium", 
              timeline: "3 jours",
              expected_result: "5K followers semaine 1, engagement 15%+"
            },
            {
              initiative: "Partenariat conciergeries palaces pour soft launch",
              effort: "medium",
              impact: "high",
              timeline: "2 semaines", 
              expected_result: "20% réservations mois 1 via prescripteurs"
            }
          ],
          
          competitive_positioning: {
            unique_value_proposition: "Le seul restaurant au monde où chaque mois est une première - et dernière - fois",
            positioning_statement: "Pour les épicuriens en quête d'expériences gastronomiques uniques, [Nom] est le restaurant éphémère qui offre chaque mois un nouveau chef étoilé et un concept inédit. Contrairement aux restaurants traditionnels, nous créons la rareté et l'exclusivité par design.",
            key_differentiators: [
              "Rotation mensuelle vs menus saisonniers classiques",
              "Chefs invités prestigieux vs brigade fixe",
              "Expérience collector vs répétable",
              "Storytelling unique chaque mois vs narrative fixe",
              "Communauté exclusive vs clientèle ouverte"
            ]
          },
          
          resource_allocation: {
            budget_priorities: {
              "Marketing/PR": "30% - Critical pour chaque lancement mensuel",
              "Chefs invités": "25% - Coeur de la proposition valeur",
              "Opérations/Logistique": "20% - Excellence exécution",
              "Tech/Digital": "15% - Experience client et data",
              "Staff permanent": "10% - Équipe coeur réduite"
            },
            team_structure: "15 permanents + 20-30 temporaires selon chef",
            key_hires: [
              "Directeur artistique culinaire (curator chefs)",
              "Head of experience (parcours client premium)",
              "PR manager senior (relations médias/influenceurs)"
            ]
          },
          
          risk_mitigation: [
            {
              risk: "Chef annule dernière minute",
              probability: "medium",
              impact: "critical",
              mitigation_strategy: "Contrats avec pénalités + 2 chefs backup pré-négociés par mois",
              contingency_plan: "Activation chef backup sous 48h + communication transparente"
            },
            {
              risk: "Mois décevant génère bad buzz",
              probability: "low-medium",
              impact: "high",
              mitigation_strategy: "Contrôle qualité drastique + répétitions générales + feedback loop temps réel",
              contingency_plan: "Gestes commerciaux immédiats + sur-délivrer mois suivant"
            }
          ],
          
          success_metrics: {
            year_1: {
              occupancy_rate: "95%+ (vs 70% industrie)",
              average_ticket: "300€ (vs 250€ planned)",
              customer_satisfaction: "9.2/10 minimum",
              press_coverage: "500+ articles, 50+ TV",
              social_engagement: "25% (vs 2-3% industrie)"
            },
            year_3: {
              revenue: "12M€",
              ebitda_margin: "20%",
              brand_value: "30M€",
              international_expansion: "2 cities launched"
            }
          }
        };
        prompt = `Développe des recommandations stratégiques ULTRA DÉTAILLÉES pour ${business.name}.

Secteur: ${business.industry}
Description: ${business.description}

IMPÉRATIF:
- Actions TRÈS SPÉCIFIQUES avec timelines, budgets, KPIs
- Distinguer quick wins / moyen terme / long terme
- Quantifier impacts et ROI attendus
- Inclure risk mitigation détaillé
- Success metrics précis par période

Structure JSON:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
    }
  }
  
  // Marketing Strategy Sections
  else if (analysisType === 'marketing') {
    switch (section) {
      case 'positioning':
        systemContext = `Tu es un expert en brand positioning avec 20 ans d'expérience en stratégie de marque dans ${business.industry}.`;
        exampleJson = {
          brand_essence: "L'innovation éphémère au service de l'excellence gastronomique",
          brand_promise: "Chaque mois, vivez une première mondiale culinaire qui n'existera plus jamais",
          brand_personality: [
            "Avant-gardiste", "Exclusive", "Audacieuse", "Sophistiquée", "Éphémère"
          ],
          brand_values: [
            "Innovation perpétuelle", "Excellence sans compromis", "Exclusivité authentique", 
            "Créativité débridée", "Expérience mémorable"
          ],
          brand_archetype: {
            primary: "The Creator - Donne vie à des visions uniques",
            secondary: "The Explorer - Découvre de nouveaux territoires gustatifs",
            traits: ["Innovant", "Visionnaire", "Perfectionniste", "Surprenant"]
          },
          positioning_statement: "Pour les épicuriens aventureux en quête d'expériences gastronomiques inédites, [Nom] est le seul restaurant au monde qui réinvente complètement son concept chaque mois avec un nouveau chef étoilé, offrant ainsi une expérience collector impossible à revivre.",
          competitive_advantages: [
            "Seul concept de rotation mensuelle complète chef + menu + décor",
            "Accès exclusif aux plus grands chefs mondiaux en résidence",
            "Création de rareté intrinsèque générant désirabilité maximale",
            "Storytelling renouvelé mensuellement maintenant attention médiatique",
            "Data insights uniques: 12 concepts testés par an"
          ],
          brand_pillars: {
            innovation: "Redéfinir les codes de la gastronomie chaque mois",
            exclusivity: "Créer des moments uniques qui n'existeront qu'une fois",
            excellence: "Standards Michelin avec créativité décuplée",
            narrative: "Chaque mois raconte une nouvelle histoire culinaire"
          },
          emotional_benefits: [
            "Fierté d'être parmi les happy few ayant vécu l'expérience",
            "Excitation de découvrir chaque nouvelle incarnation",
            "Sentiment d'appartenance à une communauté d'initiés",
            "Satisfaction de soutenir l'innovation gastronomique"
          ],
          functional_benefits: [
            "Découverte de chefs internationaux sans voyager",
            "Garantie de nouveauté à chaque visite",
            "Flexibilité des expériences selon ses envies",
            "Accès privilégié via membership exclusif"
          ],
          brand_voice: {
            tone: "Sophistiqué mais accessible, mystérieux mais engageant",
            style: "Narratif, évocateur, sensoriel",
            vocabulary: "Riche, précis, poétique sans être pompeux",
            do: ["Inspirer", "Intriguer", "Émerveiller", "Cultiver le mystère"],
            dont: ["Être prétentieux", "Sur-promettre", "Être générique", "Perdre l'humain"]
          }
        };
        prompt = `Développe un positionnement de marque EXPERT et DISTINCTIF pour ${business.name}.

Secteur: ${business.industry}  
Description: ${business.description}

EXIGENCES:
- Positionnement UNIQUE et MÉMORABLE
- Cohérence totale entre tous les éléments
- Avantages concurrentiels RÉELS et DÉFENDABLES
- Benefits émotionnels ET fonctionnels
- Brand voice guide détaillé

Structure JSON:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
        
      case 'campaigns':
        systemContext = `Tu es un directeur créatif d'agence publicitaire premium, créant des campagnes mémorables pour ${business.industry}.`;
        exampleJson = [
          {
            name: "Le Dernier Dîner",
            objective: "Créer urgence et désirabilité pour chaque nouveau chef",
            key_message: "Vous n'aurez qu'une seule chance de vivre cette expérience.",
            target_segment: "Early adopters gastronomiques CSP++",
            creative_concept: "Mise en scène dramatique du caractère unique et éphémère de chaque expérience. Visuels: sablier avec assiette, calendrier qui s'effrite, chef qui disparaît dans la fumée.",
            channels: ["Instagram", "Affichage premium métro", "Presse gastronomique", "Radio premium"],
            budget_estimate: "150K€",
            duration: "2 semaines avant chaque nouveau chef",
            expected_results: "Taux réservation 100% en 72h, 10M impressions, 500K engagements sociaux",
            
            detailed_execution: {
              phase_1_teasing: {
                timing: "J-14 à J-7",
                assets: [
                  "Stories IG cryptiques avec compte à rebours",
                  "Affiches métro avec silhouette chef mystère",
                  "Posts influenceurs 'Quelque chose arrive...'"
                ],
                budget: "40K€"
              },
              phase_2_reveal: {
                timing: "J-7 à J-1", 
                assets: [
                  "Film 90sec portrait chef en cuisine",
                  "Interview exclusive dans M Le Monde",
                  "Live Instagram chef dévoile menu"
                ],
                budget: "70K€"
              },
              phase_3_urgency: {
                timing: "J-1 à J+7",
                assets: [
                  "Countdown dernières places disponibles",
                  "User content premiers services",
                  "Notification push 'Plus que X places'"
                ],
                budget: "40K€"
              }
            },
            
            kpis: {
              awareness: "Reach 5M personnes cible",
              engagement: "Taux engagement 12%+", 
              conversion: "CTR réservation 8%+",
              earned_media: "50+ reprises presse"
            }
          },
          {
            name: "Passeport Éphémère", 
            objective: "Fidéliser early adopters et créer communauté exclusive",
            key_message: "Collectionnez des expériences uniques, pas des points.",
            target_segment: "Clients premium récurrents et prescripteurs",
            creative_concept: "Un passeport digital NFT qui se remplit d'expériences uniques vécues. Chaque mois = nouveau tampon/souvenir digital. Avantages progressifs.",
            channels: ["Email marketing", "App mobile", "Events privés", "Partnerships luxe"],
            budget_estimate: "200K€/an",
            duration: "Programme annuel avec activations mensuelles",
            expected_results: "1000 membres actifs, NPS 70+, 60% rebooking rate, CLV x3",
            
            membership_tiers: {
              explorer: {
                criteria: "1-3 expériences",
                benefits: ["Accès early bird -24h", "Welcome gift", "Newsletter exclusive"],
                target: "600 membres"
              },
              connoisseur: {
                criteria: "4-8 expériences",
                benefits: ["Accès -48h", "Meet chef", "Anniversaire offert", "Conciergerie"],
                target: "300 membres"
              },
              epicurean: {
                criteria: "9+ expériences", 
                benefits: ["Accès -72h", "Table garantie", "Events exclusifs", "Chef table"],
                target: "100 membres"
              }
            }
          },
          {
            name: "Métamorphose Live",
            objective: "Générer buzz via transformation spectaculaire du lieu",
            key_message: "Un lieu, douze incarnations. Assistez à la métamorphose.",
            target_segment: "Médias, influenceurs, early adopters tech/culture",
            creative_concept: "Live streaming 48h de la transformation complète du restaurant entre deux chefs. Time-lapse, interviews, révélations décor.",
            channels: ["YouTube", "Twitch", "TikTok", "PR"],
            budget_estimate: "100K€",
            duration: "48h de transformation + 2 semaines exploitation content",
            expected_results: "5M vues cumulées, 1000 articles, trending topic",
            
            content_strategy: {
              live_content: [
                "Déconstruction ancien décor avec chef sortant",
                "Révélation nouveau concept avec chef entrant", 
                "Création plats signature en direct",
                "Installation décor par artistes"
              ],
              derivative_content: [
                "Best-of 3min pour réseaux",
                "Behind scenes stories",
                "Podcast long format avec chefs",
                "Photo expo before/after"
              ]
            }
          }
        ];
        prompt = `Conçois des campagnes marketing CRÉATIVES et IMPACTANTES pour ${business.name}.

Secteur: ${business.industry}
Description: ${business.description}

IMPÉRATIFS:
- Concepts ORIGINAUX et MÉMORABLES
- Exécution DÉTAILLÉE avec phases
- Budgets et KPIs RÉALISTES
- Mix online/offline OPTIMISÉ
- ROI clairement justifié

Structure JSON avec minimum 3 campagnes:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
    }
  }
  
  // Competitor Analysis Sections
  else if (analysisType === 'competitor') {
    switch (section) {
      case 'main_competitors':
        systemContext = `Tu es un expert en competitive intelligence dans ${business.industry}, spécialisé dans l'analyse approfondie de la concurrence.`;
        exampleJson = [
          {
            name: "L'Astrance (Pascal Barbot)",
            category: "Concurrent direct premium",
            strengths: [
              "3 étoiles Michelin maintenues depuis 2007",
              "Réputation internationale incontestée",
              "Menu unique qui change quotidiennement (similitude concept)",
              "Taille intimiste (25 couverts) crée exclusivité",
              "Pascal Barbot = marque personnelle forte",
              "Localisation prestigieuse près Trocadéro"
            ],
            weaknesses: [
              "Concept figé depuis 20 ans, peu innovation format",
              "Absence réseaux sociaux et modernité digitale",
              "Prix très élevés limitent volume (menu 390€)",
              "Réservations complexes rebutent nouveaux clients",
              "Décor vieillissant peu photogénique",
              "Chef unique = risque si absence"
            ],
            market_share: "2.5% du segment gastronomique premium Paris",
            estimated_revenue: "4.5M€ annuel",
            threat_level: "high",
            
            strategic_profile: {
              positioning: "Excellence gastronomique intemporelle et discrète",
              target_audience: "Connaisseurs fidèles, gastronomes internationaux",
              price_strategy: "Premium assumé, 2ème plus cher Paris",
              innovation_approach: "Innovation dans l'assiette uniquement",
              marketing_strategy: "Bouche-à-oreille et guides uniquement"
            },
            
            competitive_tactics: {
              customer_acquisition: "Réputation et récompenses (Michelin, Worlds 50)",
              customer_retention: "Excellence constante et reconnaissance clients", 
              differentiation: "Style Barbot unique, introuvable ailleurs",
              partnerships: "Fournisseurs exclusifs, vignerons rares"
            },
            
            vulnerabilities: [
              "Dépendance totale à Pascal Barbot",
              "Pas de stratégie digitale à l'ère Instagram",
              "Capacité limitée empêche croissance",
              "Clientèle vieillissante non renouvelée"
            ],
            
            opportunities_to_exploit: [
              "Capter clients frustrés par réservations impossibles",
              "Attirer jeune génération via expérience moderne",
              "Proposer alternative dynamique au classicisme"
            ],
            
            monitoring_points: [
              "Évolution étoiles Michelin",
              "Mouvements équipe cuisine",
              "Tentatives modernisation",
              "Satisfaction clients temps réel"
            ]
          },
          {
            name: "Maison Rostang",
            category: "Concurrent repositionné",
            strengths: [
              "Institution parisienne depuis 1978, 2 étoiles",
              "Récent repositionnement moderne réussi",
              "Nouvelle génération (Nicolas Rostang) dynamise",
              "Forte capacité (80 couverts) = économies échelle", 
              "Cave exceptionnelle 40000 bouteilles",
              "Clientèle affaires fidèle et rentable"
            ],
            weaknesses: [
              "Image traditionnelle persiste malgré efforts",
              "Localisation 17ème moins trendy",
              "Format classique manque différenciation",
              "Dépendance clientèle corporate fragile",
              "Prix élevés pour expérience peu unique"
            ],
            market_share: "3.5% segment premium",
            estimated_revenue: "7M€",
            threat_level: "medium",
            strategic_moves_recent: [
              "Refonte décoration contemporaine 2023",
              "Lancement menu végétarien premium",
              "Partenariats jeunes chefs pour events"
            ]
          }
        ];
        prompt = `Analyse EN PROFONDEUR les principaux concurrents de ${business.name}.

Secteur: ${business.industry}
Description: ${business.description}

ANALYSE EXPERTE REQUISE:
- Profils ULTRA DÉTAILLÉS minimum 5 concurrents
- Forces/faiblesses SPÉCIFIQUES et VÉRIFIABLES  
- Données financières ESTIMÉES réalistes
- Stratégies et tactiques DÉCRYPTÉES
- Vulnérabilités À EXPLOITER

Structure JSON:
${JSON.stringify(exampleJson, null, 2)}`;
        break;
    }
  }
  
  return { systemContext, prompt, exampleJson };
}

function getSearchQuery({ business, section, analysisType }: any): string {
  const baseQuery = `${business.industry} France 2024 `;
  
  const sectionQueries: Record<string, string> = {
    // Market
    'target_audience': `segmentation clientèle profils consommateurs comportement achat`,
    'pestel_analysis': `analyse PESTEL facteurs macro environnement réglementation tendances`,
    'porter_analysis': `5 forces Porter analyse concurrentielle barrières entrée`,
    'swot_analysis': `analyse SWOT forces faiblesses opportunités menaces`,
    'strategic_recommendations': `stratégie recommandations business plan développement`,
    
    // Marketing  
    'positioning': `positionnement marque brand stratégie différenciation`,
    'campaigns': `campagnes marketing publicité communication exemples`,
    'segments': `segmentation marché cibles marketing personas`,
    
    // Competitor
    'main_competitors': `principaux concurrents leaders marché parts analyse`,
    'competitive_advantages': `avantages concurrentiels différenciation facteurs succès`
  };
  
  return baseQuery + (sectionQueries[section] || section);
}