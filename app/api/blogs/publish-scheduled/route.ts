import { NextRequest, NextResponse } from "next/server";
import { BlogScheduler } from "@/lib/blog-scheduler";

/**
 * API Route to manually trigger scheduled blog post publishing
 * Can be called via cron job or manually
 *
 * Usage:
 * - Set up a cron job to call this endpoint daily
 * - Or use Vercel Cron Jobs (vercel.json)
 * - Or Next.js Route Handlers with node-cron
 */

export async function POST(request: NextRequest) {
  try {
    // Optional: Add auth check for cron jobs
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[PublishScheduled] Running scheduled post check...");

    const result = await BlogScheduler.checkAndPublishScheduledPosts();

    return NextResponse.json({
      success: true,
      result,
      message: `Published ${result.published.length} posts, ${result.failed.length} failed`
    });
  } catch (error) {
    console.error("[PublishScheduled] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to publish scheduled posts"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: "ok",
    message: "Blog scheduler endpoint is running",
    timestamp: new Date().toISOString()
  });
}
