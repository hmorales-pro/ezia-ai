import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb-config';
import UserProject from '@/models/UserProject';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();
    
    const projects = await UserProject.find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({
      ok: true,
      projects: projects.map(project => ({
        id: project.projectId || project._id.toString(),
        projectId: project.projectId,
        userId: project.userId,
        businessId: project.businessId,
        businessName: project.businessName,
        name: project.name,
        description: project.description,
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
      }))
    });
  } catch (error) {
    console.error('Error fetching projects from MongoDB:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la récupération des projets',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    
    await dbConnect();
    
    const projectId = body.projectId || `project-${Date.now()}`;
    
    const newProject = new UserProject({
      projectId,
      userId: user.id,
      businessId: body.businessId,
      businessName: body.businessName,
      name: body.name || `Site web de ${body.businessName}`,
      description: body.description || 'Site web généré par Ezia',
      html: body.html,
      css: body.css || '',
      js: body.js || '',
      prompt: body.prompt,
      version: 1,
      versions: [{
        version: 1,
        html: body.html,
        css: body.css || '',
        js: body.js || '',
        prompt: body.prompt,
        createdAt: new Date(),
        createdBy: 'Ezia AI'
      }],
      status: 'draft',
      metadata: {
        generatedBy: body.generatedBy || 'ezia-ai',
        industry: body.industry,
        targetAudience: body.targetAudience,
        features: body.features || []
      },
      previewUrl: `/preview/${projectId}`,
      analytics: {
        views: 0,
        deployments: 0
      }
    });
    
    const savedProject = await newProject.save();
    
    return NextResponse.json({
      ok: true,
      project: {
        id: savedProject.projectId,
        projectId: savedProject.projectId,
        userId: savedProject.userId,
        businessId: savedProject.businessId,
        businessName: savedProject.businessName,
        name: savedProject.name,
        description: savedProject.description,
        html: savedProject.html,
        css: savedProject.css,
        js: savedProject.js,
        prompt: savedProject.prompt,
        version: savedProject.version,
        versions: savedProject.versions,
        status: savedProject.status,
        metadata: savedProject.metadata,
        previewUrl: savedProject.previewUrl,
        deployUrl: savedProject.deployUrl,
        analytics: savedProject.analytics,
        createdAt: savedProject.createdAt,
        updatedAt: savedProject.updatedAt
      },
      message: 'Projet sauvegardé avec succès dans MongoDB'
    });
  } catch (error) {
    console.error('Error creating project in MongoDB:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la création du projet',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}