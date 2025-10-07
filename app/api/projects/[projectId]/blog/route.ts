import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import UserProject from "@/models/UserProject";
import { BlogWriterMistral } from "@/lib/agents/blog-writer-mistral";

export const runtime = "nodejs";

/**
 * GET /api/projects/[projectId]/blog
 * Récupère tous les articles de blog d'un projet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Vérifier que le projet existe
    const project = await UserProject.findOne({ projectId: params.projectId });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Construire le filtre
    const filter: any = { projectId: params.projectId };
    if (status) {
      filter.status = status;
    }

    // Récupérer les articles
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await BlogPost.countDocuments(filter);

    return NextResponse.json({
      success: true,
      count: posts.length,
      total,
      posts
    });

  } catch (error: any) {
    console.error('[API Blog GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch blog posts'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/blog
 * Crée un nouvel article de blog (avec ou sans AI)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();

    // Vérifier que le projet existe
    const project = await UserProject.findOne({ projectId: params.projectId });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    let postData: any;

    // Si aiGenerate = true, générer avec l'AI
    if (body.aiGenerate) {
      const blogWriter = new BlogWriterMistral();

      const topic = {
        title: body.title || body.subject,
        keywords: body.keywords || [],
        targetAudience: body.targetAudience || []
      };

      const businessContext = {
        name: project.businessName || project.name,
        industry: project.metadata?.industry || 'Business',
        description: project.description || ''
      };

      console.log('[API Blog POST] Generating article with AI...', topic);

      const generatedArticle = await blogWriter.generateArticle({
        topic,
        businessContext,
        length: body.length || 'medium'
      });

      postData = {
        projectId: params.projectId,
        businessId: project.businessId,
        userId: project.userId,
        title: generatedArticle.title,
        content: generatedArticle.content,
        excerpt: generatedArticle.excerpt,
        slug: generatedArticle.slug,
        status: body.status || 'draft',
        publishedAt: body.status === 'published' ? new Date() : undefined,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        author: body.author || 'Ezia AI',
        tags: generatedArticle.tags || [],
        keywords: generatedArticle.keywords || [],
        tone: body.tone || 'professional',
        seoTitle: generatedArticle.seoTitle,
        seoDescription: generatedArticle.seoDescription,
        wordCount: generatedArticle.wordCount,
        readTime: generatedArticle.readTime,
        aiGenerated: true
      };

    } else {
      // Création manuelle
      const slug = body.slug ||
        body.title?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `article-${Date.now()}`;

      postData = {
        projectId: params.projectId,
        businessId: project.businessId,
        userId: project.userId,
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        slug,
        status: body.status || 'draft',
        publishedAt: body.status === 'published' ? new Date() : undefined,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        author: body.author || project.businessName,
        tags: body.tags || [],
        keywords: body.keywords || [],
        tone: body.tone || 'professional',
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        wordCount: body.content?.split(/\s+/).length || 0,
        readTime: Math.ceil((body.content?.split(/\s+/).length || 0) / 200),
        aiGenerated: false
      };
    }

    const post = await BlogPost.create(postData);

    console.log(`[API Blog POST] Created article ${post.slug} for project ${params.projectId}`);

    return NextResponse.json({
      success: true,
      post
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Blog POST] Error:', error);

    // Gérer l'erreur de slug dupliqué
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'An article with this slug already exists. Please choose a different title.'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create blog post'
      },
      { status: 500 }
    );
  }
}
