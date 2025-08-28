import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";

// Déclarer l'interface pour les sites web en mémoire
declare global {
  var websites: Array<{
    _id: string;
    projectId: string;
    userId: string;
    businessId: string;
    businessName: string;
    name: string;
    description: string;
    html: string;
    css: string;
    js: string;
    prompt: string;
    version: number;
    status: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

// Initialiser le stockage en mémoire si nécessaire
if (!global.websites) {
  global.websites = [];
}

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
    
    // Vérifier d'abord dans le stockage en mémoire
    const memoryWebsite = global.websites?.find(
      w => w.businessId === businessId && w.userId === user.id && w.status !== 'archived'
    );
    
    if (memoryWebsite) {
      console.log(`[Website API] Found website in memory for business ${businessId}`);
      return NextResponse.json({
        ok: true,
        website: memoryWebsite
      });
    }
    
    // Si pas trouvé en mémoire, chercher dans MongoDB
    try {
      await dbConnect();
      
      const website = await UserProject.findOne({
        userId: user.id,
        businessId: businessId,
        status: { $ne: 'archived' }
      })
      .sort({ createdAt: -1 })
      .lean();
      
      if (website) {
        console.log(`[Website API] Found website in MongoDB for business ${businessId}`);
        // Optionnellement, ajouter au cache mémoire
        global.websites.push(website);
        
        return NextResponse.json({
          ok: true,
          website: website
        });
      }
    } catch (dbError) {
      console.log("[Website API] MongoDB not available, using memory storage only");
    }
    
    return NextResponse.json({
      ok: false,
      message: "Aucun site web trouvé pour ce business"
    }, { status: 404 });
    
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
    
    // Vérifier d'abord dans le stockage en mémoire
    const memoryWebsiteIndex = global.websites?.findIndex(
      w => w.businessId === businessId && w.userId === user.id && w.status !== 'archived'
    );
    
    if (memoryWebsiteIndex >= 0) {
      // Mettre à jour en mémoire
      const website = global.websites[memoryWebsiteIndex];
      
      website.html = body.html || website.html;
      website.css = body.css || website.css;
      website.js = body.js || website.js;
      website.name = body.name || website.name;
      website.description = body.description || website.description;
      website.updatedAt = new Date();
      website.version = (website.version || 1) + 1;
      
      // Ajouter la version
      if (!website.versions) website.versions = [];
      website.versions.push({
        version: website.version,
        html: website.html,
        css: website.css,
        js: website.js,
        prompt: body.prompt || website.prompt,
        createdAt: new Date(),
        createdBy: 'User Update'
      });
      
      console.log(`[Website API] Updated website in memory for business ${businessId}`);
      
      return NextResponse.json({
        ok: true,
        website: website,
        message: "Site web mis à jour avec succès"
      });
    }
    
    // Si pas trouvé en mémoire, essayer MongoDB
    try {
      await dbConnect();
      
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
      
      // Mettre à jour aussi en mémoire
      const updatedWebsite = website.toObject();
      const existingIndex = global.websites.findIndex(
        w => w._id === updatedWebsite._id.toString()
      );
      
      if (existingIndex >= 0) {
        global.websites[existingIndex] = {
          ...updatedWebsite,
          _id: updatedWebsite._id.toString()
        };
      }
      
      console.log(`[Website API] Updated website in MongoDB for business ${businessId}`);
      
      return NextResponse.json({
        ok: true,
        website: website,
        message: "Site web mis à jour avec succès"
      });
      
    } catch (dbError) {
      console.log("[Website API] MongoDB error during update:", dbError);
      return NextResponse.json({
        ok: false,
        message: "Erreur lors de la mise à jour du site web"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error updating website:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la mise à jour du site web" 
    }, { status: 500 });
  }
}