import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// GET /api/multipage/[projectId]/pages/[pageId] - Récupérer une page spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { projectId, pageId } = await params;
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    });

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    const page = project.pages.find((p: any) => p.id === pageId);
    if (!page) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page non trouvée' 
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      page
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la récupération de la page' 
    }, { status: 500 });
  }
}

// PUT /api/multipage/[projectId]/pages/[pageId] - Mettre à jour une page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { projectId, pageId } = await params;
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, title, description, html, css, js, isHomePage, order } = body;

    await dbConnect();

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    });

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    const pageIndex = project.pages.findIndex((p: any) => p.id === pageId);
    if (pageIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page non trouvée' 
      }, { status: 404 });
    }

    // Si on définit cette page comme page d'accueil, retirer le flag des autres
    if (isHomePage) {
      project.pages.forEach((p: any) => {
        p.isHomePage = false;
      });
    }

    // Mettre à jour la page
    const updatedPage = {
      ...project.pages[pageIndex].toObject(),
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(html !== undefined && { html }),
      ...(css !== undefined && { css }),
      ...(js !== undefined && { js }),
      ...(isHomePage !== undefined && { isHomePage }),
      ...(order !== undefined && { order }),
      updatedAt: new Date()
    };

    project.pages[pageIndex] = updatedPage;

    // Mettre à jour la navigation si le nom a changé
    if (name && project.navigation) {
      const navItem = project.navigation.items.find((item: any) => item.pageId === pageId);
      if (navItem) {
        navItem.label = name;
      }
    }

    await project.save();

    return NextResponse.json({
      ok: true,
      page: updatedPage
    });

  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la mise à jour de la page' 
    }, { status: 500 });
  }
}

// DELETE /api/multipage/[projectId]/pages/[pageId] - Supprimer une page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { projectId, pageId } = await params;
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    });

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    const page = project.pages.find((p: any) => p.id === pageId);
    if (!page) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page non trouvée' 
      }, { status: 404 });
    }

    if (page.isHomePage) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Impossible de supprimer la page d\'accueil' 
      }, { status: 400 });
    }

    // Supprimer la page
    project.pages = project.pages.filter((p: any) => p.id !== pageId);

    // Supprimer de la navigation
    if (project.navigation) {
      project.navigation.items = project.navigation.items.filter(
        (item: any) => item.pageId !== pageId
      );
    }

    // Réorganiser l'ordre des pages
    project.pages.forEach((p: any, index: number) => {
      p.order = index;
    });

    await project.save();

    return NextResponse.json({
      ok: true,
      message: 'Page supprimée avec succès'
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la suppression de la page' 
    }, { status: 500 });
  }
}