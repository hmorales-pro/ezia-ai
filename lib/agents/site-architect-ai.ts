import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, SiteSection, IndustryInsights } from "@/types/agents";

export class SiteArchitectAIAgent extends AIBaseAgent {
  constructor() {
    super({
      name: "Site Architect",
      role: "AI Architecture and Structure Specialist",
      capabilities: [
        "Analyze business requirements",
        "Design optimal site structure",
        "Create user journey maps",
        "Generate SEO-optimized metadata",
        "Recommend industry-specific features"
      ],
      temperature: 0.4,
      maxTokens: 4000
    });
  }

  protected getDefaultSystemPrompt(): string {
    return `You are an expert Site Architect AI specializing in creating optimal website structures for businesses.

Your expertise includes:
- Information architecture and site structure design
- User experience (UX) best practices
- Industry-specific website requirements
- SEO optimization strategies
- Conversion rate optimization
- User journey mapping
- Content strategy

When analyzing businesses and creating site structures:
1. Consider the specific industry needs and standards
2. Focus on user goals and conversion paths
3. Create logical navigation hierarchies
4. Optimize for search engines and discoverability
5. Include all essential pages and sections
6. Prioritize content based on business goals
7. Ensure mobile-first considerations

Always provide actionable, specific recommendations tailored to the business.`;
  }

  async analyzeBusiness(input: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience: string;
  }): Promise<IndustryInsights> {
    const analysisPrompt = `Analyze this business and provide detailed insights for website structure planning:

Business Information:
- Name: ${input.businessName}
- Industry: ${input.industry}
- Description: ${input.description}
- Target Audience: ${input.targetAudience}

Provide a comprehensive analysis in JSON format with:
{
  "keyFeatures": ["list of 4-6 essential website features for this business"],
  "userJourney": ["4-5 step user journey from discovery to conversion"],
  "competitiveAdvantages": ["3-4 unique selling points to highlight"],
  "requiredSections": ["5-7 essential website sections in order of importance"],
  "businessGoals": ["3-4 primary business objectives the website should achieve"],
  "targetPersonas": [
    {
      "name": "Persona name",
      "demographics": "Age, occupation, etc",
      "goals": "What they want to achieve",
      "painPoints": "Problems they face"
    }
  ]
}

Consider industry best practices and modern web standards.`;

    try {
      const response = await this.generateWithAI({
        prompt: analysisPrompt,
        formatJson: true
      });

      const insights = this.parseAIJson<IndustryInsights>(response, {});

      // Validate and enhance insights
      return this.validateInsights(insights, input);
    } catch (error) {
      this.log(`AI analysis failed: ${error}`);
      throw error;
    }
  }

  async generateStructure(input: {
    businessName: string;
    industry: string;
    insights: IndustryInsights;
  }): Promise<SiteStructure> {
    const structurePrompt = `Create a detailed website structure for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Key Features: ${input.insights.keyFeatures.join(", ")}
- Required Sections: ${input.insights.requiredSections.join(", ")}
- Business Goals: ${input.insights.businessGoals?.join(", ") || "N/A"}

Generate a complete site structure in JSON format:
{
  "sections": [
    {
      "id": "section-id",
      "type": "section-type",
      "title": "Display Title",
      "priority": 1-10,
      "content": {
        "headline": "Main headline text",
        "subheadline": "Supporting text",
        "items": [] // if applicable
      }
    }
  ],
  "navigation": [
    {
      "label": "Menu Label",
      "href": "#section-id",
      "priority": 1-10
    }
  ],
  "metadata": {
    "title": "SEO optimized page title",
    "description": "SEO meta description (150-160 chars)",
    "keywords": ["relevant", "keywords", "for", "SEO"]
  }
}

Create sections that align with the user journey and business goals. Each section should have a clear purpose and call-to-action.`;

    try {
      const response = await this.generateWithAI({
        prompt: structurePrompt,
        context: input,
        formatJson: true
      });

      const structureData = this.parseAIJson<any>(response, {});
      
      // Build complete structure
      const structure: SiteStructure = {
        businessName: input.businessName,
        industry: input.industry,
        sections: structureData.sections || [],
        navigation: structureData.navigation || [],
        metadata: structureData.metadata || {}
      };

      return this.validateStructure(structure);
    } catch (error) {
      this.log(`AI structure generation failed: ${error}`);
      throw error;
    }
  }

  private validateInsights(insights: IndustryInsights, input: any): IndustryInsights {
    // Return as-is, let AI handle all insights
    return insights;
  }

  private validateStructure(structure: SiteStructure): SiteStructure {
    // Ensure sections have required fields
    structure.sections = structure.sections.map((section, index) => ({
      id: section.id || `section-${index}`,
      type: section.type || "generic",
      title: section.title || "Section",
      priority: section.priority || index + 1,
      content: section.content || {}
    }));

    // Ensure navigation exists
    if (!structure.navigation || structure.navigation.length === 0) {
      structure.navigation = this.generateDefaultNavigation(structure.sections);
    }

    // Return metadata as-is from AI
    structure.metadata = structure.metadata || {};

    return structure;
  }










  private formatTitle(type: string): string {
    return type
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}