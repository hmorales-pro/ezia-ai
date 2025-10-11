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

    // Envoyer l'email de confirmation avec le fichier .ics
    try {
      await sendWebinarConfirmationEmail({
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        company: registration.company,
        position: registration.position
      });

      // Envoyer la notification admin
      await sendAdminNotification({
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

      // Marquer comme confirmé après envoi de l'email
      registration.confirmed = true;
      await registration.save();
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
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

// Endpoint pour récupérer les statistiques (admin uniquement)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Protection simple pour l'admin
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const totalRegistrations = await WebinarRegistration.countDocuments();
    const confirmedRegistrations = await WebinarRegistration.countDocuments({ confirmed: true });
    const attendedCount = await WebinarRegistration.countDocuments({ attended: true });

    // Statistiques par source
    const bySource = await WebinarRegistration.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiques par intérêt
    const byInterest = await WebinarRegistration.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 }
        }
      }
    ]);

    // Dernières inscriptions
    const recentRegistrations = await WebinarRegistration.find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .select('firstName lastName email company registeredAt confirmed');

    return NextResponse.json({
      statistics: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
        attended: attendedCount,
        bySource,
        byInterest
      },
      recentRegistrations
    });

  } catch (error) {
    console.error('Error fetching webinar stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
