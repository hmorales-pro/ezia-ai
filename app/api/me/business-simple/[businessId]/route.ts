import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from '@/lib/auth-utils';

// In-memory business storage (same as parent route)
declare global {
  var businesses: any[];
}

// Initialize businesses array if not exists
if (!global.businesses) {
  global.businesses = [];
}

export async function PUT(request: NextRequest, props: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await props.params;
  
  try {
    // Get the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME);
    
    if (!token) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default-jwt-secret') as any;
    
    // Get the request body
    const body = await request.json();
    
    // Find and update the business
    const businessIndex = global.businesses.findIndex(b => b.business_id === businessId);
    
    if (businessIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Business non trouvé' 
      }, { status: 404 });
    }
    
    // Check if the business belongs to the user
    if (global.businesses[businessIndex].user_id !== decoded.userId) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non autorisé' 
      }, { status: 403 });
    }
    
    // Update the business
    global.businesses[businessIndex] = {
      ...global.businesses[businessIndex],
      ...body,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      ok: true, 
      business: global.businesses[businessIndex],
      message: 'Business mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la mise à jour du business' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await props.params;
  
  try {
    // Get the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME);
    
    if (!token) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non authentifié' 
      }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default-jwt-secret') as any;
    
    // Find the business
    const businessIndex = global.businesses.findIndex(b => b.business_id === businessId);
    
    if (businessIndex === -1) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Business non trouvé' 
      }, { status: 404 });
    }
    
    // Check if the business belongs to the user
    if (global.businesses[businessIndex].user_id !== decoded.userId) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Non autorisé' 
      }, { status: 403 });
    }
    
    // Delete the business
    global.businesses.splice(businessIndex, 1);
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Business supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json({ 
      ok: false, 
      message: 'Erreur lors de la suppression du business' 
    }, { status: 500 });
  }
}