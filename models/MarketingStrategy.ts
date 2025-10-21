import mongoose from 'mongoose';

// ==================== INTERFACES ====================

export interface IExecutiveSummary {
  vision: string;
  mission: string;
  unique_value_proposition: string;
  target_roi: string;
}

export interface IBrandPositioning {
  brand_essence: string;
  brand_promise: string;
  brand_personality: string[];
  brand_values: string[];
  positioning_statement: string;
  competitive_advantages: string[];
}

export interface ITargetSegment {
  segment_name: string;
  description: string;
  demographics: string;
  psychographics: string;
  size_estimate: string;
  priority: 'high' | 'medium' | 'low';
  reach_strategy: string;
}

export interface IMarketingMix {
  product: {
    core_offerings: string[];
    unique_features: string[];
    differentiation: string;
  };
  price: {
    strategy: string;
    positioning: string;
    tactics: string[];
  };
  place: {
    distribution_channels: string[];
    online_presence: string[];
    partnerships: string[];
  };
  promotion: {
    key_messages: string[];
    communication_channels: string[];
    content_strategy: string;
  };
}

export interface ICustomerJourneyStage {
  touchpoints: string[];
  objectives: string[];
  kpis: string[];
  actions: string[];
}

export interface ICustomerJourney {
  awareness: ICustomerJourneyStage;
  consideration: ICustomerJourneyStage;
  decision: ICustomerJourneyStage;
  retention: ICustomerJourneyStage;
}

export interface ICampaignIdea {
  title: string;
  objective: string;
  target_segment: string;
  channels: string[];
  budget_estimate: string;
  expected_roi: string;
  timeline: string;
  kpis: string[];
}

export interface IImplementationRoadmapPhase {
  phase: string;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  actions: string[];
  budget: string;
  success_metrics: string[];
  dependencies: string[];
}

export interface IMarketingStrategy {
  businessId: string;
  userId: string;
  business_name: string;
  business_description: string;
  industry: string;

  // Sections principales
  executive_summary: IExecutiveSummary;
  brand_positioning: IBrandPositioning;
  target_segments: ITargetSegment[];
  marketing_mix: IMarketingMix;
  customer_journey: ICustomerJourney;
  campaign_ideas: ICampaignIdea[];
  implementation_roadmap: IImplementationRoadmapPhase[];

  // Budget global
  total_budget_estimate?: string;
  budget_allocation?: {
    product: number;
    price: number;
    place: number;
    promotion: number;
  };

  // Métadonnées
  meta: {
    generated_at: Date;
    next_refresh_date: Date;
    refresh_frequency: 'monthly' | 'quarterly' | 'weekly';
    ai_model: string;
    data_sources: Array<{
      name: string;
      type: 'web' | 'api' | 'social' | 'manual';
      collected_at: Date;
      reliability: 'high' | 'medium' | 'low';
    }>;
  };

  // Rapports
  reports: {
    markdown?: string;
    pdf_url?: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==================== MONGOOSE SCHEMAS ====================

const ExecutiveSummarySchema = new mongoose.Schema({
  vision: { type: String, required: true },
  mission: { type: String, required: true },
  unique_value_proposition: { type: String, required: true },
  target_roi: { type: String, required: true },
}, { _id: false });

const BrandPositioningSchema = new mongoose.Schema({
  brand_essence: { type: String, required: true },
  brand_promise: { type: String, required: true },
  brand_personality: [String],
  brand_values: [String],
  positioning_statement: { type: String, required: true },
  competitive_advantages: [String],
}, { _id: false });

const TargetSegmentSchema = new mongoose.Schema({
  segment_name: { type: String, required: true },
  description: { type: String, required: true },
  demographics: String,
  psychographics: String,
  size_estimate: String,
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  reach_strategy: String,
}, { _id: false });

const MarketingMixSchema = new mongoose.Schema({
  product: {
    core_offerings: [String],
    unique_features: [String],
    differentiation: String,
  },
  price: {
    strategy: String,
    positioning: String,
    tactics: [String],
  },
  place: {
    distribution_channels: [String],
    online_presence: [String],
    partnerships: [String],
  },
  promotion: {
    key_messages: [String],
    communication_channels: [String],
    content_strategy: String,
  },
}, { _id: false });

const CustomerJourneyStageSchema = new mongoose.Schema({
  touchpoints: [String],
  objectives: [String],
  kpis: [String],
  actions: [String],
}, { _id: false });

const CustomerJourneySchema = new mongoose.Schema({
  awareness: CustomerJourneyStageSchema,
  consideration: CustomerJourneyStageSchema,
  decision: CustomerJourneyStageSchema,
  retention: CustomerJourneyStageSchema,
}, { _id: false });

const CampaignIdeaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objective: { type: String, required: true },
  target_segment: String,
  channels: [String],
  budget_estimate: String,
  expected_roi: String,
  timeline: String,
  kpis: [String],
}, { _id: false });

const ImplementationRoadmapPhaseSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  timeline: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  actions: [String],
  budget: String,
  success_metrics: [String],
  dependencies: [String],
}, { _id: false });

const DataSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['web', 'api', 'social', 'manual'],
    required: true
  },
  collected_at: { type: Date, required: true },
  reliability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
}, { _id: false });

const MetaSchema = new mongoose.Schema({
  generated_at: { type: Date, required: true },
  next_refresh_date: { type: Date, required: true },
  refresh_frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  ai_model: { type: String, required: true },
  data_sources: [DataSourceSchema],
}, { _id: false });

const MarketingStrategySchema = new mongoose.Schema({
  businessId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  business_name: { type: String, required: true },
  business_description: { type: String, required: true },
  industry: { type: String, required: true },

  executive_summary: { type: ExecutiveSummarySchema, required: true },
  brand_positioning: { type: BrandPositioningSchema, required: true },
  target_segments: [TargetSegmentSchema],
  marketing_mix: { type: MarketingMixSchema, required: true },
  customer_journey: { type: CustomerJourneySchema, required: true },
  campaign_ideas: [CampaignIdeaSchema],
  implementation_roadmap: [ImplementationRoadmapPhaseSchema],

  total_budget_estimate: String,
  budget_allocation: {
    product: Number,
    price: Number,
    place: Number,
    promotion: Number,
  },

  meta: { type: MetaSchema, required: true },

  reports: {
    markdown: String,
    pdf_url: String,
  },
}, {
  timestamps: true,
});

// Index composé pour recherche rapide
MarketingStrategySchema.index({ businessId: 1, userId: 1 });

export const MarketingStrategy = mongoose.models.MarketingStrategy || mongoose.model<IMarketingStrategy>('MarketingStrategy', MarketingStrategySchema);
