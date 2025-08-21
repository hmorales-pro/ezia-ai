import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { AgentSession } from "@/models/AgentSession";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

// GET /api/me/business/[businessId]/sessions - Lister les sessions d'un business
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agentType = searchParams.get('agentType');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Construire la requête
    const query: Record<string, unknown> = {
      business_id: businessId,
      user_id: user.id
    };

    if (status) {
      query.status = status;
    }

    if (agentType) {
      query['agent.type'] = agentType;
    }

    // Récupérer les sessions
    const sessions = await AgentSession.find(query)
      .sort({ started_at: -1 })
      .limit(limit)
      .skip(offset)
      .select('-__v -messages.metadata.thinking_process') // Exclure les données volumineuses
      .lean();

    const totalCount = await AgentSession.countDocuments(query);

    return NextResponse.json({
      ok: true,
      sessions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + sessions.length < totalCount
      }
    });

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/me/business/[businessId]/sessions - Créer une nouvelle session
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await request.json();
    const { objective, initial_request, agent_type = 'ezia' } = body;

    // Validation
    if (!objective || !initial_request) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: objective, initial_request" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Créer la session
    const sessionData = {
      session_id: `ses_${nanoid(16)}`,
      business_id: businessId,
      user_id: user.id,
      agent: {
        name: agent_type === 'ezia' ? 'Ezia' : 'Agent',
        type: agent_type,
      },
      context: {
        objective,
        initial_request,
        business_context: {
          name: business.name,
          industry: business.industry,
          stage: business.stage,
          description: business.description
        }
      },
      messages: [{
        role: 'user' as const,
        content: initial_request,
        timestamp: new Date()
      }],
      status: 'active' as const,
      started_at: new Date(),
      metrics: {
        api_calls_count: 0,
        tokens_used: 0
      }
    };

    const session = await AgentSession.create(sessionData);

    // Ajouter l'interaction au business
    await Business.findOneAndUpdate(
      { business_id: businessId },
      {
        $push: {
          ezia_interactions: {
            timestamp: new Date(),
            agent: sessionData.agent.name,
            interaction_type: 'session_started',
            summary: `Nouvelle session: ${objective}`
          }
        }
      }
    );

    return NextResponse.json({
      ok: true,
      session: {
        session_id: session.session_id,
        status: session.status,
        agent: session.agent,
        context: session.context,
        started_at: session.started_at
      },
      message: "Session created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}