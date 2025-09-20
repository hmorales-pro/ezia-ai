import { NextRequest, NextResponse } from "next/server";
import { SiteArchitectAIAgent } from "@/lib/agents/site-architect-ai";
import { KikoDesignAIAgent } from "@/lib/agents/kiko-design-ai";
import { MiloCopywritingAIAgent } from "@/lib/agents/milo-copywriting-ai";
import { LexSiteBuilderAIAgent } from "@/lib/agents/lex-site-builder-ai";

export const maxDuration = 60; // 60 seconds timeout

interface GenerationContext {
  businessName: string;
  industry: string;
  description: string;
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const context: GenerationContext = await request.json();

    if (!context.businessName || !context.industry) {
      return NextResponse.json(
        { error: "Nom du business et industrie requis" },
        { status: 400 }
      );
    }

    console.log("🚀 Starting Multi-Agent Website Generation");
    console.log("📋 Context:", context);

    // Initialize all agents
    const architect = new SiteArchitectAIAgent();
    const kikoDesign = new KikoDesignAIAgent();
    const miloCopywriter = new MiloCopywritingAIAgent();
    const lexBuilder = new LexSiteBuilderAIAgent(); // Using GLM-4.5

    try {
      // Phase 1: Site Architecture (Mistral AI)
      console.log("\n🏗️ PHASE 1: Site Architecture - Analysis");
      const insights = await architect.analyzeBusiness({
        businessName: context.businessName,
        industry: context.industry,
        description: context.description || `${context.businessName} dans le secteur ${context.industry}`,
        targetAudience: "Grand public et professionnels"
      });
      console.log("✅ Business insights generated");

      console.log("\n🏗️ PHASE 1.2: Site Architecture - Structure");
      const siteStructure = await architect.generateStructure({
        businessName: context.businessName,
        industry: context.industry,
        insights: insights
      });
      console.log("✅ Site structure created:", {
        sections: siteStructure.sections.length,
        navigation: siteStructure.navigation.length
      });

      // Phase 2: Design System (Mistral AI)
      console.log("\n🎨 PHASE 2: Design System");
      const designSystem = await kikoDesign.createDesignSystem({
        businessName: context.businessName,
        industry: context.industry,
        brandPersonality: ["Professionnel", "Moderne", "Accessible"]
      });
      console.log("✅ Design system created:", {
        primaryColor: designSystem.colors?.primary || "N/A",
        style: designSystem.layout?.style || "N/A",
        hasColors: !!designSystem.colors,
        hasLayout: !!designSystem.layout
      });

      // Phase 3: Content Generation (Mistral AI)
      console.log("\n✍️ PHASE 3: Content Generation");
      const content = await miloCopywriter.generateContent(
        siteStructure,
        {
          tone: "Professionnel et engageant",
          style: "Clair et persuasif",
          keywords: [context.businessName, context.industry],
          cta: {
            primary: "Contactez-nous",
            secondary: "En savoir plus"
          }
        }
      );
      console.log("✅ Content generated for all sections");

      // Phase 4: Website Building with GLM-4.5
      console.log("\n🔨 PHASE 4: Website Building with GLM-4.5");
      const generatedSite = await lexBuilder.buildSite(
        siteStructure,
        designSystem,
        content
      );
      console.log("✅ Website built successfully with GLM-4.5");

      // Return the complete generated website
      return NextResponse.json({
        success: true,
        html: generatedSite.html,
        metadata: {
          ...generatedSite.metadata,
          generationProcess: {
            architect: "Mistral AI",
            designer: "Mistral AI",
            copywriter: "Mistral AI",
            builder: "GLM-4.5",
            timestamp: new Date().toISOString()
          },
          structure: {
            sections: generatedSite.sections.length,
            hasNavigation: true,
            hasFooter: true
          }
        }
      });

    } catch (agentError: any) {
      console.error("❌ Agent error:", agentError);
      
      // Detailed error response for debugging
      return NextResponse.json(
        {
          error: "Erreur lors de la génération multi-agent",
          details: {
            message: agentError.message,
            phase: agentError.agent || "Unknown",
            suggestion: "Vérifiez les clés API (MISTRAL_API_KEY et HF_TOKEN)"
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("❌ General error:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de la génération",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}