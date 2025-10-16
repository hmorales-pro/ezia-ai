import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { GeneratedContent } from '@/models/GeneratedContent';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * GET /api/content/daily/[contentId]
 * Récupère un contenu quotidien spécifique
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const params = await context.params;
    const { contentId } = params;

    // 1. Authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // 2. Connexion à MongoDB
    await connectDB();

    // 3. Récupérer le contenu
    const content = await GeneratedContent.findOne({
      content_id: contentId,
      user_id: userId
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // 4. Convertir les Maps en objets pour JSON
    const publicationStatus: any = {};
    if (content.publication_status) {
      content.publication_status.forEach((value, key) => {
        publicationStatus[key] = value;
      });
    }

    const performanceMetrics: any = {};
    if (content.performance_metrics) {
      content.performance_metrics.forEach((value, key) => {
        performanceMetrics[key] = value;
      });
    }

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        content_id: content.content_id,
        calendar_id: content.calendar_id,
        business_id: content.business_id,
        version: content.version,
        date: content.date,
        items: content.items,
        publication_status: publicationStatus,
        performance_metrics: performanceMetrics,
        created_at: content._createdAt,
        updated_at: content._updatedAt
      }
    });
  } catch (error: any) {
    console.error('[API] Error fetching content:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content/daily/[contentId]
 * Met à jour le statut de publication d'un contenu
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const params = await context.params;
    const { contentId } = params;

    // 1. Authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // 2. Parser les mises à jour
    const body = await request.json();
    const {
      platform,
      publication_status,
      performance_metrics
    }: {
      platform: string;
      publication_status?: any;
      performance_metrics?: any;
    } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required field: platform' },
        { status: 400 }
      );
    }

    // 3. Connexion à MongoDB
    await connectDB();

    // 4. Récupérer le contenu
    const content = await GeneratedContent.findOne({
      content_id: contentId,
      user_id: userId
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // 5. Mettre à jour le statut de publication
    if (publication_status) {
      if (!content.publication_status) {
        content.publication_status = new Map();
      }
      content.publication_status.set(platform, publication_status);
    }

    // 6. Mettre à jour les métriques de performance
    if (performance_metrics) {
      if (!content.performance_metrics) {
        content.performance_metrics = new Map();
      }
      content.performance_metrics.set(platform, performance_metrics);
    }

    await content.save();

    // 7. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        content_id: content.content_id,
        platform,
        publication_status: content.publication_status?.get(platform),
        performance_metrics: content.performance_metrics?.get(platform),
        updated_at: content._updatedAt
      },
      message: 'Content updated successfully'
    });
  } catch (error: any) {
    console.error('[API] Error updating content:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/daily/[contentId]
 * Supprime un contenu quotidien
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const params = await context.params;
    const { contentId } = params;

    // 1. Authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // 2. Connexion à MongoDB
    await connectDB();

    // 3. Supprimer le contenu
    const result = await GeneratedContent.deleteOne({
      content_id: contentId,
      user_id: userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
      data: {
        content_id: contentId
      }
    });
  } catch (error: any) {
    console.error('[API] Error deleting content:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
