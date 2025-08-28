import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// POST /api/multipage/[projectId]/pages - Ajouter une nouvelle page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { pageType, pageData } = body;

    await dbConnect();

    const project = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    });

    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Projet non trouvé' 
      }, { status: 404 });
    }

    // Si pageData est fourni, ajouter directement la page
    if (pageData && pageData.html) {
      const newPage = {
        id: `page-${Date.now()}`,
        name: pageData.name,
        slug: pageData.slug,
        title: pageData.title || pageData.name,
        description: pageData.description,
        html: pageData.html,
        css: pageData.css || '',
        js: pageData.js || '',
        isHomePage: false,
        order: project.pages.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      project.pages.push(newPage);

      // Ajouter à la navigation si nécessaire
      if (!project.navigation) {
        project.navigation = {
          type: 'horizontal',
          items: []
        };
      }

      project.navigation.items.push({
        label: newPage.name,
        pageId: newPage.id,
        order: project.navigation.items.length
      });

      await project.save();

      return NextResponse.json({
        ok: true,
        page: newPage
      });
    }

    // Sinon, générer la page avec l'IA
    const prompt = `
Tu es un expert en création de pages web. 
Ajoute une nouvelle page "${pageType}" au site existant.

CONTEXTE DU SITE :
- Nom : ${project.name}
- Thème : ${JSON.stringify(project.theme)}
- Pages existantes : ${project.pages.map(p => p.name).join(', ')}

INSTRUCTIONS :
1. Crée une page qui s'intègre parfaitement avec le design existant
2. Utilise les mêmes couleurs et styles que le reste du site
3. La page doit être de type : ${pageType}
4. N'inclus PAS les balises <html>, <head>, <body>

RETOURNE UN JSON :
{
  "name": "Nom de la page",
  "slug": "url-de-la-page",
  "title": "Titre SEO",
  "description": "Description SEO",
  "html": "<!-- Contenu HTML -->",
  "css": "/* CSS spécifique */"
}
`;

    const aiApiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ask-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        prompt,
        provider: 'novita',
        model: 'deepseek-ai/DeepSeek-V3-0324'
      })
    });

    const aiData = await aiApiResponse.json();
    if (!aiData.ok) {
      throw new Error(aiData.error || 'AI generation failed');
    }

    const aiResponse = aiData.response || aiData.content || aiData.text || '';

    let pageContent;
    try {
      pageContent = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json({ 
        ok: false, 
        error: 'Erreur lors de la génération de la page' 
      }, { status: 500 });
    }

    const newPage = {
      id: `page-${Date.now()}`,
      name: pageContent.name,
      slug: pageContent.slug,
      title: pageContent.title,
      description: pageContent.description,
      html: pageContent.html,
      css: pageContent.css || '',
      js: pageContent.js || '',
      isHomePage: false,
      order: project.pages.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.pages.push(newPage);

    // Ajouter à la navigation
    if (!project.navigation) {
      project.navigation = {
        type: 'horizontal',
        items: []
      };
    }

    project.navigation.items.push({
      label: newPage.name,
      pageId: newPage.id,
      order: project.navigation.items.length
    });

    await project.save();

    return NextResponse.json({
      ok: true,
      page: newPage
    });

  } catch (error) {
    console.error('Error adding page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de l\'ajout de la page' 
    }, { status: 500 });
  }
}