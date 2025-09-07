import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { webGenerator } from "@/lib/specialized-web-models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    console.log("[Generate Blog] Request for business:", businessId);
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, tone, length, keywords, businessInfo } = await request.json();
    
    if (!topic || !businessInfo) {
      return NextResponse.json(
        { error: "Missing topic or business info" },
        { status: 400 }
      );
    }

    console.log("[Generate Blog] Generating blog post with specialized model...");
    console.log("[Generate Blog] Topic:", topic);
    console.log("[Generate Blog] Business:", businessInfo.name);
    console.log("[Generate Blog] Industry:", businessInfo.industry);

    try {
      // Utiliser le générateur spécialisé pour créer l'article
      const blogPost = await webGenerator.generateBlogPost({
        title: topic,
        business: businessInfo.name,
        industry: businessInfo.industry,
        keywords: keywords || [],
        tone: tone || 'professional',
        length: length || 'medium'
      });

      console.log("[Generate Blog] Blog post generated successfully");
      
      return NextResponse.json({ 
        success: true,
        blogPost,
        model: "specialized-blog-writer"
      });
      
    } catch (error) {
      console.error("[Generate Blog] Specialized generation failed:", error);
      
      // Fallback sur une génération plus simple
      const fallbackPrompt = `Écris un article de blog ${tone || 'professionnel'} pour ${businessInfo.name} (${businessInfo.industry}).

Sujet: ${topic}
Longueur: ${length === 'short' ? '500' : length === 'long' ? '2000' : '1000'} mots
${keywords?.length ? `Mots-clés à inclure: ${keywords.join(', ')}` : ''}

Structure l'article avec:
- Un titre accrocheur
- Une introduction engageante
- Des sections avec sous-titres
- Des exemples pratiques
- Une conclusion avec appel à l'action

Écris en français de manière fluide et naturelle.`;

      // Utiliser l'API ask-ai comme fallback
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: fallbackPrompt
          }],
          stream: false,
          model: 'mistral-large',
          provider: 'auto',
          businessId: businessId
        })
      });

      if (!aiResponse.ok) {
        throw new Error("Fallback AI generation failed");
      }

      const responseText = await aiResponse.text();
      
      // Créer un format de blog post à partir de la réponse
      const titleMatch = responseText.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : topic;
      
      return NextResponse.json({
        success: true,
        blogPost: {
          title,
          content: responseText,
          excerpt: responseText.substring(0, 200).replace(/[#*]/g, '').trim() + '...',
          tags: keywords || [],
          seoTitle: title.substring(0, 60),
          seoDescription: responseText.substring(0, 160).replace(/[#*]/g, '').trim()
        },
        model: "fallback-ai"
      });
    }
    
  } catch (error) {
    console.error("[Generate Blog] Error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate blog post",
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retourner des suggestions de sujets d'articles basées sur l'industrie
    const suggestions = {
      "restaurant": [
        "Les tendances culinaires à suivre cette année",
        "Comment fidéliser vos clients avec un programme de récompenses",
        "L'importance des avis en ligne pour votre restaurant",
        "Guide pour créer un menu saisonnier attractif",
        "Les meilleures pratiques d'hygiène en restauration"
      ],
      "technologie": [
        "L'impact de l'IA sur votre secteur d'activité",
        "Cybersécurité : protéger votre entreprise des menaces",
        "Les outils de productivité indispensables",
        "Transformation digitale : par où commencer ?",
        "Les tendances tech à surveiller"
      ],
      "sante": [
        "La télémédecine : opportunités et défis",
        "Comment améliorer l'expérience patient",
        "Les innovations en santé connectée",
        "Gestion des données de santé et RGPD",
        "Prévention et bien-être au travail"
      ],
      "commerce": [
        "Stratégies pour augmenter vos ventes en ligne",
        "L'expérience client omnicanale",
        "Comment optimiser votre logistique",
        "Les tendances e-commerce à adopter",
        "Fidélisation client : les meilleures pratiques"
      ],
      "default": [
        "Comment améliorer votre présence en ligne",
        "Les stratégies marketing qui fonctionnent",
        "Optimiser votre processus de vente",
        "La satisfaction client comme levier de croissance",
        "Innovation : comment rester compétitif"
      ]
    };

    // Pour l'instant, on retourne des suggestions génériques
    // Plus tard, on pourra analyser le business pour des suggestions personnalisées
    return NextResponse.json({
      success: true,
      suggestions: suggestions.default,
      message: "Voici quelques idées d'articles pour votre blog"
    });
    
  } catch (error) {
    console.error("[Generate Blog] Error getting suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get blog suggestions" },
      { status: 500 }
    );
  }
}