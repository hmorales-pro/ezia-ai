import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import { buildMultipagePrompt } from '@/lib/ai-prompts-multipage';
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
    const { 
      businessId, 
      businessName, 
      businessInfo,
      pageTypes = ['accueil', 'services', 'apropos', 'contact'],
      customRequirements 
    } = body;

    await dbConnect();

    // Construire le prompt pour l'IA
    const prompt = buildMultipagePrompt(
      businessInfo || { name: businessName, description: 'Une entreprise moderne' },
      pageTypes,
      customRequirements
    );

    // Générer le site avec l'IA via l'API ask-ai
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

    // Parser la réponse
    let siteStructure;
    try {
      siteStructure = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return NextResponse.json({ 
        ok: false, 
        error: 'Erreur lors de la génération du site' 
      }, { status: 500 });
    }

    // Créer le projet multipage
    const projectId = `multipage-${Date.now()}`;
    
    // Générer un sous-domaine intelligent et unique
    const subdomain = await generateSmartSubdomain(businessName);
    
    const newProject = await UserProjectMultipage.create({
      projectId,
      userId: user.id,
      businessId,
      businessName,
      name: `Site web de ${businessName}`,
      description: `Site multipage professionnel pour ${businessName}`,
      subdomain,
      pages: siteStructure.pages.map((page: any, index: number) => ({
        id: `page-${Date.now()}-${index}`,
        name: page.name,
        slug: page.slug,
        title: page.title,
        description: page.description,
        html: page.html,
        css: page.css || '',
        js: page.js || '',
        isHomePage: page.isHomePage || page.slug === 'index',
        order: index
      })),
      globalCss: siteStructure.globalCss || '',
      globalJs: siteStructure.globalJs || '',
      navigation: {
        type: siteStructure.navigation?.type || 'horizontal',
        items: siteStructure.navigation?.items.map((item: any, index: number) => ({
          label: item.label,
          pageId: `page-${Date.now()}-${siteStructure.pages.findIndex((p: any) => p.slug === item.pageSlug)}`,
          order: item.order || index
        })) || []
      },
      theme: siteStructure.theme || {
        primaryColor: '#6D3FC8',
        secondaryColor: '#5A35A5',
        fontFamily: 'Inter, sans-serif'
      },
      status: 'draft'
    });

    // Mettre à jour les IDs de navigation avec les vrais IDs des pages
    if (newProject.navigation && newProject.navigation.items) {
      newProject.navigation.items = siteStructure.navigation.items.map((item: any) => {
        const page = newProject.pages.find(p => p.slug === item.pageSlug);
        return {
          label: item.label,
          pageId: page?.id || '',
          order: item.order
        };
      });
      await newProject.save();
    }

    return NextResponse.json({
      ok: true,
      project: {
        id: newProject.projectId,
        name: newProject.name,
        subdomain: newProject.subdomain,
        url: `https://${newProject.subdomain}.ezia.ai`,
        pages: newProject.pages.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          isHomePage: p.isHomePage
        })),
        createdAt: newProject.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating multipage project:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la création du site multipage' 
    }, { status: 500 });
  }
}