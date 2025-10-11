/**
 * Helper pour charger les variables d'environnement
 * Utile pour diagnostiquer les problèmes en production
 */

export function getEnvVar(key: string, fallback?: string): string | undefined {
  // Essayer de lire depuis process.env
  let value = process.env[key];

  if (!value) {
    console.warn(`⚠️ Variable ${key} non trouvée dans process.env`);

    // Log pour debug
    if (key === 'BREVO_API_KEY') {
      console.log('🔍 Debug BREVO_API_KEY:', {
        exists: !!process.env.BREVO_API_KEY,
        length: process.env.BREVO_API_KEY?.length,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('BREVO')),
        nodeEnv: process.env.NODE_ENV
      });
    }
  }

  return value || fallback;
}

export function requireEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`❌ Variable d'environnement requise manquante: ${key}`);
  }
  return value;
}

// Variables spécifiques au webinaire
export const getBrevoApiKey = () => getEnvVar('BREVO_API_KEY');
export const getBrevoSenderEmail = () => getEnvVar('BREVO_SENDER_EMAIL', 'noreply@ezia.ai');
export const getAdminNotificationEmail = () => getEnvVar('ADMIN_NOTIFICATION_EMAIL', 'hugo.morales.pro+waitlist@gmail.com');
