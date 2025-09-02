import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistStats } from '@/lib/waitlist-mongodb';

export async function GET(request: NextRequest) {
  try {
    // Vérifier le mot de passe simple
    const authHeader = request.headers.get('authorization');
    const urlPassword = request.nextUrl.searchParams.get('password');
    const ADMIN_PASSWORD = 'ezia2025admin';
    
    if (authHeader !== `Bearer ${ADMIN_PASSWORD}` && urlPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const stats = await getWaitlistStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error: any) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    }, { status: 500 });
  }
}