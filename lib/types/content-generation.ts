/**
 * Types TypeScript pour la génération de contenu Ezia
 * Basé sur les spécifications JSON pour MistralAI
 * @version 1.0.0
 */

// ==================== PROFIL UTILISATEUR & CONTEXTE ====================

export interface BrandVoice {
  tone: string[];
  style_rules: string[];
  do: string[];
  dont: string[];
}

export interface Audience {
  name: string;
  pain_points: string[];
  goals: string[];
}

export interface BusinessProfile {
  brand_name: string;
  one_liner: string;
  industry: string;
  audiences: Audience[];
  unique_value_prop: string[];
  brand_voice: BrandVoice;
}

export interface Platform {
  name: 'LinkedIn' | 'Twitter/X' | 'Facebook' | 'Instagram' | 'YouTube';
  post_length_hint: string;
}

export interface LLMSettings {
  provider: 'MistralAI';
  model: string;
  temperature: number;
}

export interface GenerationSettings {
  llm: LLMSettings;
  output_variants: number;
  enable_self_review: boolean;
}

export interface ContentGenerationContext {
  version: string;
  locale: string;
  business_profile: BusinessProfile;
  platforms: Platform[];
  generation_settings: GenerationSettings;
}

// ==================== LIGNE ÉDITORIALE & CALENDRIER ====================

export interface Pillar {
  name: string;
  ratio: number; // 0-1 (ex: 0.4 = 40%)
}

export interface Campaign {
  name: string;
  goal: 'awareness' | 'engagement' | 'bookings' | 'conversion' | 'traffic';
  cta: string;
  landing_url?: string;
}

export interface Timeframe {
  start_date: string; // ISO date
  end_date: string;   // ISO date
}

export interface Cadence {
  days_per_week: number; // 1-7
}

export interface ContentCalendarCreateRequest {
  request_type: 'content_calendar_create';
  timeframe: Timeframe;
  cadence: Cadence;
  pillars: Pillar[];
  campaigns?: Campaign[];
}

export interface PlatformPlan {
  platform: string;
  objective: 'reach' | 'engagement' | 'conversion' | 'traffic' | 'brand';
  cta?: string;
}

export interface CalendarDay {
  date: string; // ISO date
  theme: string;
  pillar: string;
  platform_plans: PlatformPlan[];
  campaign_id?: string;
}

export interface EditorialLine {
  positioning_statement: string;
  voice: string[];
  key_themes: string[];
}

export interface ContentCalendarResponse {
  response_type: 'content_calendar';
  version: string;
  calendar_id: string;
  editorial_line: EditorialLine;
  calendar: CalendarDay[];
  created_at: string;
}

// ==================== GÉNÉRATION DE CONTENU QUOTIDIEN ====================

export interface DailyContentGenerateRequest {
  request_type: 'daily_content_generate';
  calendar_id: string;
  date: string; // ISO date
  platforms: string[];
  variants: number; // nombre de variantes à générer (1-3)
  tracking?: {
    enable_utm: boolean;
  };
}

export interface ContentVariant {
  variant_id: string; // 'A', 'B', 'C'
  text: string;
  metadata: {
    cta?: string;
    hashtags?: string[];
    word_count?: number;
    char_count?: number;
    utm_params?: Record<string, string>;
  };
  quality_metrics?: {
    tone_match: number; // 0-100
    hallucination_risk: number; // 0-100
    engagement_potential: number; // 0-100
  };
}

export interface DailyContentItem {
  platform: string;
  pillar: string;
  theme: string;
  variants: ContentVariant[];
  suggested_assets?: {
    image_prompt?: string;
    b_roll_ideas?: string[];
    visual_style?: string;
  };
}

export interface DailyContentResponse {
  response_type: 'daily_content';
  version: string;
  content_id: string;
  calendar_id: string;
  date: string;
  items: DailyContentItem[];
  created_at: string;
}

// ==================== OPTIONS AVANCÉES ====================

export interface ABTestingOptions {
  enable: boolean;
  split: number; // 0-1 (ex: 0.5 = 50/50)
}

export interface RepurposingOptions {
  enable: boolean;
  from_platform: string;
  to_platforms: string[];
}

export interface SuggestedAssetsOptions {
  enable: boolean;
  fields: ('image_prompt' | 'b_roll_ideas' | 'visual_style')[];
}

export interface AdvancedOptions {
  ab_testing?: ABTestingOptions;
  repurposing?: RepurposingOptions;
  suggested_assets?: SuggestedAssetsOptions;
  forbidden_terms?: string[];
  compliance_check?: boolean;
}

// ==================== MODÈLE MONGODB ====================

export interface IContentCalendar {
  // Identifiants
  calendar_id: string;
  user_id: string;
  business_id: string;

  // Version et metadata
  version: string;
  locale: string;

  // Contexte business
  business_profile: BusinessProfile;
  platforms: Platform[];

  // Configuration
  timeframe: Timeframe;
  cadence: Cadence;
  pillars: Pillar[];
  campaigns?: Campaign[];

  // Ligne éditoriale
  editorial_line: EditorialLine;

  // Calendrier
  calendar: CalendarDay[];

  // Options avancées
  advanced_options?: AdvancedOptions;

  // Statut
  status: 'draft' | 'active' | 'completed' | 'archived';

  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface IGeneratedContent {
  // Identifiants
  content_id: string;
  calendar_id: string;
  user_id: string;
  business_id: string;

  // Version
  version: string;

  // Date du contenu
  date: string; // ISO date

  // Contenu généré
  items: DailyContentItem[];

  // Statut de publication
  publication_status: {
    [platform: string]: {
      variant: string; // 'A', 'B', etc.
      status: 'draft' | 'scheduled' | 'published' | 'failed';
      scheduled_at?: Date;
      published_at?: Date;
      error?: string;
    };
  };

  // Métriques de performance
  performance_metrics?: {
    [platform: string]: {
      variant: string;
      impressions?: number;
      engagement?: number;
      clicks?: number;
      conversions?: number;
    };
  };

  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ==================== PROMPT TEMPLATES ====================

export interface EditorialStrategyPrompt {
  system: string;
  user: string;
}

export interface DailyContentPrompt {
  system: string;
  user: string;
}

// ==================== HELPERS ====================

export function generateCalendarId(businessId: string, year: number, month: number): string {
  return `CAL-${year}-${month.toString().padStart(2, '0')}-${businessId.substring(0, 8).toUpperCase()}`;
}

export function generateContentId(calendarId: string, date: string, platform: string): string {
  const dateStr = date.replace(/-/g, '');
  const platformCode = platform.substring(0, 2).toUpperCase();
  return `EZIA-${dateStr}-${platformCode}-${Date.now().toString(36).toUpperCase()}`;
}

export function validatePillars(pillars: Pillar[]): boolean {
  const totalRatio = pillars.reduce((sum, p) => sum + p.ratio, 0);
  return Math.abs(totalRatio - 1.0) < 0.01; // tolérance de 1%
}

export function generateUTMParams(campaign: Campaign, platform: string, variant: string): Record<string, string> {
  return {
    utm_source: platform.toLowerCase().replace(/\s+/g, '_'),
    utm_medium: 'social',
    utm_campaign: campaign.name.toLowerCase().replace(/\s+/g, '_'),
    utm_content: `variant_${variant.toLowerCase()}`
  };
}
