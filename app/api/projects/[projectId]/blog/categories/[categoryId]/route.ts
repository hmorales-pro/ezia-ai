import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogCategory from "@/models/BlogCategory";
import BlogPost from "@/models/BlogPost";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[projectId]/blog/categories/[categoryId]
 * Récupère une catégorie spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; categoryId: string }> }
) {
  try {
    const { projectId, categoryId } = await params;

    await dbConnect();

    const category = await BlogCategory.findOne({
      _id: categoryId,
      projectId
    }).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Compter les articles
    const postCount = await BlogPost.countDocuments({
      projectId,
      category: categoryId,
      status: { $in: ['published', 'scheduled'] }
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        postCount
      }
    });

  } catch (error) {
    console.error("Error fetching blog category:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de la catégorie" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/blog/categories/[categoryId]
 * Met à jour une catégorie
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; categoryId: string }> }
) {
  try {
    const { projectId, categoryId } = await params;
    const body = await request.json();

    await dbConnect();

    const category = await BlogCategory.findOne({
      _id: categoryId,
      projectId
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Mise à jour des champs autorisés
    const allowedFields = ['name', 'description', 'color', 'order'];
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        (category as any)[field] = body[field];
      }
    });

    // Si le nom change, regénérer le slug
    if (body.name && body.name !== category.name) {
      const newSlug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Vérifier unicité du nouveau slug
      const existingCategory = await BlogCategory.findOne({
        projectId,
        slug: newSlug,
        _id: { $ne: categoryId }
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: "Une catégorie avec ce nom existe déjà" },
          { status: 400 }
        );
      }

      category.slug = newSlug;
    }

    await category.save();

    return NextResponse.json({
      success: true,
      category,
      message: "Catégorie mise à jour avec succès"
    });

  } catch (error) {
    console.error("Error updating blog category:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/blog/categories/[categoryId]
 * Supprime une catégorie
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; categoryId: string }> }
) {
  try {
    const { projectId, categoryId } = await params;

    await dbConnect();

    const category = await BlogCategory.findOne({
      _id: categoryId,
      projectId
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des articles dans cette catégorie
    const postCount = await BlogPost.countDocuments({
      projectId,
      category: categoryId
    });

    if (postCount > 0) {
      // Retirer la catégorie des articles au lieu de bloquer la suppression
      await BlogPost.updateMany(
        { projectId, category: categoryId },
        { $unset: { category: 1 } }
      );
    }

    // Supprimer la catégorie
    await BlogCategory.deleteOne({ _id: categoryId });

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès",
      removedFromPosts: postCount
    });

  } catch (error) {
    console.error("Error deleting blog category:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
}
