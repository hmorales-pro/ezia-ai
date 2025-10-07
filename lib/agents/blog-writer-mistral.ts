import { AIBaseAgent } from "./ai-base-agent";
import { BlogTopic } from "./blog-strategy-agent";
import { DesignSystem } from "@/types/design-system";

/**
 * Blog Writer Agent using Mistral Large
 * Specialized in generating high-quality, SEO-optimized blog articles in French
 *
 * Benefits:
 * - Excellent French content generation
 * - Perfect coherence with site content (same AI across all agents)
 * - SEO optimization built-in
 * - Respects design system automatically
 * - Cost: ~€0.02/article (2000 words)
 */
export class BlogWriterMistral extends AIBaseAgent {
  constructor() {
    super({
      name: "Blog Writer",
      role: "Content Creation Specialist",
      capabilities: [
        "SEO-optimized blog articles",
        "French language expertise",
        "Design system integration",
        "Engaging storytelling",
        "Technical & business content"
      ],
      temperature: 0.7,
      maxTokens: 8000,
      systemPrompt: "Tu es un expert en rédaction de contenu web SEO-optimisé en français. Tu crées des articles de blog professionnels, engageants et optimisés pour le référencement."
    });
  }

  protected getDefaultSystemPrompt(): string {
    return "Tu es un expert en rédaction de contenu web SEO-optimisé en français. Tu crées des articles de blog professionnels, engageants et optimisés pour le référencement.";
  }

  /**
   * Generate a single blog article with design system integration
   */
  async generateArticle(input: {
    topic: BlogTopic;
    businessContext: {
      name: string;
      industry: string;
      description?: string;
    };
    designSystem?: DesignSystem;
    length?: "short" | "medium" | "long";
  }): Promise<GeneratedBlogArticle> {
    try {
      this.log(`Generating article: ${input.topic.title}`);

      const wordCount = this.getWordCount(input.length);

      const prompt = this.buildArticlePrompt({
        title: input.topic.title,
        description: input.topic.description,
        keywords: input.topic.keywords,
        tone: input.topic.tone,
        businessContext: input.businessContext,
        designSystem: input.designSystem,
        wordCount
      });

      const html = await this.generateWithAI({
        prompt,
        maxRetries: 2
      });

      const cleanedHTML = this.extractAndCleanHTML(html);

      // Extract metadata from generated HTML
      const excerpt = this.extractExcerpt(cleanedHTML);
      const readTime = Math.ceil(wordCount / 200); // Average reading speed
      const actualWordCount = this.countWords(cleanedHTML);

      // Generate slug from title
      const slug = input.topic.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const article: GeneratedBlogArticle = {
        title: input.topic.title,
        slug,
        content: cleanedHTML,
        excerpt,
        keywords: input.topic.keywords,
        tone: input.topic.tone,
        seoTitle: this.generateSEOTitle(input.topic.title),
        seoDescription: excerpt,
        wordCount: actualWordCount,
        readTime,
        tags: this.extractTags(input.topic.keywords),
        publishDate: new Date().toISOString(),
        status: "draft"
      };

      this.log(`Article generated successfully: ${actualWordCount} words, ${readTime}min read`);
      return article;
    } catch (error) {
      this.log(`Failed to generate article: ${error}`);
      throw error;
    }
  }

  private buildArticlePrompt(params: {
    title: string;
    description: string;
    keywords: string[];
    tone: string;
    businessContext: any;
    designSystem?: DesignSystem;
    wordCount: number;
  }): string {
    const colors = params.designSystem?.colorPalette || {
      primary: "#2563EB",
      secondary: "#8B5CF6",
      accent: "#EC4899"
    };

    return `Tu es un expert en rédaction de contenu web SEO-optimisé en français.

CONTEXTE BUSINESS:
- Nom: ${params.businessContext.name}
- Industrie: ${params.businessContext.industry}
- Description: ${params.businessContext.description || "N/A"}

ARTICLE À RÉDIGER:
- Titre: ${params.title}
- Sujet: ${params.description}
- Mots-clés SEO: ${params.keywords.join(", ")}
- Ton: ${params.tone}
- Longueur cible: ${params.wordCount} mots

CHARTE GRAPHIQUE:
- Couleur primaire: ${colors.primary}
- Couleur secondaire: ${colors.secondary}
- Couleur accent: ${colors.accent}

INSTRUCTIONS:
1. Rédige un article de blog complet et professionnel en français
2. Structure avec des H2 et H3 pour une bonne hiérarchie
3. Intègre naturellement les mots-clés SEO
4. Ajoute des exemples concrets et des conseils pratiques
5. Utilise un ton ${params.tone}
6. Optimise pour le référencement (balises meta, structure, densité de mots-clés)
7. Ajoute une introduction accrocheuse et une conclusion engageante
8. Utilise les couleurs de la charte graphique pour les éléments visuels

STRUCTURE HTML:
- Utilise des <h2> pour les sections principales
- Utilise des <h3> pour les sous-sections
- Ajoute des <p> pour les paragraphes
- Utilise <strong> pour mettre en évidence
- Ajoute des listes <ul> quand approprié
- Intègre des <blockquote> pour les citations importantes
- Utilise des <div class="highlight"> avec background: ${colors.primary}15 pour les encadrés

EXEMPLE DE STRUCTURE:
<article class="blog-post">
  <header>
    <h1>${params.title}</h1>
    <div class="meta">
      <span class="date">${new Date().toLocaleDateString('fr-FR')}</span>
      <span class="read-time">Lecture: 5 min</span>
    </div>
  </header>

  <div class="content">
    <p class="intro">Introduction accrocheuse...</p>

    <h2>Première Section</h2>
    <p>Contenu détaillé...</p>

    <h3>Sous-section</h3>
    <p>Développement...</p>

    <div class="highlight" style="background: ${colors.primary}15; padding: 1.5rem; border-left: 4px solid ${colors.primary}; margin: 2rem 0;">
      <strong>💡 Point clé:</strong> Information importante
    </div>

    <h2>Deuxième Section</h2>
    <ul>
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>

    <blockquote style="border-left: 4px solid ${colors.accent}; padding-left: 1.5rem; margin: 2rem 0; font-style: italic;">
      Citation pertinente
    </blockquote>

    <h2>Conclusion</h2>
    <p>Synthèse et call-to-action...</p>
  </div>
</article>

<style>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  color: #333;
}

.blog-post h1 {
  font-size: 2.5rem;
  color: ${colors.primary};
  margin-bottom: 1rem;
}

.blog-post .meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.blog-post h2 {
  font-size: 1.8rem;
  color: ${colors.primary};
  margin: 2.5rem 0 1rem 0;
}

.blog-post h3 {
  font-size: 1.4rem;
  color: ${colors.secondary};
  margin: 1.5rem 0 0.8rem 0;
}

.blog-post p {
  margin-bottom: 1.2rem;
}

.blog-post .intro {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
}

.blog-post ul, .blog-post ol {
  margin: 1rem 0 1.5rem 2rem;
}

.blog-post li {
  margin-bottom: 0.5rem;
}

.blog-post strong {
  color: ${colors.primary};
}
</style>

IMPORTANT - FORMAT DE SORTIE:
- Retourne UNIQUEMENT le HTML complet (avec <article> et <style>)
- PAS de code markdown (pas de \`\`\`html)
- PAS d'explications, juste le HTML
- Le HTML doit être prêt à être intégré directement dans une page

Génère maintenant l'article complet:`;
  }

  private extractAndCleanHTML(content: string): string {
    let html = content;

    // Remove markdown code blocks
    html = html.replace(/```html\s*/gi, '');
    html = html.replace(/```\s*$/gi, '');
    html = html.trim();

    // Unescape if JSON-wrapped
    try {
      if (html.trim().startsWith('"') && html.trim().endsWith('"')) {
        html = JSON.parse(html);
      }
      if (html.trim().startsWith('{')) {
        const parsed = JSON.parse(html);
        if (parsed.html || parsed.content) {
          html = parsed.html || parsed.content;
        }
      }
    } catch (e) {
      // Not JSON, continue
    }

    return html;
  }

  private getWordCount(length?: "short" | "medium" | "long"): number {
    switch (length) {
      case "short": return 800;
      case "long": return 2500;
      default: return 1500;
    }
  }

  private extractExcerpt(html: string): string {
    // Extract first paragraph or intro
    const introMatch = html.match(/<p class="intro">(.*?)<\/p>/s);
    if (introMatch) {
      return this.stripHTML(introMatch[1]).substring(0, 200) + "...";
    }

    const firstPMatch = html.match(/<p>(.*?)<\/p>/s);
    if (firstPMatch) {
      return this.stripHTML(firstPMatch[1]).substring(0, 200) + "...";
    }

    return "Article de blog professionnel";
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private countWords(html: string): number {
    const text = this.stripHTML(html);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateSEOTitle(title: string): string {
    return title.length > 60 ? title.substring(0, 57) + "..." : title;
  }

  private extractTags(keywords: string[]): string[] {
    return keywords.slice(0, 5); // Max 5 tags
  }

  /**
   * Generate multiple articles in batch (with concurrency limit)
   */
  async generateBatch(input: {
    topics: BlogTopic[];
    businessContext: any;
    designSystem?: DesignSystem;
    maxConcurrent?: number;
  }): Promise<GeneratedBlogArticle[]> {
    const maxConcurrent = input.maxConcurrent || 3;
    this.log(`Starting batch generation: ${input.topics.length} articles`);
    this.log(`Max concurrent: ${maxConcurrent}`);

    const results: GeneratedBlogArticle[] = [];
    const errors: { topic: BlogTopic; error: any }[] = [];

    // Process in batches
    for (let i = 0; i < input.topics.length; i += maxConcurrent) {
      const batch = input.topics.slice(i, i + maxConcurrent);
      this.log(`Processing batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(input.topics.length / maxConcurrent)}`);

      const promises = batch.map(topic =>
        this.generateArticle({
          topic,
          businessContext: input.businessContext,
          designSystem: input.designSystem
        })
          .then(article => ({ success: true, article }))
          .catch(error => {
            this.log(`Failed to generate article: ${error}`);
            errors.push({ topic, error });
            return { success: false, error };
          })
      );

      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter(r => r.success).map(r => r.article!));
    }

    this.log(`Batch complete: ${results.length} success, ${errors.length} failed`);
    return results;
  }

  /**
   * Generate initial articles for a new website (3 articles by default)
   */
  async generateInitialArticles(input: {
    businessContext: any;
    designSystem?: DesignSystem;
    count?: number;
  }): Promise<GeneratedBlogArticle[]> {
    const count = input.count || 3;
    this.log(`Generating ${count} initial articles...`);

    // Generate quick topics for initial articles
    const defaultTopics: BlogTopic[] = [
      {
        title: `${input.businessContext.name} : Notre Histoire et Notre Mission`,
        description: `Article présentant l'histoire, les valeurs et la mission de ${input.businessContext.name}`,
        keywords: [input.businessContext.name, input.businessContext.industry, "histoire", "mission", "valeurs"],
        priority: "high",
        tone: "professionnel et inspirant",
        estimatedWordCount: 1500
      },
      {
        title: `Guide Complet : Tout Savoir sur ${input.businessContext.industry}`,
        description: `Guide exhaustif pour comprendre les enjeux et opportunités dans ${input.businessContext.industry}`,
        keywords: [input.businessContext.industry, "guide", "conseils", "expertise"],
        priority: "high",
        tone: "éducatif et accessible",
        estimatedWordCount: 1800
      },
      {
        title: `Les Tendances ${input.businessContext.industry} à Suivre en 2025`,
        description: `Analyse des tendances émergentes et innovations dans ${input.businessContext.industry}`,
        keywords: [input.businessContext.industry, "tendances", "innovation", "2025", "futur"],
        priority: "medium",
        tone: "analytique et prospectif",
        estimatedWordCount: 1500
      }
    ];

    return this.generateBatch({
      topics: defaultTopics.slice(0, count),
      businessContext: input.businessContext,
      designSystem: input.designSystem,
      maxConcurrent: 3
    });
  }
}

// Types
export interface GeneratedBlogArticle {
  title: string;
  slug: string;
  content: string; // HTML
  excerpt: string;
  keywords: string[];
  tone: string;
  seoTitle: string;
  seoDescription: string;
  wordCount: number;
  readTime: number; // minutes
  tags: string[];
  publishDate: string;
  status: "draft" | "scheduled" | "published";
  scheduledDate?: string;
}
