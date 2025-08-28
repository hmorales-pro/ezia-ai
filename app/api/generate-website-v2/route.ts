import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';

// Réutiliser l'API existante qui fonctionne
export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const { businessInfo } = await request.json();

    if (!businessInfo || !businessInfo.name) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Informations business requises' 
      }, { status: 400 });
    }

    console.log('Generating enhanced website for:', businessInfo.name);

    // Construire un prompt optimisé basé sur les informations business
    const prompt = buildOptimizedPrompt(businessInfo);
    
    // Utiliser l'API ask-ai existante qui fonctionne déjà bien
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/ask-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: "novita",
        model: "deepseek-ai/DeepSeek-V3-0324",
        businessId: businessInfo.businessId
      })
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    // L'API ask-ai retourne un stream, on doit le collecter
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let html = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value);
      }
    }

    // Nettoyer et valider le HTML
    html = html.trim();
    
    // Si le HTML contient des erreurs JSON, les extraire
    if (html.includes('{"ok":false')) {
      const errorMatch = html.match(/{"ok":false[^}]+}/);
      if (errorMatch) {
        return NextResponse.json(JSON.parse(errorMatch[0]));
      }
    }

    // Valider que c'est du HTML
    if (!html.includes('<') || html.length < 100) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Impossible de générer un site valide',
        details: 'Le contenu généré n\'est pas du HTML'
      }, { status: 500 });
    }

    // S'assurer que le HTML commence bien par DOCTYPE
    if (!html.startsWith('<!DOCTYPE')) {
      // Chercher le début du HTML
      const docTypeIndex = html.indexOf('<!DOCTYPE');
      if (docTypeIndex > 0) {
        html = html.substring(docTypeIndex);
      }
    }

    return NextResponse.json({
      ok: true,
      html: html,
      model: 'deepseek-v3-enhanced',
      provider: 'novita'
    });

  } catch (error: any) {
    console.error('Error in generate-website-v2:', error);
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la génération du site',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

function buildOptimizedPrompt(businessInfo: any): string {
  const { name, description, industry, targetAudience, features } = businessInfo;
  
  // Détection intelligente du type de business
  const businessType = detectBusinessType(businessInfo);
  const palette = getColorPalette(businessType);
  const sections = getSectionsForBusiness(businessType);
  
  return `Tu es un expert en création de sites web professionnels haut de gamme.

MISSION: Créer un site web exceptionnel pour ${name}

CONTEXTE:
${description}

SPÉCIFICATIONS TECHNIQUES OBLIGATOIRES:
- Code HTML5 complet et valide
- Tailwind CSS via CDN (dernière version)
- Responsive design mobile-first
- Animations CSS fluides (AOS, transitions, keyframes)
- JavaScript pour interactivité (menu mobile, scroll smooth, etc.)
- SEO optimisé avec toutes les meta tags
- Performance optimisée (lazy loading, minification inline)

STRUCTURE DU SITE (${sections.length} sections):
${sections.map((section, i) => `${i + 1}. ${section}`).join('\n')}

PALETTE DE COULEURS:
- Primaire: ${palette.primary}
- Secondaire: ${palette.secondary}
- Accent: ${palette.accent}
- Neutres: ${palette.neutral}

ÉLÉMENTS DE DESIGN:
- Police principale: ${businessType === 'restaurant' ? 'Playfair Display' : 'Poppins'}
- Police secondaire: ${businessType === 'restaurant' ? 'Lato' : 'Inter'}
- Bordures arrondies: ${businessType === 'tech' ? 'rounded-lg' : 'rounded-xl'}
- Ombres: shadow-lg pour les cartes, shadow-2xl pour les CTAs
- Espacement: généreux (py-16 minimum entre sections)
- Images: placeholders via https://picsum.photos

CONTENU REQUIS:
- Tout le texte en français impeccable
- Ton ${businessType === 'restaurant' ? 'chaleureux et appétissant' : 'professionnel et moderne'}
- CTAs percutants et orientés conversion
- Microcopy soigné (boutons, formulaires, etc.)

FONCTIONNALITÉS JAVASCRIPT:
- Menu hamburger animé pour mobile
- Scroll smooth vers les ancres
- Animations au scroll (fade-in, slide-up)
- Validation de formulaire côté client
- Effets de parallaxe subtils

OPTIMISATIONS:
- Balises sémantiques HTML5
- Attributs ARIA pour accessibilité
- Schema.org markup pour SEO local
- Open Graph tags pour réseaux sociaux
- Performance: code CSS/JS minifié inline

Génère maintenant un site web COMPLET et PROFESSIONNEL qui impressionnera les visiteurs:`;
}

function detectBusinessType(businessInfo: any): string {
  const combined = `${businessInfo.name} ${businessInfo.description} ${businessInfo.industry || ''}`.toLowerCase();
  
  if (combined.match(/restaurant|café|bistro|gastronomie|cuisine|chef|menu/)) {
    return 'restaurant';
  }
  if (combined.match(/tech|digital|software|app|saas|startup|ia|ai/)) {
    return 'tech';
  }
  if (combined.match(/santé|médecin|clinique|wellness|thérapie/)) {
    return 'health';
  }
  if (combined.match(/boutique|commerce|vente|shop|produit/)) {
    return 'ecommerce';
  }
  if (combined.match(/agence|consulting|conseil|service/)) {
    return 'agency';
  }
  
  return 'corporate';
}

function getColorPalette(businessType: string) {
  const palettes: Record<string, any> = {
    restaurant: {
      primary: '#D97706', // Amber chaud
      secondary: '#92400E', // Brun riche  
      accent: '#FEF3C7', // Crème
      neutral: '#78716C' // Stone
    },
    tech: {
      primary: '#6366F1', // Indigo moderne
      secondary: '#4F46E5', // Indigo foncé
      accent: '#A5B4FC', // Indigo clair
      neutral: '#64748B' // Slate
    },
    health: {
      primary: '#10B981', // Emerald
      secondary: '#059669', // Green foncé
      accent: '#D1FAE5', // Green très clair
      neutral: '#6B7280' // Gray
    },
    ecommerce: {
      primary: '#8B5CF6', // Violet
      secondary: '#7C3AED', // Purple
      accent: '#EDE9FE', // Purple clair
      neutral: '#6B7280' // Gray
    },
    agency: {
      primary: '#0EA5E9', // Sky
      secondary: '#0284C7', // Sky foncé
      accent: '#E0F2FE', // Sky très clair
      neutral: '#64748B' // Slate
    },
    corporate: {
      primary: '#6D28D9', // Purple moderne
      secondary: '#5B21B6', // Purple foncé
      accent: '#DDD6FE', // Purple clair
      neutral: '#4B5563' // Gray foncé
    }
  };
  
  return palettes[businessType] || palettes.corporate;
}

function getSectionsForBusiness(businessType: string): string[] {
  const baseSections = [
    'Header avec navigation sticky et menu mobile',
    'Hero section avec titre accrocheur et 2 CTAs',
    'Section "Pourquoi nous choisir" avec 3-4 avantages clés'
  ];
  
  const specificSections: Record<string, string[]> = {
    restaurant: [
      'Section Menu avec catégories et prix',
      'Galerie photos des plats en grille',
      'Section Réservation avec formulaire',
      'Témoignages de clients gourmets',
      'Informations pratiques (horaires, adresse, parking)'
    ],
    tech: [
      'Présentation des fonctionnalités clés',
      'Section "Comment ça marche" en 3 étapes',
      'Pricing avec 3 plans',
      'Logos de clients/partenaires',
      'CTA pour démo gratuite'
    ],
    health: [
      'Services et spécialités',
      'Équipe médicale avec photos',
      'Prise de rendez-vous en ligne',
      'Témoignages patients',
      'FAQ médicale'
    ],
    ecommerce: [
      'Produits phares en carousel',
      'Catégories de produits',
      'Processus de commande en 3 étapes',
      'Avis clients avec notes',
      'Garanties et livraison'
    ],
    agency: [
      'Services détaillés avec icônes',
      'Portfolio de réalisations',
      'Process de travail',
      'Équipe et expertises',
      'Formulaire de contact étendu'
    ],
    corporate: [
      'Services ou produits principaux',
      'Chiffres clés impressionnants',
      'Section "À propos" avec mission',
      'Témoignages clients B2B',
      'Partenaires et certifications'
    ]
  };
  
  return [
    ...baseSections,
    ...(specificSections[businessType] || specificSections.corporate),
    'Footer complet avec liens, newsletter et réseaux sociaux'
  ];
}