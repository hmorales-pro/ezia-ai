// Prompts optimisés pour la génération de sites web avec les nouveaux modèles

export const SECTION_TEMPLATES = {
  hero: {
    base: `
    <section class="hero relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div class="container mx-auto px-6 text-center">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 fade-in">{{title}}</h1>
            <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto fade-in">{{subtitle}}</p>
            <div class="flex gap-4 justify-center fade-in">
                <a href="#contact" class="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">{{cta_primary}}</a>
                <a href="#services" class="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">{{cta_secondary}}</a>
            </div>
        </div>
    </section>`,
    aiPrompt: "Personnalise cette section hero pour {{business}} en gardant un ton professionnel et engageant"
  },
  
  services: {
    base: `
    <section id="services" class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold text-center mb-12 fade-in">Nos Services</h2>
            <div class="grid md:grid-cols-3 gap-8">
                {{services_grid}}
            </div>
        </div>
    </section>`,
    aiPrompt: "Crée une grille de services professionnels pour {{business}} avec icônes et descriptions"
  },
  
  about: {
    base: `
    <section id="about" class="py-20 bg-gray-50">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="fade-in">
                    <h2 class="text-4xl font-bold mb-6">À Propos de {{business_name}}</h2>
                    <p class="text-gray-600 mb-4">{{about_text}}</p>
                    <div class="grid grid-cols-2 gap-4 mt-8">
                        {{stats}}
                    </div>
                </div>
                <div class="fade-in">
                    {{about_image_or_graphic}}
                </div>
            </div>
        </div>
    </section>`,
    aiPrompt: "Crée une section à propos engageante pour {{business}} avec des statistiques impressionnantes"
  },
  
  testimonials: {
    base: `
    <section id="testimonials" class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold text-center mb-12 fade-in">Ce que disent nos clients</h2>
            <div class="grid md:grid-cols-3 gap-8">
                {{testimonials_cards}}
            </div>
        </div>
    </section>`,
    aiPrompt: "Génère 3 témoignages clients réalistes et positifs pour {{business}}"
  },
  
  contact: {
    base: `
    <section id="contact" class="py-20 bg-purple-50">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold text-center mb-12 fade-in">Contactez-nous</h2>
            <div class="max-w-2xl mx-auto">
                <form class="bg-white rounded-lg shadow-lg p-8">
                    {{form_fields}}
                    <button type="submit" class="w-full py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Envoyer le message
                    </button>
                </form>
            </div>
        </div>
    </section>`,
    aiPrompt: "Crée un formulaire de contact professionnel adapté à {{business}}"
  }
};

export const BUSINESS_TYPE_STYLES = {
  restaurant: {
    colors: {
      primary: '#D97706', // Orange chaleureux
      secondary: '#92400E',
      accent: '#FEF3C7'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Open Sans'
    },
    sections: ['hero', 'menu', 'about', 'reservations', 'gallery', 'contact']
  },
  
  tech: {
    colors: {
      primary: '#3B82F6', // Bleu tech
      secondary: '#1E40AF',
      accent: '#DBEAFE'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    sections: ['hero', 'services', 'features', 'pricing', 'team', 'contact']
  },
  
  healthcare: {
    colors: {
      primary: '#10B981', // Vert santé
      secondary: '#059669',
      accent: '#D1FAE5'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto'
    },
    sections: ['hero', 'services', 'team', 'appointments', 'testimonials', 'contact']
  },
  
  ecommerce: {
    colors: {
      primary: '#8B5CF6', // Violet commerce
      secondary: '#7C3AED',
      accent: '#EDE9FE'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Lato'
    },
    sections: ['hero', 'featured_products', 'categories', 'about', 'reviews', 'contact']
  }
};

export const INDUSTRY_PROMPTS = {
  restaurant: `
    Crée un site web appétissant pour un restaurant avec:
    - Menu interactif avec photos
    - Système de réservation en ligne
    - Galerie photos de plats
    - Horaires et localisation
    - Ambiance chaleureuse et accueillante
  `,
  
  tech: `
    Crée un site web moderne pour une entreprise tech avec:
    - Présentation des solutions technologiques
    - Études de cas clients
    - Blog technique
    - Démos interactives
    - Design épuré et futuriste
  `,
  
  healthcare: `
    Crée un site web rassurant pour un établissement de santé avec:
    - Services médicaux détaillés
    - Présentation de l'équipe
    - Prise de rendez-vous en ligne
    - Conseils santé
    - Atmosphère professionnelle et bienveillante
  `,
  
  ecommerce: `
    Crée un site web marchand attractif avec:
    - Produits phares mis en avant
    - Catégories de produits
    - Témoignages clients
    - Processus d'achat simplifié
    - Design moderne et conversion optimisée
  `,
  
  default: `
    Crée un site web professionnel polyvalent avec:
    - Présentation claire des services
    - Portfolio ou réalisations
    - Équipe et valeurs
    - Témoignages clients
    - Call-to-action efficaces
  `
};

// Fonction pour déterminer le type de business
export function detectBusinessType(businessInfo: any): string {
  const { name = '', description = '', industry = '' } = businessInfo;
  const combined = `${name} ${description} ${industry}`.toLowerCase();
  
  if (combined.match(/restaurant|café|bistro|brasserie|pizzeria|cuisine|gastronomie/)) {
    return 'restaurant';
  }
  if (combined.match(/tech|logiciel|software|app|digital|informatique|développement|startup/)) {
    return 'tech';
  }
  if (combined.match(/santé|médecin|clinique|cabinet|thérapie|soin|wellness|bien-être/)) {
    return 'healthcare';
  }
  if (combined.match(/boutique|vente|commerce|shop|magasin|produit|article/)) {
    return 'ecommerce';
  }
  
  return 'default';
}

// Prompt système optimisé pour Mixtral
export const MIXTRAL_SYSTEM_PROMPT = `Tu es un expert en création de sites web professionnels modernes. Tu maîtrises parfaitement HTML5, CSS3, JavaScript et Tailwind CSS.

Tes créations respectent toujours ces principes:
1. Code propre, sémantique et accessible (WCAG)
2. Design responsive mobile-first
3. Performance optimisée (lazy loading, minification)
4. SEO on-page parfait
5. UX/UI moderne avec micro-interactions
6. Sécurité (CSP, HTTPS ready)
7. Compatibilité navigateurs modernes

Tu génères UNIQUEMENT du code HTML complet avec CSS et JS inline, prêt à être déployé.`;

// Prompts pour génération en étapes
export const GENERATION_STEPS = {
  structure: `Définis la structure optimale du site pour {{business}}:
    - Architecture des pages
    - Navigation et parcours utilisateur
    - Sections nécessaires par page
    - Hiérarchie du contenu
    Format: JSON structuré`,
  
  design: `Crée le design system pour {{business}}:
    - Palette de couleurs (5-7 couleurs)
    - Typographie (titres, corps, accents)
    - Espacements et grille
    - Composants UI réutilisables
    Format: Variables CSS et classes utilitaires`,
  
  content: `Génère le contenu textuel pour {{business}}:
    - Titres accrocheurs
    - Descriptions engageantes
    - Call-to-action efficaces
    - Témoignages crédibles
    Format: Texte structuré par section`,
  
  code: `Assemble le site complet avec:
    - HTML5 sémantique
    - Tailwind CSS + styles custom
    - JavaScript pour interactions
    - Optimisations performance
    Format: Code HTML complet`
};

// Templates de composants réutilisables
export const COMPONENT_LIBRARY = {
  navbar: `
    <nav class="fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <a href="#" class="text-2xl font-bold text-gray-800">{{logo}}</a>
                <div class="hidden md:flex space-x-8">
                    {{nav_links}}
                </div>
                <button class="md:hidden">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </nav>`,
  
  card: `
    <div class="bg-white rounded-lg shadow-md hover-lift p-6">
        <div class="text-purple-600 mb-4">{{icon}}</div>
        <h3 class="text-xl font-semibold mb-2">{{title}}</h3>
        <p class="text-gray-600">{{description}}</p>
    </div>`,
  
  testimonial: `
    <div class="bg-gray-50 rounded-lg p-6">
        <div class="flex mb-4">
            {{stars}}
        </div>
        <p class="text-gray-700 italic mb-4">"{{quote}}"</p>
        <div class="flex items-center">
            <div class="w-10 h-10 bg-purple-200 rounded-full mr-3"></div>
            <div>
                <p class="font-semibold">{{author}}</p>
                <p class="text-sm text-gray-500">{{role}}</p>
            </div>
        </div>
    </div>`,
  
  cta: `
    <section class="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div class="container mx-auto px-6 text-center">
            <h2 class="text-4xl font-bold mb-4">{{title}}</h2>
            <p class="text-xl mb-8 opacity-90">{{subtitle}}</p>
            <a href="{{link}}" class="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition">
                {{button_text}}
            </a>
        </div>
    </section>`
};