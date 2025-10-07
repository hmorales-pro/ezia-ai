import { SiteArchitectAIAgent } from "./site-architect-ai";
import { KikoDesignAIAgent } from "./kiko-design-ai";
import { MiloCopywritingAIAgent } from "./milo-copywriting-ai";
import { BlogWriterMistral } from "./blog-writer-mistral";
import { MultiPageBuilder, PageDefinition, CompleteWebsite, GeneratedPage } from "./multi-page-builder";
import { ZipExporter } from "../zip-exporter";

/**
 * Complete Site Orchestrator
 * Coordinates all agents to generate a complete multi-page website
 *
 * Flow:
 * 1. Site Architect → Define all pages needed
 * 2. Kiko → Create unified design system
 * 3. Milo → Generate content for all pages
 * 4. Blog Writer → Generate 3-5 initial articles
 * 5. MultiPage Builder → Generate all HTML pages
 * 6. ZIP Exporter → Package everything for download
 */
export class CompleteSiteOrchestrator {
  private architect: SiteArchitectAIAgent;
  private kikoDesign: KikoDesignAIAgent;
  private miloCopywriter: MiloCopywritingAIAgent;
  private blogWriter: BlogWriterMistral;
  private pageBuilder: MultiPageBuilder;

  constructor() {
    this.architect = new SiteArchitectAIAgent();
    this.kikoDesign = new KikoDesignAIAgent();
    this.miloCopywriter = new MiloCopywritingAIAgent();
    this.blogWriter = new BlogWriterMistral();
    this.pageBuilder = new MultiPageBuilder();
  }

  /**
   * Generate complete website with all pages
   */
  async generateCompleteWebsite(input: {
    name: string;
    industry: string;
    description?: string;
    baseUrl?: string;
    onProgress?: (event: ProgressEvent) => void;
  }): Promise<CompleteWebsite> {
    const baseUrl = input.baseUrl || `https://${input.name.toLowerCase()}.com`;

    try {
      // Phase 1: Architecture
      this.sendProgress(input.onProgress, {
        phase: "architecture",
        status: "in_progress",
        message: "Analyse du business et définition de la structure..."
      });

      const structure = await this.architect.analyzeBusiness({
        businessName: input.name,
        industry: input.industry,
        businessDescription: input.description || ""
      });

      // Define all pages to generate
      const pagesToGenerate: PageDefinition[] = [
        { type: "homepage", title: "Accueil", path: "/", showInNav: true, priority: 1.0 },
        { type: "services", title: "Services", path: "/services.html", showInNav: true, priority: 0.9 },
        { type: "about", title: "À propos", path: "/a-propos.html", showInNav: true, priority: 0.8 },
        { type: "blog-listing", title: "Blog", path: "/blog/", showInNav: true, priority: 0.8 },
        { type: "contact", title: "Contact", path: "/contact.html", showInNav: true, priority: 0.7 },
        { type: "legal", title: "Mentions légales", path: "/mentions-legales.html", showInNav: false, priority: 0.3 },
        { type: "cgv", title: "CGV", path: "/cgv.html", showInNav: false, priority: 0.3 },
        { type: "404", title: "Page introuvable", path: "/404.html", showInNav: false, priority: 0.1 }
      ];

      this.sendProgress(input.onProgress, {
        phase: "architecture",
        status: "completed",
        message: `Structure définie: ${pagesToGenerate.length} pages`
      });

      // Phase 2: Design System
      this.sendProgress(input.onProgress, {
        phase: "design",
        status: "in_progress",
        message: "Création du système de design..."
      });

      const designSystem = await this.kikoDesign.createDesignSystem({
        businessName: input.name,
        industry: input.industry,
        businessDescription: input.description || "",
        targetAudience: structure.targetAudience || [],
        brandPersonality: []
      });

      this.sendProgress(input.onProgress, {
        phase: "design",
        status: "completed",
        message: "Système de design créé"
      });

      // Phase 3: Content Generation
      this.sendProgress(input.onProgress, {
        phase: "content",
        status: "in_progress",
        message: "Génération du contenu pour toutes les pages..."
      });

      const content: Record<string, any> = {};

      // Ensure sections is an array (fallback to default sections if not)
      const sections = Array.isArray(structure.sections)
        ? structure.sections
        : [
            { type: "hero", title: "Hero" },
            { type: "services", title: "Services" },
            { type: "about", title: "À propos" },
            { type: "testimonials", title: "Témoignages" },
            { type: "contact", title: "Contact" }
          ];

      // Generate content for each section in structure
      for (const section of sections) {
        const sectionContent = await this.miloCopywriter.generateContent({
          businessName: input.name,
          industry: input.industry,
          targetAudience: structure.targetAudience || [],
          brandVoice: designSystem.brandVoice || "professionnel",
          section: {
            type: section.type,
            title: section.title || section.type,
            requirements: []
          }
        });

        content[section.type] = sectionContent.content;
      }

      this.sendProgress(input.onProgress, {
        phase: "content",
        status: "completed",
        message: `Contenu généré pour ${sections.length} sections`
      });

      // Phase 4: Blog Articles
      this.sendProgress(input.onProgress, {
        phase: "blog",
        status: "in_progress",
        message: "Génération des articles de blog..."
      });

      const blogArticles = await this.blogWriter.generateInitialArticles({
        businessContext: {
          name: input.name,
          industry: input.industry,
          description: input.description || ""
        },
        designSystem,
        count: 3
      });

      this.sendProgress(input.onProgress, {
        phase: "blog",
        status: "completed",
        message: `${blogArticles.length} articles générés`
      });

      // Phase 5: Page Generation
      this.sendProgress(input.onProgress, {
        phase: "build",
        status: "in_progress",
        message: "Génération de toutes les pages HTML..."
      });

      const generatedPages: GeneratedPage[] = [];

      // Generate each page
      for (const pageDefinition of pagesToGenerate) {
        this.sendProgress(input.onProgress, {
          phase: "build",
          status: "in_progress",
          message: `Génération: ${pageDefinition.title}...`,
          current: generatedPages.length + 1,
          total: pagesToGenerate.length
        });

        const page = await this.pageBuilder.generatePage({
          pageType: pageDefinition.type,
          businessContext: {
            name: input.name,
            industry: input.industry,
            description: input.description
          },
          designSystem,
          content: content[pageDefinition.type] || {},
          allPages: pagesToGenerate,
          blogArticles: pageDefinition.type === "blog-listing" ? blogArticles : undefined
        });

        generatedPages.push(page);
      }

      // Generate individual blog article pages
      for (let i = 0; i < blogArticles.length; i++) {
        const article = blogArticles[i];
        const slug = this.slugify(article.title);

        this.sendProgress(input.onProgress, {
          phase: "build",
          status: "in_progress",
          message: `Génération article: ${article.title}...`,
          current: pagesToGenerate.length + i + 1,
          total: pagesToGenerate.length + blogArticles.length
        });

        const articlePage = await this.pageBuilder.generatePage({
          pageType: "blog-article",
          businessContext: {
            name: input.name,
            industry: input.industry,
            description: input.description
          },
          designSystem,
          content: article,
          allPages: pagesToGenerate
        });

        articlePage.filename = `blog/${slug}.html`;
        articlePage.path = `/blog/${slug}.html`;
        generatedPages.push(articlePage);
      }

      this.sendProgress(input.onProgress, {
        phase: "build",
        status: "completed",
        message: `${generatedPages.length} pages générées`
      });

      // Phase 6: Assets Generation
      this.sendProgress(input.onProgress, {
        phase: "assets",
        status: "in_progress",
        message: "Génération CSS et JavaScript..."
      });

      const css = await this.pageBuilder.generateCSS(designSystem);
      const js = await this.pageBuilder.generateJS();

      this.sendProgress(input.onProgress, {
        phase: "assets",
        status: "completed",
        message: "Assets générés"
      });

      // Phase 7: Export Package
      this.sendProgress(input.onProgress, {
        phase: "export",
        status: "in_progress",
        message: "Préparation du package final..."
      });

      const website: CompleteWebsite = {
        pages: generatedPages,
        css,
        js,
        sitemap: "",
        robots: "",
        metadata: {
          businessName: input.name,
          generatedAt: new Date().toISOString(),
          totalPages: generatedPages.length
        }
      };

      // Generate sitemap and robots.txt
      website.sitemap = ZipExporter.generateSitemap(website, baseUrl);
      website.robots = ZipExporter.generateRobotsTxt(baseUrl);

      this.sendProgress(input.onProgress, {
        phase: "export",
        status: "completed",
        message: "Package prêt pour export"
      });

      this.sendProgress(input.onProgress, {
        phase: "complete",
        status: "completed",
        message: `Site complet généré: ${website.pages.length} pages`,
        website
      });

      return website;

    } catch (error) {
      this.sendProgress(input.onProgress, {
        phase: "error",
        status: "failed",
        message: `Erreur: ${error}`,
        error: String(error)
      });

      throw error;
    }
  }

  /**
   * Get file structure ready for ZIP export
   */
  getFileStructure(website: CompleteWebsite, baseUrl: string): Record<string, string> {
    return ZipExporter.createFileStructure(website, baseUrl);
  }

  private sendProgress(
    callback: ((event: ProgressEvent) => void) | undefined,
    event: ProgressEvent
  ): void {
    if (callback) {
      callback(event);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

// Types
export interface ProgressEvent {
  phase: string;
  status: "in_progress" | "completed" | "failed";
  message: string;
  current?: number;
  total?: number;
  website?: CompleteWebsite;
  error?: string;
}
