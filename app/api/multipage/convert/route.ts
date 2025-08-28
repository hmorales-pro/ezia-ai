import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import { generateSmartSubdomain } from '@/lib/subdomain-generator';

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { simpleProjectId, businessId, businessName } = body;

    if (!simpleProjectId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'ID du projet requis' 
      }, { status: 400 });
    }

    await dbConnect();

    // Récupérer le projet simple
    let simpleProject = await UserProject.findOne({
      projectId: simpleProjectId,
      userId: user.id
    }).lean();
    
    // Si pas trouvé avec projectId, essayer avec _id
    if (!simpleProject) {
      simpleProject = await UserProject.findOne({
        _id: simpleProjectId,
        userId: user.id
      }).lean();
      
      // Si trouvé par _id, utiliser l'_id comme projectId
      if (simpleProject) {
        simpleProject.projectId = simpleProject._id.toString();
      }
    }

    if (!simpleProject) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    // Vérifier si déjà converti
    const existingMultipage = await UserProjectMultipage.findOne({
      projectId: `multipage-${simpleProjectId}`
    });

    if (existingMultipage) {
      return NextResponse.json({
        ok: true,
        project: existingMultipage,
        message: 'Ce projet a déjà été converti en multipage'
      });
    }

    // Générer un sous-domaine intelligent et unique
    const subdomain = await generateSmartSubdomain(businessName || simpleProject.name || 'site');

    // Créer le projet multipage avec le même projectId pour faciliter la transition
    const newMultipageProject = await UserProjectMultipage.create({
      projectId: simpleProjectId, // Utiliser le même ID pour une transition fluide
      userId: user.id,
      businessId: businessId || simpleProject.businessId,
      businessName: businessName || simpleProject.businessName,
      name: simpleProject.name || `Site web de ${businessName}`,
      description: simpleProject.description || `Site web professionnel`,
      subdomain,
      
      // Créer la page d'accueil à partir du HTML existant
      pages: [{
        id: `page-home-${Date.now()}`,
        name: 'Accueil',
        slug: 'index',
        title: simpleProject.name || 'Accueil',
        description: simpleProject.description,
        html: simpleProject.html || '<h1>Bienvenue</h1>',
        css: simpleProject.css || '',
        js: simpleProject.js || '',
        isHomePage: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      
      // Styles globaux
      globalCss: `
/* Styles globaux du site */
:root {
  --primary-color: #6D3FC8;
  --secondary-color: #5A35A5;
  --text-color: #333;
  --bg-color: #ffffff;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Navigation commune */
.site-navigation {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}
`,
      
      globalJs: '',
      
      navigation: {
        type: 'horizontal',
        items: [{
          label: 'Accueil',
          pageId: `page-home-${Date.now()}`,
          order: 0
        }]
      },
      
      theme: {
        primaryColor: '#6D3FC8',
        secondaryColor: '#5A35A5',
        fontFamily: 'Inter, sans-serif'
      },
      
      status: 'draft',
      metadata: {
        convertedFrom: simpleProjectId,
        convertedAt: new Date(),
        originalType: 'simple'
      }
    });

    // Optionnel : marquer le projet simple comme converti
    await UserProject.updateOne(
      { projectId: simpleProjectId },
      { 
        $set: { 
          metadata: {
            ...simpleProject.metadata,
            convertedToMultipage: true,
            multipageProjectId: newMultipageProject.projectId
          }
        }
      }
    );

    return NextResponse.json({
      ok: true,
      project: {
        id: newMultipageProject.projectId,
        name: newMultipageProject.name,
        subdomain: newMultipageProject.subdomain,
        url: `https://${newMultipageProject.subdomain}.ezia.ai`,
        pages: newMultipageProject.pages.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          isHomePage: p.isHomePage
        })),
        status: newMultipageProject.status
      },
      message: 'Site converti en multipage avec succès'
    });

  } catch (error) {
    console.error('Error converting to multipage:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la conversion' 
    }, { status: 500 });
  }
}