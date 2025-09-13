import { GeneratedSite, IndustryInsights } from "@/types/agents";

interface OrchestratorAgents {
  siteArchitect: {
    analyzeBusiness(input: any): Promise<IndustryInsights>;
    generateStructure(input: any): Promise<any>;
  };
  kikoDesign: {
    createDesignSystem(input: any): Promise<any>;
  };
  lexSiteBuilder: {
    buildSite(structure: any, designSystem: any, content: any): Promise<any>;
  };
  miloCopywriting: {
    generateContent(structure: any, businessInfo: any): Promise<any>;
  };
}

export class SiteGenerationOrchestrator {
  private agents: OrchestratorAgents;
  private name: string = "Orchestrator";

  constructor(agents: OrchestratorAgents) {
    this.agents = agents;
  }

  private log(message: string): void {
    console.log(`[${this.name}]: ${message}`);
  }

  async generateSite(input: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience: string;
    features: string[];
  }): Promise<GeneratedSite> {
    this.log("Starting AI-powered site generation process...");

    try {
      // Step 1: Site Architect analyzes the business
      this.log("Site Architect analyzing business requirements with AI...");
      const insights = await this.agents.siteArchitect.analyzeBusiness(input);

      // Step 2: Site Architect creates structure
      this.log("Site Architect designing site structure with AI...");
      const structure = await this.agents.siteArchitect.generateStructure({
        businessName: input.businessName,
        industry: input.industry,
        insights,
      });

      // Step 3: Kiko creates design system
      this.log("Kiko creating design system with AI...");
      const designSystem = await this.agents.kikoDesign.createDesignSystem({
        businessName: input.businessName,
        industry: input.industry,
        brandPersonality: this.inferBrandPersonality(input),
      });

      // Step 4: Milo generates content
      this.log("Milo generating content with AI...");
      const content = await this.agents.miloCopywriting.generateContent(
        structure,
        {
          businessName: input.businessName,
          industry: input.industry,
          description: input.description,
          targetAudience: input.targetAudience,
        }
      );

      // Step 5: Lex builds the final site
      this.log("Lex building the final site with AI...");
      const generatedHTML = await this.agents.lexSiteBuilder.buildSite(
        structure,
        designSystem,
        content
      );

      this.log("Site generation completed successfully!");

      return {
        html: generatedHTML.html,
        structure,
        designSystem,
        content,
        metadata: generatedHTML.metadata,
        insights,
      };
    } catch (error) {
      this.log(`Error during site generation: ${error}`);
      throw error;
    }
  }

  private inferBrandPersonality(input: any): string[] {
    const industryPersonalities: Record<string, string[]> = {
      restaurant: ["welcoming", "warm", "sophisticated", "culinary"],
      "e-commerce": ["trustworthy", "modern", "convenient", "reliable"],
      ecommerce: ["trustworthy", "modern", "convenient", "reliable"],
      consulting: ["professional", "expert", "strategic", "results-driven"],
      health: ["caring", "professional", "trustworthy", "compassionate"],
      tech: ["innovative", "cutting-edge", "efficient", "forward-thinking"],
      education: ["inspiring", "knowledgeable", "supportive", "growth-focused"],
      realestate: ["trustworthy", "local expert", "helpful", "professional"],
      fitness: ["motivating", "energetic", "transformative", "supportive"],
      beauty: ["luxurious", "caring", "transformative", "elegant"],
      travel: ["adventurous", "inspiring", "reliable", "exciting"],
    };

    return industryPersonalities[input.industry.toLowerCase()] || [
      "professional",
      "reliable",
      "innovative",
      "customer-focused",
    ];
  }
}