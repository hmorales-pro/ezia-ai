import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient, LLM_CONFIGS } from '@/lib/llm-client';
import { renderSite, registerCustomSpec } from '@/lib/renderer';
import Ajv from 'ajv';
import siteSchema from '@/lib/schemas/site.schema.json';

// Initialize JSON Schema validator
const ajv = new Ajv();
const validateSite = ajv.compile(siteSchema);

// System prompt for site generation
const SITE_GENERATION_SYSTEM_PROMPT = `Tu es un générateur de sites web temps réel spécialisé.

Tu renvoies une série d'événements JSON, un par un, prêts pour le streaming SSE.
Chaque événement doit être un objet JSON valide avec cette structure:
{ "type": "theme|page|block|assets|complete|error", "payload": {...} }

Types d'événements et leur structure:

1. theme - Définit le thème visuel du site:
{
  "type": "theme",
  "payload": {
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
        "lineHeight": { "tight": 1.25, "normal": 1.5, "relaxed": 1.75 }
      },
      "spacing": { "xs": "0.5rem", "sm": "0.75rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "3xl": "4rem", "4xl": "6rem" },
      "borderRadius": { "none": "0", "sm": "0.125rem", "md": "0.375rem", "lg": "0.5rem", "full": "9999px" },
      "shadows": { "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }
    }
  }
}

2. page - Définit une page du site:
{
  "type": "page",
  "payload": {
    "id": "page-id",
    "title": "Page Title",
    "slug": "url-slug",
    "meta": {
      "description": "Meta description",
      "keywords": ["keyword1", "keyword2"]
    },
    "blocks": []
  }
}

3. block - Définit un bloc de contenu:
{
  "type": "block",
  "payload": {
    "id": "block-id",
    "type": "content|navigation|custom",
    "component": "Hero|FeatureGrid|TestimonialCarousel|CTASection|HeaderNav|FooterSimple",
    "props": { ... },
    "spec": { ... } // seulement pour les composants custom
  }
}

4. assets - Définit les ressources du site:
{
  "type": "assets",
  "payload": [
    { "id": "asset-id", "type": "image|icon|video", "url": "url", "alt": "description" }
  ]
}

5. complete - Signale la fin de la génération:
{
  "type": "complete",
  "payload": { "ok": true }
}

6. error - Signale une erreur:
{
  "type": "error",
  "payload": { "message": "Error message" }
}

Composants disponibles:
- Hero: { title, description, ctaText }
- FeatureGrid: { title, features: [{ title, description, icon }] }
- TestimonialCarousel: { title, testimonials: [{ name, role, quote }] }
- CTASection: { title, description, primaryButtonText, secondaryButtonText }
- HeaderNav: { logo, links: [{ label, href }] }
- FooterSimple: { siteTitle, description, columns: [{ title, links: [{ label, href }] }], copyright }

Si tu veux créer un composant custom, inclut le champ "spec" avec:
{
  "inputs": { "param1": "type", "param2": "type" },
  "css": ".component-class { styles }",
  "template": "<div>{{param1}}</div>"
}

Règles importantes:
1. Toujours envoyer un événement JSON complet et valide
2. Commencer par l'événement "theme"
3. Envoyer les événements dans un ordre logique
4. Utiliser uniquement les composants listés ou créer des composants custom avec spec
5. Les couleurs doivent être en format hexadécimal (#RRGGBB)
6. Ne jamais inclure de HTML ou de code dans les propriétés
7. Pour les composants custom, fournir toujours le spec complet

Génère maintenant le site en fonction du brief utilisateur.`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const businessId = searchParams.get('businessId');
  const businessName = searchParams.get('businessName');

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Create LLM client
  const llmClient = createLLMClient({
    ...LLM_CONFIGS.mistral,
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
    maxTokens: 4000
  });

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Build user prompt with business context
        const userPrompt = `Brief: ${prompt}
${businessName ? `Business Name: ${businessName}` : ''}
${businessId ? `Business ID: ${businessId}` : ''}

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
1. Commencer par l'événement "theme" avec des valeurs COMPLÈTES:
   - spacing: {"xs": "0.5rem", "sm": "0.75rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "3xl": "4rem", "4xl": "6rem"}
   - typography: TOUS les champs requis
   - borderRadius: TOUS les champs requis
   - shadows: TOUS les champs requis

2. Navigation complète:
   - Header: { logo: "nom du business", links: [{ label: "Accueil", href: "#" }, { label: "Services", href: "#" }, { label: "Contact", href: "#" }] }
   - Footer: { siteTitle: "nom du business", description: "description courte", columns: [{ title: "Liens", links: [...] }], copyright: "texte copyright" }

3. Structure cohérente:
   - Une seule page avec tous les blocs
   - Hero avec titre et description percutants
   - Features avec icônes emoji (🌟, 🚀, 💎, etc.)
   - Témoignages réalistes avec noms et rôles
   - CTA avec boutons clairs

4. Design professionnel:
   - Couleurs hexadécimales valides
   - Typographie web-safe
   - Spacing et shadows définis
   - Pas de valeurs "undefined"

Le site doit être complet, fonctionnel et esthétique.`;

        let siteData: any = {
          id: `site_${Date.now()}`,
          title: businessName || 'Site Web Généré',
          description: prompt,
          locale: 'fr',
          pages: [],
          navigation: {
            header: { logo: '', links: [] },
            footer: { logo: '', links: [], copyright: '' }
          },
          assets: []
        };

        // Generate streaming response
        for await (const chunk of llmClient.generateStreamingResponse(
          SITE_GENERATION_SYSTEM_PROMPT,
          userPrompt,
          { formatJson: true }
        )) {
          if (chunk.type === 'content') {
            // Try to parse JSON events from the streaming content
            const events = parseStreamingJSONEvents(chunk.data);
            
            for (const event of events) {
              // Process the event
              switch (event.type) {
                case 'theme':
                  siteData.theme = event.payload;
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
                  
                case 'page':
                  siteData.pages.push(event.payload);
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
                  
                case 'block':
                  // Add block to the last page
                  if (siteData.pages.length > 0) {
                    const lastPage = siteData.pages[siteData.pages.length - 1];
                    if (!lastPage.blocks) lastPage.blocks = [];
                    lastPage.blocks.push(event.payload);
                  }
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
                  
                case 'assets':
                  siteData.assets = event.payload;
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
                  
                case 'complete':
                  // Validate and render the complete site
                  if (validateSite(siteData)) {
                    const html = renderSite(siteData);
                    controller.enqueue(`data: ${JSON.stringify({
                      type: 'site',
                      payload: { site: siteData, html }
                    })}\n\n`);
                  }
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
                  
                case 'error':
                  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
                  break;
              }
            }
          } else if (chunk.type === 'error') {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              payload: { message: chunk.error }
            })}\n\n`);
            break;
          } else if (chunk.type === 'complete') {
            // Send final complete event
            controller.enqueue(`data: ${JSON.stringify({
              type: 'complete',
              payload: { ok: true }
            })}\n\n`);
            break;
          }
        }
      } catch (error) {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'error',
          payload: { message: error instanceof Error ? error.message : 'Unknown error' }
        })}\n\n`);
      } finally {
        controller.close();
      }
    }
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Helper function to parse JSON events from streaming content
function parseStreamingJSONEvents(content: string): any[] {
  const events: any[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      try {
        const event = JSON.parse(trimmed);
        events.push(event);
      } catch (e) {
        // Skip invalid JSON lines
        console.warn('Failed to parse JSON event:', trimmed);
      }
    }
  }
  
  return events;
}
