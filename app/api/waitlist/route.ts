import { NextRequest, NextResponse } from 'next/server';
import { 
  addToWaitlist, 
  loadWaitlist, 
  getWaitlistCount, 
  isEmailInWaitlist,
  getWaitlistStats 
} from '@/lib/waitlist-mongodb';
import { isAuthenticated } from '@/lib/auth-simple';
import { getBrevoService } from '@/lib/brevo';
import { sendAdminNotificationFallback } from '@/lib/email-fallback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, message, profile, needs, urgency, source } = body;
    
    // Validation
    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email et nom sont requis'
      }, { status: 400 });
    }
    
    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }
    
    // Vérifier si l'email est déjà inscrit
    const alreadyInWaitlist = await isEmailInWaitlist(email);
    if (alreadyInWaitlist) {
      return NextResponse.json({
        success: false,
        error: 'Cet email est déjà inscrit sur la liste d\'attente'
      }, { status: 409 });
    }
    
    // Ajouter à la liste d'attente avec les nouvelles données
    const entry = await addToWaitlist({
      email: email.toLowerCase(),
      name,
      company,
      message,
      profile: profile || 'Non spécifié',
      needs: needs || 'Non spécifié',
      urgency: urgency || 'Non spécifié',
      source: source || 'website',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
    });
    
    // Obtenir la position dans la liste
    const position = await getWaitlistCount();
    
    // Envoyer l'email de confirmation avec Brevo
    try {
      const brevo = getBrevoService();
      if (brevo) {
        // Ajouter le contact à Brevo
        await brevo.createOrUpdateContact({
          email: email.toLowerCase(),
          attributes: {
            FIRSTNAME: name.split(' ')[0],
            LASTNAME: name.split(' ').slice(1).join(' '),
            COMPANY: company,
            PROFILE: profile,
            SOURCE: source,
            URGENCY: urgency,
            TOOLS: needs,
          },
          listIds: [parseInt(process.env.BREVO_LIST_ID || '1')],
          updateEnabled: true,
        });

        // Envoyer l'email de confirmation
        const isEnterprise = source === '/waitlist-enterprise';
        await brevo.sendWaitlistConfirmation(email, name, position, isEnterprise);
        
        // Envoyer la notification admin
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'hugo.morales.pro+waitlist@gmail.com';
        await brevo.sendAdminNotification(adminEmail, {
          name,
          email,
          company,
          profile,
          urgency,
          source,
          position,
        });
      } else {
        // Fallback si Brevo n'est pas configuré
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'hugo.morales.pro+waitlist@gmail.com';
        await sendAdminNotificationFallback(adminEmail, {
          name,
          email,
          company,
          profile,
          urgency,
          source,
          position,
        });
      }
    } catch (emailError) {
      console.error('Erreur envoi email Brevo:', emailError);
      // On ne bloque pas l'inscription si l'email échoue
    }
    
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Nous vous contacterons dès que votre accès sera disponible.',
      position,
      entry: {
        id: entry.id,
        email: entry.email,
        name: entry.name
      }
    });
    
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de l\'inscription'
    }, { status: 500 });
  }
}

// GET - Réservé aux admins pour voir la liste
export async function GET(request: NextRequest) {
  try {
    // Vérifier si c'est une requête avec mot de passe simple
    const authHeader = request.headers.get('authorization');
    const urlPassword = request.nextUrl.searchParams.get('password');
    
    // Mot de passe admin simple
    const ADMIN_PASSWORD = 'ezia2025admin';
    
    if (authHeader === `Bearer ${ADMIN_PASSWORD}` || urlPassword === ADMIN_PASSWORD) {
      // Accès avec mot de passe simple
      const waitlist = await loadWaitlist();
      const count = waitlist.length;
      
      return NextResponse.json({
        success: true,
        count,
        entries: waitlist.map(entry => ({
          ...entry,
          timestamp: entry.createdAt
        }))
      });
    }
    
    // Sinon, vérifier l'authentification normale
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 });
    }
    
    // Vérifier si c'est un admin
    const adminEmails = ['hugomorales125@gmail.com', 'hello@ezia.ai'];
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const waitlist = await loadWaitlist();
    const count = waitlist.length;
    
    return NextResponse.json({
      success: true,
      count,
      entries: waitlist
    });
    
  } catch (error: any) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de la liste'
    }, { status: 500 });
  }
}