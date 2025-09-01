import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';

export async function GET() {
  try {
    // Vérifier l'authentification admin
    const user = await isAuthenticated();
    if (!user || user.email !== 'hugomorales125@gmail.com') {
      return NextResponse.json({
        error: 'Accès non autorisé'
      }, { status: 403 });
    }

    // Récupérer les infos sur les variables d'environnement
    const mistralKey = process.env.MISTRAL_API_KEY;
    
    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MISTRAL_API_KEY: {
          exists: !!mistralKey,
          value: mistralKey === 'placeholder' ? 'placeholder' : 
                 mistralKey ? `${mistralKey.substring(0, 8)}...` : 'not set',
          length: mistralKey ? mistralKey.length : 0,
          isPlaceholder: mistralKey === 'placeholder'
        },
        MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'not set',
        NEXT_APP_API_URL: process.env.NEXT_APP_API_URL || 'not set',
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification',
      message: error.message
    }, { status: 500 });
  }
}