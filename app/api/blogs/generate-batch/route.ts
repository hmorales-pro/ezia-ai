import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { BlogWriterDeepSeek } from "@/lib/agents/blog-writer-deepseek";
import { BlogStrategyAgent } from "@/lib/agents/blog-strategy-agent";
import BlogPost from "@/models/BlogPost";
import { connectDB } from "@/lib/mongodb";

export const maxDuration = 300; // 5 minutes for batch generation

/**
 * API Route to generate multiple blog articles in batch
 * Uses DeepSeek for cost-effective generation
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      businessId,
      businessName,
      industry,
      description,
      count = 5,
      length = "medium",
      autoSchedule = false
    } = await request.json();

    if (!businessId || !businessName || !industry) {
      return NextResponse.json(
        { error: "businessId, businessName, and industry are required" },
        { status: 400 }
      );
    }

    console.log(`[BatchGenerate] Generating ${count} articles for ${businessName}...`);

    // Step 1: Generate content strategy
    const strategyAgent = new BlogStrategyAgent();
    console.log("[BatchGenerate] Generating content strategy...");

    const topics = await strategyAgent.generateQuickTopics({
      businessName,
      industry,
      count
    });

    console.log(`[BatchGenerate] Generated ${topics.length} topics`);

    // Step 2: Generate articles using DeepSeek
    const writerAgent = new BlogWriterDeepSeek();
    console.log("[BatchGenerate] Generating articles with DeepSeek...");

    const batchResult = await writerAgent.generateBatch({
      topics,
      businessContext: {
        name: businessName,
        industry,
        description
      },
      length: length as "short" | "medium" | "long",
      maxConcurrent: 3
    });

    console.log(
      `[BatchGenerate] Batch complete: ${batchResult.successCount}/${batchResult.totalCount} articles generated`
    );

    // Step 3: Save articles to database
    await connectDB();

    const savedPosts = [];
    let scheduleDateOffset = 0;

    for (const article of batchResult.articles) {
      try {
        const post = new BlogPost({
          businessId,
          userId: user._id.toString(),
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          slug: article.slug,
          status: autoSchedule ? "scheduled" : "draft",
          tags: article.tags,
          keywords: article.keywords,
          tone: article.tone,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          wordCount: article.wordCount,
          readTime: article.readTime,
          aiGenerated: true,
          lastEditedBy: user.email
        });

        // If auto-schedule, schedule posts 3 days apart
        if (autoSchedule) {
          const scheduleDate = new Date();
          scheduleDate.setDate(scheduleDate.getDate() + scheduleDateOffset);
          scheduleDate.setHours(10, 0, 0, 0); // Publish at 10 AM

          post.scheduledAt = scheduleDate;
          scheduleDateOffset += 3; // Next post 3 days later
        }

        await post.save();
        savedPosts.push({
          id: post._id.toString(),
          title: post.title,
          status: post.status,
          scheduledAt: post.scheduledAt
        });

        console.log(`[BatchGenerate] ✅ Saved: ${post.title}`);
      } catch (error) {
        console.error(`[BatchGenerate] ❌ Failed to save article: ${article.title}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      generated: batchResult.successCount,
      failed: batchResult.failureCount,
      saved: savedPosts.length,
      posts: savedPosts,
      errors: batchResult.errors.map(e => ({
        topic: e.topic.title,
        error: e.error
      }))
    });
  } catch (error) {
    console.error("[BatchGenerate] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate batch articles"
      },
      { status: 500 }
    );
  }
}
