import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// GET /api/ecosystem/[projectId]/check-type - Vérifier le type de projet
export async function GET(
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

    await dbConnect();

    // Vérifier si c'est un projet multipage
    const multipageProject = await UserProjectMultipage.findOne({
      projectId: projectId,
      userId: user.id
    }).select('projectId name subdomain');

    if (multipageProject) {
      return NextResponse.json({
        ok: true,
        type: 'multipage',
        project: {
          id: multipageProject.projectId,
          name: multipageProject.name,
          subdomain: multipageProject.subdomain
        }
      });
    }

    // Vérifier si c'est un projet simple
    const simpleProject = await UserProject.findOne({
      projectId: projectId,
      userId: user.id
    }).select('projectId name businessId');

    if (simpleProject) {
      return NextResponse.json({
        ok: true,
        type: 'simple',
        project: {
          id: simpleProject.projectId,
          name: simpleProject.name,
          businessId: simpleProject.businessId
        }
      });
    }

    return NextResponse.json({ 
      ok: false, 
      error: 'Projet non trouvé' 
    }, { status: 404 });

  } catch (error) {
    console.error('Error checking project type:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de la vérification' 
    }, { status: 500 });
  }
}