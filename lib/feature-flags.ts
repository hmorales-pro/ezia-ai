/**
 * Feature Flags Configuration
 * Contrôle les fonctionnalités activées/désactivées dans l'application
 */

export const FEATURE_FLAGS = {
  // Features actuellement activées
  MARKET_ANALYSIS: true,
  MARKETING_STRATEGY: true,
  CONTENT_CALENDAR: true,

  // Features désactivées temporairement
  WEBSITE_GENERATION: false,
  ECOSYSTEM_MULTIPAGE: false,
  SOCIAL_MEDIA_MANAGEMENT: false,
  GOALS_TRACKING: false,
  INTERACTIONS_HISTORY: false,
  EZIA_MEMORY: false,
  COMPETITOR_ANALYSIS: false,
  BUSINESS_OVERVIEW: false,

  // Features à développer
  ANALYTICS_DASHBOARD: false,
  TEAM_COLLABORATION: false,
  API_INTEGRATIONS: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Vérifie si une feature est activée
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURE_FLAGS[feature] ?? false;
}

/**
 * Retourne la liste des features activées
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(
    (key) => FEATURE_FLAGS[key]
  );
}

/**
 * Retourne la liste des features désactivées
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(
    (key) => !FEATURE_FLAGS[key]
  );
}
