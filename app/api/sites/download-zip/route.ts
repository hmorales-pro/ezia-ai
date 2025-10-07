import { NextRequest, NextResponse } from "next/server";
import { CompleteSiteOrchestrator } from "@/lib/agents/complete-site-orchestrator";
import { SimpleZipGenerator } from "@/lib/simple-zip-generator";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for complete site generation

/**
 * API endpoint for generating and downloading complete website as ZIP
 * GET /api/sites/download-zip?name=BusinessName&industry=Industry&description=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const industry = searchParams.get('industry');
    const description = searchParams.get('description');

    // Validation
    if (!name || !industry) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: name and industry'
      }, { status: 400 });
    }

    console.log(`[ZIP Download] Starting generation for ${name} (${industry})`);

    // Generate complete website
    const orchestrator = new CompleteSiteOrchestrator();
    const website = await orchestrator.generateCompleteWebsite({
      name,
      industry,
      description: description || undefined,
      baseUrl: `https://${name.toLowerCase().replace(/\s+/g, '-')}.com`,
      onProgress: (event) => {
        console.log(`[ZIP Download] Progress: ${event.phase} - ${event.message}`);
      }
    });

    console.log(`[ZIP Download] Generation complete. Creating ZIP with ${website.pages.length} pages...`);

    // Get file structure
    const files = orchestrator.getFileStructure(
      website,
      `https://${name.toLowerCase().replace(/\s+/g, '-')}.com`
    );

    // Create ZIP using built-in Node.js APIs
    const zip = new SimpleZipGenerator();

    for (const [path, content] of Object.entries(files)) {
      zip.addFile(path, content);
    }

    const zipBuffer = await zip.generate();

    console.log(`[ZIP Download] ZIP created successfully (${zipBuffer.length} bytes)`);

    // Return ZIP file
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedName}-site-complet.zip"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    console.error('[ZIP Download] Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate and download ZIP',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
