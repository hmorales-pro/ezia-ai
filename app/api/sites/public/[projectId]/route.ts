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
    
    // Récupérer le site web public (sans authentification)
    const website = await UserProject.findOne({
      _id: projectId,
      status: 'published' // Seulement les sites publiés
    })
    .select('name description html css js businessName createdAt updatedAt')
    .lean();
    
    if (!website) {
      return NextResponse.json({
        ok: false,
        message: "Site non trouvé ou non publié"
      }, { status: 404 });
    }
    
    // Créer le HTML complet
    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.name || 'Site Web'}</title>
    <meta name="description" content="${website.description || ''}">
    <style>${website.css || ''}</style>
</head>
<body>
${website.html || ''}
<script>${website.js || ''}</script>
</body>
</html>`;
    
    return new Response(fullHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache 1 heure
      }
    });
    
  } catch (error) {
    console.error("Error fetching public site:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la récupération du site" 
    }, { status: 500 });
  }
}