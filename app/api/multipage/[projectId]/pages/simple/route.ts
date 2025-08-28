import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// Version simplifiée sans imports problématiques
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

    // Créer la page directement sans IA pour le moment
    const newPage = {
      id: `page-${Date.now()}`,
      name: pageData?.name || pageType,
      slug: pageData?.slug || pageType.toLowerCase().replace(/\s+/g, '-'),
      title: pageData?.title || pageType,
      description: pageData?.description || `Page ${pageType}`,
      html: generateSimplePageHtml(pageType, project.businessName || 'Votre entreprise'),
      css: '',
      js: '',
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
      page: newPage,
      message: 'Page ajoutée avec succès'
    });

  } catch (error) {
    console.error('Error adding page:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de l\'ajout de la page' 
    }, { status: 500 });
  }
}

function generateSimplePageHtml(pageType: string, businessName: string): string {
  const templates: Record<string, string> = {
    blog: `
      <section class="py-12">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold mb-8">Blog de ${businessName}</h1>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold mb-2">Premier article</h2>
              <p class="text-gray-600 mb-4">Bienvenue sur notre blog ! Nous partagerons ici nos actualités et conseils.</p>
              <a href="#" class="text-purple-600 hover:underline">Lire la suite →</a>
            </article>
          </div>
        </div>
      </section>
    `,
    portfolio: `
      <section class="py-12">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold mb-8">Nos Réalisations</h1>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <h3 class="font-semibold mb-2">Projet 1</h3>
                <p class="text-gray-600 text-sm">Description du projet</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    booking: `
      <section class="py-12">
        <div class="container mx-auto px-4 max-w-2xl">
          <h1 class="text-4xl font-bold mb-8">Réservation</h1>
          <div class="bg-white rounded-lg shadow-md p-6">
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Date</label>
                <input type="date" class="w-full px-3 py-2 border rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Heure</label>
                <select class="w-full px-3 py-2 border rounded-lg">
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>11:00</option>
                </select>
              </div>
              <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Réserver
              </button>
            </form>
          </div>
        </div>
      </section>
    `,
    default: `
      <section class="py-12">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold mb-8">${pageType}</h1>
          <p class="text-lg text-gray-600">Cette page est en cours de construction.</p>
        </div>
      </section>
    `
  };

  return templates[pageType.toLowerCase()] || templates.default;
}