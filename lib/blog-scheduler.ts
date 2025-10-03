import BlogPost from "@/models/BlogPost";
import { connectDB } from "@/lib/mongodb";

/**
 * Blog Scheduler - Handles automated blog post publishing
 *
 * Usage:
 * - Call checkAndPublishScheduledPosts() via cron job or Next.js Route Handler
 * - Runs daily to check for scheduled posts ready to publish
 */

export class BlogScheduler {
  /**
   * Check for scheduled posts and publish them if they're due
   */
  static async checkAndPublishScheduledPosts(): Promise<PublishResult> {
    try {
      await connectDB();

      const now = new Date();
      console.log(`[BlogScheduler] Checking for posts scheduled before ${now.toISOString()}`);

      // Find all scheduled posts that should be published now
      const scheduledPosts = await BlogPost.find({
        status: "scheduled",
        scheduledAt: { $lte: now }
      });

      console.log(`[BlogScheduler] Found ${scheduledPosts.length} posts to publish`);

      const results: PublishResult = {
        published: [],
        failed: [],
        totalChecked: scheduledPosts.length
      };

      for (const post of scheduledPosts) {
        try {
          // Update status to published
          post.status = "published";
          post.publishedAt = new Date();
          await post.save();

          results.published.push({
            id: post._id.toString(),
            title: post.title,
            publishedAt: post.publishedAt.toISOString()
          });

          console.log(`[BlogScheduler] ✅ Published: ${post.title}`);

          // TODO: Trigger site regeneration to include the new post
          // await this.triggerSiteRegeneration(post.businessId);

        } catch (error) {
          console.error(`[BlogScheduler] ❌ Failed to publish ${post.title}:`, error);
          results.failed.push({
            id: post._id.toString(),
            title: post.title,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      console.log(
        `[BlogScheduler] Complete: ${results.published.length} published, ${results.failed.length} failed`
      );

      return results;
    } catch (error) {
      console.error("[BlogScheduler] Error checking scheduled posts:", error);
      throw error;
    }
  }

  /**
   * Schedule a post for future publication
   */
  static async schedulePost(
    postId: string,
    scheduledAt: Date
  ): Promise<boolean> {
    try {
      await connectDB();

      const post = await BlogPost.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      post.status = "scheduled";
      post.scheduledAt = scheduledAt;
      await post.save();

      console.log(`[BlogScheduler] Scheduled post "${post.title}" for ${scheduledAt.toISOString()}`);

      return true;
    } catch (error) {
      console.error("[BlogScheduler] Error scheduling post:", error);
      throw error;
    }
  }

  /**
   * Get all scheduled posts for a business
   */
  static async getScheduledPosts(businessId: string): Promise<any[]> {
    try {
      await connectDB();

      const posts = await BlogPost.find({
        businessId,
        status: "scheduled"
      })
        .sort({ scheduledAt: 1 })
        .lean();

      return posts;
    } catch (error) {
      console.error("[BlogScheduler] Error getting scheduled posts:", error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled post (revert to draft)
   */
  static async cancelScheduled(postId: string): Promise<boolean> {
    try {
      await connectDB();

      const post = await BlogPost.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      if (post.status !== "scheduled") {
        throw new Error("Post is not scheduled");
      }

      post.status = "draft";
      post.scheduledAt = undefined;
      await post.save();

      console.log(`[BlogScheduler] Cancelled scheduling for "${post.title}"`);

      return true;
    } catch (error) {
      console.error("[BlogScheduler] Error cancelling scheduled post:", error);
      throw error;
    }
  }

  /**
   * Get upcoming scheduled posts count for the next N days
   */
  static async getUpcomingCount(businessId: string, days: number = 7): Promise<number> {
    try {
      await connectDB();

      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const count = await BlogPost.countDocuments({
        businessId,
        status: "scheduled",
        scheduledAt: {
          $gte: now,
          $lte: futureDate
        }
      });

      return count;
    } catch (error) {
      console.error("[BlogScheduler] Error getting upcoming count:", error);
      return 0;
    }
  }

  /**
   * Trigger site regeneration when a new post is published
   * This will be called to update the website's blog section
   */
  private static async triggerSiteRegeneration(businessId: string): Promise<void> {
    // TODO: Implement site regeneration logic
    // This should update the website's blog section HTML with the new post
    console.log(`[BlogScheduler] TODO: Trigger site regeneration for business ${businessId}`);
  }
}

// Types

export interface PublishResult {
  published: PublishedPost[];
  failed: FailedPost[];
  totalChecked: number;
}

export interface PublishedPost {
  id: string;
  title: string;
  publishedAt: string;
}

export interface FailedPost {
  id: string;
  title: string;
  error: string;
}
