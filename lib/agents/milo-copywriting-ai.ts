import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, SiteContent } from "@/types/agents";

export class MiloCopywritingAIAgent extends AIBaseAgent {
  constructor() {
    super({
      name: "Milo",
      role: "AI Content and Copywriting Specialist",
      capabilities: [
        "Write compelling headlines and taglines",
        "Create persuasive sales copy",
        "Generate SEO-optimized content",
        "Craft engaging storytelling",
        "Write clear calls-to-action"
      ],
      temperature: 0.7,
      maxTokens: 4000
    });
  }

  protected getDefaultSystemPrompt(): string {
    return `You are Milo, an expert AI copywriter specializing in creating compelling website content that converts.

Your expertise includes:
- Persuasive copywriting techniques
- SEO content optimization
- Brand voice development
- Storytelling and narrative
- Conversion rate optimization
- Emotional triggers and psychology
- Clear and concise messaging
- Industry-specific terminology

When writing content:
1. Focus on benefits over features
2. Use emotional triggers appropriately
3. Write clear, action-oriented CTAs
4. Maintain consistent brand voice
5. Optimize for search engines naturally
6. Use power words and active voice
7. Create scannable content with good structure
8. Address customer pain points directly

Always write in a way that resonates with the target audience and drives action.`;
  }

  async generateContent(
    structure: SiteStructure,
    businessInfo: {
      businessName: string;
      industry: string;
      description: string;
      targetAudience: string;
    }
  ): Promise<SiteContent> {
    this.log(`Generating AI-powered content for ${businessInfo.businessName}...`);
    
    const content: SiteContent = {};

    // Generate content for each section
    for (const section of structure.sections) {
      try {
        content[section.id] = await this.generateSectionContent(
          section,
          businessInfo
        );
      } catch (error) {
        this.log(`Failed to generate content for section ${section.id}: ${error}`);
        content[section.id] = this.generateFallbackContent(section, businessInfo);
      }
    }

    return content;
  }

  private async generateSectionContent(
    section: any,
    businessInfo: any
  ): Promise<any> {
    const contentPrompt = `Generate compelling website content for the ${section.type} section.

Business Information:
- Name: ${businessInfo.businessName}
- Industry: ${businessInfo.industry}
- Description: ${businessInfo.description}
- Target Audience: ${businessInfo.targetAudience}

Section Details:
- Type: ${section.type}
- Title: ${section.title}
- Purpose: ${this.getSectionPurpose(section.type)}

Generate content in JSON format based on the section type:

${this.getSectionContentTemplate(section.type)}

Important guidelines:
- Use emotional, benefit-focused language
- Include specific details about the business
- Write in a tone appropriate for the industry
- Include power words and action verbs
- Keep it concise but impactful
- Address the target audience directly`;

    try {
      const response = await this.generateWithAI({
        prompt: contentPrompt,
        context: { section, businessInfo },
        formatJson: true
      });

      const content = this.parseAIJson(response, this.getDefaultContent(section.type));
      return this.enhanceContent(content, section.type, businessInfo);
    } catch (error) {
      this.log(`AI generation failed for ${section.type}, using enhanced fallback`);
      return this.generateEnhancedFallback(section, businessInfo);
    }
  }

  private getSectionPurpose(type: string): string {
    const purposes: Record<string, string> = {
      hero: "Capture attention and communicate value proposition",
      services: "Showcase offerings and benefits",
      about: "Build trust and connection with the brand story",
      testimonials: "Provide social proof and credibility",
      contact: "Encourage visitors to take action and get in touch",
      menu: "Display offerings in an appetizing way",
      "case-studies": "Demonstrate expertise and results",
      team: "Humanize the brand and show expertise",
      featured: "Highlight best products or services",
      categories: "Help users navigate and find what they need",
      reservations: "Make it easy to book or schedule"
    };
    return purposes[type] || "Engage visitors and drive conversions";
  }

  private getSectionContentTemplate(type: string): string {
    const templates: Record<string, string> = {
      hero: `{
  "headline": "Powerful headline that captures attention",
  "subheadline": "Supporting text that expands on the value proposition",
  "cta": "Primary call-to-action text",
  "secondaryCta": "Secondary action text"
}`,
      services: `{
  "items": [
    {
      "name": "Service Name",
      "description": "Benefit-focused description",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "cta": "Action text"
    }
  ]
}`,
      about: `{
  "headline": "Compelling about headline",
  "story": "Brand story that connects emotionally",
  "mission": "Mission statement",
  "values": ["Value 1", "Value 2", "Value 3"],
  "cta": "Call-to-action"
}`,
      testimonials: `{
  "headline": "Social proof headline",
  "items": [
    {
      "quote": "Customer testimonial",
      "author": "Customer Name",
      "role": "Title/Company",
      "rating": 5
    }
  ]
}`,
      contact: `{
  "headline": "Contact section headline",
  "subheadline": "Encouraging text",
  "cta": "Submit button text",
  "info": {
    "phone": "Phone number",
    "email": "Email address",
    "address": "Physical address",
    "hours": "Business hours"
  }
}`
    };
    
    return templates[type] || `{
  "headline": "Section headline",
  "content": "Main content text",
  "cta": "Call-to-action"
}`;
  }

  private getDefaultContent(type: string): any {
    const defaults: Record<string, any> = {
      hero: {
        headline: "Welcome to Excellence",
        subheadline: "Discover our exceptional services",
        cta: "Get Started",
        secondaryCta: "Learn More"
      },
      services: {
        items: [
          {
            name: "Premium Service",
            description: "High-quality solutions tailored to your needs",
            features: ["Professional", "Reliable", "Efficient"]
          }
        ]
      },
      about: {
        headline: "Our Story",
        story: "Dedicated to excellence and innovation",
        mission: "Delivering exceptional value to our clients",
        values: ["Quality", "Innovation", "Trust"]
      }
    };
    
    return defaults[type] || { content: "Quality content coming soon" };
  }

  private enhanceContent(content: any, sectionType: string, businessInfo: any): any {
    // Add industry-specific enhancements
    if (sectionType === "hero" && businessInfo.industry) {
      content.industryTag = this.getIndustryTag(businessInfo.industry);
    }

    // Ensure CTAs are action-oriented
    if (content.cta) {
      content.cta = this.enhanceCTA(content.cta, businessInfo.industry);
    }

    return content;
  }

  private getIndustryTag(industry: string): string {
    const tags: Record<string, string> = {
      restaurant: "Award-Winning Dining",
      ecommerce: "Shop with Confidence",
      consulting: "Strategic Excellence",
      health: "Your Health, Our Priority",
      tech: "Innovation Delivered",
      education: "Learn & Grow",
      realestate: "Find Your Dream Home",
      fitness: "Transform Your Life",
      beauty: "Radiate Confidence",
      travel: "Adventure Awaits"
    };
    return tags[industry.toLowerCase()] || "Excellence Delivered";
  }

  private enhanceCTA(cta: string, industry: string): string {
    // If the CTA is too generic, make it more specific
    const genericCTAs = ["click here", "submit", "send", "go"];
    if (genericCTAs.some(generic => cta.toLowerCase().includes(generic))) {
      const industryCTAs: Record<string, string> = {
        restaurant: "Reserve Your Table",
        ecommerce: "Shop Now",
        consulting: "Schedule Consultation",
        health: "Book Appointment",
        tech: "Start Free Trial",
        education: "Enroll Today",
        realestate: "View Properties",
        fitness: "Join Now",
        beauty: "Book Treatment",
        travel: "Plan Your Trip"
      };
      return industryCTAs[industry.toLowerCase()] || "Get Started Today";
    }
    return cta;
  }

  private generateEnhancedFallback(section: any, businessInfo: any): any {
    const fallbackGenerators: Record<string, () => any> = {
      hero: () => ({
        headline: `Transform Your ${businessInfo.industry} Experience with ${businessInfo.businessName}`,
        subheadline: `${businessInfo.description || "Discover excellence, innovation, and unmatched service"}`,
        cta: this.generateIndustryCTA(businessInfo.industry),
        secondaryCta: "Explore Our Services"
      }),
      
      services: () => ({
        items: this.generateIndustryServices(businessInfo.industry, businessInfo.businessName)
      }),
      
      about: () => ({
        headline: `The ${businessInfo.businessName} Difference`,
        story: `Founded on principles of excellence and innovation, ${businessInfo.businessName} has become a trusted name in the ${businessInfo.industry} industry. We combine expertise with passion to deliver exceptional results.`,
        mission: `Our mission is to provide unparalleled ${businessInfo.industry} solutions that exceed expectations and create lasting value for our clients.`,
        values: ["Excellence", "Innovation", "Integrity", "Customer Focus"],
        cta: "Discover Our Story"
      }),
      
      testimonials: () => ({
        headline: "What Our Clients Say",
        items: [
          {
            quote: `Working with ${businessInfo.businessName} has been transformative for our business. Their expertise and dedication are unmatched.`,
            author: "Sarah Johnson",
            role: "CEO, Success Corp",
            rating: 5
          },
          {
            quote: "Professional, reliable, and always exceeding expectations. Highly recommended!",
            author: "Michael Chen",
            role: "Director of Operations",
            rating: 5
          },
          {
            quote: "The best decision we made was choosing them as our partner. Outstanding results!",
            author: "Emily Rodriguez",
            role: "Business Owner",
            rating: 5
          }
        ]
      }),
      
      contact: () => ({
        headline: "Let's Start a Conversation",
        subheadline: "Ready to take the next step? We're here to help you succeed.",
        cta: "Send Message",
        info: {
          phone: "(555) 123-4567",
          email: `info@${businessInfo.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
          address: "123 Business Ave, Suite 100, Your City, ST 12345",
          hours: "Monday - Friday: 9:00 AM - 6:00 PM"
        }
      })
    };

    const generator = fallbackGenerators[section.type];
    return generator ? generator() : this.generateGenericContent(section, businessInfo);
  }

  private generateIndustryCTA(industry: string): string {
    const ctas: Record<string, string> = {
      restaurant: "Reserve Your Table",
      ecommerce: "Start Shopping",
      consulting: "Get Your Free Consultation",
      health: "Book Your Appointment",
      tech: "See It In Action",
      education: "Start Learning Today",
      realestate: "Find Your Dream Property",
      fitness: "Start Your Journey",
      beauty: "Book Your Session",
      travel: "Plan Your Adventure"
    };
    return ctas[industry.toLowerCase()] || "Get Started Today";
  }

  private generateIndustryServices(industry: string, businessName: string): any[] {
    const serviceTemplates: Record<string, any[]> = {
      restaurant: [
        {
          name: "Fine Dining Experience",
          description: "Savor exquisite cuisine crafted by our award-winning chefs in an elegant atmosphere",
          features: ["Seasonal menus", "Wine pairing", "Private dining"],
          cta: "View Menu"
        },
        {
          name: "Express Takeout",
          description: "Enjoy restaurant-quality meals at home with our convenient takeout service",
          features: ["Online ordering", "Quick pickup", "Special packaging"],
          cta: "Order Now"
        },
        {
          name: "Event Catering",
          description: "Make your special occasions unforgettable with our professional catering",
          features: ["Custom menus", "Full service", "Event planning"],
          cta: "Plan Your Event"
        }
      ],
      consulting: [
        {
          name: "Strategic Planning",
          description: "Develop winning strategies that drive growth and competitive advantage",
          features: ["Market analysis", "Goal setting", "Implementation roadmap"],
          cta: "Learn More"
        },
        {
          name: "Business Transformation",
          description: "Modernize operations and unlock new opportunities for success",
          features: ["Process optimization", "Digital adoption", "Change management"],
          cta: "Transform Now"
        },
        {
          name: "Performance Improvement",
          description: "Maximize efficiency and profitability with data-driven insights",
          features: ["KPI development", "Analytics", "Continuous improvement"],
          cta: "Boost Performance"
        }
      ],
      ecommerce: [
        {
          name: "Premium Selection",
          description: "Discover carefully curated products from trusted brands worldwide",
          features: ["Quality guarantee", "Exclusive items", "New arrivals daily"],
          cta: "Shop Collection"
        },
        {
          name: "Fast Shipping",
          description: "Get your orders delivered quickly with our reliable shipping partners",
          features: ["Same-day options", "Track orders", "Free shipping available"],
          cta: "Learn More"
        },
        {
          name: "Easy Returns",
          description: "Shop with confidence knowing returns are simple and hassle-free",
          features: ["30-day policy", "Free returns", "Instant refunds"],
          cta: "Return Policy"
        }
      ]
    };

    return serviceTemplates[industry.toLowerCase()] || [
      {
        name: "Professional Excellence",
        description: `Experience the ${businessName} difference with our commitment to quality`,
        features: ["Expert team", "Proven results", "Personalized service"],
        cta: "Get Started"
      },
      {
        name: "Innovative Solutions",
        description: "Stay ahead with our cutting-edge approaches and technologies",
        features: ["Modern methods", "Custom solutions", "Continuous innovation"],
        cta: "Learn More"
      },
      {
        name: "Dedicated Support",
        description: "Count on our team for ongoing guidance and assistance",
        features: ["24/7 availability", "Expert advice", "Long-term partnership"],
        cta: "Contact Us"
      }
    ];
  }

  private generateGenericContent(section: any, businessInfo: any): any {
    return {
      headline: section.title,
      content: `Welcome to the ${section.title} section of ${businessInfo.businessName}. We're dedicated to providing exceptional ${businessInfo.industry} services.`,
      cta: "Learn More"
    };
  }

  private generateFallbackContent(section: any, businessInfo: any): any {
    return this.generateEnhancedFallback(section, businessInfo);
  }
}