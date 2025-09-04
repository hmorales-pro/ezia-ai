import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

interface PersonaGenerationInput {
  business: any;
  marketAnalysis?: any;
  collectedData?: any;
}

export async function runPersonaAgent(input: PersonaGenerationInput): Promise<any> {
  const { business, marketAnalysis, collectedData } = input;
  console.log(`[Agent Persona] Génération de personas détaillés pour ${business.name}...`);
  
  const systemContext = `Tu es un expert en création de personas marketing avec 15 ans d'expérience.
Tu dois créer des personas ULTRA-DÉTAILLÉS et RÉALISTES pour ce business.
IMPORTANT:
- Chaque persona doit être unique et complémentaire
- Utilise des prénoms français réalistes
- Base-toi sur les données réelles du business et du marché
- Sois extrêmement spécifique sur les comportements et motivations
- Inclus des détails psychographiques profonds
- Crée des personas qui couvrent différents segments de marché`;

  const prompt = `Crée 3 personas détaillés pour ce business:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}
${collectedData ? `
Offres: ${JSON.stringify(collectedData.offerings)}
Modèle économique: ${JSON.stringify(collectedData.business_model)}
Insights clients: ${JSON.stringify(collectedData.customer_insights)}
` : ''}
${marketAnalysis ? `
Analyse de marché:
- Taille: ${marketAnalysis.market_overview?.market_size}
- Segments: ${JSON.stringify(marketAnalysis.market_overview?.market_segments)}
- Tendances: ${JSON.stringify(marketAnalysis.executive_summary?.key_findings)}
` : ''}

Fournis 3 personas COMPLETS et DISTINCTS avec:
1. Une histoire personnelle cohérente
2. Des motivations profondes
3. Des freins psychologiques réalistes
4. Un parcours client détaillé
5. Des préférences de communication spécifiques

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "personas": [
    {
      "id": "persona-1",
      "name": "Prénom Nom",
      "title": "Titre professionnel précis",
      "age": "Âge exact",
      "location": "Ville, Région",
      "company_size": "Taille entreprise si B2B",
      "income": "Revenu annuel précis",
      "family_status": "Situation familiale",
      "education": "Niveau d'études et domaine",
      "personality_traits": ["5-6 traits de personnalité"],
      "values": ["3-4 valeurs fondamentales"],
      "goals": {
        "professional": ["2-3 objectifs professionnels"],
        "personal": ["2-3 objectifs personnels"]
      },
      "challenges": {
        "primary": "Défi principal détaillé",
        "secondary": ["2-3 défis secondaires"],
        "hidden": "Défi caché/non-avoué"
      },
      "motivations": {
        "rational": ["Motivations rationnelles"],
        "emotional": ["Motivations émotionnelles"],
        "social": ["Motivations sociales"]
      },
      "fears": ["3-4 peurs/craintes spécifiques"],
      "buying_behavior": {
        "decision_process": "Description du processus de décision",
        "research_methods": ["Méthodes de recherche utilisées"],
        "influencers": ["Qui influence ses décisions"],
        "objections": ["Objections typiques"],
        "trigger_events": ["Événements déclencheurs d'achat"]
      },
      "communication_preferences": {
        "channels": ["Canaux préférés par ordre"],
        "tone": "Ton de communication apprécié",
        "frequency": "Fréquence de contact souhaitée",
        "content_types": ["Types de contenu préférés"]
      },
      "technology_usage": {
        "devices": ["Appareils utilisés"],
        "apps": ["Applications favorites"],
        "social_media": ["Réseaux sociaux actifs"],
        "online_behavior": "Comportement en ligne"
      },
      "typical_day": "Description d'une journée type",
      "quote": "Citation représentative du persona",
      "relationship_to_product": "Comment il/elle perçoit votre offre",
      "customer_journey_stage": "awareness|consideration|decision|retention|advocacy"
    }
  ],
  "persona_insights": {
    "common_threads": ["Points communs entre personas"],
    "key_differences": ["Différences principales"],
    "segment_coverage": "Analyse de la couverture des segments",
    "recommendations": ["Recommandations pour adresser ces personas"]
  }
}`;

  try {
    const response = await generateWithMistralAPI(prompt, systemContext);
    
    if (response.success && response.content) {
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const personas = parseAIGeneratedJson(jsonMatch[0]);
          
          // Enrichir avec des données calculées
          personas.personas = personas.personas.map((persona: any, index: number) => ({
            ...persona,
            lifetime_value_potential: calculateLTV(persona, collectedData),
            acquisition_cost_estimate: estimateCAC(persona, marketAnalysis),
            priority_score: calculatePriorityScore(persona, business, index)
          }));
          
          return personas;
        }
      } catch (parseError) {
        console.error("[Agent Persona] Erreur parsing JSON:", parseError);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Persona] Erreur:", error);
    return generateFallbackPersonas(business, collectedData);
  }
}

function calculateLTV(persona: any, collectedData: any): string {
  if (!collectedData?.offerings?.[0]?.price) return "À déterminer";
  
  const avgPrice = collectedData.offerings[0].price;
  const estimatedPurchasesPerYear = persona.buying_behavior?.trigger_events?.length || 2;
  const estimatedRetention = persona.customer_journey_stage === "advocacy" ? 5 : 3;
  
  const ltv = avgPrice * estimatedPurchasesPerYear * estimatedRetention;
  return `€${ltv.toLocaleString('fr-FR')}`;
}

function estimateCAC(persona: any, marketAnalysis: any): string {
  // Estimation basée sur la difficulté d'acquisition
  const channels = persona.communication_preferences?.channels || [];
  let baseCost = 50; // Coût de base
  
  if (channels.includes("LinkedIn")) baseCost += 100;
  if (channels.includes("Salons professionnels")) baseCost += 200;
  if (persona.buying_behavior?.decision_process?.includes("long")) baseCost += 150;
  
  return `€${baseCost}-${baseCost * 1.5}`;
}

function calculatePriorityScore(persona: any, business: any, index: number): number {
  // Score de priorité de 1 à 10
  let score = 5;
  
  // Ajuster selon le stade du business
  if (business.stage === "idea" && index === 0) score += 3; // Prioriser le premier persona en phase idée
  if (persona.challenges?.primary?.toLowerCase().includes(business.industry.toLowerCase())) score += 2;
  if (persona.income && parseInt(persona.income) > 50000) score += 1;
  
  return Math.min(10, score);
}

function generateFallbackPersonas(business: any, collectedData: any): any {
  const basePrice = collectedData?.offerings?.[0]?.price || 500;
  const isB2B = business.industry?.toLowerCase().includes('entreprise') || 
                business.industry?.toLowerCase().includes('business') ||
                basePrice > 1000;
  
  return {
    personas: [
      {
        id: "persona-1",
        name: isB2B ? "Marie Dubois" : "Thomas Martin",
        title: isB2B ? "Directrice des Opérations" : "Cadre dynamique",
        age: isB2B ? "38" : "32",
        location: "Paris, Île-de-France",
        company_size: isB2B ? "50-200 employés" : "N/A",
        income: isB2B ? "€75,000" : "€45,000",
        family_status: isB2B ? "Mariée, 2 enfants" : "En couple",
        education: "Master en Gestion",
        personality_traits: ["Analytique", "Orientée résultats", "Innovante", "Collaborative", "Exigeante"],
        values: ["Efficacité", "Innovation", "Équilibre vie pro/perso", "Développement durable"],
        goals: {
          professional: ["Optimiser les processus", "Réduire les coûts de 20%", "Innover dans son secteur"],
          personal: ["Plus de temps en famille", "Développement personnel continu"]
        },
        challenges: {
          primary: "Moderniser les outils sans perturber l'activité",
          secondary: ["Budget limité", "Résistance au changement des équipes"],
          hidden: "Peur de prendre la mauvaise décision technologique"
        },
        motivations: {
          rational: ["ROI démontrable", "Gain de productivité mesurable"],
          emotional: ["Reconnaissance de ses pairs", "Sentiment d'accomplissement"],
          social: ["Être perçue comme innovante", "Améliorer la vie de son équipe"]
        },
        fears: ["Échec d'implémentation", "Dépassement de budget", "Perte de contrôle"],
        buying_behavior: {
          decision_process: "Recherche approfondie > Comparaison > Essai > Validation équipe > Décision",
          research_methods: ["Google", "Avis pairs", "Démos produits", "Salons professionnels"],
          influencers: ["Équipe technique", "Pairs dans l'industrie", "Consultants"],
          objections: ["Prix élevé", "Complexité d'intégration", "Support insuffisant"],
          trigger_events: ["Nouveau budget", "Problème critique", "Pression concurrentielle"]
        },
        communication_preferences: {
          channels: ["Email professionnel", "LinkedIn", "Webinaires"],
          tone: "Professionnel mais accessible",
          frequency: "2-3 fois par mois maximum",
          content_types: ["Études de cas", "ROI calculators", "Webinaires experts"]
        },
        technology_usage: {
          devices: ["Laptop pro", "iPhone", "iPad occasionnel"],
          apps: ["Slack", "Teams", "Notion", "LinkedIn"],
          social_media: ["LinkedIn actif", "Twitter veille"],
          online_behavior: "Recherche entre 9h-11h et 14h-16h"
        },
        typical_day: "Réunions le matin, analyse l'après-midi, veille en soirée",
        quote: "Je cherche des solutions qui font vraiment la différence, pas des gadgets",
        relationship_to_product: "Voit le potentiel mais a besoin de preuves concrètes",
        customer_journey_stage: "consideration"
      },
      {
        id: "persona-2",
        name: "Julien Lefebvre",
        title: "Fondateur de startup",
        age: "29",
        location: "Lyon, Auvergne-Rhône-Alpes",
        company_size: "5-10 employés",
        income: "€35,000 (réinvestit tout)",
        family_status: "Célibataire",
        education: "École d'ingénieur",
        personality_traits: ["Visionnaire", "Agile", "Risk-taker", "Passionné", "Impatient"],
        values: ["Innovation", "Liberté", "Impact", "Croissance rapide"],
        goals: {
          professional: ["Scaler rapidement", "Lever des fonds", "Disrupter le marché"],
          personal: ["Construire quelque chose qui compte", "Liberté financière"]
        },
        challenges: {
          primary: "Faire beaucoup avec peu de ressources",
          secondary: ["Cashflow tendu", "Manque de temps", "Tout à construire"],
          hidden: "Syndrome de l'imposteur"
        },
        motivations: {
          rational: ["Solutions scalables", "Coût maîtrisé", "Time-to-market rapide"],
          emotional: ["Être pionnier", "Prouver sa vision"],
          social: ["Reconnaissance écosystème startup", "Inspirer d'autres"]
        },
        fears: ["Burn cash trop vite", "Passer à côté d'opportunités", "Échouer publiquement"],
        buying_behavior: {
          decision_process: "Test rapide > Décision intuitive > Itération",
          research_methods: ["ProductHunt", "Recommandations réseaux", "Essais gratuits"],
          influencers: ["Autres fondateurs", "Mentors", "Communauté startup"],
          objections: ["Pas assez flexible", "Trop cher pour démarrer", "Lock-in vendor"],
          trigger_events: ["Levée de fonds", "Nouveau client majeur", "Bottleneck opérationnel"]
        },
        communication_preferences: {
          channels: ["Slack", "WhatsApp", "Email rapide"],
          tone: "Direct, no bullshit",
          frequency: "Quand c'est pertinent",
          content_types: ["Tips actionables", "Hacks de croissance", "Retours d'expérience"]
        },
        technology_usage: {
          devices: ["MacBook Pro", "iPhone dernier modèle"],
          apps: ["Notion", "Slack", "Figma", "GitHub"],
          social_media: ["Twitter très actif", "LinkedIn networking"],
          online_behavior: "Always on, multitâche"
        },
        typical_day: "Débute à 7h, calls équipe, dev produit, networking soirée",
        quote: "Move fast and break things, mais intelligemment",
        relationship_to_product: "Early adopter enthousiaste si ça résout un vrai problème",
        customer_journey_stage: "decision"
      },
      {
        id: "persona-3",
        name: "Sophie Mercier",
        title: "Consultante indépendante",
        age: "42",
        location: "Bordeaux, Nouvelle-Aquitaine",
        company_size: "Freelance",
        income: "€65,000",
        family_status: "Divorcée, 1 enfant",
        education: "MBA + formations continues",
        personality_traits: ["Autonome", "Organisée", "Prudente", "Relationnelle", "Perfectionniste"],
        values: ["Indépendance", "Qualité", "Équilibre", "Authenticité"],
        goals: {
          professional: ["Clients premium", "Expertise reconnue", "Revenus stables"],
          personal: ["Temps pour sa fille", "Voyager", "Épanouissement"]
        },
        challenges: {
          primary: "Gérer seule tous les aspects du business",
          secondary: ["Irrégularité revenus", "Isolement professionnel", "Admin chronophage"],
          hidden: "Peur de repasser au salariat"
        },
        motivations: {
          rational: ["Optimiser son temps", "Automatiser l'admin", "Augmenter sa valeur"],
          emotional: ["Garder sa liberté", "Fierté de réussir seule"],
          social: ["Réseau de pairs", "Reconnaissance clients"]
        },
        fears: ["Précarité", "Burn-out", "Obsolescence compétences"],
        buying_behavior: {
          decision_process: "Veille longue > Comparaison minutieuse > Test > Achat réfléchi",
          research_methods: ["Blogs spécialisés", "Forums", "Bouche-à-oreille"],
          influencers: ["Autres consultants", "Clients de confiance"],
          objections: ["Rapport qualité/prix", "Courbe apprentissage", "Service client"],
          trigger_events: ["Nouveau gros client", "Problème récurrent", "Opportunité manquée"]
        },
        communication_preferences: {
          channels: ["Email structuré", "LinkedIn", "Téléphone si urgent"],
          tone: "Professionnel chaleureux",
          frequency: "1 fois par semaine max",
          content_types: ["Guides pratiques", "Templates", "Success stories similaires"]
        },
        technology_usage: {
          devices: ["PC portable", "Smartphone Android", "Tablette lecture"],
          apps: ["Suite Office", "Trello", "Zoom", "Calendly"],
          social_media: ["LinkedIn pro", "Instagram perso"],
          online_behavior: "Recherche matin tôt ou soir"
        },
        typical_day: "Client matin, admin midi, prospection après-midi, famille soir",
        quote: "J'investis dans ce qui me fait vraiment gagner du temps et de la sérénité",
        relationship_to_product: "Prudente mais fidèle une fois convaincue",
        customer_journey_stage: "awareness"
      }
    ],
    persona_insights: {
      common_threads: [
        "Recherche d'efficacité et de gain de temps",
        "Besoin de prouver le ROI",
        "Importance du support et de l'accompagnement"
      ],
      key_differences: [
        "Budget et processus de décision très variables",
        "Maturité technologique différente",
        "Motivations émotionnelles distinctes"
      ],
      segment_coverage: "Couvre les entreprises établies, startups en croissance et indépendants",
      recommendations: [
        "Adapter le pricing selon les segments",
        "Créer des parcours d'onboarding différenciés",
        "Développer du contenu spécifique par persona",
        "Offrir des niveaux de support adaptés"
      ]
    }
  };
}

export async function generatePersonaReport(personas: any, business: any): Promise<string> {
  const report = `# Rapport Personas - ${business.name}

## Vue d'ensemble
Nous avons identifié ${personas.personas.length} personas clés pour votre business.

${personas.personas.map((p: any) => `
### ${p.name} - ${p.title}
**Âge:** ${p.age} | **Localisation:** ${p.location} | **Revenus:** ${p.income}
**Stage:** ${p.customer_journey_stage} | **Priorité:** ${p.priority_score}/10
**LTV Potentiel:** ${p.lifetime_value_potential} | **CAC Estimé:** ${p.acquisition_cost_estimate}

**Citation:** "${p.quote}"

#### Profil
- **Traits:** ${p.personality_traits.join(', ')}
- **Valeurs:** ${p.values.join(', ')}
- **Défi principal:** ${p.challenges.primary}

#### Comportement d'achat
- **Processus:** ${p.buying_behavior.decision_process}
- **Canaux préférés:** ${p.communication_preferences.channels.join(', ')}
- **Objections typiques:** ${p.buying_behavior.objections.join(', ')}

#### Recommandations spécifiques
- Adapter le message sur: ${p.motivations.emotional.join(', ')}
- Adresser les peurs: ${p.fears.join(', ')}
- Utiliser le ton: ${p.communication_preferences.tone}
`).join('\n')}

## Insights transversaux
${personas.persona_insights.common_threads.map((t: string) => `- ${t}`).join('\n')}

## Recommandations stratégiques
${personas.persona_insights.recommendations.map((r: string) => `- ${r}`).join('\n')}
`;

  return report;
}