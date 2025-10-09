import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

export const runtime = "nodejs";

/**
 * GET /api/projects/[projectId]/blog/[slug]
 * Récupère un article spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string }> }
) {
  try {
    const { projectId, slug } = await params;
    await dbConnect();

    const post = await BlogPost.findOne({
      projectId: projectId,
      slug: slug
    }).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Incrémenter les vues
    await BlogPost.updateOne(
      { _id: post._id },
      { $inc: { 'metadata.views': 1 } }
    );

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error: any) {
    console.error('[API Blog GET by slug] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch blog post'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/blog/[slug]
 * Met à jour un article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string }> }
) {
  try {
    const { projectId, slug } = await params;
    await dbConnect();

    const body = await request.json();

    // Ne pas permettre de changer projectId
    delete body.projectId;
    delete body._id;

    // Si le statut passe à "published", définir publishedAt
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const post = await BlogPost.findOneAndUpdate(
      {
        projectId: projectId,
        slug: slug
      },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    console.log(`[API Blog PUT] Updated article ${slug} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error: any) {
    console.error('[API Blog PUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update blog post'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/blog/[slug]
 * Supprime un article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string }> }
) {
  try {
    const { projectId, slug } = await params;
    await dbConnect();

    const post = await BlogPost.findOneAndDelete({
      projectId: projectId,
      slug: slug
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    console.log(`[API Blog DELETE] Deleted article ${params.slug} from project ${params.projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error: any) {
    console.error('[API Blog DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete blog post'
      },
      { status: 500 }
    );
  }
}
