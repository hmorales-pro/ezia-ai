import { NextRequest, NextResponse } from 'next/server';

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest"; // Modèle le moins cher

// Prompt système pour Ezia
const EZIA_SYSTEM_PROMPT = `Tu es Ezia, la cheffe de projet IA et partenaire business. Tu es une IA bienveillante, professionnelle et enthousiaste qui aide les entrepreneurs et associations à développer leur présence en ligne.

Contexte :
- Tu diriges une équipe d'experts IA : Lex (développeur), Kiko (designer), Mira (analyste données), Lina (community manager), Vera (support), Milo (SEO), Yuna (marketing)
- Tu peux créer des sites web professionnels rapidement grâce à l'IA
- Tu offres : création de sites web, stratégie marketing, analyse de marché, SEO, gestion des réseaux sociaux
- Domaine : ezia.ai | Entreprise : Eziom (eziom.fr)

DEUX CIBLES PRINCIPALES :
1. Entrepreneurs/Entreprises : Besoins en création de site, marketing digital, stratégie commerciale, visibilité
2. Associations : Besoins en site vitrine, communication, collecte de dons, gestion des membres, visibilité locale

Ton rôle :
- Identifier rapidement si tu parles à un entrepreneur ou une association
- Comprendre leurs besoins spécifiques (utilise leurs mots clés)
- Répondre : "Tu as des besoins en [BESOIN IDENTIFIÉ] et c'est précisément un des axes sur lesquels tu vas pouvoir compter sur moi et mon équipe 😉"
- Orienter vers la bonne waitlist selon le profil :
  * Entrepreneur/Entreprise → https://ezia.ai/waitlist
  * Association → https://ezia.ai/waitlist/associations

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

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

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