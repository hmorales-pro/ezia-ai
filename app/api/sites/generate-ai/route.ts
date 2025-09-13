import { NextRequest, NextResponse } from "next/server";
import { SiteArchitectAIAgent } from "@/lib/agents/site-architect-ai";
import { KikoDesignAIAgent } from "@/lib/agents/kiko-design-ai";
import { LexSiteBuilderAIAgent } from "@/lib/agents/lex-site-builder-ai";
import { MiloCopywritingAIAgent } from "@/lib/agents/milo-copywriting-ai";

export const maxDuration = 60; // 60 seconds timeout for AI generation

export async function POST(request: NextRequest) {
  try {
    const { businessName, industry, description } = await request.json();

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "Nom du business et industrie requis" },
        { status: 400 }
      );
    }

    console.log("🚀 Starting AI-powered site generation for:", businessName);

    // Create business context
    const businessContext = {
      businessName,
      industry,
      description: description || `${businessName} est une entreprise dans le secteur ${industry}.`
    };

    // Step 1: Site Architect analyzes and creates structure
    console.log("🏗️ Site Architect analyzing business...");
    const architect = new SiteArchitectAIAgent();
    const { insights, structure } = await architect.analyzeAndStructure(businessContext);
    
    // Step 2: Kiko creates design system
    console.log("🎨 Kiko creating design system...");
    const kiko = new KikoDesignAIAgent();
    const designSystem = await kiko.createDesignSystem({
      ...businessContext,
      brandPersonality: insights.competitiveAdvantages || []
    });
    
    // Step 3: Milo generates content
    console.log("✍️ Milo generating content...");
    const milo = new MiloCopywritingAIAgent();
    const content = await milo.generateContent(structure, businessContext);
    
    // Step 4: Lex builds the site
    console.log("🔨 Lex building the website...");
    const lex = new LexSiteBuilderAIAgent();
    const { html } = await lex.buildSite(structure, designSystem, content);
    
    // Step 5: Generate CSS from design system
    console.log("🎨 Generating CSS from design system...");
    const css = generateCSSFromDesignSystem(designSystem);
    
    // Combine HTML with CSS
    const finalHTML = html.replace(
      "</head>",
      `<style>${css}</style>\n</head>`
    );

    console.log("✅ AI-powered site generation complete!");

    return NextResponse.json({
      success: true,
      html: finalHTML,
      metadata: {
        generatedAt: new Date().toISOString(),
        agents: {
          architect: "Site Architect AI",
          designer: "Kiko AI",
          copywriter: "Milo AI",
          builder: "Lex AI"
        },
        insights,
        structure,
        designSystem
      }
    });

  } catch (error) {
    console.error("❌ Error in AI site generation:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la génération AI du site",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function generateCSSFromDesignSystem(designSystem: any): string {
  const { colorPalette, typography, spacing } = designSystem;
  
  return `
    /* AI-Generated Design System */
    :root {
      /* Colors */
      --color-primary: ${colorPalette.primary};
      --color-secondary: ${colorPalette.secondary};
      --color-accent: ${colorPalette.accent};
      --color-success: ${colorPalette.success};
      --color-warning: ${colorPalette.warning};
      --color-error: ${colorPalette.error};
      --color-info: ${colorPalette.info};
      
      /* Neutral Colors */
      ${Object.entries(colorPalette.neutral).map(([key, value]) => 
        `--color-neutral-${key}: ${value};`
      ).join('\n      ')}
      
      /* Typography */
      --font-heading: ${typography.fontFamily.heading};
      --font-body: ${typography.fontFamily.body};
      --font-mono: ${typography.fontFamily.mono};
      
      /* Font Sizes */
      ${Object.entries(typography.fontSize).map(([key, value]) => 
        `--text-${key}: ${value};`
      ).join('\n      ')}
      
      /* Spacing */
      ${Object.entries(spacing).map(([key, value]) => 
        `--space-${key}: ${value};`
      ).join('\n      ')}
    }
    
    /* Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body);
      color: var(--color-neutral-900);
      background-color: var(--color-neutral-50);
      line-height: 1.6;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: var(--space-4);
    }
    
    h1 { font-size: var(--text-5xl); }
    h2 { font-size: var(--text-4xl); }
    h3 { font-size: var(--text-3xl); }
    h4 { font-size: var(--text-2xl); }
    h5 { font-size: var(--text-xl); }
    h6 { font-size: var(--text-lg); }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-4);
    }
    
    .btn {
      display: inline-block;
      padding: var(--space-3) var(--space-6);
      background-color: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .btn:hover {
      background-color: var(--color-secondary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .section {
      padding: var(--space-16) 0;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      h1 { font-size: var(--text-3xl); }
      h2 { font-size: var(--text-2xl); }
      h3 { font-size: var(--text-xl); }
      .section { padding: var(--space-8) 0; }
    }
  `;
}