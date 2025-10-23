import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { streamMistralResponse } from "@/lib/mistral-streaming";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;

    console.log("[Generate Content Stream] Request for business:", businessId);

    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { contentItem, businessInfo } = await request.json();

    if (!contentItem || !businessInfo) {
      return new Response(
        JSON.stringify({ error: "Missing content item or business info" }),
        { status: 400 }
      );
    }

    // Vérifier la clé API Mistral
    if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'placeholder' || MISTRAL_API_KEY.length < 10) {
      return new Response(
        JSON.stringify({ error: "Mistral API key not configured" }),
        { status: 500 }
      );
    }

    // Construire le prompt
    const prompt = buildPrompt(contentItem, businessInfo);
    const systemContext = `Tu es un expert en création de contenu pour ${businessInfo.name}, ${businessInfo.description} dans l'industrie ${businessInfo.industry}.
Tu dois générer du contenu RÉEL, PUBLIABLE et ENGAGEANT.
IMPORTANT: Réponds uniquement avec le contenu demandé, sans introduction ni conclusion.
Le contenu doit être spécifique à l'entreprise et prêt à être publié.`;

    // Définir max_tokens selon le type
    const maxTokensByType: Record<string, number> = {
      'article': 5000,
      'email': 1500,
      'social': 800,
      'ad': 1000,
      'video': 3000,
      'image': 500
    };

    const maxTokens = maxTokensByType[contentItem.type] || 2000;

    console.log("[Generate Content Stream] Type:", contentItem.type);
    console.log("[Generate Content Stream] Max tokens:", maxTokens);
    console.log("[Generate Content Stream] Démarrage du streaming...");

    // Créer le stream
    const stream = await streamMistralResponse({
      apiKey: MISTRAL_API_KEY,
      model: "mistral-medium-latest",
      systemContext,
      prompt,
      maxTokens,
      temperature: 0.7,
      onChunk: (text) => {
        // Log pour debug (optionnel)
        // console.log("[Stream Chunk]:", text.slice(0, 50));
      }
    });

    // Retourner la réponse SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Désactive le buffering nginx
      }
    });

  } catch (error: any) {
    console.error('[Generate Content Stream] Error:', error);

    // Retourner une erreur en format SSE
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({
            error: error.message || 'Une erreur est survenue'
          })}\n\n`)
        );
        controller.close();
      }
    });

    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    });
  }
}

// Fonction pour construire le prompt (copié de generate-content/route.ts)
function buildPrompt(contentItem: any, businessInfo: any) {
  const { name, description, industry } = businessInfo;
  const { type, title, description: itemDescription, platform, targetAudience, tone, marketingObjective } = contentItem;

  let baseContext = `Tu es un expert en création de contenu pour ${name}, ${description}.\n`;
  baseContext += `Secteur: ${industry}\n`;

  if (targetAudience) {
    baseContext += `\nAudience cible spécifique pour ce contenu: ${targetAudience}\n`;
  }

  if (tone) {
    baseContext += `Ton: ${tone}\n`;
  }

  if (marketingObjective) {
    baseContext += `Objectif marketing: ${marketingObjective}\n`;
  }

  // Instructions spécifiques par type
  if (type === "social") {
    const platforms = Array.isArray(platform) ? platform : [platform];
    const platformStr = platforms.join(", ");

    return `${baseContext}

Tu dois générer un post pour ${platformStr}.
Titre/Thème: "${title}"
Description/Contexte: ${itemDescription}

INSTRUCTIONS:
Génère un post RÉEL et PUBLIABLE qui suit ces exigences:

${platforms.includes('linkedin') ? `LinkedIn:
- Format: Post professionnel avec storytelling
- Structure: Hook → Histoire/Insight → Valeur → CTA
- Longueur: 1200-1500 caractères
- Hashtags: 3-5 pertinents
- Ton: Professionnel mais humain
- Inclure: Statistiques, cas concrets, leçons apprises` : ''}

${platforms.includes('facebook') ? `Facebook:
- Format: Post engageant avec question
- Structure: Accroche → Contexte → Question d'engagement
- Longueur: 400-800 caractères
- Emojis: 3-5 bien placés
- Ton: Convivial et accessible
- Inclure: Question ouverte à la fin` : ''}

${platforms.includes('instagram') ? `Instagram:
- Format: Caption visuelle et inspirante
- Structure: Hook fort → Story → CTA + Hashtags
- Longueur: 1500-2000 caractères
- Hashtags: 15-25 (mix populaires + niche)
- Emojis: Utilisation généreuse
- Inclure: Appel à sauvegarder/partager` : ''}

${platforms.includes('twitter') ? `Twitter:
- Format: Thread de 3-5 tweets
- Structure: Hook → Points clés → Conclusion
- Longueur: 280 caractères par tweet
- Hashtags: 1-2 maximum
- Style: Concis et percutant` : ''}

IMPORTANT: Le contenu doit être 100% prêt à publier, pas de placeholders.

Post généré:`;

  } else if (type === "article") {
    return `${baseContext}
Tu dois rédiger un article de blog professionnel.
Titre: "${title}"
Contexte: ${itemDescription}

INSTRUCTIONS:
Rédige un article COMPLET et PUBLIABLE selon ces critères:

STRUCTURE DÉTAILLÉE:
1. Titre accrocheur et SEO-friendly
2. Introduction (150-200 mots):
   - Hook puissant
   - Problématique claire
   - Promesse de valeur

3. Corps de l'article (4-5 sections):
   - Sous-titres descriptifs (H2)
   - Paragraphes de 3-4 phrases
   - Données/statistiques récentes
   - Exemples concrets
   - Conseils actionnables

4. Conclusion (100-150 mots):
   - Résumé des points clés
   - CTA spécifique
   - Ouverture sur l'avenir

FORMAT:
- Longueur: 800-1200 mots
- Style: Professionnel mais accessible
- Inclure: Listes à puces, citations, données
- SEO: Mots-clés naturellement intégrés

Article complet:`;

  } else if (type === "email") {
    return `${baseContext}
Tu dois créer un email marketing performant.
Sujet: "${title}"
Contexte: ${itemDescription}

INSTRUCTIONS:
Crée un email PRÊT À ENVOYER selon ces spécifications:

STRUCTURE:
1. Ligne d'objet (50-60 caractères):
   - Personnalisée
   - Créant l'urgence/curiosité
   - Sans mots spam

2. Pré-header (80-100 caractères)

3. Corps de l'email:
   - Salutation personnalisée
   - Hook d'ouverture (1-2 phrases)
   - Problème/besoin identifié
   - Solution proposée avec bénéfices
   - Preuve sociale/témoignage
   - CTA principal (bouton)
   - P.S. avec offre secondaire

FORMAT:
- Longueur: 150-250 mots
- Paragraphes courts (2-3 lignes)
- Un seul CTA principal
- Mobile-friendly

Email complet:`;

  } else {
    return `${baseContext}
Crée du contenu pour "${title}".
Type: ${type}
Contexte: ${itemDescription}

Le contenu doit être professionnel, engageant et prêt à être utilisé.

Contenu:`;
  }
}
