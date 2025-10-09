import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogCategory from "@/models/BlogCategory";
import BlogPost from "@/models/BlogPost";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[projectId]/blog/categories
 * Liste toutes les catégories d'un projet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    await dbConnect();

    // Récupérer toutes les catégories du projet
    const categories = await BlogCategory.find({ projectId })
      .sort({ order: 1, name: 1 })
      .lean();

    // Compter les articles pour chaque catégorie
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const postCount = await BlogPost.countDocuments({
          projectId,
          category: category._id,
          status: { $in: ['published', 'scheduled'] }
        });

        return {
          ...category,
          postCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length
    });

  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/blog/categories
 * Crée une nouvelle catégorie
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    await dbConnect();

    // Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }

    // Générer le slug
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Vérifier unicité du slug
    const existingCategory = await BlogCategory.findOne({ projectId, slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Créer la catégorie
    const category = await BlogCategory.create({
      projectId,
      businessId: body.businessId,
      userId: body.userId,
      name: body.name,
      slug,
      description: body.description || '',
      color: body.color || '#6D3FC8',
      order: body.order || 0
    });

    return NextResponse.json(
      {
        success: true,
        category,
        message: "Catégorie créée avec succès"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating blog category:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
