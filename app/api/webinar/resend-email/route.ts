import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { WebinarRegistration } from '@/models/WebinarRegistration';
import { sendWebinarConfirmationEmail } from '@/lib/webinar-email';

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = req.headers.get('Authorization');
    const ADMIN_PASSWORD = 'ezia2025admin';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Récupérer l'inscription
    const registration = await WebinarRegistration.findOne({ email: email.toLowerCase() });

    if (!registration) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    console.log(`📧 Renvoi manuel de l'email de confirmation à ${email}`);

    // Envoyer l'email de confirmation
    const emailSent = await sendWebinarConfirmationEmail({
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      company: registration.company,
      position: registration.position
    });

    console.log('📧 Résultat renvoi email:', emailSent);

    if (emailSent) {
      // Marquer comme confirmé
      registration.confirmed = true;
      await registration.save();
      console.log('✅ Inscription marquée comme confirmée');

      return NextResponse.json({
        success: true,
        message: 'Email renvoyé avec succès'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur lors du renvoi d\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors du renvoi de l\'email' },
      { status: 500 }
    );
  }
}
