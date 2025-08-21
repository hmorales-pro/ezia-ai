import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Récupérer le projet
    const project = await UserProject.findOne({
      _id: projectId,
      userId: user.id
    }).lean();
    
    if (!project) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Projet non trouvé ou non autorisé' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      project
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la récupération du projet' 
    }, { status: 500 });
  }
}