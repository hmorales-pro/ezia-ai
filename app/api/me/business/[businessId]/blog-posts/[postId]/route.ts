import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from '@/lib/database';
import BlogPost from '@/models/BlogPost';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; postId: string }> }
) {
  try {
    const { businessId, postId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connexion à la base de données
    await getDB();

    // Récupérer l'article
    const blogPost = await BlogPost.findOne({
      _id: postId,
      businessId,
      userId: user.id
    }).lean();

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      blogPost
    });
    
  } catch (error) {
    console.error("[Blog Post] Error fetching:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; postId: string }> }
) {
  try {
    const { businessId, postId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Connexion à la base de données
    await getDB();

    // Vérifier que l'article existe et appartient à l'utilisateur
    const existingPost = await BlogPost.findOne({
      _id: postId,
      businessId,
      userId: user.id
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Si le slug change, vérifier l'unicité
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await BlogPost.findOne({ 
        slug: data.slug,
        _id: { $ne: postId }
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Calculer le temps de lecture si wordCount change
    if (data.wordCount && data.wordCount !== existingPost.wordCount) {
      data.readTime = Math.ceil(data.wordCount / 200);
    }

    // Mettre à jour l'article
    const updatedPost = await BlogPost.findByIdAndUpdate(
      postId,
      {
        ...data,
        lastEditedBy: user.name || user.email,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ 
      success: true,
      blogPost: updatedPost
    });
    
  } catch (error) {
    console.error("[Blog Post] Error updating:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; postId: string }> }
) {
  try {
    const { businessId, postId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connexion à la base de données
    await getDB();

    // Supprimer l'article
    const deletedPost = await BlogPost.findOneAndDelete({
      _id: postId,
      businessId,
      userId: user.id
    });

    if (!deletedPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Blog post deleted successfully"
    });
    
  } catch (error) {
    console.error("[Blog Post] Error deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}