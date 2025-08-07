import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-service";

export async function GET(request: NextRequest) {
  try {
    // Obtenir le token depuis les cookies ou utiliser celui par défaut
    const token = request.cookies.get("HF_TOKEN")?.value || 
                 process.env.DEFAULT_HF_TOKEN || 
                 process.env.HF_TOKEN;

    if (!token) {
      return NextResponse.json({
        error: "Aucun token HuggingFace configuré"
      }, { status: 400 });
    }

    // Test simple
    const response = await generateAIResponse(
      "Qu'est-ce qu'une stratégie marketing efficace pour une startup?",
      {
        systemContext: "Tu es un consultant en marketing. Réponds en français de manière concise.",
        token,
        maxTokens: 500,
        temperature: 0.7
      }
    );

    return NextResponse.json({
      success: response.success,
      content: response.content,
      model: response.model,
      error: response.error
    });
  } catch (error: any) {
    console.error("AI Service test error:", error);
    return NextResponse.json({
      error: error.message || "Erreur lors du test"
    }, { status: 500 });
  }
}