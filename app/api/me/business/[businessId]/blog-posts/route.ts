import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from '@/lib/database';
import BlogPost from '@/models/BlogPost';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Connexion à la base de données
    await getDB();

    // Construire la requête
    const query: any = { 
      businessId,
      userId: user.id 
    };
    
    if (status) {
      query.status = status;
    }

    // Récupérer les articles
    const blogPosts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Compter le total
    const total = await BlogPost.countDocuments(query);

    return NextResponse.json({ 
      success: true,
      blogPosts,
      total,
      limit,
      skip
    });
    
  } catch (error) {
    console.error("[Blog Posts] Error fetching:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Connexion à la base de données
    await getDB();

    // Générer un slug unique si non fourni
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Vérifier l'unicité du slug
      let slugBase = data.slug;
      let counter = 1;
      while (await BlogPost.findOne({ slug: data.slug })) {
        data.slug = `${slugBase}-${counter}`;
        counter++;
      }
    }

    // Calculer le temps de lecture si non fourni
    if (!data.readTime && data.wordCount) {
      data.readTime = Math.ceil(data.wordCount / 200); // 200 mots par minute
    }

    // Créer l'article
    const blogPost = new BlogPost({
      ...data,
      businessId,
      userId: user.id,
      author: user.name || user.email
    });

    await blogPost.save();

    return NextResponse.json({ 
      success: true,
      blogPost: blogPost.toObject()
    });
    
  } catch (error) {
    console.error("[Blog Posts] Error creating:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}