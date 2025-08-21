import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Stockage temporaire en mémoire (remplacer par MongoDB en production)
declare global {
  var businessCalendars: Record<string, any> | undefined;
}

if (!global.businessCalendars) {
  global.businessCalendars = {};
}

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    try {
      jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Récupérer le calendrier sauvegardé
    const calendar = global.businessCalendars[businessId] || null;
    
    return NextResponse.json({ 
      success: true,
      calendar 
    });

  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Récupérer les données du calendrier
    const { calendar } = await request.json();
    
    if (!calendar || !Array.isArray(calendar)) {
      return NextResponse.json(
        { error: "Invalid calendar data" },
        { status: 400 }
      );
    }

    // Sauvegarder le calendrier
    global.businessCalendars[businessId] = {
      items: calendar,
      updatedAt: new Date().toISOString(),
      userId
    };

    return NextResponse.json({ 
      success: true,
      message: "Calendar saved successfully"
    });

  } catch (error) {
    console.error("Error saving calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    try {
      jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Supprimer le calendrier
    delete global.businessCalendars[businessId];

    return NextResponse.json({ 
      success: true,
      message: "Calendar deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}