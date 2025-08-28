// Analyseur intelligent pour suggérer des pages selon les besoins de l'entreprise

interface BusinessContext {
  name: string;
  description: string;
  industry?: string;
  targetAudience?: string;
  requirements?: string;
}

interface PageSuggestion {
  type: string;
  name: string;
  slug: string;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
  content?: {
    sections: string[];
    features: string[];
  };
}

export class EziaPageAnalyzer {
  // Mots-clés pour détecter les besoins
  private static keywords = {
    blog: ['blog', 'actualités', 'news', 'articles', 'publications', 'contenu'],
    portfolio: ['portfolio', 'réalisations', 'projets', 'travaux', 'créations', 'exemples'],
    boutique: ['boutique', 'shop', 'vente', 'produits', 'commerce', 'acheter', 'prix'],
    equipe: ['équipe', 'team', 'employés', 'collaborateurs', 'personnel', 'qui sommes-nous'],
    temoignages: ['témoignages', 'avis', 'clients', 'retours', 'satisfaction', 'recommandations'],
    faq: ['questions', 'faq', 'aide', 'support', 'assistance', 'comment'],
    evenements: ['événements', 'agenda', 'calendrier', 'formations', 'ateliers', 'conférences'],
    reservation: ['réservation', 'booking', 'rendez-vous', 'planifier', 'disponibilité'],
    galerie: ['photos', 'images', 'galerie', 'visuels', 'showcase'],
    tarifs: ['tarifs', 'prix', 'devis', 'forfaits', 'packages', 'coûts']
  };

  // Suggestions par industrie
  private static industrySuggestions: Record<string, PageSuggestion[]> = {
    restaurant: [
      { type: 'menu', name: 'Menu', slug: 'menu', reason: 'Présenter vos plats et boissons', priority: 'essential' },
      { type: 'reservation', name: 'Réservation', slug: 'reservation', reason: 'Permettre les réservations en ligne', priority: 'essential' },
      { type: 'galerie', name: 'Galerie', slug: 'galerie', reason: 'Montrer l\'ambiance de votre restaurant', priority: 'recommended' }
    ],
    commerce: [
      { type: 'boutique', name: 'Boutique', slug: 'boutique', reason: 'Vendre vos produits en ligne', priority: 'essential' },
      { type: 'livraison', name: 'Livraison', slug: 'livraison', reason: 'Informer sur les options de livraison', priority: 'recommended' }
    ],
    service: [
      { type: 'tarifs', name: 'Tarifs', slug: 'tarifs', reason: 'Présenter vos prix et forfaits', priority: 'essential' },
      { type: 'reservation', name: 'Prise de RDV', slug: 'rendez-vous', reason: 'Faciliter la prise de rendez-vous', priority: 'recommended' },
      { type: 'temoignages', name: 'Témoignages', slug: 'temoignages', reason: 'Rassurer avec des avis clients', priority: 'recommended' }
    ],
    creatif: [
      { type: 'portfolio', name: 'Portfolio', slug: 'portfolio', reason: 'Présenter vos réalisations', priority: 'essential' },
      { type: 'process', name: 'Notre Process', slug: 'process', reason: 'Expliquer votre méthode de travail', priority: 'recommended' }
    ],
    education: [
      { type: 'formations', name: 'Formations', slug: 'formations', reason: 'Détailler vos programmes', priority: 'essential' },
      { type: 'inscription', name: 'Inscription', slug: 'inscription', reason: 'Permettre les inscriptions en ligne', priority: 'essential' },
      { type: 'ressources', name: 'Ressources', slug: 'ressources', reason: 'Partager du matériel pédagogique', priority: 'optional' }
    ]
  };

  // Analyser le contexte et suggérer des pages
  static async analyzeBusiness(context: BusinessContext): Promise<PageSuggestion[]> {
    const suggestions: PageSuggestion[] = [];
    const addedTypes = new Set<string>();

    // Pages de base toujours recommandées
    const baseSuggestions: PageSuggestion[] = [
      { type: 'accueil', name: 'Accueil', slug: 'index', reason: 'Page principale de votre site', priority: 'essential' },
      { type: 'services', name: 'Services', slug: 'services', reason: 'Présenter vos offres', priority: 'essential' },
      { type: 'apropos', name: 'À propos', slug: 'a-propos', reason: 'Raconter votre histoire', priority: 'essential' },
      { type: 'contact', name: 'Contact', slug: 'contact', reason: 'Faciliter la prise de contact', priority: 'essential' }
    ];

    suggestions.push(...baseSuggestions);
    baseSuggestions.forEach(s => addedTypes.add(s.type));

    // Analyser la description pour des mots-clés
    const textToAnalyze = `${context.description} ${context.requirements || ''}`.toLowerCase();
    
    for (const [pageType, keywords] of Object.entries(this.keywords)) {
      if (addedTypes.has(pageType)) continue;
      
      const hasKeyword = keywords.some(keyword => textToAnalyze.includes(keyword));
      if (hasKeyword) {
        suggestions.push(this.createSuggestion(pageType, 'recommended'));
        addedTypes.add(pageType);
      }
    }

    // Suggestions basées sur l'industrie
    if (context.industry) {
      const industryKey = this.findIndustryKey(context.industry);
      if (industryKey && this.industrySuggestions[industryKey]) {
        for (const suggestion of this.industrySuggestions[industryKey]) {
          if (!addedTypes.has(suggestion.type)) {
            suggestions.push(suggestion);
            addedTypes.add(suggestion.type);
          }
        }
      }
    }

    // Analyser le public cible pour des suggestions supplémentaires
    if (context.targetAudience) {
      const audience = context.targetAudience.toLowerCase();
      
      if (audience.includes('jeune') || audience.includes('étudiant')) {
        if (!addedTypes.has('blog')) {
          suggestions.push({
            type: 'blog',
            name: 'Blog',
            slug: 'blog',
            reason: 'Engager votre audience avec du contenu régulier',
            priority: 'recommended'
          });
        }
      }
      
      if (audience.includes('professionnel') || audience.includes('entreprise')) {
        if (!addedTypes.has('etudes-cas')) {
          suggestions.push({
            type: 'etudes-cas',
            name: 'Études de cas',
            slug: 'etudes-de-cas',
            reason: 'Démontrer votre expertise avec des exemples concrets',
            priority: 'optional'
          });
        }
      }
    }

    return suggestions;
  }

  private static findIndustryKey(industry: string): string | null {
    const normalized = industry.toLowerCase();
    const industryMap: Record<string, string> = {
      'restaurant': 'restaurant',
      'restauration': 'restaurant',
      'food': 'restaurant',
      'commerce': 'commerce',
      'boutique': 'commerce',
      'retail': 'commerce',
      'service': 'service',
      'consultant': 'service',
      'agence': 'creatif',
      'créatif': 'creatif',
      'design': 'creatif',
      'formation': 'education',
      'école': 'education',
      'cours': 'education'
    };

    for (const [key, value] of Object.entries(industryMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    return null;
  }

  private static createSuggestion(type: string, priority: 'essential' | 'recommended' | 'optional' = 'recommended'): PageSuggestion {
    const suggestions: Record<string, PageSuggestion> = {
      blog: {
        type: 'blog',
        name: 'Blog',
        slug: 'blog',
        reason: 'Partager des actualités et articles',
        priority,
        content: {
          sections: ['Liste des articles', 'Catégories', 'Articles récents'],
          features: ['Pagination', 'Recherche', 'Tags']
        }
      },
      portfolio: {
        type: 'portfolio',
        name: 'Portfolio',
        slug: 'portfolio',
        reason: 'Présenter vos réalisations',
        priority,
        content: {
          sections: ['Galerie de projets', 'Filtres par catégorie', 'Détails des projets'],
          features: ['Lightbox', 'Filtrage', 'Animations']
        }
      },
      boutique: {
        type: 'boutique',
        name: 'Boutique',
        slug: 'boutique',
        reason: 'Vendre vos produits en ligne',
        priority,
        content: {
          sections: ['Catalogue produits', 'Panier', 'Paiement'],
          features: ['Filtres', 'Recherche', 'Promotions']
        }
      },
      equipe: {
        type: 'equipe',
        name: 'Notre équipe',
        slug: 'equipe',
        reason: 'Présenter votre équipe',
        priority,
        content: {
          sections: ['Photos et bios', 'Rôles', 'Valeurs'],
          features: ['Cards interactives', 'Réseaux sociaux']
        }
      },
      temoignages: {
        type: 'temoignages',
        name: 'Témoignages',
        slug: 'temoignages',
        reason: 'Afficher les avis clients',
        priority,
        content: {
          sections: ['Avis clients', 'Notes', 'Logos partenaires'],
          features: ['Carousel', 'Filtrage par service']
        }
      },
      faq: {
        type: 'faq',
        name: 'FAQ',
        slug: 'faq',
        reason: 'Répondre aux questions fréquentes',
        priority,
        content: {
          sections: ['Questions par catégorie', 'Recherche'],
          features: ['Accordéon', 'Recherche instantanée']
        }
      }
    };

    return suggestions[type] || {
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      slug: type,
      reason: `Page ${type} personnalisée`,
      priority
    };
  }

  // Générer le prompt pour Ezia
  static generateEziaPrompt(suggestions: PageSuggestion[], context: BusinessContext): string {
    const essentialPages = suggestions.filter(s => s.priority === 'essential');
    const recommendedPages = suggestions.filter(s => s.priority === 'recommended');
    const optionalPages = suggestions.filter(s => s.priority === 'optional');

    return `En tant qu'Ezia, conseiller IA pour ${context.name}, j'ai analysé vos besoins et voici mes recommandations pour la structure de votre site web :

📋 **Pages essentielles** (indispensables pour votre activité) :
${essentialPages.map(p => `- ${p.name} : ${p.reason}`).join('\n')}

💡 **Pages recommandées** (pour optimiser votre présence en ligne) :
${recommendedPages.map(p => `- ${p.name} : ${p.reason}`).join('\n')}

🎯 **Pages optionnelles** (selon votre évolution) :
${optionalPages.map(p => `- ${p.name} : ${p.reason}`).join('\n')}

Je peux créer automatiquement ces pages en m'assurant qu'elles restent cohérentes avec votre identité visuelle. Souhaitez-vous que je procède avec cette structure ?`;
  }
}