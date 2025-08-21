import mongoose, { Document, Schema } from 'mongoose';

// Interface TypeScript pour le Business
export interface IBusiness {
  // Identifiants
  user_id: string;              // HuggingFace user ID
  business_id: string;          // ID unique du business
  
  // Informations de base
  name: string;                 // Nom du business
  description: string;          // Description courte
  industry: string;             // Secteur d'activité
  stage: 'idea' | 'startup' | 'growth' | 'established';
  
  // Contact & Présence
  website_url?: string;         // URL du site web (HuggingFace Space)
  hasWebsite?: 'yes' | 'no';   // Si le business a déjà un site
  wantsWebsite?: 'yes' | 'no' | 'later'; // Si le business veut un site généré
  existingWebsiteUrl?: string;  // URL du site existant (si hasWebsite='yes')
  websiteGeneratedAt?: Date;    // Date de génération automatique du site
  space_id?: string;            // ID du HuggingFace Space associé
  email?: string;
  phone?: string;
  
  // Réseaux sociaux
  social_media: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  
  // Analyse de marché (généré par les agents)
  market_analysis: {
    target_audience: string;
    value_proposition: string;
    market_size?: string;
    competitors?: string[];
    opportunities?: string[];
    threats?: string[];
    last_updated?: Date;
  };
  
  // Marketing (généré par les agents)
  marketing_strategy: {
    positioning: string;
    key_messages: string[];
    channels: string[];
    content_calendar?: Array<{
      date: Date;
      type: string;
      content: string;
      status: 'draft' | 'scheduled' | 'published';
    }>;
    last_updated?: Date;
  };
  
  // Historique des interactions avec Ezia
  ezia_interactions: Array<{
    timestamp: Date;
    agent: string;              // Nom de l'agent (Ezia, chef d'équipe, etc.)
    interaction_type: string;   // Type d'interaction (renamed from 'type' to avoid mongoose conflicts)
    summary: string;            // Résumé de l'interaction
    content?: string;           // Contenu complet de l'analyse/réponse
    recommendations?: string[]; // Recommandations données
  }>;
  
  // Métriques et performance
  metrics: {
    website_visits?: number;
    conversion_rate?: number;
    social_engagement?: number;
    last_updated?: Date;
  };
  
  // Modèle économique et offre
  business_model: {
    type: 'product' | 'service' | 'hybrid' | 'marketplace' | 'subscription' | 'other';
    revenue_streams?: string[];
    business_plan_summary?: string;
    unique_selling_points?: string[];
  };
  
  // Produits et services
  offerings: Array<{
    id: string;
    name: string;
    description: string;
    type: 'product' | 'service';
    price: number;
    currency: string;
    unit?: string;  // par heure, par pièce, par mois, etc.
    cost_breakdown?: {
      raw_materials?: number;
      labor?: number;
      overhead?: number;
      other?: number;
    };
    margin?: number;  // en pourcentage
    target_margin?: number;
    min_quantity?: number;
    max_quantity?: number;
    availability?: 'in_stock' | 'on_demand' | 'seasonal' | 'limited';
    features?: string[];
    benefits?: string[];
  }>;
  
  // Informations financières
  financial_info: {
    monthly_revenue?: number;
    monthly_expenses?: number;
    break_even_point?: number;
    funding_status?: 'bootstrapped' | 'seeking' | 'funded';
    funding_amount_needed?: number;
    pricing_strategy?: string;
    payment_methods?: string[];
  };
  
  // Clients et marché cible
  customer_insights: {
    ideal_customer_profile?: string;
    customer_pain_points?: string[];
    customer_journey?: string;
    acquisition_channels?: string[];
    retention_strategy?: string;
    average_customer_value?: number;
    customer_acquisition_cost?: number;
  };
  
  // Ressources et capacités
  resources: {
    team_size?: number;
    key_skills?: string[];
    production_capacity?: string;
    suppliers?: string[];
    partners?: string[];
    certifications?: string[];
  };
  
  // Objectifs business
  goals: Array<{
    goal_id: string;
    title: string;
    description: string;
    category: 'revenue' | 'growth' | 'product' | 'marketing' | 'operations' | 'other';
    target_date: Date;
    created_at: Date;
    completed_at?: Date;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    progress: number;          // 0-100
    metrics?: {
      target_value?: string;
      unit?: string;
      current_value?: string;
    };
    milestones?: Array<{
      title: string;
      achieved_at: Date;
    }>;
    updates?: Array<{
      date: Date;
      note: string;
      progress: number;
      updated_by?: string;
    }>;
  }>;
  
  // Metadata
  _createdAt: Date;
  _updatedAt: Date;
  is_active: boolean;
}

// Schema Mongoose
const BusinessSchema = new Schema<IBusiness>({
  user_id: { type: String, required: true, index: true },
  business_id: { type: String, required: true, unique: true },
  
  // Informations de base
  name: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['idea', 'startup', 'growth', 'established'],
    required: true 
  },
  
  // Contact & Présence
  website_url: { type: String },
  hasWebsite: { type: String, enum: ['yes', 'no'] },
  wantsWebsite: { type: String, enum: ['yes', 'no', 'later'] },
  existingWebsiteUrl: { type: String },
  websiteGeneratedAt: { type: Date },
  space_id: { type: String },
  email: { type: String },
  phone: { type: String },
  
  // Réseaux sociaux
  social_media: {
    linkedin: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String }
  },
  
  // Analyse de marché
  market_analysis: {
    target_audience: { type: String },
    value_proposition: { type: String },
    market_size: { type: String },
    competitors: [{ type: String }],
    opportunities: [{ type: String }],
    threats: [{ type: String }],
    last_updated: { type: Date }
  },
  
  // Marketing
  marketing_strategy: {
    positioning: { type: String },
    key_messages: [{ type: String }],
    channels: [{ type: String }],
    content_calendar: [{
      date: { type: Date },
      type: { type: String },
      content: { type: String },
      status: {
        type: String,
        enum: ['draft', 'scheduled', 'published']
      }
    }],
    last_updated: { type: Date }
  },
  
  // Historique Ezia
  ezia_interactions: {
    type: [{
      timestamp: { type: Date, default: Date.now },
      agent: { type: String },
      interaction_type: { type: String },
      summary: { type: String },
      content: { type: String },
      recommendations: [{ type: String }]
    }],
    default: []
  },
  
  // Métriques
  metrics: {
    website_visits: { type: Number },
    conversion_rate: { type: Number },
    social_engagement: { type: Number },
    last_updated: { type: Date }
  },
  
  // Modèle économique
  business_model: {
    type: {
      type: String,
      enum: ['product', 'service', 'hybrid', 'marketplace', 'subscription', 'other']
    },
    revenue_streams: [{ type: String }],
    business_plan_summary: { type: String },
    unique_selling_points: [{ type: String }]
  },
  
  // Produits et services
  offerings: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['product', 'service'],
      required: true
    },
    price: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    unit: { type: String },
    cost_breakdown: {
      raw_materials: { type: Number },
      labor: { type: Number },
      overhead: { type: Number },
      other: { type: Number }
    },
    margin: { type: Number },
    target_margin: { type: Number },
    min_quantity: { type: Number },
    max_quantity: { type: Number },
    availability: {
      type: String,
      enum: ['in_stock', 'on_demand', 'seasonal', 'limited']
    },
    features: [{ type: String }],
    benefits: [{ type: String }]
  }],
  
  // Informations financières
  financial_info: {
    monthly_revenue: { type: Number },
    monthly_expenses: { type: Number },
    break_even_point: { type: Number },
    funding_status: {
      type: String,
      enum: ['bootstrapped', 'seeking', 'funded']
    },
    funding_amount_needed: { type: Number },
    pricing_strategy: { type: String },
    payment_methods: [{ type: String }]
  },
  
  // Insights clients
  customer_insights: {
    ideal_customer_profile: { type: String },
    customer_pain_points: [{ type: String }],
    customer_journey: { type: String },
    acquisition_channels: [{ type: String }],
    retention_strategy: { type: String },
    average_customer_value: { type: Number },
    customer_acquisition_cost: { type: Number }
  },
  
  // Ressources
  resources: {
    team_size: { type: Number },
    key_skills: [{ type: String }],
    production_capacity: { type: String },
    suppliers: [{ type: String }],
    partners: [{ type: String }],
    certifications: [{ type: String }]
  },
  
  // Objectifs
  goals: [{
    goal_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['revenue', 'growth', 'product', 'marketing', 'operations', 'other'],
      required: true
    },
    target_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    metrics: {
      target_value: { type: String },
      unit: { type: String },
      current_value: { type: String }
    },
    milestones: [{
      title: { type: String },
      achieved_at: { type: Date }
    }],
    updates: [{
      date: { type: Date, default: Date.now },
      note: { type: String },
      progress: { type: Number },
      updated_by: { type: String }
    }]
  }],
  
  // Metadata
  is_active: { type: Boolean, default: true }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index composé pour améliorer les performances
BusinessSchema.index({ user_id: 1, business_id: 1 });
BusinessSchema.index({ user_id: 1, is_active: 1 });

// Méthodes virtuelles
BusinessSchema.virtual('completion_score').get(function() {
  // Calcul du score de complétion du profil business
  let score = 0;
  const fields = [
    this.description,
    this.website_url,
    this.market_analysis?.target_audience,
    this.market_analysis?.value_proposition,
    this.marketing_strategy?.positioning,
    this.goals?.length > 0
  ];
  
  fields.forEach(field => {
    if (field) score += 100 / fields.length;
  });
  
  return Math.round(score);
});

export const Business = mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);