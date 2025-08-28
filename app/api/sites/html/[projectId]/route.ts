import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Chercher par projectId
    const website = await UserProject.findOne({
      projectId: projectId
    })
    .select('html')
    .lean();
    
    if (!website || !website.html) {
      return NextResponse.json({
        ok: false,
        message: "Site non trouvé"
      }, { status: 404 });
    }
    
    // Retourner directement le HTML
    return new Response(website.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error("Error fetching site HTML:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la récupération du site" 
    }, { status: 500 });
  }
}