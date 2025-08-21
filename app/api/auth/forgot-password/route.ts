import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // TODO: Implémenter la logique réelle de réinitialisation de mot de passe
    // 1. Vérifier si l'utilisateur existe dans la base de données
    // 2. Générer un token de réinitialisation unique
    // 3. Envoyer l'email avec le lien de réinitialisation
    // 4. Stocker le token avec une expiration

    // Pour l'instant, on simule juste un succès
    // En production, vous devrez intégrer un service d'envoi d'emails
    console.log(`Password reset requested for: ${email}`);

    // Simuler un délai d'envoi d'email
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}