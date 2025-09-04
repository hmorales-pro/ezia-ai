import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utiliser le même stockage en mémoire que business-simple
declare global {
  var businesses: any[];
}

if (!global.businesses) {
  global.businesses = [];
}

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
    
    // Trouver le business
    const business = global.businesses.find(
      b => b.business_id === businessId && b.userId === decoded.userId
    );
    
    if (!business) {
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
    
    // Trouver et mettre à jour le business
    const businessIndex = global.businesses.findIndex(
      b => b.business_id === businessId && b.userId === decoded.userId
    );
    
    if (businessIndex === -1) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }
    
    global.businesses[businessIndex] = {
      ...global.businesses[businessIndex],
      ...updates,
      _updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      ok: true, 
      business: global.businesses[businessIndex]
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}