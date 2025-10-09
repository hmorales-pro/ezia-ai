import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebProject from '@/models/WebProject';
import { getServerSession } from 'next-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/web-projects/[businessId]
 * Récupère le projet web d'un business
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    // Calculer les statistiques
    const stats = {
      totalPages: webProject.pages.length,
      publishedPages: webProject.pages.filter(p => p.isPublished).length,
      totalViews: webProject.analytics.views,
      uniqueVisitors: webProject.analytics.uniqueVisitors
    };

    return NextResponse.json({
      success: true,
      webProject,
      stats
    });
  } catch (error: any) {
    console.error('[WebProject GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch web project'
    }, { status: 500 });
  }
}

/**
 * POST /api/web-projects/[businessId]
 * Crée un nouveau projet web pour un business
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const body = await request.json();
    await dbConnect();

    // Vérifier si un projet existe déjà
    const existingProject = await WebProject.findByBusinessId(businessId);
    if (existingProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project already exists for this business'
      }, { status: 400 });
    }

    // Générer un projectId unique
    const projectId = `proj_${businessId}_${Date.now()}`;

    // Créer le projet
    const webProject = await WebProject.create({
      projectId,
      businessId,
      userId: body.userId,
      name: body.name,
      description: body.description || '',
      status: body.status || 'draft',
      subdomain: body.subdomain,
      features: {
        website: body.features?.website ?? true,
        blog: body.features?.blog ?? false,
        shop: body.features?.shop ?? false,
        newsletter: body.features?.newsletter ?? false
      },
      pages: body.pages || [],
      design: body.design || {},
      blogConfig: body.features?.blog ? (body.blogConfig || {}) : undefined,
      shopConfig: body.features?.shop ? (body.shopConfig || {}) : undefined,
      analytics: {
        views: 0,
        uniqueVisitors: 0,
        conversionRate: 0
      }
    });

    console.log(`[WebProject POST] Created web project ${projectId} for business ${businessId}`);

    return NextResponse.json({
      success: true,
      webProject
    }, { status: 201 });
  } catch (error: any) {
    console.error('[WebProject POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create web project'
    }, { status: 500 });
  }
}

/**
 * PUT /api/web-projects/[businessId]
 * Met à jour un projet web
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const body = await request.json();
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    // Mettre à jour les champs autorisés
    const allowedFields = [
      'name', 'description', 'status', 'domain', 'subdomain',
      'features', 'design', 'blogConfig', 'shopConfig', 'globalSeo'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        (webProject as any)[field] = body[field];
      }
    });

    await webProject.save();

    console.log(`[WebProject PUT] Updated web project for business ${businessId}`);

    return NextResponse.json({
      success: true,
      webProject
    });
  } catch (error: any) {
    console.error('[WebProject PUT] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update web project'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/web-projects/[businessId]
 * Archive un projet web (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    // Soft delete : archiver au lieu de supprimer
    webProject.status = 'archived';
    await webProject.save();

    console.log(`[WebProject DELETE] Archived web project for business ${businessId}`);

    return NextResponse.json({
      success: true,
      message: 'Web project archived successfully'
    });
  } catch (error: any) {
    console.error('[WebProject DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to archive web project'
    }, { status: 500 });
  }
}
