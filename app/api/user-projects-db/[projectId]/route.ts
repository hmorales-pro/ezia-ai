import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Supprimer le projet (vérifier qu'il appartient à l'utilisateur)
    const result = await UserProject.deleteOne({
      _id: projectId,
      userId: user.id
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Projet non trouvé ou non autorisé' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la suppression du projet' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Mettre à jour le projet
    const project = await UserProject.findOneAndUpdate(
      {
        _id: projectId,
        userId: user.id
      },
      {
        $set: {
          name: body.name,
          description: body.description,
          html: body.html,
          css: body.css,
          js: body.js,
          status: body.status,
          'metadata.industry': body.industry,
          'metadata.targetAudience': body.targetAudience,
          'metadata.features': body.features
        }
      },
      { new: true }
    );
    
    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Projet non trouvé ou non autorisé' 
      }, { status: 404 });
    }
    
    // Ajouter une nouvelle version si le contenu a changé
    if (body.html !== project.html || body.css !== project.css || body.js !== project.js) {
      await project.addVersion({
        html: body.html,
        css: body.css,
        js: body.js,
        prompt: body.prompt,
        createdBy: 'User Update'
      });
    }
    
    return NextResponse.json({
      ok: true,
      project,
      message: 'Projet mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la mise à jour du projet' 
    }, { status: 500 });
  }
}