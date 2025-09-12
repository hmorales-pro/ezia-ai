import { BaseAgent } from "./base-agent";
import { SiteStructure, SiteSection, IndustryInsights } from "@/types/agents";

export class SiteArchitectAgent extends BaseAgent {
  constructor() {
    super("Site Architect", "Architecture and Structure Specialist");
  }

  async analyzeBusiness(input: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience: string;
  }): Promise<IndustryInsights> {
    // Industry-specific analysis
    const industryTemplates: Record<string, IndustryInsights> = {
      restaurant: {
        keyFeatures: ["menu", "reservations", "location", "reviews"],
        userJourney: ["discover", "browse menu", "book table", "visit"],
        competitiveAdvantages: ["cuisine type", "ambiance", "service quality"],
        requiredSections: ["hero", "menu", "about", "reservations", "contact"],
      },
      "e-commerce": {
        keyFeatures: ["products", "cart", "checkout", "search", "filters"],
        userJourney: ["browse", "search", "add to cart", "checkout"],
        competitiveAdvantages: ["product range", "pricing", "shipping"],
        requiredSections: ["hero", "featured", "categories", "testimonials", "footer"],
      },
      consulting: {
        keyFeatures: ["services", "case studies", "expertise", "team"],
        userJourney: ["understand services", "see results", "book consultation"],
        competitiveAdvantages: ["expertise", "track record", "approach"],
        requiredSections: ["hero", "services", "case-studies", "team", "contact"],
      },
      default: {
        keyFeatures: ["services", "about", "portfolio", "contact"],
        userJourney: ["discover", "explore", "engage", "contact"],
        competitiveAdvantages: ["quality", "experience", "innovation"],
        requiredSections: ["hero", "services", "about", "testimonials", "contact"],
      },
    };

    const insights = industryTemplates[input.industry.toLowerCase()] || industryTemplates.default;
    
    return {
      ...insights,
      businessGoals: this.inferBusinessGoals(input),
      targetPersonas: this.generatePersonas(input.targetAudience),
    };
  }

  async generateStructure(input: {
    businessName: string;
    industry: string;
    insights: IndustryInsights;
  }): Promise<SiteStructure> {
    const sections: SiteSection[] = input.insights.requiredSections.map((type) => {
      return this.createSection(type, input);
    });

    return {
      businessName: input.businessName,
      industry: input.industry,
      sections,
      navigation: this.generateNavigation(sections),
      metadata: {
        title: `${input.businessName} - Leading ${input.industry} Services`,
        description: `Welcome to ${input.businessName}, your trusted partner in ${input.industry}.`,
        keywords: this.generateKeywords(input),
      },
    };
  }

  private createSection(type: string, input: any): SiteSection {
    const sectionTemplates: Record<string, Partial<SiteSection>> = {
      hero: {
        id: "hero",
        type: "hero",
        title: `Welcome to ${input.businessName}`,
        priority: 1,
        content: {
          headline: `Transform Your ${input.industry} Experience`,
          subheadline: "Professional, reliable, and innovative solutions",
          cta: "Get Started",
        },
      },
      services: {
        id: "services",
        type: "services",
        title: "Our Services",
        priority: 2,
        content: {
          items: this.generateServiceItems(input.industry),
        },
      },
      menu: {
        id: "menu",
        type: "menu",
        title: "Our Menu",
        priority: 2,
        content: {
          categories: ["Appetizers", "Main Courses", "Desserts", "Beverages"],
        },
      },
      about: {
        id: "about",
        type: "about",
        title: "About Us",
        priority: 3,
        content: {
          story: `${input.businessName} has been serving the community with excellence.`,
          mission: "To provide exceptional service and value to our customers.",
        },
      },
      contact: {
        id: "contact",
        type: "contact",
        title: "Contact Us",
        priority: 5,
        content: {
          form: true,
          map: true,
          details: true,
        },
      },
    };

    return {
      id: type,
      type,
      title: sectionTemplates[type]?.title || type,
      priority: sectionTemplates[type]?.priority || 3,
      content: sectionTemplates[type]?.content || {},
      layout: this.determineLayout(type),
    } as SiteSection;
  }

  private generateNavigation(sections: SiteSection[]) {
    return sections
      .filter((s) => s.priority <= 4)
      .sort((a, b) => a.priority - b.priority)
      .map((s) => ({
        label: s.title,
        href: `#${s.id}`,
        priority: s.priority,
      }));
  }

  private generateKeywords(input: any): string[] {
    const baseKeywords = [input.businessName, input.industry];
    const industryKeywords: Record<string, string[]> = {
      restaurant: ["dining", "food", "cuisine", "reservation", "menu"],
      "e-commerce": ["shop", "buy", "products", "online store", "shopping"],
      consulting: ["advisory", "expertise", "solutions", "strategy", "consulting"],
    };
    
    return [
      ...baseKeywords,
      ...(industryKeywords[input.industry.toLowerCase()] || []),
    ];
  }

  private generateServiceItems(industry: string): any[] {
    const serviceTemplates: Record<string, any[]> = {
      restaurant: [
        { name: "Dine In", description: "Enjoy our full service experience" },
        { name: "Takeout", description: "Order and pick up at your convenience" },
        { name: "Catering", description: "Perfect for your events and gatherings" },
      ],
      consulting: [
        { name: "Strategy", description: "Comprehensive business strategy development" },
        { name: "Implementation", description: "Hands-on execution support" },
        { name: "Training", description: "Empower your team with expert knowledge" },
      ],
      default: [
        { name: "Service 1", description: "Our primary offering" },
        { name: "Service 2", description: "Additional value-added service" },
        { name: "Service 3", description: "Specialized solutions" },
      ],
    };

    return serviceTemplates[industry.toLowerCase()] || serviceTemplates.default;
  }

  private determineLayout(sectionType: string): string {
    const layouts: Record<string, string> = {
      hero: "full-width-centered",
      services: "grid-3-columns",
      menu: "tabbed-content",
      about: "two-column-image",
      testimonials: "carousel",
      contact: "split-form-map",
    };
    
    return layouts[sectionType] || "single-column";
  }

  private inferBusinessGoals(input: any): string[] {
    const industryGoals: Record<string, string[]> = {
      restaurant: ["increase reservations", "showcase menu", "build loyalty"],
      "e-commerce": ["drive sales", "reduce cart abandonment", "increase AOV"],
      consulting: ["generate leads", "demonstrate expertise", "book consultations"],
    };
    
    return industryGoals[input.industry.toLowerCase()] || 
      ["generate leads", "build trust", "increase conversions"];
  }

  private generatePersonas(targetAudience: string): any[] {
    // Simple persona generation based on target audience
    return [
      {
        name: "Primary User",
        characteristics: ["tech-savvy", "value-conscious", "time-sensitive"],
        needs: ["quick information", "easy navigation", "clear CTAs"],
      },
    ];
  }
}