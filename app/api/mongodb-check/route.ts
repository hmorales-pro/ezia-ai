import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Business from '@/models/Business';
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

    // Se connecter à MongoDB
    await connectDB();

    // Récupérer les statistiques
    const stats = {
      database: {
        connected: true,
        uri: process.env.MONGODB_URI ? 'Configuré' : 'Non configuré',
      },
      collections: {
        users: {
          count: await User.countDocuments(),
          recent: await User.find().sort({ createdAt: -1 }).limit(5).select('email username createdAt'),
        },
        projects: {
          count: await Project.countDocuments(),
          recent: await Project.find().sort({ createdAt: -1 }).limit(5).select('name createdAt'),
        },
        businesses: {
          count: await Business.countDocuments(),
          recent: await Business.find().sort({ createdAt: -1 }).limit(5).select('name createdAt'),
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('MongoDB check error:', error);
    return NextResponse.json({
      error: 'Erreur de connexion MongoDB',
      message: error.message,
      database: {
        connected: false,
        uri: process.env.MONGODB_URI ? 'Configuré' : 'Non configuré',
      }
    }, { status: 500 });
  }
}