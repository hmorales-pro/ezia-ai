import mongoose, { Document, Schema } from 'mongoose';
import { IGeneratedContent, DailyContentItem, ContentVariant } from '@/lib/types/content-generation';

// Extension du type pour Mongoose Document
export interface IGeneratedContentDocument extends Omit<IGeneratedContent, 'created_at' | 'updated_at'>, Document {
  _createdAt: Date;
  _updatedAt: Date;
}

// Schéma pour les métriques de qualité
const QualityMetricsSchema = new Schema({
  tone_match: { type: Number, min: 0, max: 100 },
  hallucination_risk: { type: Number, min: 0, max: 100 },
  engagement_potential: { type: Number, min: 0, max: 100 }
}, { _id: false });

// Schéma pour les variantes de contenu
const ContentVariantSchema = new Schema({
  variant_id: { type: String, required: true },
  text: { type: String, required: true },
  metadata: {
    cta: { type: String },
    hashtags: [{ type: String }],
    word_count: { type: Number },
    char_count: { type: Number },
    utm_params: { type: Map, of: String }
  },
  quality_metrics: QualityMetricsSchema
}, { _id: false });

// Schéma pour les assets suggérés
const SuggestedAssetsSchema = new Schema({
  image_prompt: { type: String },
  b_roll_ideas: [{ type: String }],
  visual_style: { type: String }
}, { _id: false });

// Schéma pour les items de contenu quotidien
const DailyContentItemSchema = new Schema({
  platform: { type: String, required: true },
  pillar: { type: String, required: true },
  theme: { type: String, required: true },
  variants: [ContentVariantSchema],
  suggested_assets: SuggestedAssetsSchema
}, { _id: false });

// Schéma pour le statut de publication
const PublicationStatusSchema = new Schema({
  variant: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduled_at: { type: Date },
  published_at: { type: Date },
  error: { type: String }
}, { _id: false });

// Schéma pour les métriques de performance
const PerformanceMetricsSchema = new Schema({
  variant: { type: String, required: true },
  impressions: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 }
}, { _id: false });

// Schéma principal du contenu généré
const GeneratedContentSchema = new Schema<IGeneratedContentDocument>({
  // Identifiants
  content_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  calendar_id: {
    type: String,
    required: true,
    index: true,
    ref: 'ContentCalendar'
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

  // Version
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },

  // Date du contenu
  date: {
    type: String,
    required: true,
    index: true
  },

  // Contenu généré
  items: {
    type: [DailyContentItemSchema],
    required: true
  },

  // Statut de publication
  publication_status: {
    type: Map,
    of: PublicationStatusSchema
  },

  // Métriques de performance
  performance_metrics: {
    type: Map,
    of: PerformanceMetricsSchema
  }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index composés pour optimiser les requêtes
GeneratedContentSchema.index({ user_id: 1, business_id: 1 });
GeneratedContentSchema.index({ calendar_id: 1, date: 1 });
GeneratedContentSchema.index({ user_id: 1, date: 1 });
GeneratedContentSchema.index({ business_id: 1, date: 1 });

// Méthodes d'instance
GeneratedContentSchema.methods.getContentForPlatform = function(platform: string) {
  return this.items.find((item: DailyContentItem) => item.platform === platform);
};

GeneratedContentSchema.methods.getBestVariant = function(platform: string) {
  const item = this.getContentForPlatform(platform);
  if (!item || !item.variants.length) return null;

  // Trouver la variante avec le meilleur score d'engagement potentiel
  return item.variants.reduce((best: ContentVariant, current: ContentVariant) => {
    const bestScore = best.quality_metrics?.engagement_potential || 0;
    const currentScore = current.quality_metrics?.engagement_potential || 0;
    return currentScore > bestScore ? current : best;
  }, item.variants[0]);
};

GeneratedContentSchema.methods.getPublicationStatus = function(platform: string) {
  return this.publication_status?.get(platform);
};

GeneratedContentSchema.methods.updatePublicationStatus = function(
  platform: string,
  status: any
) {
  if (!this.publication_status) {
    this.publication_status = new Map();
  }
  this.publication_status.set(platform, status);
  return this.save();
};

GeneratedContentSchema.methods.isPublished = function(platform: string) {
  const status = this.getPublicationStatus(platform);
  return status?.status === 'published';
};

GeneratedContentSchema.methods.isPending = function() {
  const date = new Date(this.date);
  const now = new Date();
  return date > now;
};

// Méthodes statiques
GeneratedContentSchema.statics.findByCalendar = function(calendarId: string) {
  return this.find({ calendar_id: calendarId }).sort({ date: 1 });
};

GeneratedContentSchema.statics.findByDateRange = function(
  userId: string,
  startDate: string,
  endDate: string
) {
  return this.find({
    user_id: userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

GeneratedContentSchema.statics.findUpcoming = function(
  userId: string,
  businessId?: string,
  limit: number = 10
) {
  const today = new Date().toISOString().split('T')[0];
  const query: any = {
    user_id: userId,
    date: { $gte: today }
  };
  if (businessId) {
    query.business_id = businessId;
  }
  return this.find(query).sort({ date: 1 }).limit(limit);
};

GeneratedContentSchema.statics.findScheduled = function(
  userId: string,
  businessId?: string
) {
  const query: any = {
    user_id: userId
  };
  if (businessId) {
    query.business_id = businessId;
  }

  return this.find(query).then((contents: any[]) => {
    return contents.filter(content => {
      const statuses = Array.from(content.publication_status?.values() || []);
      return statuses.some((s: any) => s.status === 'scheduled');
    });
  });
};

GeneratedContentSchema.statics.getPerformanceStats = function(
  calendarId: string,
  platform?: string
) {
  return this.find({ calendar_id: calendarId }).then((contents: any[]) => {
    const stats: Record<string, any> = {};

    contents.forEach(content => {
      const metrics = platform
        ? [content.performance_metrics?.get(platform)]
        : Array.from(content.performance_metrics?.values() || []);

      metrics.forEach((metric: any) => {
        if (!metric) return;

        const key = metric.variant || 'unknown';
        if (!stats[key]) {
          stats[key] = {
            impressions: 0,
            engagement: 0,
            clicks: 0,
            conversions: 0,
            count: 0
          };
        }

        stats[key].impressions += metric.impressions || 0;
        stats[key].engagement += metric.engagement || 0;
        stats[key].clicks += metric.clicks || 0;
        stats[key].conversions += metric.conversions || 0;
        stats[key].count += 1;
      });
    });

    return stats;
  });
};

export const GeneratedContent = mongoose.models.GeneratedContent ||
  mongoose.model<IGeneratedContentDocument>('GeneratedContent', GeneratedContentSchema);
