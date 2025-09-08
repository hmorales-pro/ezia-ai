import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from '@/lib/database';
import ChatSession from '@/models/ChatSession';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connexion à la base de données
    await getDB();

    // Récupérer les sessions de l'utilisateur pour ce business
    const sessions = await ChatSession.find({
      businessId,
      userId: user.id
    })
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();

    // Formater les sessions pour le frontend
    const formattedSessions = sessions.map(session => ({
      id: session.sessionId,
      businessId: session.businessId,
      title: session.title,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      context: session.context || session.mode
    }));

    return NextResponse.json({ 
      success: true,
      sessions: formattedSessions
    });

  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionData = await request.json();

    // Connexion à la base de données
    await getDB();

    // Créer la nouvelle session
    const newSession = new ChatSession({
      sessionId: sessionData.id,
      businessId,
      userId: user.id,
      title: sessionData.title,
      messages: sessionData.messages || [],
      context: sessionData.context,
      mode: sessionData.context || 'general',
      metadata: {
        messagesCount: 0,
        userMessagesCount: 0,
        lastActivity: new Date()
      }
    });

    await newSession.save();

    return NextResponse.json({ 
      success: true,
      session: {
        id: newSession.sessionId,
        businessId: newSession.businessId,
        title: newSession.title,
        messages: newSession.messages,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
        context: newSession.context
      }
    });

  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}