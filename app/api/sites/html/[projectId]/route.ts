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
    
    // Injecter un script pour ouvrir les liens dans de nouveaux onglets
    const scriptInjection = `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour traiter tous les liens
    function processLinks() {
      var links = document.querySelectorAll('a[href]');
      links.forEach(function(link) {
        // Ne pas modifier les liens qui ont déjà un target
        if (!link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
    
    // Traiter les liens existants
    processLinks();
    
    // Observer les changements dans le DOM pour les liens ajoutés dynamiquement
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          processLinks();
        }
      });
    });
    
    // Configurer et démarrer l'observer
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
</script>
    `;
    
    // Injecter le script juste avant la balise </body>
    let modifiedHtml = website.html;
    const bodyCloseTag = '</body>';
    const bodyCloseIndex = modifiedHtml.toLowerCase().lastIndexOf(bodyCloseTag);
    
    if (bodyCloseIndex !== -1) {
      modifiedHtml = modifiedHtml.slice(0, bodyCloseIndex) + scriptInjection + modifiedHtml.slice(bodyCloseIndex);
    } else {
      // Si pas de balise </body>, ajouter à la fin
      modifiedHtml += scriptInjection;
    }
    
    // Retourner le HTML modifié
    return new Response(modifiedHtml, {
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