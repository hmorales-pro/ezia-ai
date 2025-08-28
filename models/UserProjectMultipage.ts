import mongoose, { Schema, Document } from 'mongoose';

export interface IPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  html: string;
  css?: string;
  js?: string;
  isHomePage: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProjectMultipage extends Document {
  projectId: string;
  userId: string;
  businessId?: string;
  businessName?: string;
  name: string;
  description: string;
  domain?: string;
  subdomain?: string; // sous-domaine personnalisé (ex: monsite.ezia.ai)
  customDomain?: string; // domaine personnalisé futur (ex: monsite.com)
  
  // Structure multipages
  pages: IPage[];
  globalCss?: string;
  globalJs?: string;
  navigation?: {
    type: 'horizontal' | 'vertical' | 'hamburger';
    items: Array<{
      label: string;
      pageId: string;
      order: number;
    }>;
  };
  
  // Métadonnées globales
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    favicon?: string;
    ogImage?: string;
  };
  
  // Configuration
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  
  status: 'draft' | 'published' | 'archived';
  version: number;
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  html: { type: String, required: true },
  css: String,
  js: String,
  isHomePage: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserProjectMultipageSchema = new Schema({
  projectId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  businessId: { type: String, index: true },
  businessName: String,
  name: { type: String, required: true },
  description: { type: String, required: true },
  domain: String,
  subdomain: { type: String, unique: true, sparse: true },
  customDomain: { type: String, unique: true, sparse: true },
  
  pages: [PageSchema],
  globalCss: String,
  globalJs: String,
  
  navigation: {
    type: { type: String, enum: ['horizontal', 'vertical', 'hamburger'], default: 'horizontal' },
    items: [{
      label: String,
      pageId: String,
      order: Number
    }]
  },
  
  seo: {
    defaultTitle: String,
    defaultDescription: String,
    favicon: String,
    ogImage: String
  },
  
  theme: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String
  },
  
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: { type: Number, default: 1 },
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true
});

// Index composé pour les requêtes fréquentes
UserProjectMultipageSchema.index({ userId: 1, status: 1 });
UserProjectMultipageSchema.index({ businessId: 1, status: 1 });

// Méthode pour ajouter une nouvelle page
UserProjectMultipageSchema.methods.addPage = function(pageData: Partial<IPage>) {
  const newPage: IPage = {
    id: `page-${Date.now()}`,
    name: pageData.name || 'Nouvelle page',
    slug: pageData.slug || 'nouvelle-page',
    title: pageData.title || 'Nouvelle page',
    description: pageData.description,
    html: pageData.html || '<h1>Nouvelle page</h1>',
    css: pageData.css,
    js: pageData.js,
    isHomePage: pageData.isHomePage || false,
    order: this.pages.length,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // S'assurer qu'il n'y a qu'une seule page d'accueil
  if (newPage.isHomePage) {
    this.pages.forEach((page: IPage) => {
      page.isHomePage = false;
    });
  }
  
  this.pages.push(newPage);
  return this.save();
};

// Méthode pour générer le HTML complet d'une page
UserProjectMultipageSchema.methods.generatePageHtml = function(pageId: string) {
  const page = this.pages.find((p: IPage) => p.id === pageId);
  if (!page) return null;
  
  // Construire le HTML avec navigation
  let navHtml = '';
  if (this.navigation && this.navigation.items.length > 0) {
    const navItems = this.navigation.items
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const targetPage = this.pages.find((p: IPage) => p.id === item.pageId);
        if (!targetPage) return '';
        return `<a href="/${targetPage.slug}" class="nav-link">${item.label}</a>`;
      })
      .join('');
    
    navHtml = `
      <nav class="site-navigation ${this.navigation.type}">
        ${navItems}
      </nav>
    `;
  }
  
  // Template HTML complet
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}${this.seo?.defaultTitle ? ` - ${this.seo.defaultTitle}` : ''}</title>
    ${page.description ? `<meta name="description" content="${page.description}">` : ''}
    ${this.seo?.favicon ? `<link rel="icon" href="${this.seo.favicon}">` : ''}
    <style>
        /* Global CSS */
        ${this.globalCss || ''}
        
        /* Page-specific CSS */
        ${page.css || ''}
    </style>
</head>
<body>
    ${navHtml}
    ${page.html}
    
    <script>
        /* Global JS */
        ${this.globalJs || ''}
        
        /* Page-specific JS */
        ${page.js || ''}
    </script>
</body>
</html>`;
};

export default mongoose.models.UserProjectMultipage || 
  mongoose.model<IUserProjectMultipage>('UserProjectMultipage', UserProjectMultipageSchema);