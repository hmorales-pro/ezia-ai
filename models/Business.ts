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
    type: string;               // Type d'interaction
    summary: string;            // Résumé de l'interaction
    recommendations?: string[]; // Recommandations données
  }>;
  
  // Métriques et performance
  metrics: {
    website_visits?: number;
    conversion_rate?: number;
    social_engagement?: number;
    last_updated?: Date;
  };
  
  // Objectifs business
  goals: Array<{
    title: string;
    description: string;
    target_date: Date;
    status: 'pending' | 'in_progress' | 'completed';
    progress?: number;          // 0-100
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
  website_url: String,
  space_id: String,
  email: String,
  phone: String,
  
  // Réseaux sociaux
  social_media: {
    linkedin: String,
    twitter: String,
    instagram: String,
    facebook: String,
    youtube: String
  },
  
  // Analyse de marché
  market_analysis: {
    target_audience: String,
    value_proposition: String,
    market_size: String,
    competitors: [String],
    opportunities: [String],
    threats: [String],
    last_updated: Date
  },
  
  // Marketing
  marketing_strategy: {
    positioning: String,
    key_messages: [String],
    channels: [String],
    content_calendar: [{
      date: Date,
      type: String,
      content: String,
      status: {
        type: String,
        enum: ['draft', 'scheduled', 'published']
      }
    }],
    last_updated: Date
  },
  
  // Historique Ezia
  ezia_interactions: [{
    timestamp: { type: Date, default: Date.now },
    agent: String,
    type: String,
    summary: String,
    recommendations: [String]
  }],
  
  // Métriques
  metrics: {
    website_visits: Number,
    conversion_rate: Number,
    social_engagement: Number,
    last_updated: Date
  },
  
  // Objectifs
  goals: [{
    title: String,
    description: String,
    target_date: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    progress: { type: Number, min: 0, max: 100 }
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

export interface IBusinessDocument extends IBusiness, Document {
  completion_score: number;
}

export const Business = mongoose.models.Business || mongoose.model<IBusinessDocument>('Business', BusinessSchema);