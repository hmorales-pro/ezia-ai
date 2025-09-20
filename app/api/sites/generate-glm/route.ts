import { NextRequest, NextResponse } from "next/server";
import { CodeLLMAgent } from "@/lib/agents/code-llm-agent";

export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const { businessName, industry, description, features } = await request.json();

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "Nom du business et industrie requis" },
        { status: 400 }
      );
    }

    console.log("🤖 Starting Code LLM Full-Stack generation for:", businessName);

    // Use GLM-4.5 model directly
    const agent = new CodeLLMAgent("glm45");
    const result = await agent.generateWebsite({
      businessName,
      industry,
      description: description || `${businessName} est une entreprise dans le secteur ${industry}.`,
      features
    });

    console.log("✅ Code LLM generation complete!");

    return NextResponse.json({
      success: true,
      html: result.html,
      metadata: result.metadata
    });

  } catch (error) {
    console.error("❌ Error with GLM-4.5 generation:", error);
    
    // Détails d'erreur pour le debug
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    } : { message: "Unknown error" };

    return NextResponse.json(
      { 
        error: "Erreur lors de la génération GLM-4.5",
        details: errorDetails
      },
      { status: 500 }
    );
  }
}