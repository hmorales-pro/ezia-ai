import { DeepSeekCodeAgent } from "./deepseek-code-agent";
import { BlogTopic } from "./blog-strategy-agent";

/**
 * Blog Writer Agent using DeepSeek V3
 * Specialized in generating high-quality, SEO-optimized blog articles
 *
 * Benefits:
 * - Cost-effective: ~60% cheaper than GLM-4.5
 * - High quality content generation
 * - SEO optimization built-in
 * - Batch processing support
 */
export class BlogWriterDeepSeek {
  private deepseek: DeepSeekCodeAgent;

  constructor() {
    this.deepseek = new DeepSeekCodeAgent();
  }

  /**
   * Generate a single blog article
   */
  async generateArticle(input: {
    topic: BlogTopic;
    businessContext: {
      name: string;
      industry: string;
      description?: string;
    };
    length?: "short" | "medium" | "long";
  }): Promise<GeneratedBlogArticle> {
    try {
      console.log(`[BlogWriter] Generating article: ${input.topic.title}`);

      const wordCount = this.getWordCount(input.length);

      const html = await this.deepseek.generateBlogArticle({
        title: input.topic.title,
        topic: input.topic.description,
        keywords: input.topic.keywords,
        tone: input.topic.tone,
        businessContext: input.businessContext
      });

      // Extract metadata from generated HTML
      const excerpt = this.extractExcerpt(html);
      const readTime = Math.ceil(wordCount / 200); // Average reading speed
      const actualWordCount = this.countWords(html);

      const article: GeneratedBlogArticle = {
        title: input.topic.title,
        content: html,
        excerpt,
        keywords: input.topic.keywords,
        tone: input.topic.tone,
        seoTitle: this.generateSEOTitle(input.topic.title),
        seoDescription: excerpt,
        wordCount: actualWordCount,
        readTime,
        tags: this.generateTags(input.topic),
        slug: this.generateSlug(input.topic.title),
        generatedAt: new Date().toISOString()
      };

      console.log(`[BlogWriter] Article generated: ${actualWordCount} words, ${readTime}min read`);

      return article;
    } catch (error) {
      console.error(`[BlogWriter] Failed to generate article:`, error);
      throw error;
    }
  }

  /**
   * Generate multiple articles in batch (parallel processing)
   */
  async generateBatch(input: {
    topics: BlogTopic[];
    businessContext: {
      name: string;
      industry: string;
      description?: string;
    };
    length?: "short" | "medium" | "long";
    maxConcurrent?: number;
  }): Promise<BatchGenerationResult> {
    const maxConcurrent = input.maxConcurrent || 3; // Limit concurrent requests
    const results: GeneratedBlogArticle[] = [];
    const errors: Array<{ topic: BlogTopic; error: string }> = [];

    console.log(`[BlogWriter] Starting batch generation: ${input.topics.length} articles`);
    console.log(`[BlogWriter] Max concurrent: ${maxConcurrent}`);

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < input.topics.length; i += maxConcurrent) {
      const batch = input.topics.slice(i, i + maxConcurrent);
      console.log(`[BlogWriter] Processing batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(input.topics.length / maxConcurrent)}`);

      const promises = batch.map(topic =>
        this.generateArticle({
          topic,
          businessContext: input.businessContext,
          length: input.length
        })
          .then(article => ({ success: true, article, topic }))
          .catch(error => ({ success: false, error: error.message, topic }))
      );

      const batchResults = await Promise.all(promises);

      batchResults.forEach(result => {
        if (result.success && result.article) {
          results.push(result.article);
        } else {
          errors.push({
            topic: result.topic,
            error: result.error || "Unknown error"
          });
        }
      });

      // Small delay between batches to be respectful to the API
      if (i + maxConcurrent < input.topics.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[BlogWriter] Batch complete: ${results.length} success, ${errors.length} failed`);

    return {
      articles: results,
      errors,
      successCount: results.length,
      failureCount: errors.length,
      totalCount: input.topics.length
    };
  }

  /**
   * Generate initial blog articles for a new website
   */
  async generateInitialArticles(input: {
    businessContext: {
      name: string;
      industry: string;
      description?: string;
    };
    count?: number;
  }): Promise<GeneratedBlogArticle[]> {
    try {
      console.log(`[BlogWriter] Generating ${input.count || 3} initial articles...`);

      // Generate quick topics first
      const topics = await this.generateQuickTopics(input.businessContext, input.count || 3);

      // Generate articles from topics
      const result = await this.generateBatch({
        topics,
        businessContext: input.businessContext,
        length: "medium"
      });

      return result.articles;
    } catch (error) {
      console.error(`[BlogWriter] Failed to generate initial articles:`, error);
      throw error;
    }
  }

  /**
   * Update an existing article with improvements
   */
  async updateArticle(input: {
    currentContent: string;
    improvements: string[];
    additionalKeywords?: string[];
  }): Promise<string> {
    try {
      console.log(`[BlogWriter] Updating article with ${input.improvements.length} improvements`);

      const prompt = `Improve the following blog article based on these suggestions:

## Current Article
${input.currentContent}

## Improvements to Make
${input.improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n")}

${input.additionalKeywords ? `\n## Additional Keywords to Include\n${input.additionalKeywords.join(", ")}` : ""}

## Requirements
1. Maintain the original tone and style
2. Improve SEO optimization
3. Enhance readability and engagement
4. Naturally integrate any additional keywords
5. Keep the same HTML structure (article tags, headings, etc.)
6. Make the content more valuable and actionable

Return the complete improved HTML article.`;

      // Use DeepSeek's general generation method
      const improved = await this.deepseek.generateBlogArticle({
        title: "Article Update",
        topic: prompt,
        keywords: input.additionalKeywords || [],
        tone: "professional",
        businessContext: { name: "", industry: "" }
      });

      console.log(`[BlogWriter] Article updated successfully`);

      return improved;
    } catch (error) {
      console.error(`[BlogWriter] Failed to update article:`, error);
      throw error;
    }
  }

  // Helper methods

  private getWordCount(length?: "short" | "medium" | "long"): number {
    switch (length) {
      case "short":
        return 600;
      case "long":
        return 2000;
      case "medium":
      default:
        return 1200;
    }
  }

  private extractExcerpt(html: string): string {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, " ");
    // Clean up whitespace
    const cleaned = text.replace(/\s+/g, " ").trim();
    // Take first 160 characters for SEO description
    return cleaned.substring(0, 160) + "...";
  }

  private countWords(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/);
    return words.length;
  }

  private generateSEOTitle(title: string): string {
    // Ensure SEO title is under 60 characters
    if (title.length <= 60) return title;
    return title.substring(0, 57) + "...";
  }

  private generateTags(topic: BlogTopic): string[] {
    // Extract main themes from keywords and topic
    const tags = new Set<string>();

    // Add first 3-5 keywords as tags
    topic.keywords.slice(0, 5).forEach(keyword => {
      tags.add(keyword.toLowerCase());
    });

    // Add business impact as tag
    if (topic.businessImpact) {
      tags.add(topic.businessImpact);
    }

    return Array.from(tags);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
  }

  private async generateQuickTopics(
    businessContext: { name: string; industry: string; description?: string },
    count: number
  ): Promise<BlogTopic[]> {
    // For initial articles, generate simple, high-value topics
    const baseTopics: BlogTopic[] = [
      {
        title: `${businessContext.name} : Notre Histoire et Notre Mission`,
        description: `Découvrez l'histoire de ${businessContext.name} et notre engagement dans le secteur ${businessContext.industry}`,
        keywords: [businessContext.name, businessContext.industry, "histoire", "mission"],
        tone: "professional",
        businessImpact: "high"
      },
      {
        title: `Guide Complet : Tout Savoir sur ${businessContext.industry}`,
        description: `Un guide exhaustif pour comprendre ${businessContext.industry} et ses enjeux`,
        keywords: [businessContext.industry, "guide", "introduction"],
        tone: "professional",
        businessImpact: "high"
      },
      {
        title: `Les Tendances ${businessContext.industry} à Suivre en ${new Date().getFullYear()}`,
        description: `Analyse des principales tendances qui transforment ${businessContext.industry}`,
        keywords: [businessContext.industry, "tendances", new Date().getFullYear().toString()],
        tone: "enthusiastic",
        businessImpact: "medium"
      },
      {
        title: `Comment Choisir le Bon Service ${businessContext.industry}`,
        description: `Conseils d'experts pour sélectionner le meilleur service ${businessContext.industry}`,
        keywords: [businessContext.industry, "choisir", "service", "conseils"],
        tone: "professional",
        businessImpact: "high"
      },
      {
        title: `FAQ : Questions Fréquentes sur ${businessContext.industry}`,
        description: `Réponses aux questions les plus posées sur ${businessContext.industry}`,
        keywords: [businessContext.industry, "faq", "questions"],
        tone: "casual",
        businessImpact: "medium"
      }
    ];

    return baseTopics.slice(0, count);
  }
}

// Types

export interface GeneratedBlogArticle {
  title: string;
  content: string; // HTML content
  excerpt: string;
  keywords: string[];
  tone: string;
  seoTitle: string;
  seoDescription: string;
  wordCount: number;
  readTime: number; // in minutes
  tags: string[];
  slug: string;
  generatedAt: string;
}

export interface BatchGenerationResult {
  articles: GeneratedBlogArticle[];
  errors: Array<{ topic: BlogTopic; error: string }>;
  successCount: number;
  failureCount: number;
  totalCount: number;
}
