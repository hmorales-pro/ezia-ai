import mongoose, { Document, Schema } from 'mongoose';
import {
  IContentCalendar,
  BusinessProfile,
  Platform,
  Timeframe,
  Cadence,
  Pillar,
  Campaign,
  EditorialLine,
  CalendarDay,
  AdvancedOptions
} from '@/lib/types/content-generation';

// Extension du type pour Mongoose Document
export interface IContentCalendarDocument extends Omit<IContentCalendar, 'created_at' | 'updated_at'>, Document {
  _createdAt: Date;
  _updatedAt: Date;
}

// Schéma pour la voix de la marque
const BrandVoiceSchema = new Schema({
  tone: [{ type: String }],
  style_rules: [{ type: String }],
  do: [{ type: String }],
  dont: [{ type: String }]
}, { _id: false });

// Schéma pour l'audience
const AudienceSchema = new Schema({
  name: { type: String, required: true },
  pain_points: [{ type: String }],
  goals: [{ type: String }]
}, { _id: false });

// Schéma pour le profil business
const BusinessProfileSchema = new Schema({
  brand_name: { type: String, required: true },
  one_liner: { type: String, required: true },
  industry: { type: String, required: true },
  audiences: [AudienceSchema],
  unique_value_prop: [{ type: String }],
  brand_voice: BrandVoiceSchema
}, { _id: false });

// Schéma pour les plateformes
const PlatformSchema = new Schema({
  name: {
    type: String,
    enum: ['LinkedIn', 'Twitter/X', 'Facebook', 'Instagram', 'YouTube'],
    required: true
  },
  post_length_hint: { type: String }
}, { _id: false });

// Schéma pour les piliers
const PillarSchema = new Schema({
  name: { type: String, required: true },
  ratio: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    validate: {
      validator: function(v: number) {
        return v >= 0 && v <= 1;
      },
      message: 'Ratio must be between 0 and 1'
    }
  }
}, { _id: false });

// Schéma pour les campagnes
const CampaignSchema = new Schema({
  name: { type: String, required: true },
  goal: {
    type: String,
    enum: ['awareness', 'engagement', 'bookings', 'conversion', 'traffic'],
    required: true
  },
  cta: { type: String, required: true },
  landing_url: { type: String }
}, { _id: false });

// Schéma pour le timeframe
const TimeframeSchema = new Schema({
  start_date: { type: String, required: true },
  end_date: { type: String, required: true }
}, { _id: false });

// Schéma pour la cadence
const CadenceSchema = new Schema({
  days_per_week: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  }
}, { _id: false });

// Schéma pour la ligne éditoriale
const EditorialLineSchema = new Schema({
  positioning_statement: { type: String, required: true },
  voice: [{ type: String }],
  key_themes: [{ type: String }]
}, { _id: false });

// Schéma pour les plans de plateforme
const PlatformPlanSchema = new Schema({
  platform: { type: String, required: true },
  objective: {
    type: String,
    enum: ['reach', 'engagement', 'conversion', 'traffic', 'brand'],
    required: true
  },
  cta: { type: String }
}, { _id: false });

// Schéma pour les jours du calendrier
const CalendarDaySchema = new Schema({
  date: { type: String, required: true },
  theme: { type: String, required: true },
  pillar: { type: String, required: true },
  platform_plans: [PlatformPlanSchema],
  campaign_id: { type: String }
}, { _id: false });

// Schéma pour les options avancées
const AdvancedOptionsSchema = new Schema({
  ab_testing: {
    enable: { type: Boolean, default: false },
    split: { type: Number, min: 0, max: 1, default: 0.5 }
  },
  repurposing: {
    enable: { type: Boolean, default: false },
    from_platform: { type: String },
    to_platforms: [{ type: String }]
  },
  suggested_assets: {
    enable: { type: Boolean, default: false },
    fields: [{
      type: String,
      enum: ['image_prompt', 'b_roll_ideas', 'visual_style']
    }]
  },
  forbidden_terms: [{ type: String }],
  compliance_check: { type: Boolean, default: false }
}, { _id: false });

// Schéma principal du calendrier de contenu
const ContentCalendarSchema = new Schema<IContentCalendarDocument>({
  // Identifiants
  calendar_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  business_id: {
    type: String,
    required: true,
    index: true
  },

  // Version et metadata
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  locale: {
    type: String,
    required: true,
    default: 'fr-FR'
  },

  // Contexte business
  business_profile: {
    type: BusinessProfileSchema,
    required: true
  },
  platforms: [PlatformSchema],

  // Configuration
  timeframe: {
    type: TimeframeSchema,
    required: true
  },
  cadence: {
    type: CadenceSchema,
    required: true
  },
  pillars: {
    type: [PillarSchema],
    required: true,
    validate: {
      validator: function(pillars: Pillar[]) {
        const totalRatio = pillars.reduce((sum, p) => sum + p.ratio, 0);
        return Math.abs(totalRatio - 1.0) < 0.01;
      },
      message: 'Sum of pillar ratios must equal 1.0'
    }
  },
  campaigns: [CampaignSchema],

  // Ligne éditoriale
  editorial_line: {
    type: EditorialLineSchema,
    required: true
  },

  // Calendrier
  calendar: {
    type: [CalendarDaySchema],
    required: true
  },

  // Options avancées
  advanced_options: AdvancedOptionsSchema,

  // Statut
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index composés pour optimiser les requêtes
ContentCalendarSchema.index({ user_id: 1, business_id: 1 });
ContentCalendarSchema.index({ user_id: 1, status: 1 });
ContentCalendarSchema.index({ business_id: 1, status: 1 });
ContentCalendarSchema.index({ 'timeframe.start_date': 1, 'timeframe.end_date': 1 });

// Méthodes d'instance
ContentCalendarSchema.methods.isActive = function() {
  const now = new Date().toISOString().split('T')[0];
  return this.status === 'active' &&
         now >= this.timeframe.start_date &&
         now <= this.timeframe.end_date;
};

ContentCalendarSchema.methods.getContentForDate = function(date: string) {
  return this.calendar.find(day => day.date === date);
};

ContentCalendarSchema.methods.getPillarDistribution = function() {
  const distribution: Record<string, number> = {};
  this.calendar.forEach(day => {
    distribution[day.pillar] = (distribution[day.pillar] || 0) + 1;
  });
  return distribution;
};

// Méthodes statiques
ContentCalendarSchema.statics.findActiveCalendars = function(userId: string, businessId?: string) {
  const query: any = {
    user_id: userId,
    status: 'active'
  };
  if (businessId) {
    query.business_id = businessId;
  }
  return this.find(query);
};

ContentCalendarSchema.statics.findByDateRange = function(
  userId: string,
  startDate: string,
  endDate: string
) {
  return this.find({
    user_id: userId,
    $or: [
      {
        'timeframe.start_date': { $lte: endDate },
        'timeframe.end_date': { $gte: startDate }
      }
    ]
  });
};

export const ContentCalendar = mongoose.models.ContentCalendar ||
  mongoose.model<IContentCalendarDocument>('ContentCalendar', ContentCalendarSchema);
