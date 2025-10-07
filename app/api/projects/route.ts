import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

/**
 * POST /api/projects
 * Crée un nouveau projet
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Générer un projectId unique si non fourni
    const projectId = body.projectId || `proj_${nanoid(12)}`;

    // Générer un subdomain basé sur le businessName si non fourni
    const subdomain = body.subdomain ||
      body.businessName?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      projectId;

    const projectData = {
      projectId,
      subdomain,
      userId: body.userId,
      businessId: body.businessId,
      businessName: body.businessName,
      name: body.name || body.businessName,
      description: body.description,
      html: body.html,
      css: body.css || '',
      js: body.js || '',
      prompt: body.prompt,
      status: body.status || 'draft',
      hasBlog: body.hasBlog || false,
      blogConfig: body.blogConfig || {
        enabled: body.hasBlog || false,
        layout: 'grid',
        postsPerPage: 9
      },
      metadata: {
        generatedBy: 'ezia-ai',
        industry: body.industry,
        targetAudience: body.targetAudience,
        features: body.features || [],
        tags: body.tags || []
      },
      previewUrl: body.previewUrl,
      deployUrl: `/${projectId}` // URL publique relative
    };

    const project = await UserProject.create(projectData);

    console.log(`[API Projects] Created project ${projectId} for user ${body.userId}`);

    return NextResponse.json({
      success: true,
      project,
      publicUrl: `/${projectId}`,
      previewUrl: `/preview/${projectId}`
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Projects POST] Error:', error);

    // Gérer l'erreur de subdomain dupliqué
    if (error.code === 11000 && error.keyPattern?.subdomain) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subdomain already exists. Please choose a different name.'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create project'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects
 * Récupère tous les projets d'un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (businessId) filter.businessId = businessId;
    if (status) filter.status = status;

    const projects = await UserProject.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error: any) {
    console.error('[API Projects GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch projects'
      },
      { status: 500 }
    );
  }
}
