/**
 * Variables d'environnement centralisées
 * Ce fichier force le chargement des variables au runtime
 */

// Pour Dokploy : Ces variables doivent être définies dans l'interface Dokploy
// sous "Environment Variables"

export const ENV = {
  // Brevo Email (CRITIQUE pour webinaire)
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'noreply@ezia.ai',
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || '',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || '',

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

  // HuggingFace
  HF_TOKEN: process.env.HF_TOKEN || '',
  DEFAULT_HF_TOKEN: process.env.DEFAULT_HF_TOKEN || '',

  // Mistral
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',

  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Debug : Afficher quelles variables sont chargées (sans les valeurs)
if (typeof window === 'undefined') {
  console.log('🔍 ENV Module - Variables chargées:', {
    hasBrevoKey: !!ENV.BREVO_API_KEY,
    hasBrevoSender: !!ENV.BREVO_SENDER_EMAIL,
    hasAdminEmail: !!ENV.ADMIN_NOTIFICATION_EMAIL,
    hasMongoDB: !!ENV.MONGODB_URI,
    hasHFToken: !!ENV.HF_TOKEN,
    hasMistralKey: !!ENV.MISTRAL_API_KEY,
    nodeEnv: ENV.NODE_ENV
  });
}
