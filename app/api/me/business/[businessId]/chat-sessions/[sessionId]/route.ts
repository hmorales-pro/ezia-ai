import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from '@/lib/database';
import ChatSession from '@/models/ChatSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; sessionId: string }> }
) {
  try {
    const { businessId, sessionId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connexion à la base de données
    await getDB();

    // Récupérer la session
    const session = await ChatSession.findOne({
      sessionId,
      businessId,
      userId: user.id
    }).lean();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      session: {
        id: session.sessionId,
        businessId: session.businessId,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        context: session.context
      }
    });

  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; sessionId: string }> }
) {
  try {
    const { businessId, sessionId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, updatedAt } = await request.json();

    // Connexion à la base de données
    await getDB();

    // Mettre à jour la session
    const session = await ChatSession.findOneAndUpdate(
      {
        sessionId,
        businessId,
        userId: user.id
      },
      {
        messages,
        updatedAt: updatedAt || new Date(),
        $set: {
          'metadata.lastActivity': new Date(),
          'metadata.messagesCount': messages.length,
          'metadata.userMessagesCount': messages.filter((m: any) => m.role === 'user').length
        }
      },
      { new: true }
    );

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      session: {
        id: session.sessionId,
        businessId: session.businessId,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        context: session.context
      }
    });

  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; sessionId: string }> }
) {
  try {
    const { businessId, sessionId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connexion à la base de données
    await getDB();

    // Supprimer la session
    const result = await ChatSession.findOneAndDelete({
      sessionId,
      businessId,
      userId: user.id
    });

    if (!result) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Session deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}