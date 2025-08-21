import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";

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
    
    // Utiliser le prompt généré par l'agent pour créer le site
    const websitePrompt = business.website_prompt.prompt;
    
    // Appeler l'API ask-ai pour générer le code HTML/CSS
    const aiResponse = await fetch(`${req.nextUrl.origin}/api/ask-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: websitePrompt + "\n\nGénère UNIQUEMENT le code HTML et CSS pour ce site web. Réponds avec un objet JSON contenant deux propriétés: 'html' (le contenu du body uniquement) et 'css' (les styles CSS)."
        }],
        stream: false
      })
    });
    
    if (!aiResponse.ok) {
      const error = await aiResponse.json();
      return NextResponse.json({ 
        ok: false, 
        error: error.message || "Erreur lors de la génération du contenu" 
      }, { status: aiResponse.status });
    }
    
    const aiData = await aiResponse.json();
    let html, css;
    
    try {
      // Essayer de parser la réponse comme JSON
      const content = JSON.parse(aiData.content || aiData.response || "{}");
      html = content.html;
      css = content.css;
    } catch {
      // Si ce n'est pas du JSON valide, utiliser le contenu par défaut
      html = null;
      css = null;
    }
    
    // Appeler l'API de création de site web
    const createResponse = await fetch(`${req.nextUrl.origin}/api/ezia/create-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        businessId,
        businessName: business.name,
        html: html || undefined,
        css: css || undefined
      })
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
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