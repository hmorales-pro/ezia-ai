import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Calendar } from '@/models/Calendar';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connexion à MongoDB
    await dbConnect();

    // Récupérer le calendrier depuis MongoDB
    const calendarDoc = await Calendar.findOne({ businessId, userId });

    return NextResponse.json({
      success: true,
      calendar: calendarDoc ? {
        items: calendarDoc.items,
        updatedAt: calendarDoc.updatedAt,
        userId: calendarDoc.userId
      } : null
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

    // Connexion à MongoDB
    await dbConnect();

    // Sauvegarder ou mettre à jour le calendrier dans MongoDB
    const calendarDoc = await Calendar.findOneAndUpdate(
      { businessId, userId },
      {
        businessId,
        userId,
        items: calendar,
        updatedAt: new Date(),
      },
      {
        upsert: true, // Créer si n'existe pas
        new: true,    // Retourner le document mis à jour
      }
    );

    return NextResponse.json({
      success: true,
      message: "Calendar saved successfully",
      calendar: {
        items: calendarDoc.items,
        updatedAt: calendarDoc.updatedAt,
      }
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
    let userId;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connexion à MongoDB
    await dbConnect();

    // Supprimer le calendrier de MongoDB
    await Calendar.findOneAndDelete({ businessId, userId });

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
