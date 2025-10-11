import { NextResponse } from 'next/server';

// Route de test pour vérifier les variables d'environnement
// À SUPPRIMER après diagnostic !
export async function GET() {
  return NextResponse.json({
    hasBrevoKey: !!process.env.BREVO_API_KEY,
    brevoKeyPrefix: process.env.BREVO_API_KEY?.substring(0, 10) + '...',
    hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    hasAdminEmail: !!process.env.ADMIN_NOTIFICATION_EMAIL,
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
    nodeEnv: process.env.NODE_ENV
  });
}
