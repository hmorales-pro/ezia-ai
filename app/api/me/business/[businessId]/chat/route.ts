import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const INITIAL_SYSTEM_PROMPT = `Tu es Ezia, un assistant IA expert en stratégie business. Tu aides les entrepreneurs à développer et optimiser leur business.

Ta mission est d'avoir une conversation approfondie et naturelle pour comprendre le business en détail. Tu dois:

1. ANALYSER le contexte complet avant chaque réponse
2. APPROFONDIR les informations déjà données
3. FAIRE DES CONNEXIONS entre les différents éléments
4. PROPOSER des insights et recommandations basés sur ce que tu sais
5. POSER des questions de suivi pertinentes qui enrichissent la compréhension

Informations à explorer et approfondir:
- Modèle économique et sources de revenus
- Détails des offres (caractéristiques, bénéfices, pricing)
- Profil client et parcours d'achat
- Concurrence et positionnement
- Objectifs et défis actuels
- Ressources et contraintes

IMPORTANT:
- Toujours te référer aux informations déjà collectées
- Approfondir plutôt que passer à autre chose
- Donner des exemples concrets basés sur leur business
- Proposer des calculs et analyses quand pertinent
- Partager des insights sectoriels
- Rester conversationnel et empathique
- Une question principale à la fois, mais enrichie de contexte`;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { message, conversationHistory, collectedData, completionScore } = await request.json();
    
    console.log(`[Ezia Chat] Processing message for business ${businessId}`);
    
    // Analyser les données pour identifier les zones à approfondir
    const analysisContext = analyzeBusinessContext(collectedData, businessId);
    
    // Construire le prompt avec le contexte enrichi
    const prompt = `${INITIAL_SYSTEM_PROMPT}

CONTEXTE BUSINESS ACTUEL:
${analysisContext}

Données collectées détaillées:
${JSON.stringify(collectedData, null, 2)}

Score de complétion: ${completionScore}%

Historique de conversation:
${conversationHistory}
user: ${message}

INSTRUCTIONS POUR CETTE RÉPONSE:
1. Analyse d'abord ce que l'utilisateur vient de partager
2. Fais des connexions avec les informations précédentes
3. Donne des insights ou recommandations spécifiques
4. Pose une question d'approfondissement pertinente

Exemple: Si l'utilisateur parle de prix à 800€ pour des meubles éco-responsables, tu peux:
- Calculer les marges potentielles
- Comparer avec les prix du marché
- Suggérer des stratégies de pricing
- Demander des détails sur les matériaux ou le processus de fabrication

RAPPEL: Sois naturel, empathique et apporte de la valeur à chaque échange.`;

    let aiResponse = "";
    let extractedData = null;

    if (MISTRAL_API_KEY) {
      try {
        const response = await generateWithMistralAPI(
          prompt,
          "Tu es Ezia, assistant business empathique et expert. Sois conversationnel et naturel.",
          MISTRAL_API_KEY
        );
        
        if (response.success && response.content) {
          aiResponse = response.content;
          
          // Extraire les données structurées
          extractedData = await extractDataFromConversation(message, aiResponse, collectedData);
        }
      } catch (error) {
        console.error("[Ezia Chat] Mistral API error:", error);
      }
    }
    
    // Fallback si pas d'API ou erreur
    if (!aiResponse) {
      aiResponse = generateFallbackResponse(message, collectedData, completionScore);
      extractedData = extractFallbackData(message, collectedData);
    }
    
    // Déterminer les suggestions contextuelles
    const suggestions = generateContextualSuggestions(aiResponse, collectedData);
    
    // Vérifier si on doit proposer des personas
    const personaSuggestions = shouldSuggestPersonas(collectedData, conversationHistory) 
      ? await generatePersonaSuggestions(collectedData, MISTRAL_API_KEY)
      : null;
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      extractedData: extractedData,
      suggestions: suggestions,
      personaSuggestions: personaSuggestions
    });
    
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function extractDataFromConversation(userMessage: string, aiResponse: string, currentData: any) {
  if (!MISTRAL_API_KEY) return null;
  
  const extractionPrompt = `Analyse cette conversation et extrais les données business structurées.

Message utilisateur: "${userMessage}"
Réponse IA: "${aiResponse}"

Contexte business actuel:
${JSON.stringify(currentData, null, 2)}

Extrais et structure UNIQUEMENT les NOUVELLES informations selon ce format JSON:
{
  "business_model": {
    "type": "product|service|hybrid",
    "revenue_streams": [],
    "unique_selling_points": []
  },
  "offerings": [{
    "id": "unique-id",
    "name": "nom de l'offre (REQUIS)",
    "description": "description de l'offre (REQUIS)",
    "type": "product|service (REQUIS)",
    "price": 0,
    "currency": "EUR",
    "unit": "par heure/par pièce/etc",
    "cost_breakdown": {
      "raw_materials": 0,
      "labor": 0,
      "overhead": 0
    }
  }],
  "customer_insights": {
    "ideal_customer_profile": "",
    "customer_pain_points": [],
    "acquisition_channels": []
  },
  "financial_info": {
    "monthly_revenue": 0,
    "target_monthly_revenue": 0,
    "pricing_strategy": ""
  }
}

Retourne UNIQUEMENT le JSON avec les nouvelles données extraites. N'inclus que les champs pour lesquels tu as trouvé des informations NOUVELLES dans cette conversation.`;

  try {
    const response = await generateWithMistralAPI(
      extractionPrompt,
      "Tu es un expert en extraction de données structurées. Retourne uniquement du JSON valide sans aucun texte avant ou après.",
      MISTRAL_API_KEY
    );
    
    if (response.success && response.content) {
      try {
        // Nettoyer la réponse pour extraire uniquement le JSON
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[0]);
          return extracted;
        }
      } catch (e) {
        console.error("Failed to parse extraction:", e);
      }
    }
  } catch (error) {
    console.error("Extraction error:", error);
  }
  
  return null;
}

function generateFallbackResponse(message: string, collectedData: any, completionScore: number): string {
  const msg = message.toLowerCase();
  const context = analyzeBusinessContext(collectedData, "");
  
  // Analyser ce qui a déjà été collecté
  const hasBusinessType = !!collectedData.business_model?.type;
  const hasOfferings = collectedData.offerings?.length > 0;
  const hasCustomerProfile = !!collectedData.customer_insights?.ideal_customer_profile;
  const hasFinancialGoals = !!collectedData.financial_info?.target_monthly_revenue;
  
  // Si on a déjà des infos, approfondir
  if (hasOfferings && msg.includes("€")) {
    const mainOffer = collectedData.offerings[0];
    const price = parseInt(msg.match(/(\d+)\s*€/)?.[1] || "0");
    
    if (price > mainOffer.price * 1.5) {
      return `Intéressant ! Ce prix de ${price}€ est significativement plus élevé que votre offre à ${mainOffer.price}€. S'agit-il d'une version premium ou d'une offre différente ? Cela pourrait être une excellente opportunité de gamme pour augmenter votre panier moyen.`;
    } else if (price < mainOffer.price * 0.7) {
      return `Je vois que vous envisagez un prix de ${price}€, plus accessible que votre offre actuelle. C'est une stratégie intéressante pour élargir votre marché. Avez-vous calculé si les marges restent viables à ce prix ?`;
    }
  }
  
  if (hasBusinessType && msg.includes(collectedData.business_model.type)) {
    // Approfondir le type de business
    if (collectedData.business_model.type === "product") {
      return `D'accord, vous êtes spécialisé dans les produits. Au-delà du produit lui-même, qu'est-ce qui fait que vos clients vous choisissent vous plutôt qu'un concurrent ? Est-ce la qualité, le service, la personnalisation, ou autre chose ?`;
    } else if (collectedData.business_model.type === "service") {
      return `Vos services sont au cœur de votre activité. Comment mesurez-vous la satisfaction client ? Avez-vous des témoignages ou des cas de succès qui illustrent votre valeur ajoutée ?`;
    }
  }
  
  if (hasCustomerProfile && (msg.includes("client") || msg.includes("cible"))) {
    return `Vous m'avez dit que votre client idéal est "${collectedData.customer_insights.ideal_customer_profile}". C'est très précis ! Comment ces clients vous trouvent-ils actuellement ? Bouche-à-oreille, recherche Google, réseaux sociaux ?`;
  }
  
  // Questions d'approfondissement basées sur le contexte
  if (hasOfferings && !collectedData.offerings[0].cost_breakdown) {
    return `Pour votre offre à ${collectedData.offerings[0].price}€, j'aimerais vous aider à optimiser vos marges. Pouvez-vous me donner une estimation de vos coûts principaux ? Cela nous permettra de calculer votre rentabilité réelle et d'identifier des leviers d'amélioration.`;
  }
  
  if (hasFinancialGoals && hasOfferings) {
    const salesNeeded = Math.ceil(collectedData.financial_info.target_monthly_revenue / collectedData.offerings[0].price);
    return `Pour atteindre ${collectedData.financial_info.target_monthly_revenue}€/mois, vous devrez réaliser environ ${salesNeeded} ventes. Cela vous semble-t-il réaliste avec vos ressources actuelles ? Combien de ventes réalisez-vous en moyenne aujourd'hui ?`;
  }
  
  // Fallback générique mais contextuel
  return `Merci pour ces informations ! ${context.includes("Marge") ? "J'ai calculé vos marges et elles semblent intéressantes." : ""} Quel est actuellement votre plus grand défi pour développer votre business ?`;
}

function extractFallbackData(message: string, currentData: any): any {
  const extracted: any = {};
  const msg = message.toLowerCase();
  
  // Extraire le type de business
  if (!currentData.business_model?.type) {
    if (msg.includes("produit") && !msg.includes("service")) {
      extracted.business_model = { type: "product" };
    } else if (msg.includes("service") && !msg.includes("produit")) {
      extracted.business_model = { type: "service" };
    } else if (msg.includes("les deux") || msg.includes("hybride")) {
      extracted.business_model = { type: "hybrid" };
    }
  }
  
  // Extraire les prix
  const priceMatch = msg.match(/(\d+)\s*€|euros?/);
  if (priceMatch && (!currentData.offerings || currentData.offerings.length === 0)) {
    extracted.offerings = [{
      id: `offer-${Date.now()}`,
      name: "Offre principale",
      description: "Offre principale du business", // Requis par MongoDB
      price: parseInt(priceMatch[1]),
      currency: "EUR",
      type: currentData.business_model?.type === "service" ? "service" : "product"
    }];
  }
  
  // Extraire le CA cible
  const revenueMatch = msg.match(/(\d+)\s*(?:k|€|euros?).*(?:mois|mensuel)/);
  if (revenueMatch && !currentData.financial_info?.target_monthly_revenue) {
    const amount = parseInt(revenueMatch[1]);
    extracted.financial_info = {
      target_monthly_revenue: msg.includes('k') ? amount * 1000 : amount
    };
  }
  
  return Object.keys(extracted).length > 0 ? extracted : null;
}

function analyzeBusinessContext(collectedData: any, businessId: string): string {
  let context = "";
  
  // Analyser le modèle économique
  if (collectedData.business_model?.type) {
    context += `Type de business: ${collectedData.business_model.type}\n`;
    if (collectedData.business_model.unique_selling_points?.length > 0) {
      context += `Points différenciants identifiés: ${collectedData.business_model.unique_selling_points.join(', ')}\n`;
    }
  }
  
  // Analyser les offres
  if (collectedData.offerings?.length > 0) {
    const mainOffer = collectedData.offerings[0];
    context += `\nOffre principale: ${mainOffer.name || 'Non nommée'} à ${mainOffer.price}€\n`;
    
    // Calculer les marges si possible
    if (mainOffer.cost_breakdown) {
      const totalCost = Object.values(mainOffer.cost_breakdown).reduce((sum: number, cost: any) => sum + (cost || 0), 0);
      if (totalCost > 0) {
        const margin = ((mainOffer.price - totalCost) / mainOffer.price * 100).toFixed(1);
        context += `Marge calculée: ${margin}% (coûts: ${totalCost}€)\n`;
        
        if (parseFloat(margin) < 30) {
          context += `⚠️ Marge faible - Explorer l'optimisation des coûts ou l'augmentation des prix\n`;
        } else if (parseFloat(margin) > 60) {
          context += `✅ Excellente marge - Potentiel de croissance par volume\n`;
        }
      }
    }
  } else {
    context += "\n❓ Aucune offre détaillée - Important d'approfondir les produits/services\n";
  }
  
  // Analyser le client cible
  if (collectedData.customer_insights?.ideal_customer_profile) {
    context += `\nClient cible: ${collectedData.customer_insights.ideal_customer_profile}\n`;
    if (collectedData.customer_insights.customer_pain_points?.length > 0) {
      context += `Problèmes résolus: ${collectedData.customer_insights.customer_pain_points.join(', ')}\n`;
    }
  } else {
    context += "\n❓ Profil client non défini - Crucial pour le marketing ciblé\n";
  }
  
  // Analyser les objectifs financiers
  if (collectedData.financial_info?.target_monthly_revenue) {
    const target = collectedData.financial_info.target_monthly_revenue;
    context += `\nObjectif CA mensuel: ${target}€\n`;
    
    // Calculer le nombre de ventes nécessaires
    if (collectedData.offerings?.[0]?.price) {
      const salesNeeded = Math.ceil(target / collectedData.offerings[0].price);
      context += `Ventes mensuelles nécessaires: ${salesNeeded} (soit ${Math.ceil(salesNeeded / 20)} par jour ouvré)\n`;
    }
  }
  
  // Identifier les zones à explorer
  const missingAreas = [];
  if (!collectedData.customer_insights?.acquisition_channels?.length) {
    missingAreas.push("canaux d'acquisition");
  }
  if (!collectedData.financial_info?.pricing_strategy) {
    missingAreas.push("stratégie de prix");
  }
  if (!collectedData.resources?.team_size) {
    missingAreas.push("ressources et capacités");
  }
  
  if (missingAreas.length > 0) {
    context += `\n🎯 Zones à approfondir: ${missingAreas.join(', ')}\n`;
  }
  
  return context || "Début de conversation - Aucune donnée collectée";
}

function generateContextualSuggestions(aiResponse: string, collectedData: any): string[] {
  const suggestions = [];
  const response = aiResponse.toLowerCase();
  
  if (response.includes("prix") || response.includes("coût") || response.includes("marge")) {
    suggestions.push("Calculer mes marges");
    suggestions.push("Optimiser mes prix");
  }
  
  if (response.includes("client") || response.includes("cible")) {
    suggestions.push("Définir mon persona client");
    suggestions.push("Identifier les points de douleur");
  }
  
  if (response.includes("concurrent") || response.includes("différenc")) {
    suggestions.push("Analyser ma concurrence");
    suggestions.push("Définir mes avantages uniques");
  }
  
  if (collectedData.offerings && collectedData.offerings.length > 0) {
    suggestions.push("Ajouter une autre offre");
  }
  
  if (collectedData.financial_info?.target_monthly_revenue && collectedData.offerings?.[0]?.price) {
    suggestions.push("Calculer le nombre de ventes nécessaires");
  }
  
  return suggestions.slice(0, 3); // Limiter à 3 suggestions
}

function shouldSuggestPersonas(collectedData: any, conversationHistory: string): boolean {
  // Vérifier si on a assez d'informations pour suggérer des personas
  const hasBasicInfo = collectedData.business_model?.type && 
                      collectedData.offerings?.length > 0;
  
  // Vérifier si on n'a pas déjà un persona bien défini
  const hasDetailedPersona = collectedData.customer_insights?.ideal_customer_profile &&
                            collectedData.customer_insights?.customer_pain_points?.length > 2;
  
  // Compter le nombre d'échanges
  const messageCount = (conversationHistory.match(/user:/g) || []).length;
  
  // Suggérer des personas après 5+ échanges si on n'a pas encore de persona détaillé
  return hasBasicInfo && !hasDetailedPersona && messageCount >= 5;
}

async function generatePersonaSuggestions(collectedData: any, apiKey?: string): Promise<any> {
  if (!apiKey) {
    // Générer des personas basiques en fallback
    return generateFallbackPersonas(collectedData);
  }
  
  const prompt = `En tant qu'expert en marketing et personas, analyse ces données business et génère 3 personas clients distincts et réalistes.

Données du business:
${JSON.stringify(collectedData, null, 2)}

Pour CHAQUE persona, fournis:
1. Un nom et titre professionnel
2. Âge et situation
3. Problèmes principaux (3-4)
4. Motivations d'achat
5. Freins potentiels
6. Budget typique
7. Canaux de communication préférés

Format JSON structuré avec 3 personas complémentaires mais différents.
Les personas doivent être spécifiques au business et secteur identifiés.`;

  try {
    const response = await generateWithMistralAPI(
      prompt,
      "Tu es un expert en création de personas marketing. Génère uniquement du JSON valide.",
      apiKey
    );
    
    if (response.success && response.content) {
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse personas:", e);
      }
    }
  } catch (error) {
    console.error("Error generating personas:", error);
  }
  
  return generateFallbackPersonas(collectedData);
}

function generateFallbackPersonas(collectedData: any): any {
  const { business_model, offerings } = collectedData;
  const mainOffer = offerings?.[0];
  const price = mainOffer?.price || 0;
  
  // Déterminer le niveau de gamme
  const isLuxury = price > 1000;
  const isMidRange = price >= 200 && price <= 1000;
  const isBudget = price < 200;
  
  const personas = {
    personas: []
  };
  
  if (business_model?.type === "product") {
    // Personas pour produits
    personas.personas = [
      {
        id: "persona-1",
        name: isLuxury ? "Sophie Martin" : "Thomas Dubois",
        title: isLuxury ? "Directrice Marketing" : "Chef de projet",
        age: isLuxury ? "35-45 ans" : "28-38 ans",
        situation: isLuxury ? "Cadre supérieur, urbain" : "Cadre, périurbain",
        problems: [
          isLuxury ? "Recherche qualité et durabilité" : "Budget limité mais veut de la qualité",
          "Manque de temps pour comparer",
          "Veut des garanties sur l'investissement"
        ],
        motivations: [
          isLuxury ? "Statut et image professionnelle" : "Rapport qualité/prix",
          "Valeurs éthiques/durables",
          "Service client de qualité"
        ],
        barriers: [
          "Prix initial élevé",
          "Crainte de faire le mauvais choix"
        ],
        budget: isLuxury ? "2000-5000€" : "500-1500€",
        channels: ["LinkedIn", "Google", "Recommandations"]
      },
      {
        id: "persona-2",
        name: "Julie Rousseau",
        title: "Entrepreneure",
        age: "25-35 ans",
        situation: "Créatrice d'entreprise, dynamique",
        problems: [
          "Doit optimiser chaque euro investi",
          "Besoin de flexibilité",
          "Recherche des partenaires fiables"
        ],
        motivations: [
          "ROI rapide",
          "Évolutivité",
          "Support réactif"
        ],
        barriers: [
          "Trésorerie limitée",
          "Peur de l'engagement long terme"
        ],
        budget: isBudget ? "100-500€" : "1000-3000€",
        channels: ["Instagram", "Facebook", "Forums spécialisés"]
      },
      {
        id: "persona-3",
        name: "Pierre Lambert",
        title: "Responsable achats",
        age: "40-55 ans",
        situation: "Entreprise établie, processus structurés",
        problems: [
          "Doit justifier chaque achat",
          "Recherche fournisseurs certifiés",
          "Contraintes de conformité"
        ],
        motivations: [
          "Fiabilité fournisseur",
          "Conditions de paiement",
          "Volume et remises"
        ],
        barriers: [
          "Processus de validation long",
          "Résistance au changement"
        ],
        budget: "Variable selon volume",
        channels: ["Email", "Salons professionnels", "Appels d'offres"]
      }
    ];
  } else {
    // Personas pour services
    personas.personas = [
      {
        id: "persona-1",
        name: "Marie Lecomte",
        title: "CEO PME",
        age: "35-50 ans",
        situation: "Dirigeante débordée",
        problems: [
          "Manque de temps pour tout gérer",
          "Besoin d'expertise pointue",
          "Difficulté à déléguer"
        ],
        motivations: [
          "Gain de temps",
          "Résultats mesurables",
          "Accompagnement personnalisé"
        ],
        barriers: [
          "Coût récurrent",
          "Perte de contrôle"
        ],
        budget: "% du CA ou forfait mensuel",
        channels: ["LinkedIn", "Recommandations", "Webinaires"]
      },
      {
        id: "persona-2", 
        name: "Alexandre Chen",
        title: "Directeur Innovation",
        age: "30-45 ans",
        situation: "Grande entreprise, budget dédié",
        problems: [
          "Pression pour innover",
          "ROI à démontrer",
          "Résistance interne"
        ],
        motivations: [
          "Expertise de pointe",
          "Méthodologie éprouvée",
          "Références solides"
        ],
        barriers: [
          "Processus d'achat complexe",
          "Mise en concurrence"
        ],
        budget: "10K-100K€ selon projet",
        channels: ["Conférences", "LinkedIn", "RFP"]
      },
      {
        id: "persona-3",
        name: "Camille Moreau", 
        title: "Freelance/Indépendant",
        age: "25-40 ans",
        situation: "Solo-entrepreneur agile",
        problems: [
          "Tout faire seul",
          "Cashflow variable",
          "Besoin ponctuel"
        ],
        motivations: [
          "Flexibilité",
          "Pas d'engagement",
          "Prix accessible"
        ],
        barriers: [
          "Budget serré",
          "Préfère le DIY"
        ],
        budget: "100-1000€/mois",
        channels: ["Google", "Communautés en ligne", "Podcasts"]
      }
    ];
  }
  
  return personas;
}