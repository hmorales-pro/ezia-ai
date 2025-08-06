import mongoose, { Document, Schema } from 'mongoose';

// Interface pour un projet Ezia (site web d'un business)
export interface IEziaProject {
  // Identifiants
  project_id: string;
  business_id: string;        // Lien vers le business
  user_id: string;            // HuggingFace user ID
  space_id: string;           // HuggingFace Space ID (format: namespace/repoId)
  
  // Informations du projet
  title: string;
  description: string;
  type: 'landing_page' | 'portfolio' | 'e_commerce' | 'blog' | 'corporate' | 'other';
  status: 'draft' | 'published' | 'archived';
  
  // Contenu
  html: string;               // Code HTML généré
  css?: string;               // CSS personnalisé
  js?: string;                // JavaScript personnalisé
  
  // Historique des prompts et versions
  prompts: Array<{
    content: string;
    timestamp: Date;
    agent: string;            // Quel agent a traité ce prompt
    result_summary?: string;
  }>;
  
  versions: Array<{
    version_number: string;
    html: string;
    created_at: Date;
    created_by: string;       // Agent ou utilisateur
    change_summary: string;
  }>;
  
  // Configuration SEO
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
    structured_data?: any;
  };
  
  // Analytics
  analytics: {
    views: number;
    unique_visitors: number;
    bounce_rate?: number;
    avg_time_on_page?: number;
    last_updated?: Date;
  };
  
  // Configuration de déploiement
  deployment: {
    url?: string;             // URL complète du site déployé
    custom_domain?: string;   // Domaine personnalisé si configuré
    ssl_enabled: boolean;
    cdn_enabled: boolean;
    last_deployed?: Date;
  };
  
  // Intégrations
  integrations: {
    google_analytics?: string;
    facebook_pixel?: string;
    custom_scripts?: Array<{
      name: string;
      code: string;
      placement: 'head' | 'body_start' | 'body_end';
    }>;
  };
  
  // Recommandations des agents
  agent_recommendations: Array<{
    timestamp: Date;
    agent: string;
    category: string;         // 'seo', 'performance', 'content', 'design'
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    implemented: boolean;
  }>;
  
  // Metadata
  _createdAt: Date;
  _updatedAt: Date;
  is_active: boolean;
}

// Schema Mongoose
const EziaProjectSchema = new Schema<IEziaProject>({
  project_id: { type: String, required: true, unique: true },
  business_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true, index: true },
  space_id: { type: String, required: true },
  
  // Informations
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['landing_page', 'portfolio', 'e_commerce', 'blog', 'corporate', 'other'],
    default: 'landing_page'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Contenu
  html: { type: String, required: true },
  css: String,
  js: String,
  
  // Historique
  prompts: [{
    content: String,
    timestamp: { type: Date, default: Date.now },
    agent: String,
    result_summary: String
  }],
  
  versions: [{
    version_number: String,
    html: String,
    created_at: { type: Date, default: Date.now },
    created_by: String,
    change_summary: String
  }],
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    og_image: String,
    structured_data: Schema.Types.Mixed
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    unique_visitors: { type: Number, default: 0 },
    bounce_rate: Number,
    avg_time_on_page: Number,
    last_updated: Date
  },
  
  // Déploiement
  deployment: {
    url: String,
    custom_domain: String,
    ssl_enabled: { type: Boolean, default: true },
    cdn_enabled: { type: Boolean, default: true },
    last_deployed: Date
  },
  
  // Intégrations
  integrations: {
    google_analytics: String,
    facebook_pixel: String,
    custom_scripts: [{
      name: String,
      code: String,
      placement: {
        type: String,
        enum: ['head', 'body_start', 'body_end']
      }
    }]
  },
  
  // Recommandations
  agent_recommendations: [{
    timestamp: { type: Date, default: Date.now },
    agent: String,
    category: String,
    recommendation: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    implemented: { type: Boolean, default: false }
  }],
  
  // Metadata
  is_active: { type: Boolean, default: true }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index
EziaProjectSchema.index({ business_id: 1, status: 1 });
EziaProjectSchema.index({ user_id: 1, is_active: 1 });

// Méthodes
EziaProjectSchema.methods.addVersion = function(html: string, created_by: string, change_summary: string) {
  const version_number = `v${this.versions.length + 1}.0`;
  this.versions.push({
    version_number,
    html,
    created_at: new Date(),
    created_by,
    change_summary
  });
};

EziaProjectSchema.methods.publish = function() {
  this.status = 'published';
  this.deployment.last_deployed = new Date();
};

export const EziaProject = mongoose.models.EziaProject || mongoose.model<IEziaProject>('EziaProject', EziaProjectSchema);