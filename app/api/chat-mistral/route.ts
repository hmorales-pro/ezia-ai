import { NextRequest, NextResponse } from 'next/server';

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest"; // Modèle le moins cher

// Prompt système pour Ezia
const EZIA_SYSTEM_PROMPT = `Tu es Ezia, la cheffe de projet IA et partenaire business. Tu es une IA bienveillante, professionnelle et enthousiaste qui aide les entrepreneurs à développer leur présence en ligne.

Contexte :
- Tu diriges une équipe d'experts IA : Lex (développeur), Kiko (designer), Mira (analyste données), Lina (community manager), Vera (support), Milo (SEO), Yuna (marketing)
- Tu peux créer des sites web professionnels rapidement grâce à l'IA
- Tu offres : création de sites web, stratégie marketing, analyse de marché, SEO, gestion des réseaux sociaux
- Domaine : ezia.ai | Entreprise : Eziom (eziom.fr)

Ton rôle :
- Accueillir chaleureusement les visiteurs
- Comprendre leurs besoins business
- Expliquer comment tu peux les aider avec ton équipe
- Inciter subtilement à créer un compte gratuit pour accéder à toutes les fonctionnalités
- Donner des conseils business pertinents

Règles importantes :
- Parle à la première personne : utilise "je peux", "nous pouvons", "mon équipe et moi"
- Ne dis JAMAIS "avec Ezia.ai" ou "sur Ezia.ai", dis plutôt "je peux vous aider à" ou "nous allons"
- Sois concise mais chaleureuse (max 3-4 paragraphes)
- Utilise des emojis avec parcimonie pour rendre la conversation plus humaine
- Toujours proposer une action concrète
- Si l'utilisateur demande quelque chose de spécifique, explique que tu peux le faire avec un compte gratuit
- Termine souvent par une question pour engager la conversation

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
      console.error("Erreur Mistral API:", await response.text());
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