import { BaseAgent } from "./base-agent";
import { SiteArchitectAgent } from "./site-architect";
import { KikoDesignAgent } from "./kiko-design";
import { LexSiteBuilderAgent } from "./lex-site-builder";
import { MiloCopywritingAgent } from "./milo-copywriting";
import { GeneratedSite } from "@/types/agents";

interface OrchestratorAgents {
  siteArchitect: SiteArchitectAgent;
  kikoDesign: KikoDesignAgent;
  lexSiteBuilder: LexSiteBuilderAgent;
  miloCopywriting: MiloCopywritingAgent;
}

export class SiteGenerationOrchestrator extends BaseAgent {
  private agents: OrchestratorAgents;

  constructor(agents: OrchestratorAgents) {
    super("Orchestrator", "Multi-Agent Coordination");
    this.agents = agents;
  }

  async generateSite(input: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience: string;
    features: string[];
  }): Promise<GeneratedSite> {
    this.log("Starting site generation process...");

    try {
      // Step 1: Site Architect analyzes the business
      this.log("Site Architect analyzing business requirements...");
      const insights = await this.agents.siteArchitect.analyzeBusiness(input);
      await this.simulateThinking(500);

      // Step 2: Site Architect creates structure
      this.log("Site Architect designing site structure...");
      const structure = await this.agents.siteArchitect.generateStructure({
        businessName: input.businessName,
        industry: input.industry,
        insights,
      });
      await this.simulateThinking(500);

      // Step 3: Kiko creates design system
      this.log("Kiko creating design system...");
      const designSystem = await this.agents.kikoDesign.createDesignSystem({
        businessName: input.businessName,
        industry: input.industry,
        brandPersonality: insights.competitiveAdvantages,
      });
      await this.simulateThinking(500);

      // Step 4: Milo generates content
      this.log("Milo generating content...");
      const content = await this.agents.miloCopywriting.generateContent(
        structure,
        input
      );
      await this.simulateThinking(500);

      // Step 5: Kiko generates CSS
      this.log("Kiko generating CSS styles...");
      const css = await this.agents.kikoDesign.generateCSS(designSystem);
      await this.simulateThinking(500);

      // Step 6: Lex builds the HTML
      this.log("Lex building HTML structure...");
      const generatedHTML = await this.agents.lexSiteBuilder.buildSite(
        structure,
        designSystem,
        content
      );

      this.log("Site generation complete!");

      // Combine HTML and CSS
      const finalHTML = generatedHTML.html.replace(
        "</head>",
        `<style>${css}</style>\n</head>`
      );

      return {
        html: finalHTML,
        css,
        structure,
        designSystem,
        content,
        metadata: {
          generatedAt: new Date().toISOString(),
          agents: {
            architect: this.agents.siteArchitect.getName(),
            designer: this.agents.kikoDesign.getName(),
            builder: this.agents.lexSiteBuilder.getName(),
            copywriter: this.agents.miloCopywriting.getName(),
          },
          insights,
        },
      };
    } catch (error) {
      this.log(`Error during site generation: ${error}`);
      throw error;
    }
  }

  async validateGeneration(site: GeneratedSite): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 100;

    // Check HTML validity
    if (!site.html || site.html.length < 100) {
      issues.push("HTML content is too short or missing");
      score -= 20;
    }

    // Check CSS validity
    if (!site.css || site.css.length < 50) {
      issues.push("CSS styles are too short or missing");
      score -= 15;
    }

    // Check structure completeness
    if (!site.structure || site.structure.sections.length < 3) {
      issues.push("Site structure is incomplete (less than 3 sections)");
      score -= 25;
    }

    // Check content generation
    if (!site.content || Object.keys(site.content).length === 0) {
      issues.push("Content generation failed");
      score -= 30;
    }

    // Check design system
    if (!site.designSystem || !site.designSystem.colorPalette) {
      issues.push("Design system is incomplete");
      score -= 10;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score),
    };
  }
}