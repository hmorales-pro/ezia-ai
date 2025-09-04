import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { getDB } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Await params
    const { businessId } = await params;
    
    // Utiliser le système de base de données unifié
    const db = getDB();
    const business = await db.findBusinessById(businessId);
    
    // Vérifier que le business existe et appartient à l'utilisateur
    if (!business || business.user_id !== decoded.userId) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, business });
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const updates = await req.json();
    
    // Await params
    const { businessId } = await params;
    
    // Utiliser le système de base de données unifié
    const db = getDB();
    
    // Vérifier que le business existe et appartient à l'utilisateur
    const existingBusiness = await db.findBusinessById(businessId);
    if (!existingBusiness || existingBusiness.user_id !== decoded.userId) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }
    
    // Mettre à jour le business
    const updatedBusiness = await db.updateBusiness(businessId, {
      ...updates,
      _updatedAt: new Date()
    });
    
    if (!updatedBusiness) {
      return NextResponse.json({ ok: false, error: "Échec de la mise à jour" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      business: updatedBusiness
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}