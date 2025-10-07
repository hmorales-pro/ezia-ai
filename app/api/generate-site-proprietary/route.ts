import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient, LLM_CONFIGS } from '@/lib/llm-client';
import { renderSite } from '@/lib/renderer';
import Ajv from 'ajv';
import siteSchema from '@/lib/schemas/site.schema.json';

// Initialize JSON Schema validator
const ajv = new Ajv();
const validateSite = ajv.compile(siteSchema);

// System prompt for site generation
const SITE_GENERATION_SYSTEM_PROMPT = `Tu es un générateur de sites web professionnel spécialisé.

Tu génères un site web complet et structuré en JSON valide avec cette structure:

{
  "id": "site_unique_id",
  "title": "Titre du site",
  "description": "Description du site",
  "locale": "fr",
  "theme": {
    "name": "Theme Name",
    "tokens": {
      "colors": {
        "primary": "#hex",
        "secondary": "#hex", 
        "accent": "#hex",
        "background": "#hex",
        "surface": "#hex",
        "text": "#hex",
        "textSecondary": "#hex",
        "border": "#hex"
      },
      "typography": {
        "fontFamily": { "heading": "Font", "body": "Font", "mono": "Font" },
        "fontSize": { "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem" },
        "fontWeight": { "light": 300, "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
        "lineHeight": { "tight": "1.25", "normal": "1.5", "relaxed": "1.75" }
      },
      "spacing": { "xs": "0.5rem", "sm": "0.75rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "3xl": "4rem", "4xl": "6rem" },
      "borderRadius": { "none": "0", "sm": "0.125rem", "md": "0.375rem", "lg": "0.5rem", "full": "9999px" },
      "shadows": { "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }
    }
  },
  "pages": [
    {
      "id": "home",
      "title": "Accueil",
      "slug": "home",
      "blocks": [
        {
          "id": "header",
          "type": "navigation",
          "component": "HeaderNav",
          "props": {
            "logo": "Nom du business",
            "links": [
              { "label": "Accueil", "href": "#home" },
              { "label": "Services", "href": "#services" },
              { "label": "Contact", "href": "#contact" }
            ]
          }
        },
        {
          "id": "hero",
          "type": "content",
          "component": "Hero",
          "props": {
            "title": "Titre principal accrocheur",
            "description": "Description percutante du business",
            "ctaText": "Appel à l'action"
          }
        },
        {
          "id": "features",
          "type": "content", 
          "component": "FeatureGrid",
          "props": {
            "title": "Nos Services",
            "features": [
              { "title": "Service 1", "description": "Description du service 1", "icon": "🌟" },
              { "title": "Service 2", "description": "Description du service 2", "icon": "🚀" },
              { "title": "Service 3", "description": "Description du service 3", "icon": "💎" }
            ]
          }
        },
        {
          "id": "testimonials",
          "type": "content",
          "component": "TestimonialCarousel", 
          "props": {
            "title": "Témoignages Clients",
            "testimonials": [
              { "name": "Client 1", "role": "Rôle 1", "quote": "Témoignage 1" },
              { "name": "Client 2", "role": "Rôle 2", "quote": "Témoignage 2" }
            ]
          }
        },
        {
          "id": "cta",
          "type": "content",
          "component": "CTASection",
          "props": {
            "title": "Prêt à commencer ?",
            "description": "Description du CTA",
            "primaryButtonText": "Contactez-nous",
            "secondaryButtonText": "En savoir plus"
          }
        },
        {
          "id": "footer",
          "type": "navigation",
          "component": "FooterSimple",
          "props": {
            "siteTitle": "Nom du business",
            "description": "Description courte du business",
            "columns": [
              {
                "title": "Liens rapides",
                "links": [
                  { "label": "Accueil", "href": "#" },
                  { "label": "Services", "href": "#" },
                  { "label": "Contact", "href": "#" }
                ]
              }
            ],
            "copyright": "© 2024 Nom du business. Tous droits réservés."
          }
        }
      ]
    }
  ],
  "navigation": {
    "header": { "logo": "Nom du business", "links": [...] },
    "footer": { "siteTitle": "Nom du business", "description": "...", "columns": [...], "copyright": "..." }
  },
  "assets": []
}

RÈGLES IMPORTANTES:
1. Utiliser uniquement les composants disponibles: Hero, FeatureGrid, TestimonialCarousel, CTASection, HeaderNav, FooterSimple
2. Couleurs en format hexadécimal (#RRGGBB)
3. Typographie web-safe (Inter, Playfair Display, etc.)
4. Spacing et shadows doivent avoir des valeurs valides
5. Pas de valeurs "undefined" ou nulles
6. Structure cohérente avec header, hero, features, testimonials, cta, footer
7. Contenu réaliste et professionnel

Génère maintenant le site en fonction du brief utilisateur.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessInfo } = body;

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: 'Prompt requis' },
        { status: 400 }
      );
    }

    console.log('Generating proprietary site for:', prompt.substring(0, 100) + '...');

    // Create LLM client
    const llmClient = createLLMClient({
      ...LLM_CONFIGS.mistral,
      apiKey: process.env.MISTRAL_API_KEY,
      temperature: 0.7,
      maxTokens: 4000
    });

    // Build user prompt with business context
    const businessName = businessInfo?.name || '';
    const businessDescription = businessInfo?.description || '';
    const industry = businessInfo?.industry || 'Services professionnels';
    const tone = businessInfo?.tone || 'Professional';

    const userPrompt = `Business: ${businessName}
Industry: ${industry}
Tone: ${tone}
Description: ${businessDescription}

Brief: ${prompt}

Génère un site web professionnel avec:
- Un design moderne et responsive
- Des couleurs harmonieuses et professionnelles  
- Une typographie lisible et élégante
- Une structure de page logique

Composants à inclure:
1. Header avec navigation (logo + liens)
2. Hero section principale (titre accrocheur + description + CTA)
3. Section services/features (3-6 fonctionnalités avec icônes)
4. Section témoignages (2-4 témoignages clients)
5. Section call-to-action (titre + description + boutons)
6. Footer avec informations (logo + colonnes + copyright)

RÈGLES IMPORTANTES:
1. Theme complet avec toutes les valeurs requises
2. Navigation header et footer avec liens cohérents
3. Structure: header → hero → features → testimonials → cta → footer
4. Couleurs hexadécimales valides
5. Typographie web-safe
6. Spacing et shadows définis
7. Pas de valeurs "undefined"

Le site doit être complet, fonctionnel et esthétique.`;

    // Generate complete response
    const siteJson = await llmClient.generateCompleteResponse(
      SITE_GENERATION_SYSTEM_PROMPT,
      userPrompt,
      { formatJson: true }
    );

    // Parse the generated JSON
    let siteData;
    try {
      // Clean the response if needed
      const cleanJson = siteJson.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
      siteData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse generated JSON:', parseError);
      console.log('Raw response:', siteJson);
      throw new Error('Le format JSON généré est invalide');
    }

    // Post-process: Normalize data to match schema requirements
    if (siteData.theme?.tokens) {
      // Convert numeric lineHeight values to strings (AI sometimes ignores format)
      if (siteData.theme.tokens.typography?.lineHeight) {
        const lh = siteData.theme.tokens.typography.lineHeight;
        if (typeof lh.tight === 'number') lh.tight = String(lh.tight);
        if (typeof lh.normal === 'number') lh.normal = String(lh.normal);
        if (typeof lh.relaxed === 'number') lh.relaxed = String(lh.relaxed);
      }

      // Ensure spacing.px exists (required by schema)
      if (siteData.theme.tokens.spacing && !siteData.theme.tokens.spacing.px) {
        siteData.theme.tokens.spacing.px = '1px';
      }
    }

    // Validate site structure
    if (!validateSite(siteData)) {
      console.error('Invalid site structure:', ajv.errorsText(validateSite.errors));
      throw new Error('La structure du site générée est invalide');
    }

    // Render the final HTML
    const html = renderSite(siteData);

    // Prepare response
    const response = {
      ok: true,
      site: {
        id: siteData.id,
        title: siteData.title,
        description: siteData.description,
        pages: siteData.pages.length,
        theme: siteData.theme?.name || 'Custom Theme'
      },
      html,
      events: [{ type: 'complete', payload: { ok: true } }],
      generationTime: 0
    };

    console.log('Proprietary site generated successfully:', response.site.title);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating proprietary site:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Erreur lors de la génération du site',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
