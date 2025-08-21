import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";

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
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Récupérer le site web le plus récent pour ce business
    const website = await UserProject.findOne({
      userId: user.id,
      businessId: businessId,
      status: { $ne: 'archived' }
    })
    .sort({ createdAt: -1 })
    .lean();
    
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
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Trouver le site web existant
    const website = await UserProject.findOne({
      userId: user.id,
      businessId: businessId,
      status: { $ne: 'archived' }
    });
    
    if (!website) {
      return NextResponse.json({
        ok: false,
        message: "Aucun site web trouvé pour ce business"
      }, { status: 404 });
    }
    
    // Mettre à jour le site web
    website.html = body.html || website.html;
    website.css = body.css || website.css;
    website.js = body.js || website.js;
    website.name = body.name || website.name;
    website.description = body.description || website.description;
    
    // Ajouter une nouvelle version
    await website.addVersion({
      html: website.html,
      css: website.css,
      js: website.js,
      prompt: body.prompt || website.prompt,
      createdBy: 'User Update'
    });
    
    await website.save();
    
    return NextResponse.json({
      ok: true,
      website: website,
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