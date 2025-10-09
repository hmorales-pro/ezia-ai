import mongoose, { Schema, Document } from 'mongoose';

/**
 * WebProject - Modèle unifié pour la gestion de la présence web d'un business
 * Regroupe : site web, blog, boutique, copywriting, SEO
 */

export interface IWebPage {
  pageId: string;
  slug: string;  // '/' pour homepage, '/about', '/contact', etc.
  title: string;
  description: string;
  html: string;
  css: string;
  js?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  isPublished: boolean;
  createdBy: 'user' | 'ai';
  aiGenerated?: {
    agent: string;
    prompt: string;
    timestamp: Date;
  };
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDesignSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'sharp' | 'soft' | 'rounded';
  logo?: string;
  favicon?: string;
}

export interface IBlogConfig {
  postsPerPage: number;
  layout: 'grid' | 'list' | 'magazine';
  showCategories: boolean;
  showTags: boolean;
  enableComments: boolean;
  rssEnabled: boolean;
}

export interface IShopConfig {
  currency: 'EUR' | 'USD' | 'GBP';
  stripeAccountId?: string;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  taxRate: number;
  shippingEnabled: boolean;
  inventoryManagement: 'manual' | 'automatic';
}

export interface IWebProject extends Document {
  projectId: string;        // URL-friendly unique ID
  businessId: string;       // Lien avec le Business parent
  userId: string;           // Propriétaire

  // Métadonnées
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  domain?: string;          // Custom domain (ex: monsite.com)
  subdomain?: string;       // Sous-domaine Ezia (ex: monbusiness.ezia.ai)

  // Features activées
  features: {
    website: boolean;
    blog: boolean;
    shop: boolean;
    newsletter: boolean;
  };

  // Pages du site
  pages: IWebPage[];

  // Configuration design
  design: IDesignSystem;

  // Configuration blog (si features.blog = true)
  blogConfig?: IBlogConfig;

  // Configuration shop (si features.shop = true)
  shopConfig?: IShopConfig;

  // Analytics
  analytics: {
    views: number;
    uniqueVisitors: number;
    conversionRate: number;
    lastViewed?: Date;
  };

  // SEO global
  globalSeo?: {
    googleAnalyticsId?: string;
    googleSearchConsoleId?: string;
    facebookPixelId?: string;
    metaRobots: 'index,follow' | 'noindex,nofollow';
  };

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

const WebPageSchema = new Schema<IWebPage>({
  pageId: { type: String, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  html: { type: String, required: true },
  css: { type: String, default: '' },
  js: { type: String, default: '' },
  seo: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
    ogImage: { type: String },
    canonicalUrl: { type: String }
  },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: String, enum: ['user', 'ai'], default: 'user' },
  aiGenerated: {
    agent: { type: String },
    prompt: { type: String },
    timestamp: { type: Date }
  },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DesignSystemSchema = new Schema<IDesignSystem>({
  colors: {
    primary: { type: String, default: '#6D3FC8' },
    secondary: { type: String, default: '#8B5CF6' },
    accent: { type: String, default: '#10B981' },
    background: { type: String, default: '#FFFFFF' },
    text: { type: String, default: '#1E1E1E' }
  },
  typography: {
    headingFont: { type: String, default: 'Inter' },
    bodyFont: { type: String, default: 'Inter' }
  },
  spacing: { type: String, enum: ['compact', 'normal', 'spacious'], default: 'normal' },
  borderRadius: { type: String, enum: ['sharp', 'soft', 'rounded'], default: 'soft' },
  logo: { type: String },
  favicon: { type: String }
});

const BlogConfigSchema = new Schema<IBlogConfig>({
  postsPerPage: { type: Number, default: 9 },
  layout: { type: String, enum: ['grid', 'list', 'magazine'], default: 'grid' },
  showCategories: { type: Boolean, default: true },
  showTags: { type: Boolean, default: true },
  enableComments: { type: Boolean, default: false },
  rssEnabled: { type: Boolean, default: true }
});

const ShopConfigSchema = new Schema<IShopConfig>({
  currency: { type: String, enum: ['EUR', 'USD', 'GBP'], default: 'EUR' },
  stripeAccountId: { type: String },
  stripePublicKey: { type: String },
  stripeSecretKey: { type: String },
  taxRate: { type: Number, default: 20 },
  shippingEnabled: { type: Boolean, default: true },
  inventoryManagement: { type: String, enum: ['manual', 'automatic'], default: 'manual' }
});

const WebProjectSchema = new Schema<IWebProject>(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },

    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    domain: { type: String, unique: true, sparse: true },
    subdomain: { type: String, unique: true, sparse: true },

    features: {
      website: { type: Boolean, default: true },
      blog: { type: Boolean, default: false },
      shop: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false }
    },

    pages: [WebPageSchema],

    design: { type: DesignSystemSchema, default: () => ({}) },

    blogConfig: { type: BlogConfigSchema },

    shopConfig: { type: ShopConfigSchema },

    analytics: {
      views: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      lastViewed: { type: Date }
    },

    globalSeo: {
      googleAnalyticsId: { type: String },
      googleSearchConsoleId: { type: String },
      facebookPixelId: { type: String },
      metaRobots: { type: String, enum: ['index,follow', 'noindex,nofollow'], default: 'index,follow' }
    }
  },
  {
    timestamps: true,
    collection: 'web_projects'
  }
);

// Index composés pour les requêtes fréquentes
WebProjectSchema.index({ businessId: 1, status: 1 });
WebProjectSchema.index({ userId: 1, status: 1 });
WebProjectSchema.index({ subdomain: 1, status: 1 });

// Méthodes d'instance
WebProjectSchema.methods.addPage = function(pageData: Partial<IWebPage>) {
  const pageId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newPage: IWebPage = {
    pageId,
    slug: pageData.slug || '/',
    title: pageData.title || 'Nouvelle page',
    description: pageData.description || '',
    html: pageData.html || '',
    css: pageData.css || '',
    js: pageData.js || '',
    seo: pageData.seo || {
      title: pageData.title || 'Nouvelle page',
      description: pageData.description || '',
      keywords: []
    },
    isPublished: pageData.isPublished || false,
    createdBy: pageData.createdBy || 'user',
    aiGenerated: pageData.aiGenerated,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  this.pages.push(newPage);
  return newPage;
};

WebProjectSchema.methods.updatePage = function(pageId: string, pageData: Partial<IWebPage>) {
  const pageIndex = this.pages.findIndex((p: IWebPage) => p.pageId === pageId);
  if (pageIndex === -1) {
    throw new Error('Page not found');
  }

  this.pages[pageIndex] = {
    ...this.pages[pageIndex],
    ...pageData,
    updatedAt: new Date()
  };

  return this.pages[pageIndex];
};

WebProjectSchema.methods.deletePage = function(pageId: string) {
  const pageIndex = this.pages.findIndex((p: IWebPage) => p.pageId === pageId);
  if (pageIndex === -1) {
    throw new Error('Page not found');
  }

  this.pages.splice(pageIndex, 1);
  return true;
};

WebProjectSchema.methods.getPageBySlug = function(slug: string) {
  return this.pages.find((p: IWebPage) => p.slug === slug);
};

WebProjectSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Méthodes statiques
WebProjectSchema.statics.findByBusinessId = function(businessId: string) {
  return this.findOne({ businessId, status: { $ne: 'archived' } });
};

WebProjectSchema.statics.findBySubdomain = function(subdomain: string) {
  return this.findOne({ subdomain, status: 'published' });
};

// Pre-save hook pour mettre à jour updatedAt sur les pages
WebProjectSchema.pre('save', function(next) {
  if (this.isModified('pages')) {
    this.pages.forEach((page: IWebPage) => {
      if (!page.updatedAt || this.isModified(`pages.${this.pages.indexOf(page)}`)) {
        page.updatedAt = new Date();
      }
    });
  }
  next();
});

const WebProject = mongoose.models.WebProject || mongoose.model<IWebProject>('WebProject', WebProjectSchema);

export default WebProject;
