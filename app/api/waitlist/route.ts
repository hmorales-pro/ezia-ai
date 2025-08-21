import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist, loadWaitlist, getWaitlistCount, isEmailInWaitlist } from '@/lib/waitlist-storage';
import { isAuthenticated } from '@/lib/auth-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, message, source } = body;
    
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
    
    // Ajouter à la liste d'attente
    const entry = await addToWaitlist({
      email: email.toLowerCase(),
      name,
      company,
      message,
      source: source || 'website',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
    });
    
    // Obtenir la position dans la liste
    const position = await getWaitlistCount();
    
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
    // Vérifier l'authentification admin
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 });
    }
    
    // Vérifier si c'est un admin (vous pouvez ajouter une vérification plus sophistiquée)
    const adminEmails = ['hugomorales125@gmail.com'];
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
      entries: waitlist.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
    
  } catch (error: any) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de la liste'
    }, { status: 500 });
  }
}