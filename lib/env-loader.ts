/**
 * Helper pour charger les variables d'environnement
 * Utilise le module ENV centralisé pour garantir la cohérence
 */

import { ENV } from './env';

export function getEnvVar(key: string, fallback?: string): string | undefined {
  // Essayer de lire depuis process.env ET depuis le module ENV
  let value = process.env[key] || (ENV as any)[key];

  if (!value) {
    console.warn(`⚠️ Variable ${key} non trouvée`);

    // Log pour debug
    if (key === 'BREVO_API_KEY') {
      console.log('🔍 Debug BREVO_API_KEY:', {
        fromProcessEnv: !!process.env.BREVO_API_KEY,
        fromENVModule: !!ENV.BREVO_API_KEY,
        length: (process.env.BREVO_API_KEY || ENV.BREVO_API_KEY)?.length,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('BREVO')),
        nodeEnv: ENV.NODE_ENV
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

// Variables spécifiques au webinaire - Utilisent le module ENV
export const getBrevoApiKey = () => ENV.BREVO_API_KEY || getEnvVar('BREVO_API_KEY');
export const getBrevoSenderEmail = () => ENV.BREVO_SENDER_EMAIL || getEnvVar('BREVO_SENDER_EMAIL', 'noreply@ezia.ai');
export const getAdminNotificationEmail = () => ENV.ADMIN_NOTIFICATION_EMAIL || getEnvVar('ADMIN_NOTIFICATION_EMAIL', 'hugo.morales.pro+waitlist@gmail.com');
