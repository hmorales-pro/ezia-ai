import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import { isValidSubdomain } from '@/lib/subdomain-generator';

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json();
    
    if (!subdomain) {
      return NextResponse.json({ 
        available: false, 
        error: 'Sous-domaine requis' 
      }, { status: 400 });
    }
    
    // Valider le format
    const isValid = isValidSubdomain(subdomain);
    if (!isValid) {
      return NextResponse.json({ 
        available: false, 
        error: 'Format de sous-domaine invalide' 
      });
    }
    
    await dbConnect();
    
    // Vérifier dans les deux collections
    const existsInSimple = await UserProject.findOne({ subdomain });
    const existsInMultipage = await UserProjectMultipage.findOne({ subdomain });
    
    const available = !existsInSimple && !existsInMultipage;
    
    return NextResponse.json({ 
      available,
      subdomain 
    });
    
  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json({ 
      available: false, 
      error: 'Erreur lors de la vérification' 
    }, { status: 500 });
  }
}