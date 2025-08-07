import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { agentSpeak, multiAgentConversation, selectAgentForTask } from "@/lib/ai-agents";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, agentId, projectContext, multiAgent = false } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Mode multi-agents pour les projets complexes
    if (multiAgent) {
      const conversation = await multiAgentConversation(message, projectContext || "");
      return NextResponse.json({
        success: true,
        conversation,
        agents: conversation.map(c => ({
          id: c.agent.id,
          name: c.agent.name,
          emoji: c.agent.emoji,
          role: c.agent.role
        }))
      });
    }

    // Mode agent unique
    const selectedAgentId = agentId || selectAgentForTask(message).id;
    const response = await agentSpeak(selectedAgentId, message, projectContext);

    return NextResponse.json({
      success: true,
      agent: {
        id: response.agent.id,
        name: response.agent.name,
        emoji: response.agent.emoji,
        role: response.agent.role
      },
      message: response.response
    });

  } catch (error: any) {
    console.error("Agent chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process agent request" },
      { status: 500 }
    );
  }
}