import { NextRequest, NextResponse } from "next/server";
import { SiteArchitectAIAgent } from "@/lib/agents/site-architect-ai";
import { KikoDesignAIAgent } from "@/lib/agents/kiko-design-ai";
import { MiloCopywritingAIAgent } from "@/lib/agents/milo-copywriting-ai";
import { LexSiteBuilderEnhanced } from "@/lib/agents/lex-site-builder-enhanced";
import { BlogWriterMistral } from "@/lib/agents/blog-writer-mistral";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";
import BlogPost from "@/models/BlogPost";
import { nanoid } from "nanoid";

// export const runtime = 'edge'; // Disabled - using Node.js runtime
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const industry = searchParams.get('industry');
  const description = searchParams.get('description');
  const userId = searchParams.get('userId') || 'anonymous';
  const businessId = searchParams.get('businessId');
  const includeBlog = searchParams.get('includeBlog') === 'true';
  const saveToDb = searchParams.get('saveToDb') !== 'false'; // true par défaut

  if (!name || !industry) {
    return NextResponse.json(
      { error: "Nom du business et industrie requis" },
      { status: 400 }
    );
  }

  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Helper function to send SSE event
  const sendEvent = async (type: string, payload: any) => {
    const eventData = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
    await writer.write(encoder.encode(eventData));
  };

  // Start generation in background
  (async () => {
    try {
      await sendEvent('phase_start', {
        phase: 'initialization',
        description: 'Initialisation du système multi-agents'
      });

      // Initialize all agents
      const architect = new SiteArchitectAIAgent();
      const kikoDesign = new KikoDesignAIAgent();
      const miloCopywriter = new MiloCopywritingAIAgent();
      const lexBuilder = new LexSiteBuilderEnhanced();

      let siteStructure: any = null;
      let designSystem: any = null;
      let content: any = null;

      // Phase 1: Site Architecture
      await sendEvent('phase_start', {
        phase: 'architecture',
        agent: 'Site Architect',
        description: 'Analyse du business et création de la structure'
      });

      const insights = await architect.analyzeBusiness({
        businessName: name,
        industry: industry,
        description: description || `${name} dans le secteur ${industry}`,
        targetAudience: "Grand public et professionnels"
      });

      siteStructure = await architect.generateStructure({
        businessName: name,
        industry: industry,
        insights: insights
      });

      await sendEvent('phase_complete', {
        phase: 'architecture',
        result: { sections: siteStructure.sections.length }
      });

      // Phase 2: Design System
      await sendEvent('phase_start', {
        phase: 'design',
        agent: 'Kiko Design',
        description: 'Création du système de design'
      });

      designSystem = await kikoDesign.createDesignSystem({
        businessName: name,
        industry: industry,
        brandPersonality: Array.isArray(insights.brandPersonality)
          ? insights.brandPersonality
          : ['Professional', 'Modern']
      });

      await sendEvent('phase_complete', {
        phase: 'design',
        result: { colors: designSystem.colorPalette }
      });

      // Phase 3: Content Generation
      await sendEvent('phase_start', {
        phase: 'content',
        agent: 'Milo Copywriting',
        description: 'Génération du contenu personnalisé'
      });

      content = await miloCopywriter.generateContent(
        siteStructure,
        {
          businessName: name,
          industry: industry,
          description: description || `${name} dans le secteur ${industry}`,
          brandVoice: insights.brandVoice || 'Professional and engaging',
          valueProposition: insights.valueProposition || ''
        }
      );

      await sendEvent('phase_complete', {
        phase: 'content'
      });

      // Phase 4: Blog Generation (if blog section exists)
      const hasBlogSection = siteStructure.sections.some((s: any) => s.type === "blog");
      if (hasBlogSection) {
        await sendEvent('phase_start', {
          phase: 'blog',
          agent: 'Blog Writer',
          description: 'Génération des articles de blog initiaux'
        });

        const blogWriter = new BlogWriterMistral();
        const blogSection = siteStructure.sections.find((s: any) => s.type === "blog");

        const articles = await blogWriter.generateInitialArticles({
          businessContext: { name, industry, description: description || '' },
          designSystem,
          count: 3
        });

        if (!content[blogSection.id]) {
          content[blogSection.id] = {};
        }
        content[blogSection.id].articles = articles;

        await sendEvent('phase_complete', {
          phase: 'blog',
          result: { articles: articles.length }
        });
      }

      // Phase 5: HTML Generation
      await sendEvent('phase_start', {
        phase: 'build',
        agent: 'Lex Builder',
        description: 'Génération du HTML final avec DeepSeek V3'
      });

      const generatedSite = await lexBuilder.buildSite(
        siteStructure,
        designSystem,
        content
      );

      // Extract HTML from the generated site object
      let finalHtml = generatedSite.html || generatedSite.fullHtml || '';

      await sendEvent('html_chunk', { html: finalHtml });

      await sendEvent('phase_complete', {
        phase: 'build'
      });

      // Save to MongoDB if requested
      let projectId: string | undefined;
      let publicUrl: string | undefined;

      if (saveToDb && finalHtml) {
        try {
          await dbConnect();

          // Generate unique project ID
          projectId = `proj_${nanoid(12)}`;

          // Create subdomain from business name
          const subdomain = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

          // Save project to MongoDB
          const project = await UserProject.create({
            projectId,
            subdomain,
            userId,
            businessId,
            businessName: name,
            name,
            description: description || '',
            html: finalHtml,
            css: '', // Will be extracted later if needed
            js: '',
            prompt: `Generate website for ${name} in ${industry}`,
            status: 'published', // Publié par défaut
            hasBlog: hasBlogSection,
            blogConfig: {
              enabled: hasBlogSection,
              layout: 'grid',
              postsPerPage: 9
            },
            metadata: {
              generatedBy: 'ezia-multi-agent',
              industry,
              targetAudience: siteStructure.targetAudience?.join(', ') || '',
              features: siteStructure.features || [],
              tags: [industry, 'ai-generated']
            },
            deployUrl: `/${projectId}`
          });

          publicUrl = `/${projectId}`;

          // Fix blog links in HTML to use correct projectId
          if (hasBlogSection && finalHtml.includes('/blog/')) {
            finalHtml = finalHtml.replace(/href="\/blog\//g, `href="/${projectId}/blog/`);
            finalHtml = finalHtml.replace(/href="#"/g, `href="/${projectId}/blog"`);
            console.log(`[Multi-Agent] Fixed blog links to use projectId: ${projectId}`);
          }

          // Update project with corrected HTML
          await UserProject.findOneAndUpdate(
            { projectId },
            { html: finalHtml }
          );

          console.log(`[Multi-Agent] Saved project ${projectId} to MongoDB`);

          // Save blog articles to MongoDB if they exist
          if (hasBlogSection && content[siteStructure.sections.find((s: any) => s.type === "blog")?.id]?.articles) {
            const blogSectionId = siteStructure.sections.find((s: any) => s.type === "blog")?.id;
            const generatedArticles = content[blogSectionId]?.articles || [];

            console.log(`[Multi-Agent] Saving ${generatedArticles.length} blog articles to MongoDB`);

            for (const article of generatedArticles) {
              try {
                await BlogPost.create({
                  businessId: businessId || 'anonymous',
                  projectId,
                  userId,
                  title: article.title,
                  slug: article.slug,
                  content: article.content,
                  excerpt: article.excerpt,
                  status: 'published',
                  publishedAt: new Date(),
                  author: 'Ezia AI',
                  tags: article.tags || [],
                  keywords: article.keywords || [],
                  tone: article.tone || 'professional',
                  seoTitle: article.seoTitle,
                  seoDescription: article.seoDescription,
                  wordCount: article.wordCount,
                  readTime: article.readTime,
                  aiGenerated: true
                });
                console.log(`[Multi-Agent] Saved article: ${article.title}`);
              } catch (articleError) {
                console.error(`[Multi-Agent] Failed to save article ${article.title}:`, articleError);
              }
            }
          }

          await sendEvent('saved', {
            projectId,
            publicUrl,
            subdomain
          });

        } catch (saveError) {
          console.error('[Multi-Agent] Failed to save to MongoDB:', saveError);
          // Continue même si la sauvegarde échoue
        }
      }

      // Complete
      await sendEvent('complete', {
        success: true,
        projectId,
        publicUrl,
        metadata: {
          sections: siteStructure.sections.length,
          hasBlog: hasBlogSection,
          generator: 'Multi-Agent System (Mistral + DeepSeek V3)'
        }
      });

    } catch (error) {
      console.error('Multi-agent generation error:', error);
      await sendEvent('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    } finally {
      await writer.close();
    }
  })();

  // Return SSE stream
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
