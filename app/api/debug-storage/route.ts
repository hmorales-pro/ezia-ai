import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import { loadProjects } from '@/lib/file-storage';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    const debugInfo: any = {
      userId: user.id,
      timestamp: new Date().toISOString(),
      storage: {
        file: { available: false, projects: 0, error: null },
        mongodb: { available: false, projects: 0, error: null }
      }
    };

    // Test du stockage fichier
    try {
      const fileProjects = await loadProjects();
      const userProjects = fileProjects[user.id] || [];
      debugInfo.storage.file = {
        available: true,
        projects: userProjects.length,
        error: null,
        sample: userProjects.length > 0 ? {
          id: userProjects[0].id,
          name: userProjects[0].name,
          createdAt: userProjects[0].createdAt
        } : null
      };
    } catch (error: any) {
      debugInfo.storage.file.error = error.message;
    }

    // Test de MongoDB
    try {
      if (process.env.MONGODB_URI) {
        await dbConnect();
        const mongoProjects = await UserProject.find({ userId: user.id }).lean();
        debugInfo.storage.mongodb = {
          available: true,
          projects: mongoProjects.length,
          error: null,
          connectionString: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
          sample: mongoProjects.length > 0 ? {
            id: mongoProjects[0]._id,
            name: mongoProjects[0].name,
            createdAt: mongoProjects[0].createdAt
          } : null
        };
      } else {
        debugInfo.storage.mongodb.error = 'MONGODB_URI not configured';
      }
    } catch (error: any) {
      debugInfo.storage.mongodb.error = error.message;
    }

    // Informations sur l'environnement
    debugInfo.environment = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      hasMongoUri: !!process.env.MONGODB_URI,
      platform: process.platform
    };

    // Recommandations
    debugInfo.recommendations = [];
    if (!debugInfo.storage.mongodb.available && debugInfo.storage.file.available) {
      debugInfo.recommendations.push('MongoDB non disponible, utilisation du stockage fichier');
    }
    if (debugInfo.storage.file.projects > 0 && debugInfo.storage.mongodb.projects === 0) {
      debugInfo.recommendations.push('Des projets existent dans le stockage fichier mais pas dans MongoDB');
    }

    return NextResponse.json({
      ok: true,
      debug: debugInfo
    });
  } catch (error) {
    console.error('Debug storage error:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors du debug',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}