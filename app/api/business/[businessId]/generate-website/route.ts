import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { webGenerator } from "@/lib/specialized-web-models";

declare global {
  let businesses: Array<{
    business_id: string;
    userId: string;
    name: string;
    description: string;
    website_prompt?: {
      prompt: string;
      key_features: string[];
      design_style: string;
      target_impression: string;
    };
    hasWebsite?: string;
    website_url?: string;
    websiteGeneratedAt?: string;
    space_id?: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const { businessId } = await params;
    
    // Trouver le business
    const business = global.businesses?.find(
      b => b.business_id === businessId && b.userId === user.id
    );
    
    if (!business) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }
    
    // Vérifier que le prompt du site web est disponible
    if (!business.website_prompt?.prompt) {
      return NextResponse.json({ 
        ok: false, 
        error: "Le prompt du site web n'est pas encore généré. Veuillez attendre que les analyses soient terminées." 
      }, { status: 400 });
    }
    
    console.log('[Generate Website] Using specialized web models for generation');
    
    // Préparer le contexte business pour la génération
    const businessContext = {
      name: business.name,
      type: business.website_prompt.design_style || 'modern',
      description: business.description,
      features: business.website_prompt.key_features || [],
      style: business.website_prompt.design_style as 'modern' | 'classic' | 'minimal' | 'bold' || 'modern',
      targetImpression: business.website_prompt.target_impression
    };
    
    let html: string;
    
    try {
      // Utiliser le générateur spécialisé pour créer le site
      console.log('[Generate Website] Generating web structure with specialized model...');
      html = await webGenerator.generateWebStructure(businessContext);
      
      // Générer du contenu SEO optimisé
      console.log('[Generate Website] Generating SEO content...');
      const seoContent = await webGenerator.generateSEOContent({
        name: business.name,
        description: business.description,
        targetAudience: business.website_prompt.target_impression
      });
      
      // Injecter le contenu SEO dans le HTML
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${seoContent.title}</title>`);
      html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${seoContent.metaDescription}">`);
      
      // Si le HTML contient des placeholders, les remplacer
      if (html.includes('${')) {
        html = html.replace(/\${business\.name}/g, business.name);
        html = html.replace(/\${business\.description}/g, business.description);
        html = html.replace(/\${seo\.h1}/g, seoContent.h1);
        html = html.replace(/\${seo\.heroText}/g, seoContent.heroText);
        html = html.replace(/\${seo\.ctaText}/g, seoContent.ctaText);
      }
      
      console.log('[Generate Website] Website generated successfully with specialized models');
      
    } catch (error) {
      console.error('[Generate Website] Specialized generation failed, falling back to standard AI:', error);
      
      // Fallback sur l'ancienne méthode si le générateur spécialisé échoue
      const aiPrompt = `Tu es un expert en création de sites web. Génère un site web professionnel basé sur les informations suivantes:

${business.website_prompt.prompt}

IMPORTANT: Tu dois générer un fichier HTML COMPLET avec tout le code nécessaire.
Le site doit être:
1. Moderne, responsive et professionnel
2. Avec un design ${businessContext.style}
3. En français
4. Avec du CSS inline pour la simplicité

Commence directement par <!DOCTYPE html>`;

      const aiResponse = await fetch(`${req.nextUrl.origin}/api/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: aiPrompt
          }],
          stream: false,
          model: 'mistral-large',
          provider: 'auto',
          businessId: businessId
        })
      });
      
      if (!aiResponse.ok) {
        const error = await aiResponse.json();
        console.error('[Generate Website] AI API error:', error);
        return NextResponse.json({ 
          ok: false, 
          error: error.message || "Erreur lors de la génération du contenu" 
        }, { status: aiResponse.status });
      }
      
      const responseText = await aiResponse.text();
      
      // Extraire le HTML de la réponse
      const htmlMatch = responseText.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
      if (htmlMatch) {
        html = htmlMatch[0];
      } else {
        // Si pas de HTML complet, essayer de construire un document valide
        const bodyMatch = responseText.match(/<body[^>]*>[\s\S]*<\/body>/i);
        if (bodyMatch) {
          html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${business.name}</title>
</head>
${bodyMatch[0]}
</html>`;
        } else {
          return NextResponse.json({ 
            ok: false, 
            error: "Impossible de générer le site web. Veuillez réessayer." 
          }, { status: 500 });
        }
      }
    }
    
    // Extraire le CSS du HTML pour le passer séparément si nécessaire
    let css = '';
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      css = styleMatch[1];
    }
    
    // Pour l'API create-website, on doit extraire le body du HTML complet
    let bodyContent = '';
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }
    
    // Log pour debug
    console.log('[Generate Website] Sending to create-website:', {
      hasHtml: !!bodyContent,
      hasCss: !!css,
      businessId,
      businessName: business.name
    });
    
    // Appeler l'API de création de site web avec le contenu généré
    const createResponse = await fetch(`${req.nextUrl.origin}/api/ezia/create-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        businessId,
        businessName: business.name,
        html: bodyContent || html,  // Utiliser le body extrait ou le HTML complet
        css: css,
        prompt: business.website_prompt.prompt
      })
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('[Generate Website] Create website error:', error);
      return NextResponse.json({ 
        ok: false, 
        error: error.error || "Erreur lors de la création du site" 
      }, { status: createResponse.status });
    }
    
    const result = await createResponse.json();
    
    // Mettre à jour le business avec les informations du site
    const businessIndex = global.businesses.findIndex(b => b.business_id === businessId);
    if (businessIndex !== -1) {
      global.businesses[businessIndex].hasWebsite = 'yes';
      global.businesses[businessIndex].website_url = result.project.url;
      global.businesses[businessIndex].websiteGeneratedAt = new Date().toISOString();
      global.businesses[businessIndex].space_id = result.project.space_id;
    }
    
    return NextResponse.json({ 
      ok: true, 
      ...result
    });
    
  } catch (error) {
    console.error('[Generate Website] Error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Erreur lors de la génération du site web" 
    }, { status: 500 });
  }
}