import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// POST /api/multipage/[projectId]/duplicate/[pageId] - Dupliquer une page
export async function POST(
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

    const originalPage = project.pages.find((p: any) => p.id === pageId);
    if (!originalPage) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page non trouvée' 
      }, { status: 404 });
    }

    // Créer un nouveau slug unique
    let newSlug = originalPage.slug + '-copie';
    let counter = 1;
    while (project.pages.some((p: any) => p.slug === newSlug)) {
      newSlug = `${originalPage.slug}-copie-${counter}`;
      counter++;
    }

    // Dupliquer la page
    const duplicatedPage = {
      id: `page-${Date.now()}`,
      name: originalPage.name + ' (Copie)',
      slug: newSlug,
      title: originalPage.title + ' - Copie',
      description: originalPage.description,
      html: originalPage.html,
      css: originalPage.css,
      js: originalPage.js,
      isHomePage: false, // Une copie ne peut pas être la page d'accueil
      order: project.pages.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.pages.push(duplicatedPage);

    // Ajouter à la navigation
    if (project.navigation) {
      project.navigation.items.push({
        label: duplicatedPage.name,
        pageId: duplicatedPage.id,
        order: project.navigation.items.length
      });
    }

    await project.save();

    return NextResponse.json({
      ok: true,
      page: duplicatedPage,
      message: 'Page dupliquée avec succès'
    });

  } catch (error) {
    console.error('Error duplicating page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la duplication de la page' 
    }, { status: 500 });
  }
}