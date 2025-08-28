import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// GET /api/multipage/[projectId] - Récupérer un projet multipage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();
    
    const { projectId } = await params;

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    }).lean();

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      project: {
        ...project,
        _id: project._id.toString()
      }
    });

  } catch (error) {
    console.error('Error fetching multipage project:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la récupération du projet' 
    }, { status: 500 });
  }
}

// PUT /api/multipage/[projectId] - Mettre à jour un projet (statut, métadonnées)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { status, theme, navigation, seo, globalCss, globalJs } = body;

    await dbConnect();
    
    const { projectId } = await params;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (theme) updateData.theme = theme;
    if (navigation) updateData.navigation = navigation;
    if (seo) updateData.seo = seo;
    if (globalCss !== undefined) updateData.globalCss = globalCss;
    if (globalJs !== undefined) updateData.globalJs = globalJs;
    updateData.updatedAt = new Date();

    const project = await UserProjectMultipage.findOneAndUpdate(
      { projectId: projectId, userId: user.id },
      { $set: updateData },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      project: {
        id: project.projectId,
        status: project.status,
        updatedAt: project.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating multipage project:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la mise à jour du projet' 
    }, { status: 500 });
  }
}

// DELETE /api/multipage/[projectId] - Supprimer un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();
    
    const { projectId } = await params;

    const result = await UserProjectMultipage.deleteOne({
      projectId: projectId,
      userId: user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Projet supprimé avec succès'
    });

  } catch (error) {
    console.error('Error deleting multipage project:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la suppression du projet' 
    }, { status: 500 });
  }
}