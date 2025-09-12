import { NextRequest, NextResponse } from "next/server";
import { SiteGenerationOrchestrator } from "@/lib/agents/site-orchestrator";
import { SiteArchitectAgent } from "@/lib/agents/site-architect";
import { KikoDesignAgent } from "@/lib/agents/kiko-design";
import { LexSiteBuilderAgent } from "@/lib/agents/lex-site-builder";
import { MiloCopywritingAgent } from "@/lib/agents/milo-copywriting";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, industry, description } = body;

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "Business name and industry are required" },
        { status: 400 }
      );
    }

    // Generate with Ezia multi-agent system
    const orchestrator = new SiteGenerationOrchestrator({
      siteArchitect: new SiteArchitectAgent(),
      kikoDesign: new KikoDesignAgent(),
      lexSiteBuilder: new LexSiteBuilderAgent(),
      miloCopywriting: new MiloCopywritingAgent(),
    });

    const eziaStartTime = Date.now();
    const eziaResult = await orchestrator.generateSite({
      businessName,
      industry,
      description: description || `A ${industry} business`,
      targetAudience: "General audience",
      features: [],
    });
    const eziaTime = Date.now() - eziaStartTime;

    // For comparison, we'd call DeepSite's API here
    // For now, we'll create a placeholder
    const deepsiteResult = {
      html: "<div>DeepSite comparison placeholder</div>",
      css: "/* DeepSite styles */",
      time: 0,
    };

    return NextResponse.json({
      success: true,
      comparison: {
        ezia: {
          result: eziaResult,
          generationTime: eziaTime,
          features: {
            multiAgent: true,
            industrySpecific: true,
            designSystem: true,
            seoOptimized: true,
            responsive: true,
          },
        },
        deepsite: {
          result: deepsiteResult,
          generationTime: deepsiteResult.time,
          features: {
            multiAgent: false,
            industrySpecific: false,
            designSystem: false,
            seoOptimized: false,
            responsive: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Comparison generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comparison failed" },
      { status: 500 }
    );
  }
}