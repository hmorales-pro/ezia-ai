import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from '@/lib/database';

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

    // Pour l'instant, on retourne un tableau vide
    // Plus tard, on implémentera la récupération depuis MongoDB
    const sessions = [];

    return NextResponse.json({ 
      success: true,
      sessions 
    });
    
  } catch (error) {
    console.error("[Chat History] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
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

    const { sessionId, messages } = await request.json();

    // Pour l'instant, on simule la sauvegarde
    // Plus tard, on implémentera la sauvegarde dans MongoDB
    console.log("[Chat History] Saving messages for session:", sessionId);

    return NextResponse.json({ 
      success: true,
      message: "Messages saved successfully"
    });
    
  } catch (error) {
    console.error("[Chat History] Error saving:", error);
    return NextResponse.json(
      { error: "Failed to save chat history" },
      { status: 500 }
    );
  }
}