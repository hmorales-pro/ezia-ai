import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebProject from '@/models/WebProject';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/web-projects/[businessId]/pages/[pageId]
 * Récupère une page spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; pageId: string }> }
) {
  try {
    const { businessId, pageId } = await params;
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    const page = webProject.pages.find((p: any) => p.pageId === pageId);

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'Page not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      page
    });
  } catch (error: any) {
    console.error('[WebProject Page GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch page'
    }, { status: 500 });
  }
}

/**
 * PUT /api/web-projects/[businessId]/pages/[pageId]
 * Met à jour une page
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; pageId: string }> }
) {
  try {
    const { businessId, pageId } = await params;
    const body = await request.json();
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    const updatedPage = webProject.updatePage(pageId, body);
    await webProject.save();

    console.log(`[WebProject Page PUT] Updated page ${pageId} for business ${businessId}`);

    return NextResponse.json({
      success: true,
      page: updatedPage
    });
  } catch (error: any) {
    console.error('[WebProject Page PUT] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update page'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/web-projects/[businessId]/pages/[pageId]
 * Supprime une page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; pageId: string }> }
) {
  try {
    const { businessId, pageId } = await params;
    await dbConnect();

    const webProject = await WebProject.findByBusinessId(businessId);

    if (!webProject) {
      return NextResponse.json({
        success: false,
        error: 'Web project not found'
      }, { status: 404 });
    }

    webProject.deletePage(pageId);
    await webProject.save();

    console.log(`[WebProject Page DELETE] Deleted page ${pageId} for business ${businessId}`);

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error: any) {
    console.error('[WebProject Page DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete page'
    }, { status: 500 });
  }
}
