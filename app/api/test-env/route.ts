import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

// Route de test pour vérifier les variables d'environnement
// À SUPPRIMER après diagnostic !
export async function GET() {
  return NextResponse.json({
    // Test depuis process.env
    fromProcessEnv: {
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      brevoKeyPrefix: process.env.BREVO_API_KEY?.substring(0, 10) + '...',
      hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      hasAdminEmail: !!process.env.ADMIN_NOTIFICATION_EMAIL,
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
    },
    // Test depuis module ENV
    fromENVModule: {
      hasBrevoKey: !!ENV.BREVO_API_KEY,
      brevoKeyPrefix: ENV.BREVO_API_KEY?.substring(0, 10) + '...',
      hasSenderEmail: !!ENV.BREVO_SENDER_EMAIL,
      senderEmail: ENV.BREVO_SENDER_EMAIL,
      hasAdminEmail: !!ENV.ADMIN_NOTIFICATION_EMAIL,
      adminEmail: ENV.ADMIN_NOTIFICATION_EMAIL,
    },
    nodeEnv: ENV.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('BREVO') || k.includes('MONGODB') || k.includes('HF_'))
  });
}
