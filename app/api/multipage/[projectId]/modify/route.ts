import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import { buildContextualModification } from '@/lib/ai-prompts-multipage';
import { api } from '@/lib/api';

// POST /api/multipage/[projectId]/modify - Appliquer une modification AI à une page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, modification, context } = body;

    if (!pageId || !modification) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page ID et modification requis' 
      }, { status: 400 });
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

    const pageIndex = project.pages.findIndex((p: any) => p.id === pageId);
    if (pageIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Page non trouvée' 
      }, { status: 404 });
    }

    const currentPage = project.pages[pageIndex];

    // Construire le prompt contextuel
    const prompt = buildContextualModification(
      currentPage,
      modification,
      context.allPages || project.pages,
      context.theme || project.theme
    );

    // Appeler l'API AI pour la modification
    const aiResponse = await api.put("/api/ask-ai", {
      prompt: prompt,
      provider: "novita",
      model: "deepseek-ai/DeepSeek-V3-0324",
      html: currentPage.html,
      businessId: project.businessId,
      isFollowUp: true
    });

    if (!aiResponse.data.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: aiResponse.data.error || 'Erreur lors de la modification' 
      }, { status: 500 });
    }

    // Extraire le HTML modifié
    const modifiedHtml = aiResponse.data.html || aiResponse.data.finalHtml;
    if (!modifiedHtml) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Aucun HTML généré' 
      }, { status: 500 });
    }

    // Mettre à jour la page
    project.pages[pageIndex].html = modifiedHtml;
    project.pages[pageIndex].updatedAt = new Date();

    // Si l'IA a également généré du CSS ou JS
    if (aiResponse.data.css) {
      project.pages[pageIndex].css = aiResponse.data.css;
    }
    if (aiResponse.data.js) {
      project.pages[pageIndex].js = aiResponse.data.js;
    }

    await project.save();

    return NextResponse.json({
      ok: true,
      page: project.pages[pageIndex],
      updatedLines: aiResponse.data.updatedLines || []
    });

  } catch (error) {
    console.error('Error modifying page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la modification de la page' 
    }, { status: 500 });
  }
}