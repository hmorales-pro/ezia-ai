import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebProject from '@/models/WebProject';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/web-projects/[businessId]/pages
 * Récupère toutes les pages d'un projet web
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    let pages = webProject.pages;

    // Filtrer par statut si demandé
    if (publishedOnly) {
      pages = pages.filter(p => p.isPublished);
    }

    // Trier par date de mise à jour (plus récent en premier)
    pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      pages,
      total: pages.length
    });
  } catch (error: any) {
    console.error('[WebProject Pages GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch pages'
    }, { status: 500 });
  }
}

/**
 * POST /api/web-projects/[businessId]/pages
 * Crée une nouvelle page
 */
export async function POST(
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

    // Vérifier que le slug n'existe pas déjà
    const existingPage = webProject.pages.find(p => p.slug === body.slug);
    if (existingPage) {
      return NextResponse.json({
        success: false,
        error: 'A page with this slug already exists'
      }, { status: 400 });
    }

    // Créer la page
    const newPage = webProject.addPage(body);
    await webProject.save();

    console.log(`[WebProject Pages POST] Created page ${newPage.pageId} for business ${businessId}`);

    return NextResponse.json({
      success: true,
      page: newPage
    }, { status: 201 });
  } catch (error: any) {
    console.error('[WebProject Pages POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create page'
    }, { status: 500 });
  }
}
