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

      const insights = this.parseAIJson<IndustryInsights>(response, {
        keyFeatures: ["services", "portfolio", "about", "contact"],
        userJourney: ["discover", "explore", "evaluate", "contact"],
        competitiveAdvantages: ["quality", "experience", "innovation"],
        requiredSections: ["hero", "services", "about", "testimonials", "contact"],
        businessGoals: ["increase visibility", "generate leads", "build trust"],
        targetPersonas: []
      });

      // Validate and enhance insights
      return this.validateInsights(insights, input);
    } catch (error) {
      this.log(`AI analysis failed, using enhanced fallback: ${error}`);
      return this.generateEnhancedInsights(input);
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
        sections: structureData.sections || this.generateDefaultSections(input),
        navigation: structureData.navigation || this.generateDefaultNavigation(structureData.sections),
        metadata: structureData.metadata || this.generateDefaultMetadata(input)
      };

      return this.validateStructure(structure);
    } catch (error) {
      this.log(`AI structure generation failed, using enhanced fallback: ${error}`);
      return this.generateEnhancedStructure(input);
    }
  }

  private validateInsights(insights: IndustryInsights, input: any): IndustryInsights {
    // Ensure all required fields are present and valid
    return {
      keyFeatures: insights.keyFeatures?.length > 0 ? insights.keyFeatures : 
        ["quality service", "expertise", "customer focus", "innovation"],
      userJourney: insights.userJourney?.length > 0 ? insights.userJourney :
        ["discover", "explore", "evaluate", "contact", "convert"],
      competitiveAdvantages: insights.competitiveAdvantages?.length > 0 ? insights.competitiveAdvantages :
        ["industry expertise", "proven results", "customer satisfaction"],
      requiredSections: insights.requiredSections?.length > 0 ? insights.requiredSections :
        ["hero", "services", "about", "testimonials", "contact"],
      businessGoals: insights.businessGoals || this.inferBusinessGoals(input),
      targetPersonas: insights.targetPersonas || this.generateDefaultPersonas(input.targetAudience)
    };
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

    // Ensure metadata is complete
    structure.metadata = {
      title: structure.metadata?.title || `${structure.businessName} - ${structure.industry}`,
      description: structure.metadata?.description || `Welcome to ${structure.businessName}`,
      keywords: structure.metadata?.keywords || this.generateKeywords(structure)
    };

    return structure;
  }

  private generateEnhancedInsights(input: any): IndustryInsights {
    // Enhanced fallback based on industry patterns
    const industryPatterns: Record<string, Partial<IndustryInsights>> = {
      restaurant: {
        keyFeatures: ["online menu", "table reservations", "customer reviews", "location & hours", "special events"],
        userJourney: ["search for restaurant", "view menu & prices", "check reviews", "make reservation", "visit restaurant"],
        competitiveAdvantages: ["unique cuisine", "ambiance", "chef expertise", "local ingredients"],
        requiredSections: ["hero", "menu", "about", "reservations", "reviews", "location", "contact"]
      },
      ecommerce: {
        keyFeatures: ["product catalog", "shopping cart", "secure checkout", "customer accounts", "order tracking"],
        userJourney: ["browse products", "search & filter", "add to cart", "checkout", "track order"],
        competitiveAdvantages: ["product selection", "competitive pricing", "fast shipping", "customer service"],
        requiredSections: ["hero", "featured-products", "categories", "testimonials", "shipping-info", "contact"]
      },
      consulting: {
        keyFeatures: ["service offerings", "case studies", "team expertise", "client testimonials", "contact forms"],
        userJourney: ["identify need", "research services", "review credentials", "schedule consultation", "engage services"],
        competitiveAdvantages: ["industry expertise", "proven methodology", "client results", "team credentials"],
        requiredSections: ["hero", "services", "case-studies", "team", "testimonials", "process", "contact"]
      },
      health: {
        keyFeatures: ["services", "practitioner profiles", "appointment booking", "patient resources", "insurance info"],
        userJourney: ["search symptoms", "find services", "check credentials", "book appointment", "visit clinic"],
        competitiveAdvantages: ["medical expertise", "modern facilities", "patient care", "convenient location"],
        requiredSections: ["hero", "services", "team", "appointments", "patient-info", "insurance", "contact"]
      }
    };

    const pattern = industryPatterns[input.industry.toLowerCase()] || {
      keyFeatures: ["professional services", "portfolio", "about us", "contact information"],
      userJourney: ["discover", "explore services", "evaluate expertise", "make contact"],
      competitiveAdvantages: ["quality", "experience", "customer service", "innovation"],
      requiredSections: ["hero", "services", "about", "portfolio", "testimonials", "contact"]
    };

    return {
      ...pattern,
      businessGoals: this.inferBusinessGoals(input),
      targetPersonas: this.generateDefaultPersonas(input.targetAudience)
    } as IndustryInsights;
  }

  private generateEnhancedStructure(input: any): SiteStructure {
    const insights = input.insights;
    const sections: SiteSection[] = insights.requiredSections.map((type: string, index: number) => 
      this.createEnhancedSection(type, input, index + 1)
    );

    return {
      businessName: input.businessName,
      industry: input.industry,
      sections,
      navigation: this.generateDefaultNavigation(sections),
      metadata: this.generateDefaultMetadata(input)
    };
  }

  private createEnhancedSection(type: string, input: any, priority: number): SiteSection {
    const sectionTemplates: Record<string, () => SiteSection> = {
      hero: () => ({
        id: "hero",
        type: "hero",
        title: `Welcome to ${input.businessName}`,
        priority: 1,
        content: {
          headline: `Excellence in ${input.industry}`,
          subheadline: `Discover why ${input.businessName} is the trusted choice for quality and innovation`,
          cta: "Get Started Today"
        }
      }),
      services: () => ({
        id: "services",
        type: "services",
        title: "Our Services",
        priority,
        content: {
          items: this.generateServiceItems(input.industry)
        }
      }),
      about: () => ({
        id: "about",
        type: "about",
        title: `About ${input.businessName}`,
        priority,
        content: {
          story: `With years of experience in ${input.industry}, we've built a reputation for excellence and innovation.`,
          mission: "Our mission is to deliver exceptional value and results that exceed expectations."
        }
      }),
      contact: () => ({
        id: "contact",
        type: "contact",
        title: "Get in Touch",
        priority,
        content: {
          headline: "Ready to get started?",
          subheadline: "Contact us today for a free consultation"
        }
      }),
      testimonials: () => ({
        id: "testimonials",
        type: "testimonials",
        title: "What Our Clients Say",
        priority,
        content: {
          headline: "Trusted by businesses like yours"
        }
      }),
      menu: () => ({
        id: "menu",
        type: "menu",
        title: "Our Menu",
        priority,
        content: {
          categories: ["Appetizers", "Main Courses", "Desserts", "Beverages"]
        }
      }),
      "case-studies": () => ({
        id: "case-studies",
        type: "case-studies",
        title: "Success Stories",
        priority,
        content: {
          headline: "See how we've helped businesses succeed"
        }
      }),
      team: () => ({
        id: "team",
        type: "team",
        title: "Meet Our Team",
        priority,
        content: {
          headline: "The experts behind your success"
        }
      })
    };

    const template = sectionTemplates[type];
    if (template) {
      return template();
    }

    // Generic section fallback
    return {
      id: type,
      type: type,
      title: this.formatTitle(type),
      priority,
      content: {}
    };
  }

  private generateServiceItems(industry: string): any[] {
    const serviceTemplates: Record<string, any[]> = {
      restaurant: [
        { name: "Dine In", description: "Enjoy our full restaurant experience" },
        { name: "Takeout", description: "Quality meals to go" },
        { name: "Catering", description: "Perfect for events and gatherings" }
      ],
      consulting: [
        { name: "Strategy Consulting", description: "Develop winning business strategies" },
        { name: "Digital Transformation", description: "Modernize your operations" },
        { name: "Process Optimization", description: "Improve efficiency and reduce costs" }
      ],
      ecommerce: [
        { name: "Wide Selection", description: "Thousands of products to choose from" },
        { name: "Fast Shipping", description: "Get your orders quickly" },
        { name: "Easy Returns", description: "Hassle-free return policy" }
      ]
    };

    return serviceTemplates[industry.toLowerCase()] || [
      { name: "Professional Service", description: "Expert solutions for your needs" },
      { name: "Custom Solutions", description: "Tailored to your requirements" },
      { name: "Ongoing Support", description: "We're here when you need us" }
    ];
  }

  private inferBusinessGoals(input: any): string[] {
    const industryGoals: Record<string, string[]> = {
      restaurant: ["increase reservations", "showcase menu", "build local presence", "encourage repeat visits"],
      ecommerce: ["drive online sales", "reduce cart abandonment", "increase average order value", "build customer loyalty"],
      consulting: ["generate qualified leads", "demonstrate expertise", "build trust", "convert visitors to clients"],
      health: ["facilitate appointments", "educate patients", "build trust", "streamline patient communication"]
    };

    return industryGoals[input.industry.toLowerCase()] || [
      "increase brand awareness",
      "generate qualified leads",
      "showcase expertise",
      "convert visitors to customers"
    ];
  }

  private generateDefaultPersonas(targetAudience: string): any[] {
    // Parse target audience and create basic personas
    const audienceSegments = targetAudience.split(",").map(s => s.trim());
    
    return audienceSegments.slice(0, 3).map((segment, index) => ({
      name: `${segment} Persona`,
      demographics: segment,
      goals: `Find quality solutions that meet their specific needs`,
      painPoints: `Limited time, need reliable service, value for money`
    }));
  }

  private generateDefaultNavigation(sections: SiteSection[]): any[] {
    return sections
      .filter(s => s.type !== "hero") // Don't include hero in nav
      .sort((a, b) => a.priority - b.priority)
      .map(section => ({
        label: section.title,
        href: `#${section.id}`,
        priority: section.priority
      }));
  }

  private generateDefaultMetadata(input: any): any {
    return {
      title: `${input.businessName} - Leading ${input.industry} Solutions`,
      description: `${input.businessName} provides exceptional ${input.industry} services. Contact us today to learn how we can help you succeed.`,
      keywords: this.generateKeywords(input)
    };
  }

  private generateKeywords(input: any): string[] {
    const baseKeywords = [
      input.businessName,
      input.industry,
      `${input.industry} services`,
      `best ${input.industry}`,
      `professional ${input.industry}`
    ];

    if (input.insights?.keyFeatures) {
      baseKeywords.push(...input.insights.keyFeatures);
    }

    return baseKeywords;
  }

  private formatTitle(type: string): string {
    return type
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}