import { AIBaseAgent } from "./ai-base-agent";
import { DesignSystem } from "@/types/design-system";

/**
 * Multi-Page Builder Agent
 * Generates complete website with all necessary pages
 *
 * Generates:
 * - Homepage (index.html)
 * - Blog listing page (blog/index.html)
 * - Individual blog articles (blog/article-*.html)
 * - About page (a-propos.html)
 * - Services page (services.html)
 * - Contact page (contact.html)
 * - Legal pages (mentions-legales.html, cgv.html)
 * - 404 page (404.html)
 * - Shared CSS (assets/css/style.css)
 * - Shared JS (assets/js/main.js)
 * - Sitemap.xml & robots.txt
 */
export class MultiPageBuilder extends AIBaseAgent {
  constructor() {
    super({
      name: "MultiPage Builder",
      role: "Full Website Generator",
      capabilities: [
        "Multi-page website generation",
        "Unified navigation system",
        "Shared design system",
        "SEO optimization",
        "Export-ready structure"
      ],
      temperature: 0.5,
      maxTokens: 16000,
      systemPrompt: "Tu es un expert en création de sites web multi-pages complets. Tu génères des sites professionnels avec toutes les pages nécessaires, une navigation unifiée, et une charte graphique cohérente."
    });
  }

  protected getDefaultSystemPrompt(): string {
    return "Tu es un expert en création de sites web multi-pages complets. Tu génères des sites professionnels avec toutes les pages nécessaires, une navigation unifiée, et une charte graphique cohérente.";
  }

  /**
   * Generate a complete page with navigation
   */
  async generatePage(input: {
    pageType: PageType;
    businessContext: BusinessContext;
    designSystem: DesignSystem;
    content: any;
    allPages: PageDefinition[];
    blogArticles?: any[];
  }): Promise<GeneratedPage> {
    this.log(`Generating page: ${input.pageType}`);

    const prompt = this.buildPagePrompt(input);

    const html = await this.generateWithAI({
      prompt,
      maxRetries: 2
    });

    const cleanedHTML = this.cleanHTML(html);

    return {
      type: input.pageType,
      filename: this.getFilename(input.pageType),
      html: cleanedHTML,
      title: this.getPageTitle(input.pageType, input.businessContext),
      path: this.getPagePath(input.pageType)
    };
  }

  private buildPagePrompt(input: {
    pageType: PageType;
    businessContext: BusinessContext;
    designSystem: DesignSystem;
    content: any;
    allPages: PageDefinition[];
    blogArticles?: any[];
  }): string {
    const colors = input.designSystem.colorPalette || {
      primary: "#2563EB",
      secondary: "#8B5CF6",
      accent: "#EC4899"
    };

    const typography = input.designSystem.typography || {
      headingFont: "Playfair Display",
      bodyFont: "Inter"
    };

    // Build navigation menu
    const navLinks = input.allPages
      .filter(p => p.showInNav)
      .map(p => `<a href="${p.path}">${p.title}</a>`)
      .join('\n            ');

    const basePrompt = `Tu génères une page HTML complète pour un site web professionnel.

CONTEXTE BUSINESS:
- Nom: ${input.businessContext.name}
- Industrie: ${input.businessContext.industry}
- Description: ${input.businessContext.description || ""}

CHARTE GRAPHIQUE:
- Couleur primaire: ${colors.primary}
- Couleur secondaire: ${colors.secondary}
- Couleur accent: ${colors.accent}
- Police titres: ${typography.headingFont}
- Police texte: ${typography.bodyFont}

NAVIGATION (identique sur toutes les pages):
<nav class="main-nav">
  <div class="container">
    <div class="nav-brand">
      <a href="/">${input.businessContext.name}</a>
    </div>
    <div class="nav-links">
      ${navLinks}
    </div>
    <button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>
  </div>
</nav>

FOOTER (identique sur toutes les pages):
<footer class="main-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h3>${input.businessContext.name}</h3>
        <p>Excellence et innovation</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        ${navLinks.replace(/<a /g, '<a class="footer-link" ')}
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <p>Email: contact@${input.businessContext.name.toLowerCase()}.fr</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${input.businessContext.name}. Tous droits réservés.</p>
      <div class="footer-legal">
        <a href="/mentions-legales.html">Mentions légales</a>
        <a href="/cgv.html">CGV</a>
      </div>
    </div>
  </div>
</footer>

TYPE DE PAGE: ${input.pageType}

${this.getPageSpecificInstructions(input)}

STRUCTURE HTML REQUISE:
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getPageTitle(input.pageType, input.businessContext)}</title>
    <meta name="description" content="...">
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=${typography.headingFont.replace(' ', '+')}:wght@400;700&family=${typography.bodyFont.replace(' ', '+')}:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation (coller celle ci-dessus) -->

    <main class="page-${input.pageType}">
        <!-- Contenu spécifique de la page -->
    </main>

    <!-- Footer (coller celui ci-dessus) -->

    <script src="/assets/js/main.js"></script>
</body>
</html>

IMPORTANT:
- Retourne UNIQUEMENT le HTML complet
- PAS de code markdown (\`\`\`html)
- Utilise les couleurs de la charte graphique
- Navigation et footer IDENTIQUES partout
- Optimisé SEO (meta, headings, alt)

Génère la page HTML complète maintenant:`;

    return basePrompt;
  }

  private getPageSpecificInstructions(input: {
    pageType: PageType;
    content: any;
    blogArticles?: any[];
  }): string {
    switch (input.pageType) {
      case "homepage":
        return `CONTENU:
${JSON.stringify(input.content, null, 2)}

INSTRUCTIONS SPÉCIFIQUES:
- Hero section impactante avec CTA
- Présentation des services/produits
- Section témoignages
- Section blog (3 derniers articles en preview)
- Call-to-action final`;

      case "blog-listing":
        return `ARTICLES DISPONIBLES:
${JSON.stringify(input.blogArticles?.map(a => ({
  title: a.title,
  excerpt: a.excerpt,
  readTime: a.readTime,
  tags: a.tags
})), null, 2)}

INSTRUCTIONS SPÉCIFIQUES:
- Grid responsive d'articles (3 colonnes desktop, 1 mobile)
- Chaque card: image, titre, extrait, tags, temps de lecture
- Pagination si >9 articles
- Sidebar avec catégories/tags populaires`;

      case "blog-article":
        return `ARTICLE:
${JSON.stringify(input.content, null, 2)}

INSTRUCTIONS SPÉCIFIQUES:
- Header avec titre + meta (date, temps lecture, auteur)
- Contenu article avec bonne typographie
- Sidebar: articles récents, catégories
- Section commentaires (formulaire désactivé)
- Boutons partage réseaux sociaux`;

      case "about":
        return `CONTENU:
${JSON.stringify(input.content, null, 2)}

INSTRUCTIONS SPÉCIFIQUES:
- Histoire de l'entreprise
- Mission & valeurs
- Équipe (si disponible)
- Timeline visuelle
- Call-to-action "Nous contacter"`;

      case "services":
        return `SERVICES:
${JSON.stringify(input.content, null, 2)}

INSTRUCTIONS SPÉCIFIQUES:
- Grid de services avec icônes
- Description détaillée de chaque service
- Tarifs si disponibles
- FAQ
- CTA "Demander un devis"`;

      case "contact":
        return `INSTRUCTIONS SPÉCIFIQUES:
- Formulaire de contact (nom, email, message)
- Coordonnées (adresse, téléphone, email)
- Carte Google Maps (placeholder)
- Horaires d'ouverture
- Liens réseaux sociaux`;

      case "legal":
        return `INSTRUCTIONS SPÉCIFIQUES:
- Mentions légales standard
- Éditeur du site
- Hébergeur
- RGPD / données personnelles
- Cookies
- Crédits`;

      case "cgv":
        return `INSTRUCTIONS SPÉCIFIQUES:
- Conditions générales de vente
- Article par article
- Tarifs et paiement
- Livraison
- Garanties
- Litiges`;

      case "404":
        return `INSTRUCTIONS SPÉCIFIQUES:
- Message d'erreur friendly
- Illustration/emoji
- Liens vers pages principales
- Barre de recherche
- Bouton retour accueil`;

      default:
        return "";
    }
  }

  private cleanHTML(html: string): string {
    let cleaned = html;

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```html\s*/gi, '');
    cleaned = cleaned.replace(/```\s*$/gi, '');
    cleaned = cleaned.trim();

    // Unescape if JSON-wrapped
    try {
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = JSON.parse(cleaned);
      }
      if (cleaned.startsWith('{')) {
        const parsed = JSON.parse(cleaned);
        if (parsed.html || parsed.content) {
          cleaned = parsed.html || parsed.content;
        }
      }
    } catch (e) {
      // Not JSON
    }

    return cleaned;
  }

  private getFilename(pageType: PageType): string {
    const filenames: Record<PageType, string> = {
      "homepage": "index.html",
      "blog-listing": "blog/index.html",
      "blog-article": "", // Dynamic based on article slug
      "about": "a-propos.html",
      "services": "services.html",
      "contact": "contact.html",
      "legal": "mentions-legales.html",
      "cgv": "cgv.html",
      "404": "404.html"
    };
    return filenames[pageType] || "page.html";
  }

  private getPagePath(pageType: PageType): string {
    const paths: Record<PageType, string> = {
      "homepage": "/",
      "blog-listing": "/blog/",
      "blog-article": "/blog/", // + slug
      "about": "/a-propos.html",
      "services": "/services.html",
      "contact": "/contact.html",
      "legal": "/mentions-legales.html",
      "cgv": "/cgv.html",
      "404": "/404.html"
    };
    return paths[pageType] || "/";
  }

  private getPageTitle(pageType: PageType, context: BusinessContext): string {
    const titles: Record<PageType, string> = {
      "homepage": `${context.name} - Excellence et Innovation`,
      "blog-listing": `Blog - ${context.name}`,
      "blog-article": "", // Dynamic
      "about": `À propos - ${context.name}`,
      "services": `Nos Services - ${context.name}`,
      "contact": `Contact - ${context.name}`,
      "legal": `Mentions légales - ${context.name}`,
      "cgv": `Conditions Générales de Vente - ${context.name}`,
      "404": `Page introuvable - ${context.name}`
    };
    return titles[pageType] || context.name;
  }

  /**
   * Generate shared CSS file
   */
  async generateCSS(designSystem: DesignSystem): Promise<string> {
    this.log("Generating shared CSS...");

    const colors = designSystem.colorPalette || {};
    const typography = designSystem.typography || {};

    return `/* Global Styles - Generated by Ezia AI */
:root {
  --color-primary: ${colors.primary || '#2563EB'};
  --color-secondary: ${colors.secondary || '#8B5CF6'};
  --color-accent: ${colors.accent || '#EC4899'};
  --color-neutral-50: ${colors.neutral?.[50] || '#F8FAFC'};
  --color-neutral-900: ${colors.neutral?.[900] || '#0F172A'};
  --font-heading: '${typography.headingFont || 'Playfair Display'}', serif;
  --font-body: '${typography.bodyFont || 'Inter'}', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--color-neutral-900);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Navigation */
.main-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.nav-brand a {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--color-neutral-900);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--color-primary);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .mobile-menu-btn {
    display: block;
  }
}

/* Footer */
.main-footer {
  background: var(--color-neutral-900);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: 5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-col h3, .footer-col h4 {
  font-family: var(--font-heading);
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.footer-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  display: block;
  margin: 0.5rem 0;
}

.footer-link:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-legal {
  display: flex;
  gap: 1rem;
}

.footer-legal a {
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 0.9rem;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-primary);
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Blog styles */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.blog-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

/* Utility classes */
.text-center { text-align: center; }
.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.mb-1 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 2rem; }
`;
  }

  /**
   * Generate shared JavaScript
   */
  async generateJS(): Promise<string> {
    return `// Main JS - Generated by Ezia AI

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Form validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Add your form handling logic here
      alert('Formulaire soumis ! (Demo)');
    });
  });
});
`;
  }
}

// Types
export type PageType =
  | "homepage"
  | "blog-listing"
  | "blog-article"
  | "about"
  | "services"
  | "contact"
  | "legal"
  | "cgv"
  | "404";

export interface BusinessContext {
  name: string;
  industry: string;
  description?: string;
}

export interface PageDefinition {
  type: PageType;
  title: string;
  path: string;
  showInNav: boolean;
  priority: number; // For sitemap
}

export interface GeneratedPage {
  type: PageType;
  filename: string;
  html: string;
  title: string;
  path: string;
}

export interface CompleteWebsite {
  pages: GeneratedPage[];
  css: string;
  js: string;
  sitemap: string;
  robots: string;
  metadata: {
    businessName: string;
    generatedAt: string;
    totalPages: number;
  };
}
