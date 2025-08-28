import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getStorage } from "@/lib/storage/unified-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: "Non authentifié" 
      }, { status: 401 });
    }

    const { businessId } = await params;
    const storage = getStorage();
    
    // Récupérer tous les projets de l'utilisateur
    const projects = await storage.getAllProjects(user.id);
    
    // Filtrer pour trouver le site web le plus récent pour ce business
    const websites = projects
      .filter(p => p.businessId === businessId && p.status !== 'archived')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    
    const website = websites[0];
    
    if (!website) {
      return NextResponse.json({
        ok: false,
        message: "Aucun site web trouvé pour ce business"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      website: website
    });
    
  } catch (error) {
    console.error("Error fetching website:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la récupération du site web" 
    }, { status: 500 });
  }
}

// Mettre à jour le site web existant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: "Non authentifié" 
      }, { status: 401 });
    }

    const { businessId } = await params;
    const body = await request.json();
    const storage = getStorage();
    
    // Récupérer tous les projets pour trouver le site web
    const projects = await storage.getAllProjects(user.id);
    const website = projects
      .filter(p => p.businessId === businessId && p.status !== 'archived')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })[0];
    
    if (!website) {
      return NextResponse.json({
        ok: false,
        message: "Aucun site web trouvé pour ce business"
      }, { status: 404 });
    }
    
    // Préparer les données mises à jour
    const updates = {
      html: body.html || website.html,
      css: body.css || website.css,
      js: body.js || website.js,
      name: body.name || website.name,
      description: body.description || website.description,
      version: (website.version || 1) + 1,
      versions: [...(website.versions || []), {
        version: (website.version || 1) + 1,
        html: body.html || website.html,
        css: body.css || website.css,
        js: body.js || website.js,
        prompt: body.prompt || website.prompt,
        createdAt: new Date().toISOString(),
        createdBy: 'User Update'
      }]
    };
    
    // Mettre à jour via le système de stockage unifié
    const updatedWebsite = await storage.updateProject(
      website.projectId || website.id,
      updates
    );
    
    return NextResponse.json({
      ok: true,
      website: updatedWebsite,
      message: "Site web mis à jour avec succès"
    });
    
  } catch (error) {
    console.error("Error updating website:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la mise à jour du site web" 
    }, { status: 500 });
  }
}