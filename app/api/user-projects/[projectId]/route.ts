import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb-config';
import UserProject from '@/models/UserProject';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    const { projectId } = await params;
    await dbConnect();
    
    const project = await UserProject.findOne({ 
      projectId,
      userId: user.id
    }).lean();
    
    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    // Incrémenter les vues
    await UserProject.updateOne(
      { projectId, userId: user.id },
      { 
        $inc: { 'analytics.views': 1 },
        $set: { 'analytics.lastViewed': new Date() }
      }
    );
    
    return NextResponse.json({
      ok: true,
      project: {
        id: project.projectId,
        projectId: project.projectId,
        userId: project.userId,
        businessId: project.businessId,
        businessName: project.businessName,
        name: project.name,
        description: project.description,
        subdomain: project.subdomain,
        html: project.html,
        css: project.css,
        js: project.js,
        prompt: project.prompt,
        version: project.version,
        versions: project.versions,
        status: project.status,
        metadata: project.metadata,
        previewUrl: project.previewUrl,
        deployUrl: project.deployUrl,
        analytics: project.analytics,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching project from MongoDB:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la récupération du projet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    const { projectId } = await params;
    const updates = await request.json();
    
    await dbConnect();
    
    const project = await UserProject.findOne({ 
      projectId,
      userId: user.id
    });
    
    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    // Si c'est une mise à jour du code, créer une nouvelle version
    if (updates.html || updates.css || updates.js) {
      const newVersionData = {
        html: updates.html || project.html,
        css: updates.css || project.css,
        js: updates.js || project.js,
        prompt: updates.prompt || project.prompt,
        createdBy: updates.createdBy || 'User'
      };
      
      await project.addVersion(newVersionData);
    }
    
    // Mettre à jour les autres champs
    const updateFields: any = {
      updatedAt: new Date()
    };
    
    if (updates.name) updateFields.name = updates.name;
    if (updates.description) updateFields.description = updates.description;
    if (updates.subdomain) updateFields.subdomain = updates.subdomain;
    if (updates.status) updateFields.status = updates.status;
    if (updates.metadata) updateFields.metadata = { ...project.metadata, ...updates.metadata };
    
    const updatedProject = await UserProject.findOneAndUpdate(
      { projectId, userId: user.id },
      updateFields,
      { new: true }
    );
    
    return NextResponse.json({
      ok: true,
      project: {
        id: updatedProject.projectId,
        projectId: updatedProject.projectId,
        userId: updatedProject.userId,
        businessId: updatedProject.businessId,
        businessName: updatedProject.businessName,
        name: updatedProject.name,
        description: updatedProject.description,
        subdomain: updatedProject.subdomain,
        html: updatedProject.html,
        css: updatedProject.css,
        js: updatedProject.js,
        prompt: updatedProject.prompt,
        version: updatedProject.version,
        versions: updatedProject.versions,
        status: updatedProject.status,
        metadata: updatedProject.metadata,
        previewUrl: updatedProject.previewUrl,
        deployUrl: updatedProject.deployUrl,
        analytics: updatedProject.analytics,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt
      },
      message: 'Projet mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating project in MongoDB:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la mise à jour du projet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    const { projectId } = await params;
    await dbConnect();
    
    const result = await UserProject.findOneAndUpdate(
      { projectId, userId: user.id },
      { status: 'archived', updatedAt: new Date() },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      message: 'Projet archivé avec succès'
    });
  } catch (error) {
    console.error('Error deleting project from MongoDB:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la suppression du projet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}