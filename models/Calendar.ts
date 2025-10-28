import mongoose from 'mongoose';

export interface IContentItem {
  id: string;
  date: string;
  title: string;
  type: "article" | "video" | "image" | "social" | "email" | "ad";
  status: "draft" | "scheduled" | "published" | "suggested" | "approved" | "generating" | "generated";
  platform?: string[];
  description?: string;
  time?: string;
  tags?: string[];
  ai_generated?: boolean;
  content?: string;
  imageUrl?: string;
  agent?: string;
  agent_emoji?: string;
  aiCapabilities?: string[];
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
  marketingObjective?: string;
  objectiveDescription?: string;
  performance?: {
    views?: number;
    engagement?: number;
    clicks?: number;
    estimatedReach?: number;
    estimatedEngagement?: number;
  };
}

export interface IPublicationRule {
  id: string;
  platform: string;
  contentType: string;
  frequency: number;
  period: "day" | "week" | "month";
}

export interface ICalendar {
  businessId: string;
  userId: string;
  items: IContentItem[];
  publicationRules?: IPublicationRule[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["article", "video", "image", "social", "email", "ad"],
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "published", "suggested", "approved", "generating", "generated"],
    required: true
  },
  platform: [String],
  description: String,
  time: String,
  tags: [String],
  ai_generated: Boolean,
  content: String,
  imageUrl: String,
  agent: String,
  agent_emoji: String,
  aiCapabilities: [String],
  keywords: [String],
  targetAudience: String,
  tone: String,
  marketingObjective: String,
  objectiveDescription: String,
  performance: {
    views: Number,
    engagement: Number,
    clicks: Number,
    estimatedReach: Number,
    estimatedEngagement: Number,
  },
}, { _id: false });

const PublicationRuleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  platform: { type: String, required: true },
  contentType: { type: String, required: true },
  frequency: { type: Number, required: true },
  period: {
    type: String,
    enum: ['day', 'week', 'month'],
    required: true
  }
}, { _id: false });

const CalendarSchema = new mongoose.Schema<ICalendar>({
  businessId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  items: [ContentItemSchema],
  publicationRules: [PublicationRuleSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index composé pour rechercher par businessId et userId
CalendarSchema.index({ businessId: 1, userId: 1 });

// Mettre à jour automatiquement le timestamp updatedAt
CalendarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Calendar = mongoose.models.Calendar || mongoose.model<ICalendar>('Calendar', CalendarSchema);
