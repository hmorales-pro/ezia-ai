export const MULTIPAGE_PROMPTS = {
  // Prompt pour créer un site multipage complet
  createMultipageSite: (businessInfo: any, requirements: string) => `
Tu es un expert en création de sites web professionnels multipages. 
Crée un site web complet pour ${businessInfo.name} avec les pages suivantes :

STRUCTURE REQUISE :
1. Page d'accueil (index)
2. Page À propos 
3. Page Services/Produits
4. Page Contact
${requirements ? `\nEXIGENCES SPÉCIFIQUES : ${requirements}` : ''}

INFORMATIONS SUR L'ENTREPRISE :
- Nom : ${businessInfo.name}
- Description : ${businessInfo.description}
- Secteur : ${businessInfo.industry}
- Public cible : ${businessInfo.targetAudience || 'Grand public'}

INSTRUCTIONS :
1. Chaque page doit avoir une structure HTML complète mais sans les balises <html>, <head>, <body>
2. Utilise un design cohérent entre toutes les pages
3. Inclus une navigation commune sur toutes les pages
4. Optimise pour le SEO avec des titres et descriptions uniques
5. Assure-toi que le design est responsive
6. Utilise des couleurs et un style adaptés au secteur d'activité

RETOURNE UN JSON avec cette structure :
{
  "pages": [
    {
      "name": "Accueil",
      "slug": "index",
      "title": "Titre SEO de la page",
      "description": "Description SEO",
      "html": "<!-- Contenu HTML de la page sans <html><head><body> -->",
      "css": "/* CSS spécifique à cette page */",
      "isHomePage": true
    },
    // ... autres pages
  ],
  "globalCss": "/* CSS global pour toutes les pages */",
  "navigation": {
    "type": "horizontal",
    "items": [
      {"label": "Accueil", "pageSlug": "index", "order": 0},
      // ... autres liens
    ]
  },
  "theme": {
    "primaryColor": "#...",
    "secondaryColor": "#...",
    "fontFamily": "..."
  }
}
`,

  // Prompt pour ajouter une nouvelle page
  addNewPage: (existingPages: any[], pageType: string, siteContext: any) => `
Tu dois ajouter une nouvelle page "${pageType}" à un site existant.

PAGES EXISTANTES :
${existingPages.map(p => `- ${p.name} (/${p.slug})`).join('\n')}

CONTEXTE DU SITE :
- Nom : ${siteContext.name}
- Style : ${siteContext.theme ? JSON.stringify(siteContext.theme) : 'Standard'}
- Navigation existante : ${siteContext.navigation ? JSON.stringify(siteContext.navigation.items) : 'Aucune'}

INSTRUCTIONS :
1. Crée une page qui s'intègre parfaitement avec le design existant
2. Utilise le même style de navigation que les autres pages
3. Assure la cohérence visuelle (couleurs, polices, espacements)
4. La page doit être pertinente pour le type demandé : ${pageType}
5. N'inclus PAS les balises <html>, <head>, <body>

RETOURNE UN JSON :
{
  "name": "Nom de la page",
  "slug": "url-de-la-page",
  "title": "Titre SEO",
  "description": "Description SEO",
  "html": "<!-- Contenu HTML -->",
  "css": "/* CSS spécifique */"
}
`,

  // Prompt pour modifier une page existante
  modifyPage: (pageContent: string, modification: string, siteContext: any) => `
Modifie cette page selon les instructions tout en maintenant la cohérence avec le reste du site.

PAGE ACTUELLE :
${pageContent}

MODIFICATION DEMANDÉE :
${modification}

CONTEXTE DU SITE :
- Thème : ${JSON.stringify(siteContext.theme || {})}
- Autres pages : ${siteContext.otherPages?.map(p => p.name).join(', ') || 'Aucune'}

INSTRUCTIONS :
1. Applique la modification demandée
2. Maintiens la cohérence avec le style global du site
3. Préserve la structure de navigation existante
4. Garde le même niveau de qualité et de professionnalisme

RETOURNE LE HTML MODIFIÉ UNIQUEMENT.
`,

  // Prompt pour générer une navigation cohérente
  generateNavigation: (pages: any[], style: string) => `
Génère un code HTML de navigation pour ces pages :
${pages.map(p => `- ${p.name} (/${p.slug})`).join('\n')}

Style demandé : ${style}

Le code doit :
1. Être responsive (menu hamburger sur mobile)
2. Indiquer la page active
3. Être facilement intégrable dans toutes les pages
4. Utiliser des classes CSS modernes

RETOURNE UNIQUEMENT LE CODE HTML DE LA NAVIGATION.
`,

  // Prompt pour analyser et optimiser la cohérence
  analyzeCoherence: (pages: any[]) => `
Analyse ces pages et suggère des améliorations pour la cohérence :

PAGES :
${pages.map(p => `
Page : ${p.name}
- Couleurs principales utilisées
- Style de boutons
- Typographie
- Espacements
`).join('\n---\n')}

Identifie :
1. Les incohérences visuelles
2. Les éléments manquants
3. Les améliorations possibles

RETOURNE UN JSON :
{
  "inconsistencies": ["..."],
  "suggestions": ["..."],
  "globalStyles": "/* CSS pour uniformiser */"
}
`
};

// Fonction helper pour construire un prompt de création complet
export function buildMultipagePrompt(
  businessInfo: any,
  pageTypes: string[] = ['accueil', 'services', 'apropos', 'contact'],
  customRequirements?: string
) {
  const requirements = [
    `Pages requises : ${pageTypes.join(', ')}`,
    customRequirements
  ].filter(Boolean).join('\n');
  
  return MULTIPAGE_PROMPTS.createMultipageSite(businessInfo, requirements);
}

// Fonction pour gérer les modifications contextuelles
export function buildContextualModification(
  currentPage: any,
  modification: string,
  allPages: any[],
  siteTheme: any
) {
  const siteContext = {
    theme: siteTheme,
    otherPages: allPages.filter(p => p.id !== currentPage.id)
  };
  
  return MULTIPAGE_PROMPTS.modifyPage(
    currentPage.html,
    modification,
    siteContext
  );
}