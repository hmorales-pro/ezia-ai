import { NextRequest, NextResponse } from "next/server";
import { SiteArchitectAIAgent } from "@/lib/agents/site-architect-ai";
import { KikoDesignAIAgent } from "@/lib/agents/kiko-design-ai";
import { MiloCopywritingAIAgent } from "@/lib/agents/milo-copywriting-ai";
import { LexSiteBuilderEnhanced } from "@/lib/agents/lex-site-builder-enhanced";
import { AIResponseValidator } from "@/lib/agents/validators/ai-response-validator";

export const maxDuration = 60; // 60 seconds timeout

interface GenerationContext {
  businessName: string;
  industry: string;
  description: string;
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const context: GenerationContext = await request.json();

    if (!context.businessName || !context.industry) {
      return NextResponse.json(
        { error: "Nom du business et industrie requis" },
        { status: 400 }
      );
    }

    console.log("🚀 Starting Multi-Agent Website Generation");
    console.log("📋 Context:", context);

    // Initialize all agents
    const architect = new SiteArchitectAIAgent();
    const kikoDesign = new KikoDesignAIAgent();
    const miloCopywriter = new MiloCopywritingAIAgent();
    const lexBuilder = new LexSiteBuilderEnhanced(); // Enhanced with proper HTML rendering

    let siteStructure: any = null;
    let designSystem: any = null;
    let content: any = null;
    let generatedSite: any = null;
    
    try {
      // Phase 1: Site Architecture with validation and retry
      console.log("\n🏗️ PHASE 1: Site Architecture - Analysis");
      
      let insights = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          insights = await architect.analyzeBusiness({
            businessName: context.businessName,
            industry: context.industry,
            description: context.description || `${context.businessName} dans le secteur ${context.industry}`,
            targetAudience: "Grand public et professionnels"
          });
          
          if (insights && Object.keys(insights).length > 0) {
            console.log("✅ Business insights generated");
            break;
          }
          throw new Error("Empty insights generated");
        } catch (error) {
          console.error(`❌ Insights generation attempt ${attempt} failed:`, error);
          if (attempt === 3) {
            throw new Error("Failed to generate business insights after 3 attempts");
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log("\n🏗️ PHASE 1.2: Site Architecture - Structure");
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          siteStructure = await architect.generateStructure({
            businessName: context.businessName,
            industry: context.industry,
            insights: insights
          });
          
          // Validate structure
          const structureValidation = AIResponseValidator.validateSiteStructure(siteStructure);
          if (!structureValidation.isValid) {
            throw new Error(`Structure validation failed: ${structureValidation.errors.join(', ')}`);
          }
          
          console.log("✅ Site structure created and validated:", {
            sections: siteStructure.sections.length,
            navigation: siteStructure.navigation.length
          });
          break;
        } catch (error) {
          console.error(`❌ Structure generation attempt ${attempt} failed:`, error);
          if (attempt === 3) {
            throw new Error("Failed to generate valid site structure after 3 attempts");
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Phase 2: Design System with validation
      console.log("\n🎨 PHASE 2: Design System");
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          designSystem = await kikoDesign.createDesignSystem({
            businessName: context.businessName,
            industry: context.industry,
            brandPersonality: ["Professionnel", "Moderne", "Accessible"]
          });
          
          // Validate design system
          const designValidation = AIResponseValidator.validateDesignSystem(designSystem);
          if (!designValidation.isValid) {
            console.warn(`⚠️ Design validation issues: ${designValidation.errors.join(', ')}`);
            // Continue anyway, Lex can handle incomplete design systems
          }
          
          console.log("✅ Design system created:", {
            primaryColor: designSystem.colors?.primary || "N/A",
            style: designSystem.layout?.style || "N/A",
            hasColors: !!designSystem.colors,
            hasLayout: !!designSystem.layout
          });
          break;
        } catch (error) {
          console.error(`❌ Design system attempt ${attempt} failed:`, error);
          if (attempt === 3) {
            throw new Error("Failed to generate design system after 3 attempts");
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Phase 3: Content Generation with enhanced error handling
      console.log("\n✍️ PHASE 3: Content Generation");
      try {
        content = await miloCopywriter.generateContent(
          siteStructure,
          {
            businessName: context.businessName,
            industry: context.industry,
            description: context.description || '',
            targetAudience: "Grand public et professionnels"
          }
        );
        
        // Validate we have content for critical sections
        const criticalSections = siteStructure.sections
          .filter((s: any) => ['hero', 'services', 'contact'].includes(s.type));
        
        for (const section of criticalSections) {
          if (!content[section.id]) {
            console.warn(`⚠️ Missing content for critical section: ${section.id}`);
          }
        }
        
        console.log("✅ Content generated for sections:", Object.keys(content).length);
      } catch (contentError) {
        console.error("❌ Content generation failed:", contentError);
        
        // Attempt simplified content generation
        console.log("🔄 Attempting simplified content generation...");
        content = {};
        
        for (const section of siteStructure.sections) {
          try {
            content[section.id] = await miloCopywriter.generateSectionContent(
              section,
              {
                businessName: context.businessName,
                industry: context.industry,
                description: context.description || '',
                targetAudience: "Grand public et professionnels"
              },
              1
            );
          } catch (sectionError) {
            console.error(`Failed to generate content for ${section.id}:`, sectionError);
            // Continue with other sections
          }
        }
        
        if (Object.keys(content).length === 0) {
          throw new Error("Failed to generate any content for the website");
        }
      }

      // Phase 4: Blog Content Generation (Optional but recommended)
      console.log("\n📝 PHASE 4: Blog Content Generation");
      let blogArticles: any[] = [];

      try {
        // Check if site has blog section
        const hasBlogSection = siteStructure.sections.some((s: any) => s.type === "blog");

        if (hasBlogSection) {
          console.log("Blog section detected, generating initial articles...");

          const { BlogWriterDeepSeek } = await import("@/lib/agents/blog-writer-deepseek");
          const blogWriter = new BlogWriterDeepSeek();

          const articles = await blogWriter.generateInitialArticles({
            businessContext: {
              name: context.businessName,
              industry: context.industry,
              description: context.description || ""
            },
            count: 3 // Generate 3 initial articles
          });

          blogArticles = articles.map(article => ({
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            tags: article.tags,
            readTime: article.readTime,
            publishedAt: new Date().toISOString(),
            date: new Date().toLocaleDateString("fr-FR")
          }));

          // Add articles to blog section content
          const blogSection = siteStructure.sections.find((s: any) => s.type === "blog");
          if (blogSection && content[blogSection.id]) {
            content[blogSection.id].articles = blogArticles;
          }

          console.log(`✅ Generated ${blogArticles.length} initial blog articles`);
        } else {
          console.log("No blog section in structure, skipping blog generation");
        }
      } catch (blogError) {
        console.error("⚠️ Blog generation failed (non-critical):", blogError);
        // Continue without blog - it's not critical
      }

      // Phase 5: Website Building with comprehensive error handling
      console.log("\n🔨 PHASE 5: Website Building");
      try {
        generatedSite = await lexBuilder.buildSite(
          siteStructure,
          designSystem,
          content
        );

        // Final validation
        const htmlValidation = AIResponseValidator.validateHTML(generatedSite.html);
        if (!htmlValidation.isValid) {
          console.warn("⚠️ HTML validation warnings:", htmlValidation.errors);
          // Continue anyway as minor issues can be fixed client-side
        }

        console.log("✅ Website built successfully");
      } catch (buildError) {
        console.error("❌ Website building failed:", buildError);
        throw new Error(
          `Failed to build website: ${buildError instanceof Error ? buildError.message : 'Unknown error'}. ` +
          `This may be due to AI service availability or complexity of the request.`
        );
      }

      // Return the complete generated website
      return NextResponse.json({
        success: true,
        html: generatedSite.html,
        metadata: {
          ...generatedSite.metadata,
          generationProcess: {
            architect: "Mistral AI",
            designer: "Mistral AI",
            copywriter: "Mistral AI",
            blogWriter: blogArticles.length > 0 ? "DeepSeek V3" : "Not generated",
            builder: "DeepSeek V3",
            timestamp: new Date().toISOString()
          },
          structure: {
            sections: generatedSite.sections.length,
            hasNavigation: true,
            hasFooter: true,
            hasBlog: blogArticles.length > 0
          },
          blog: blogArticles.length > 0 ? {
            articlesGenerated: blogArticles.length,
            articles: blogArticles
          } : undefined
        }
      });

    } catch (agentError: any) {
      console.error("❌ Agent error:", agentError);
      
      // Determine which phase failed
      let failedPhase = "Unknown";
      let recovery = "";
      
      if (!siteStructure) {
        failedPhase = "Site Architecture";
        recovery = "The AI failed to create a proper site structure. This might be due to service unavailability or invalid input.";
      } else if (!designSystem) {
        failedPhase = "Design System";
        recovery = "The AI failed to create a design system. The site structure was created successfully.";
      } else if (!content || Object.keys(content).length === 0) {
        failedPhase = "Content Generation";
        recovery = "The AI failed to generate content for the website sections. Structure and design were created successfully.";
      } else if (!generatedSite) {
        failedPhase = "Website Building";
        recovery = "The AI failed to build the final HTML. All preparation steps completed successfully.";
      }
      
      // Detailed error response for debugging
      return NextResponse.json(
        {
          error: "Erreur lors de la génération multi-agent",
          details: {
            message: agentError.message,
            phase: failedPhase,
            recovery: recovery,
            suggestion: "Vérifiez les clés API (MISTRAL_API_KEY et HF_TOKEN) et réessayez",
            partialResults: {
              hasStructure: !!siteStructure,
              hasDesign: !!designSystem,
              hasContent: !!(content && Object.keys(content).length > 0),
              contentSections: content ? Object.keys(content).length : 0
            }
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("❌ General error:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors de la génération",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}