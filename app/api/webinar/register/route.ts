import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { WebinarRegistration } from '@/models/WebinarRegistration';
import { sendWebinarConfirmationEmail, sendAdminNotification } from '@/lib/webinar-email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, company, position, phone, interests, mainChallenge, projectDescription, expectations, source } = body;

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Le prénom, nom et email sont requis' },
        { status: 400 }
      );
    }

    // Valider l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Vérifier si l'email existe déjà
    const existingRegistration = await WebinarRegistration.findOne({ email: email.toLowerCase() });

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: 'Cet email est déjà inscrit au webinaire',
          alreadyRegistered: true
        },
        { status: 409 }
      );
    }

    // Créer l'inscription
    const registration = await WebinarRegistration.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim(),
      position: position?.trim(),
      phone: phone?.trim(),
      interests: interests || [],
      mainChallenge: mainChallenge?.trim(),
      projectDescription: projectDescription?.trim(),
      expectations: expectations?.trim(),
      source: source || 'website',
      confirmed: false,
      registeredAt: new Date()
    });

    // Debug: Vérifier les variables d'environnement
    console.log('🔍 Variables env dans API route:', {
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      brevoKeyLength: process.env.BREVO_API_KEY?.length,
      hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      hasAdminEmail: !!process.env.ADMIN_NOTIFICATION_EMAIL,
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL
    });

    // Envoyer l'email de confirmation avec le fichier .ics
    try {
      const emailSent = await sendWebinarConfirmationEmail({
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        company: registration.company,
        position: registration.position
      });

      console.log('📧 Résultat envoi email confirmation:', emailSent);

      // Envoyer la notification admin
      const adminNotifSent = await sendAdminNotification({
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        company: registration.company,
        position: registration.position,
        mainChallenge: registration.mainChallenge,
        projectDescription: registration.projectDescription,
        expectations: registration.expectations,
        interests: registration.interests
      });

      console.log('📧 Résultat notification admin:', adminNotifSent);

      // Marquer comme confirmé seulement si l'email a été envoyé
      if (emailSent) {
        registration.confirmed = true;
        await registration.save();
        console.log('✅ Inscription confirmée dans la DB');
      }
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
      console.error('Stack:', emailError instanceof Error ? emailError.stack : 'N/A');
      // On ne bloque pas l'inscription si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Un email de confirmation vous a été envoyé.',
      registration: {
        id: registration._id,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Webinar registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les inscriptions (admin uniquement)
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification admin (même mot de passe que admin-simple)
    const authHeader = req.headers.get('Authorization');
    const ADMIN_PASSWORD = 'ezia2025admin';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    // Récupérer toutes les inscriptions
    const registrations = await WebinarRegistration.find()
      .sort({ registeredAt: -1 })
      .select('firstName lastName email company position phone interests mainChallenge projectDescription expectations source registeredAt confirmed attended');

    // Statistiques
    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter(r => r.confirmed).length;
    const attendedCount = registrations.filter(r => r.attended).length;

    // Statistiques par défi principal
    const challengeCounts: Record<string, number> = {};
    registrations.forEach(r => {
      if (r.mainChallenge) {
        challengeCounts[r.mainChallenge] = (challengeCounts[r.mainChallenge] || 0) + 1;
      }
    });

    // Statistiques par intérêt
    const interestCounts: Record<string, number> = {};
    registrations.forEach(r => {
      if (r.interests && r.interests.length > 0) {
        r.interests.forEach(interest => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    return NextResponse.json({
      success: true,
      registrations: registrations.map(r => ({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        company: r.company,
        position: r.position,
        phone: r.phone,
        interests: r.interests || [],
        mainChallenge: r.mainChallenge,
        projectDescription: r.projectDescription,
        expectations: r.expectations,
        source: r.source,
        registeredAt: r.registeredAt,
        confirmed: r.confirmed,
        attended: r.attended
      })),
      statistics: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
        attended: attendedCount,
        byChallenges: Object.entries(challengeCounts).map(([challenge, count]) => ({
          _id: challenge,
          count
        })),
        byInterests: Object.entries(interestCounts).map(([interest, count]) => ({
          _id: interest,
          count
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching webinar registrations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    );
  }
}
