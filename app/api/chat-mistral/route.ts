import { NextRequest, NextResponse } from 'next/server';

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest"; // Modèle le moins cher

// Prompt système pour l'assistant description business
const BUSINESS_DESCRIPTION_ASSISTANT_PROMPT = `Tu es un assistant spécialisé dans l'aide à la rédaction de descriptions de business complètes et optimales pour l'analyse par IA.

Ton rôle :
1. Poser des questions ciblées pour obtenir les informations manquantes
2. Creuser sur les détails importants : zone géographique, public cible précis, différenciation, valeur ajoutée
3. Reformuler les réponses vagues en questions plus précises
4. Une fois que tu as suffisamment d'informations (localisation, cible, offre, différenciation, objectif), générer une description complète

Questions à explorer :
- 📍 Localisation : Ville, région, national, international ?
- 🎯 Cible : Qui sont les clients idéaux ? (âge, profession, besoins spécifiques)
- 💡 Différenciation : Qu'est-ce qui rend ce business unique ?
- 🎨 Offre : Produits/services principaux et leur valeur ajoutée ?
- 🚀 Mission : Quel problème résout-on ? Quel impact veut-on avoir ?

Format de conversation :
- Questions courtes et précises (une à la fois)
- Tutoiement et ton encourageant
- Rebondir sur les réponses pour creuser
- Pas plus de 3-4 échanges avant de générer la description

Quand générer la description finale :
- Dès que tu as : localisation + cible précise + offre claire + différenciation + objectif
- Format : 3-5 phrases denses et détaillées
- Inclure TOUS les détails récoltés
- Ton professionnel mais engageant
- Répondre UNIQUEMENT avec la description (pas de "Voici la description:", juste la description directe)

Détection de description complète :
Si tu détectes que l'utilisateur a suffisamment d'informations pour générer la description, réponds EXACTEMENT dans ce format JSON :
{
  "type": "final_description",
  "description": "La description complète ici"
}`;

// Prompt système pour Ezia
const EZIA_SYSTEM_PROMPT = `Tu es Ezia, la cheffe de projet IA et partenaire business. Tu es une IA bienveillante, professionnelle et enthousiaste qui aide les entrepreneurs et associations à développer leur présence en ligne.

Contexte :
- Tu diriges une équipe d'experts IA : Lex (développeur), Kiko (designer), Mira (analyste données), Lina (community manager), Vera (support), Milo (SEO), Yuna (marketing)
- Tu peux créer des sites web professionnels rapidement grâce à l'IA
- Tu offres : création de sites web, stratégie marketing, analyse de marché, SEO, gestion des réseaux sociaux
- Domaine : ezia.ai | Entreprise : Eziom (eziom.fr)

DEUX CIBLES PRINCIPALES :
1. **Entrepreneurs qui démarrent** (→ /waitlist) :
   - Porteurs de projet, idée à valider
   - Jeunes entrepreneurs, freelances qui se lancent
   - Commerçants locaux qui veulent se digitaliser
   - TPE qui n'ont pas encore tout défini
   - Besoins : création site web, stratégie de lancement, validation marché, marketing de base

2. **Entreprises établies** (→ /waitlist-enterprise) :
   - Entreprises avec clients et ventes existantes
   - Utilisent déjà plusieurs outils (Stripe, CRM, analytics...)
   - Ont des données mais peinent à les comprendre
   - Perdent du temps en reporting manuel
   - Besoins : unifier leurs données, comprendre ce qui marche, alertes intelligentes

Ton rôle :
- Identifier rapidement dans quelle catégorie ils sont
- Écouter les indices : "je me lance", "j'ai une idée" → /waitlist
- Écouter les indices : "mes clients", "mes ventes", "mes outils", "mes données" → /waitlist-enterprise
- Répondre : "Tu as des besoins en [BESOIN IDENTIFIÉ] et c'est précisément un des axes sur lesquels tu vas pouvoir compter sur moi et mon équipe 😉"
- Orienter vers la bonne waitlist :
  * Démarrage/Lancement → https://ezia.ai/waitlist
  * Entreprise établie avec données → https://ezia.ai/waitlist-enterprise

Règles importantes :
- Parle à la première personne : utilise "je peux", "nous pouvons", "mon équipe et moi"
- Sois concise (2-3 paragraphes max)
- TOUJOURS inclure : "Inscris-toi pour rejoindre les premiers utilisateurs prochainement : [URL appropriée]"
- Utilise le tutoiement pour créer de la proximité
- Un emoji maximum par message
- Adapte ton vocabulaire : "association" pour les assos, "entreprise/business" pour les entrepreneurs

Tu ne peux PAS :
- Générer du code HTML complet
- Faire des analyses approfondies sans compte
- Donner accès aux fonctionnalités complètes

Format de réponse : Markdown simple, pas de titres H1/H2 sauf si vraiment nécessaire.`;

// Handler pour l'assistant description business
async function handleBusinessDescriptionAssistant(messages: any[], context: any) {
  const mistralApiKey = process.env.MISTRAL_API_KEY;

  if (!mistralApiKey || mistralApiKey === 'placeholder' || mistralApiKey.length < 10) {
    return NextResponse.json({
      success: false,
      message: "Désolé, l'assistant n'est pas disponible pour le moment. Essayez de rédiger votre description manuellement."
    });
  }

  // Ajouter le contexte business dans le prompt système
  const systemPrompt = `${BUSINESS_DESCRIPTION_ASSISTANT_PROMPT}

Contexte du business :
- Nom : ${context.businessName}
- Secteur : ${context.industry}
${context.currentDescription ? `- Description actuelle : ${context.currentDescription}` : ''}`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!response.ok) {
      console.error("Erreur Mistral API:", await response.text());
      return NextResponse.json({
        success: false,
        message: "Une erreur est survenue. Pouvez-vous reformuler ?"
      });
    }

    const data = await response.json();
    const assistantResponse = data.choices[0]?.message?.content || "";

    // Détecter si c'est une description finale (JSON)
    let finalDescription = null;
    try {
      const jsonMatch = assistantResponse.match(/\{[\s\S]*"type":\s*"final_description"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.type === "final_description") {
          finalDescription = parsed.description;
        }
      }
    } catch (e) {
      // Pas de JSON, c'est une question normale
    }

    return NextResponse.json({
      success: true,
      message: finalDescription ?
        "Parfait ! Voici la description complète que j'ai rédigée pour toi. Tu peux la valider ou me demander de la modifier." :
        assistantResponse,
      finalDescription: finalDescription
    });

  } catch (error) {
    console.error('Erreur assistant description:', error);
    return NextResponse.json({
      success: false,
      message: "Désolé, une erreur est survenue. Peux-tu réessayer ?"
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [], messages, context } = await req.json();

    // Gestion spécifique pour l'assistant description business
    if (context?.task === "business_description_assistant") {
      return handleBusinessDescriptionAssistant(messages, context);
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Utiliser la clé API Mistral depuis les variables d'environnement
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    
    // Vérifier si la clé API est valide (pas vide et pas "placeholder")
    if (!mistralApiKey || mistralApiKey === 'placeholder' || mistralApiKey.length < 10) {
      // Réponse par défaut si pas de clé API valide
      return NextResponse.json({
        content: "Bonjour ! Je suis Ezia, votre partenaire business IA. 🌟\n\nJe suis ravie de vous accueillir ! Je dirige une équipe d'experts en IA et ensemble, nous pouvons créer votre site web, développer votre stratégie marketing et faire grandir votre entreprise.\n\nPour que je puisse mobiliser toutes mes capacités et celles de mon équipe, créez votre compte gratuit. C'est rapide et sans engagement !\n\nQu'est-ce qui vous amène aujourd'hui ? Un projet de site web ? Des questions sur le marketing digital ?",
        isDefault: true
      });
    }

    // Préparer les messages pour l'API Mistral
    const messages = [
      { role: "system", content: EZIA_SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Appel à l'API Mistral
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500, // Limiter pour réduire les coûts
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Mistral API:", errorText);
      console.error("Status:", response.status);
      console.error("Headers:", response.headers);
      
      // Si c'est une erreur 401, la clé est invalide
      if (response.status === 401) {
        console.error("Clé API Mistral invalide ou expirée");
      }
      
      // Réponse de fallback en cas d'erreur
      return NextResponse.json({
        content: "Je suis désolée, j'ai un petit souci technique. 😅\n\nMais je peux quand même vous dire que je peux créer un site web professionnel en quelques minutes, développer une stratégie marketing personnalisée et bien plus avec mon équipe !\n\nCréez votre compte gratuit pour découvrir tout ce que nous pouvons faire ensemble. Qu'est-ce qui vous intéresse le plus ?",
        isDefault: true
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Je suis là pour vous aider !";

    return NextResponse.json({
      content: aiResponse,
      isDefault: false
    });

  } catch (error) {
    console.error('Erreur chat Mistral:', error);
    return NextResponse.json({
      content: "Bonjour ! Je suis Ezia, votre conseillère business IA. 🚀\n\nMême si j'ai un petit problème technique, je peux vous assurer que mon équipe et moi pouvons créer votre présence en ligne rapidement et facilement.\n\nCréez votre compte gratuit pour accéder à toutes nos fonctionnalités. Parlez-moi de votre projet !",
      isDefault: true
    });
  }
}