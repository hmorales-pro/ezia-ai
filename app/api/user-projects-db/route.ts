import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import { getDB } from '@/lib/database';
import { generateSmartSubdomain } from '@/lib/subdomain-generator';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Récupérer tous les projets de l'utilisateur
    const db = getDB();
    const projects = await db.findUserProjectsByUserId(user.id);
    
    // S'assurer que projectId est inclus dans la réponse
    const formattedProjects = projects.map(project => ({
      ...project,
      id: project.projectId || project._id,
      projectId: project.projectId || project._id
    }));
    
    return NextResponse.json({
      ok: true,
      projects: formattedProjects || []
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la récupération des projets' 
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
    
    // Générer un projectId unique
    const projectId = `project-${Date.now()}`;
    
    // Générer un sous-domaine intelligent
    const subdomain = await generateSmartSubdomain(body.businessName || body.name || 'site');
    
    // Créer le nouveau projet
    const db = getDB();
    const newProject = await db.createUserProject({
      projectId: projectId,
      userId: user.id,
      businessId: body.businessId,
      businessName: body.businessName,
      name: body.name || `Site web de ${body.businessName}`,
      description: body.description || 'Site web généré par Ezia',
      subdomain: subdomain,
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
      }
    });
    
    return NextResponse.json({
      ok: true,
      project: newProject,
      message: 'Projet sauvegardé avec succès'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la création du projet' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ 
        ok: false, 
        message: 'ID du projet manquant' 
      }, { status: 400 });
    }
    
    // Supprimer le projet (vérifier qu'il appartient à l'utilisateur)
    const db = getDB();
    const deleted = await db.deleteUserProject(projectId, user.id);
    
    if (!deleted) {
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