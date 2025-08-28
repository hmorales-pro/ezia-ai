import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

export async function GET(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    await dbConnect();

    // Récupérer tous les projets multipage de l'utilisateur
    const projects = await UserProjectMultipage.find({ 
      userId: user.id 
    })
    .sort({ updatedAt: -1 })
    .lean();

    return NextResponse.json({
      ok: true,
      projects: projects.map(project => ({
        id: project._id.toString(),
        projectId: project.projectId,
        userId: project.userId,
        businessId: project.businessId,
        businessName: project.businessName,
        name: project.name,
        description: project.description,
        subdomain: project.subdomain,
        status: project.status,
        pages: project.pages?.map(page => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          isHomePage: page.isHomePage
        })) || [],
        metadata: project.metadata,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching multipage projects:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la récupération des projets' 
    }, { status: 500 });
  }
}