import { NextRequest, NextResponse } from "next/server";
import { CompleteSiteOrchestrator } from "@/lib/agents/complete-site-orchestrator";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for complete generation

/**
 * API Route: Generate Complete Multi-Page Website
 *
 * Generates:
 * - 8+ pages (homepage, blog, about, services, contact, legal, etc.)
 * - 3-5 blog articles
 * - Shared CSS & JS
 * - Sitemap.xml & robots.txt
 * - README with deployment instructions
 *
 * Returns: JSON with complete file structure ready for ZIP download
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const industry = searchParams.get('industry');
  const description = searchParams.get('description');
  const baseUrl = searchParams.get('baseUrl');

  if (!name || !industry) {
    return NextResponse.json(
      { error: "Nom du business et industrie requis" },
      { status: 400 }
    );
  }

  try {
    console.log(`[Complete Site] Starting generation for: ${name}`);

    const orchestrator = new CompleteSiteOrchestrator();

    const website = await orchestrator.generateCompleteWebsite({
      name,
      industry,
      description: description || undefined,
      baseUrl: baseUrl || undefined
    });

    // Get file structure for download
    const files = orchestrator.getFileStructure(
      website,
      baseUrl || `https://${name.toLowerCase()}.com`
    );

    console.log(`[Complete Site] Generation complete: ${Object.keys(files).length} files`);

    return NextResponse.json({
      success: true,
      website: {
        metadata: website.metadata,
        totalPages: website.pages.length,
        totalFiles: Object.keys(files).length,
        pages: website.pages.map(p => ({
          type: p.type,
          filename: p.filename,
          title: p.title,
          path: p.path
        }))
      },
      files // Full file structure for download
    });

  } catch (error) {
    console.error("[Complete Site] Generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la génération"
      },
      { status: 500 }
    );
  }
}
