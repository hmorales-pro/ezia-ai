import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// POST /api/ecosystem/[projectId]/features - Ajouter une fonctionnalité
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { featureId, configuration } = body;

    if (!featureId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'ID de fonctionnalité requis' 
      }, { status: 400 });
    }

    await dbConnect();

    // Pour l'instant, on enregistre les fonctionnalités dans les métadonnées
    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    });

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    // Initialiser les fonctionnalités si nécessaire
    if (!project.metadata) {
      project.metadata = {};
    }
    if (!project.metadata.features) {
      project.metadata.features = {};
    }

    // Ajouter ou mettre à jour la fonctionnalité
    project.metadata.features[featureId] = {
      enabled: true,
      configuration: configuration || {},
      addedAt: new Date(),
      lastUpdated: new Date()
    };

    // Gérer les fonctionnalités spécifiques
    switch (featureId) {
      case 'social':
        // Ajouter les métadonnées pour les réseaux sociaux
        if (!project.metadata.social) {
          project.metadata.social = {
            facebook: configuration.facebook || '',
            instagram: configuration.instagram || '',
            twitter: configuration.twitter || '',
            linkedin: configuration.linkedin || ''
          };
        }
        break;

      case 'analytics':
        // Configuration Google Analytics ou autre
        if (!project.metadata.analytics) {
          project.metadata.analytics = {
            googleAnalyticsId: configuration.googleAnalyticsId || '',
            enabled: true
          };
        }
        break;

      case 'chat':
        // Configuration du chat
        if (!project.metadata.chat) {
          project.metadata.chat = {
            provider: configuration.provider || 'default',
            position: configuration.position || 'bottom-right',
            welcomeMessage: configuration.welcomeMessage || 'Bonjour ! Comment puis-je vous aider ?'
          };
        }
        break;

      case 'booking':
        // Configuration du système de réservation
        if (!project.metadata.booking) {
          project.metadata.booking = {
            enabled: true,
            workingHours: configuration.workingHours || {},
            slotDuration: configuration.slotDuration || 30,
            advanceBookingDays: configuration.advanceBookingDays || 30
          };
        }
        break;
    }

    await project.save();

    return NextResponse.json({
      ok: true,
      feature: {
        id: featureId,
        enabled: true,
        configuration: project.metadata.features[featureId]
      },
      message: `Fonctionnalité ${featureId} activée avec succès`
    });

  } catch (error) {
    console.error('Error adding feature:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de l\'ajout de la fonctionnalité' 
    }, { status: 500 });
  }
}

// GET /api/ecosystem/[projectId]/features - Lister les fonctionnalités actives
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    }).select('metadata.features');

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    const features = project.metadata?.features || {};
    const activeFeatures = Object.entries(features)
      .filter(([_, config]: [string, any]) => config.enabled)
      .map(([id, config]: [string, any]) => ({
        id,
        ...config
      }));

    return NextResponse.json({
      ok: true,
      features: activeFeatures
    });

  } catch (error) {
    console.error('Error listing features:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la récupération des fonctionnalités' 
    }, { status: 500 });
  }
}