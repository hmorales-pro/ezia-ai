import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { AgentSession } from "@/models/AgentSession";

interface RouteParams {
  params: Promise<{
    businessId: string;
    sessionId: string;
  }>;
}

// GET /api/me/business/[businessId]/sessions/[sessionId] - Récupérer une session
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, sessionId } = await params;
    await dbConnect();

    const session = await AgentSession.findOne({
      session_id: sessionId,
      business_id: businessId,
      user_id: user.id
    })
      .select('-__v')
      .lean();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      session
    });

  } catch (error: any) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PUT /api/me/business/[businessId]/sessions/[sessionId] - Mettre à jour une session
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, sessionId } = await params;
    const body = await request.json();
    const { action, data } = body;

    await dbConnect();

    // Vérifier que la session existe et appartient à l'utilisateur
    const session = await AgentSession.findOne({
      session_id: sessionId,
      business_id: businessId,
      user_id: user.id
    });

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Traiter les différentes actions
    switch (action) {
      case 'add_message':
        if (!data.content || !data.role) {
          return NextResponse.json(
            { ok: false, error: "Missing message content or role" },
            { status: 400 }
          );
        }

        session.addMessage(data.role, data.content, data.metadata);
        await session.save();
        break;

      case 'complete':
        if (!data.results) {
          return NextResponse.json(
            { ok: false, error: "Missing session results" },
            { status: 400 }
          );
        }

        session.results = data.results;
        session.complete();
        
        // Mettre à jour les métriques si fournies
        if (data.metrics) {
          session.metrics = { ...session.metrics, ...data.metrics };
        }
        
        await session.save();
        break;

      case 'pause':
        session.status = 'paused';
        await session.save();
        break;

      case 'resume':
        if (session.status !== 'paused') {
          return NextResponse.json(
            { ok: false, error: "Session is not paused" },
            { status: 400 }
          );
        }
        session.status = 'active';
        await session.save();
        break;

      case 'fail':
        session.status = 'failed';
        if (data.error) {
          session.results.summary = `Session failed: ${data.error}`;
        }
        await session.save();
        break;

      default:
        return NextResponse.json(
          { ok: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    // Retourner la session mise à jour
    const updatedSession = await AgentSession.findById(session._id)
      .select('-__v')
      .lean();

    return NextResponse.json({
      ok: true,
      session: updatedSession,
      message: `Session ${action} successful`
    });

  } catch (error: any) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/me/business/[businessId]/sessions/[sessionId] - Supprimer une session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, sessionId } = await params;
    await dbConnect();

    // Vérifier et supprimer la session
    const result = await AgentSession.deleteOne({
      session_id: sessionId,
      business_id: businessId,
      user_id: user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Session deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete session" },
      { status: 500 }
    );
  }
}