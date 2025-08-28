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
    
    console.log('[Generate Website] Using prompt:', websitePrompt.substring(0, 200) + '...');
    
    // Créer un prompt plus explicite pour l'IA
    const aiPrompt = `Tu es un expert en création de sites web. Génère un site web professionnel basé sur les informations suivantes:

${websitePrompt}

IMPORTANT: Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.
Le JSON doit avoir exactement cette structure:
{
  "html": "<body><!-- contenu HTML du body uniquement, sans balises html, head ou body --></body>",
  "css": "/* Tous les styles CSS */"
}

Assure-toi que:
1. Le HTML contient UNIQUEMENT le contenu du body (sans les balises <body>)
2. Le CSS est complet avec tous les styles nécessaires
3. Le design est moderne, responsive et professionnel
4. Les couleurs correspondent au secteur d'activité
5. Le contenu est en français

Réponds UNIQUEMENT avec le JSON, rien d'autre.`;

    // Appeler l'API ask-ai pour générer le code HTML/CSS - SANS streaming pour éviter les problèmes de parsing
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
        stream: false,  // Désactiver le streaming pour obtenir la réponse complète
        model: 'mistral-large',  // Utiliser un modèle spécifique
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
    
    // Lire la réponse comme texte pour mieux la traiter
    const responseText = await aiResponse.text();
    console.log('[Generate Website] AI Response (first 500 chars):', responseText.substring(0, 500));
    
    let html, css;
    
    try {
      // Essayer de trouver un objet JSON dans la réponse
      // Parfois l'IA peut ajouter du texte avant ou après
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const content = JSON.parse(jsonStr);
        html = content.html;
        css = content.css;
        
        console.log('[Generate Website] Successfully parsed JSON response');
        console.log('[Generate Website] HTML length:', html?.length || 0);
        console.log('[Generate Website] CSS length:', css?.length || 0);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error('[Generate Website] Failed to parse AI response:', parseError);
      console.log('[Generate Website] Full response:', responseText);
      
      // En cas d'échec, essayer d'extraire le HTML et CSS directement
      // Chercher des patterns HTML/CSS dans la réponse
      const htmlMatch = responseText.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
      const cssMatch = responseText.match(/\{[^}]+\}|\.[\w-]+\s*\{[^}]+\}|#[\w-]+\s*\{[^}]+\}/);
      
      if (htmlMatch) {
        html = htmlMatch[0];
        console.log('[Generate Website] Extracted HTML from response');
      }
      
      if (cssMatch) {
        css = cssMatch[0];
        console.log('[Generate Website] Extracted CSS from response');
      }
      
      // Si toujours pas de contenu, retourner une erreur claire
      if (!html && !css) {
        return NextResponse.json({ 
          ok: false, 
          error: "L'IA n'a pas pu générer le site web. Veuillez réessayer." 
        }, { status: 500 });
      }
    }
    
    // Log pour debug
    console.log('[Generate Website] Sending to create-website:', {
      hasHtml: !!html,
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
        html: html,  // Passer directement, pas undefined
        css: css,    // Passer directement, pas undefined
        prompt: websitePrompt
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