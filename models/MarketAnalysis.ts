import mongoose from 'mongoose';

// Types pour l'analyse de marché
export interface IMarketSegment {
  name: string;
  size: string;
  growth: string;
  characteristics: string[];
}

export interface IMarketOverview {
  market_size: string;
  growth_rate: string;
  trends: string[];
  key_drivers: string[];
  segments: IMarketSegment[];
}

export interface ICompetitor {
  name: string;
  position: string;
  strengths: string[];
  weaknesses: string[];
  market_share?: string;
  pricing?: string;
  differentiation?: string;
}

export interface ICompetitionAnalysis {
  main_competitors: ICompetitor[];
  competitive_landscape: string;
  entry_barriers: string[];
  competitive_advantages: string[];
}

export interface ICustomerPersona {
  name: string;
  demographics: {
    age?: string;
    location?: string;
    industry?: string;
    company_size?: string;
    role?: string;
  };
  pain_points: string[];
  needs: string[];
  buying_behavior: string[];
  communication_channels: string[];
}

export interface ICustomerAnalysis {
  personas: ICustomerPersona[];
  customer_needs: string[];
  buying_criteria: string[];
  decision_makers: string[];
}

export interface IOpportunity {
  title: string;
  description: string;
  potential_impact: 'high' | 'medium' | 'low';
  timeframe: string;
  required_resources?: string[];
}

export interface IThreat {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation?: string[];
}

export interface IOceanBlueStrategy {
  eliminate: string[];
  reduce: string[];
  increase: string[];
  create: string[];
  value_proposition: string;
  target_market: string;
}

export interface IScoring {
  market_attractiveness: number; // 0-100
  competitive_intensity: number; // 0-100
  entry_difficulty: number; // 0-100
  growth_potential: number; // 0-100
  customer_demand: number; // 0-100
  market_opportunity_index: number; // 0-100 (MOI global)
  confidence_level: 'high' | 'medium' | 'low';
  scoring_rationale: string;
}

export interface IDataSource {
  name: string;
  type: 'web' | 'api' | 'social' | 'seo' | 'database' | 'manual';
  url?: string;
  collected_at: Date;
  reliability: 'high' | 'medium' | 'low';
}

export interface IMarketAnalysisMeta {
  analysis_version: string;
  generated_at: Date;
  last_updated: Date;
  next_refresh_date: Date;
  refresh_frequency: 'weekly' | 'monthly' | 'quarterly';
  data_sources: IDataSource[];
  llm_model: string;
  analyst_notes?: string;
}

export interface IMarketAnalysis {
  businessId: string;
  userId: string;
  industry: string;
  business_name: string;
  business_description: string;

  // Analyse structurée
  market_overview: IMarketOverview;
  competition: ICompetitionAnalysis;
  customer_analysis: ICustomerAnalysis;
  opportunities: IOpportunity[];
  threats: IThreat[];
  ocean_blue_strategy: IOceanBlueStrategy;
  scoring: IScoring;

  // Métadonnées
  meta: IMarketAnalysisMeta;

  // Rapports générés
  reports: {
    markdown?: string;
    pdf_url?: string;
    json_export?: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Schemas Mongoose
const MarketSegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  growth: { type: String, required: true },
  characteristics: [String],
}, { _id: false });

const TrendSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String, enum: ['Élevé', 'Moyen', 'Faible'], required: true },
  source: String, // Source ou URL (optionnel)
}, { _id: false });

const MarketOverviewSchema = new mongoose.Schema({
  market_size: { type: String, required: true },
  growth_rate: { type: String, required: true },
  trends: [String], // Ancienne version (pour rétro-compatibilité)
  key_trends: [TrendSchema], // Nouvelle version enrichie
  key_drivers: [String],
  segments: [MarketSegmentSchema],
  market_maturity: String,
}, { _id: false });

const CompetitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }, // Description détaillée (anciennement position)
  website: String, // URL du site web
  position: String, // Positionnement (optionnel, pour rétro-compatibilité)
  strengths: [String],
  weaknesses: [String],
  market_share: String,
  pricing: String,
  differentiation: String,
}, { _id: false });

const CompetitionAnalysisSchema = new mongoose.Schema({
  main_competitors: [CompetitorSchema],
  competitive_landscape: { type: String, required: true },
  entry_barriers: [String],
  competitive_advantages: [String],
}, { _id: false });

const CustomerPersonaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  demographics: {
    age: String,
    location: String,
    industry: String,
    company_size: String,
    role: String,
  },
  pain_points: [String],
  needs: [String],
  buying_behavior: [String],
  communication_channels: [String],
}, { _id: false });

const CustomerAnalysisSchema = new mongoose.Schema({
  personas: [CustomerPersonaSchema],
  customer_needs: [String],
  buying_criteria: [String],
  decision_makers: [String],
}, { _id: false });

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  potential_impact: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  timeframe: { type: String, required: true },
  required_resources: [String],
  examples: String, // Exemples concrets ou acteurs similaires
}, { _id: false });

const ThreatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  probability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  mitigation: [String],
}, { _id: false });

const OceanBlueStrategySchema = new mongoose.Schema({
  eliminate: [String],
  reduce: [String],
  increase: [String],
  create: [String],
  value_proposition: { type: String, required: true },
  target_market: { type: String, required: true },
}, { _id: false });

const ScoringSchema = new mongoose.Schema({
  market_attractiveness: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  competitive_intensity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  entry_difficulty: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  growth_potential: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  customer_demand: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  market_opportunity_index: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  confidence_level: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  scoring_rationale: { type: String, required: true },
}, { _id: false });

const DataSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['web', 'api', 'social', 'seo', 'database', 'manual'],
    required: true
  },
  url: String,
  collected_at: { type: Date, required: true },
  reliability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
}, { _id: false });

const MetaSchema = new mongoose.Schema({
  analysis_version: { type: String, required: true, default: '1.0' },
  generated_at: { type: Date, required: true },
  last_updated: { type: Date, required: true },
  next_refresh_date: { type: Date, required: true },
  refresh_frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    required: true,
    default: 'monthly'
  },
  data_sources: [DataSourceSchema],
  llm_model: { type: String, required: true },
  analyst_notes: String,
}, { _id: false });

const ReportsSchema = new mongoose.Schema({
  markdown: String,
  pdf_url: String,
  json_export: String,
}, { _id: false });

// Schema principal
const MarketAnalysisSchema = new mongoose.Schema<IMarketAnalysis>({
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
  industry: {
    type: String,
    required: true,
    index: true,
  },
  business_name: {
    type: String,
    required: true,
  },
  business_description: {
    type: String,
    required: true,
  },
  market_overview: {
    type: MarketOverviewSchema,
    required: true,
  },
  competition: {
    type: CompetitionAnalysisSchema,
    required: true,
  },
  customer_analysis: {
    type: CustomerAnalysisSchema,
    required: true,
  },
  opportunities: [OpportunitySchema],
  threats: [ThreatSchema],
  ocean_blue_strategy: {
    type: OceanBlueStrategySchema,
    required: true,
  },
  scoring: {
    type: ScoringSchema,
    required: true,
  },
  meta: {
    type: MetaSchema,
    required: true,
  },
  reports: {
    type: ReportsSchema,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index composés
MarketAnalysisSchema.index({ businessId: 1, userId: 1 });
MarketAnalysisSchema.index({ industry: 1, 'scoring.market_opportunity_index': -1 });
MarketAnalysisSchema.index({ 'meta.next_refresh_date': 1 });

// Mise à jour automatique du timestamp
MarketAnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const MarketAnalysis = mongoose.models.MarketAnalysis || mongoose.model<IMarketAnalysis>('MarketAnalysis', MarketAnalysisSchema);
