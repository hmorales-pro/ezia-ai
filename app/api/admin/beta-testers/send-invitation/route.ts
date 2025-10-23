import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

const ADMIN_PASSWORD = "ezia2025admin";
const PHP_EMAIL_SCRIPT_URL = "https://noreply.eziom.fr/send-email.php";

// POST: Send invitation email to beta tester
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare email content
    const emailSubject = "🎉 Bienvenue dans la Beta d'Ezia - Votre accès est prêt !";
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6D3FC8 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
    .credentials { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6D3FC8; }
    .button { display: inline-block; background: #6D3FC8; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .highlight { color: #6D3FC8; font-weight: 600; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🎉 Bienvenue chez Ezia !</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Vous faites partie de nos Beta Testeurs privilégiés</p>
    </div>

    <div class="content">
      <h2>Bonjour ${user.fullName || 'Testeur'} 👋</h2>

      <p>Nous sommes ravis de vous compter parmi nos <strong>Beta Testeurs</strong> ! Vous avez désormais accès à l'intégralité de la plateforme Ezia avec des avantages exclusifs.</p>

      <div class="credentials">
        <h3 style="margin-top: 0;">🔐 Vos identifiants de connexion</h3>
        <p style="margin: 10px 0;"><strong>Email :</strong> <span class="highlight">${user.email}</span></p>
        <p style="margin: 10px 0;"><strong>Mot de passe :</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-size: 14px; border: 1px solid #ddd;">${password}</code></p>
      </div>

      <div class="warning">
        ⚠️ <strong>Important :</strong> Conservez ce mot de passe en sécurité. Vous pourrez le changer après votre première connexion dans les paramètres de votre compte.
      </div>

      <div style="text-align: center;">
        <a href="https://ezia.ai/auth/ezia" class="button">🚀 Accéder à Ezia</a>
      </div>

      <h3>✨ Ce qui vous attend :</h3>
      <ul>
        <li><strong>Accès illimité</strong> à toutes les fonctionnalités premium</li>
        <li><strong>Génération de sites web</strong> avec IA multi-agents</li>
        <li><strong>Analyse de marché</strong> approfondie avec stratégie Océan Bleu</li>
        <li><strong>Stratégie marketing</strong> personnalisée</li>
        <li><strong>Calendrier de contenu</strong> avec génération automatique</li>
        <li><strong>Support prioritaire</strong> pour vos retours et questions</li>
      </ul>

      <h3>📢 Votre avis compte !</h3>
      <p>En tant que Beta Testeur, vos retours sont précieux pour améliorer Ezia. N'hésitez pas à nous faire part de vos suggestions, bugs rencontrés ou idées d'amélioration.</p>

      <p style="margin-top: 30px;">À très bientôt sur Ezia ! 🎯</p>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        L'équipe Ezia<br>
        <a href="mailto:contact@eziom.fr" style="color: #6D3FC8;">contact@eziom.fr</a>
      </p>
    </div>

    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Si vous n'êtes pas censé recevoir ce message, veuillez l'ignorer.</p>
      <p>© 2025 Ezia - Votre Assistant IA Business</p>
    </div>
  </div>
</body>
</html>
`;

    // Send email via PHP script
    const emailResponse = await fetch(PHP_EMAIL_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        to: user.email,
        subject: emailSubject,
        message: emailBody,
        from: 'noreply@eziom.fr',
        from_name: 'Ezia - Beta Program'
      })
    });

    const emailResult = await emailResponse.text();
    console.log('[Beta Invitation] Email result:', emailResult);

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation email sent successfully',
      recipient: user.email
    });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation email' },
      { status: 500 }
    );
  }
}
