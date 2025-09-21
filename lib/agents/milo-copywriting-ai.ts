import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, SiteContent } from "@/types/agents";
import { AIResponseValidator } from "./validators/ai-response-validator";

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
    const failedSections: string[] = [];

    // Generate content for each section with validation
    for (const section of structure.sections) {
      let sectionSuccess = false;
      let lastError: Error | null = null;
      
      // Try up to 3 times for each section
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const sectionContent = await this.generateSectionContent(
            section,
            businessInfo,
            attempt
          );
          
          // Validate the generated content
          const validation = AIResponseValidator.validateContentSection(
            sectionContent,
            section.type
          );
          
          if (!validation.isValid) {
            throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
          }
          
          content[section.id] = sectionContent;
          sectionSuccess = true;
          break;
        } catch (error) {
          lastError = error as Error;
          this.log(`Attempt ${attempt} failed for section ${section.id}: ${lastError.message}`);
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!sectionSuccess) {
        failedSections.push(section.id);
        this.log(`Failed to generate valid content for section ${section.id} after 3 attempts`);
      }
    }
    
    // If critical sections failed, attempt to regenerate them collectively
    if (failedSections.length > 0) {
      const criticalSections = failedSections.filter(id => 
        ['hero', 'services', 'contact'].includes(
          structure.sections.find(s => s.id === id)?.type || ''
        )
      );
      
      if (criticalSections.length > 0) {
        throw new Error(
          `Failed to generate content for critical sections: ${criticalSections.join(', ')}. ` +
          `Please ensure the AI service is responding with valid content.`
        );
      }
    }

    return content;
  }

  async generateSectionContent(
    section: any,
    businessInfo: any,
    attemptNumber: number = 1
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
- Address the target audience directly
- ALL required fields MUST be populated with meaningful content
- Ensure JSON is valid and properly formatted${
  attemptNumber > 1 ? `\n\nNOTE: This is attempt ${attemptNumber}. Please ensure all required fields are properly filled.` : ''
}`;

    try {
      const response = await this.generateWithAI({
        prompt: contentPrompt,
        context: { section, businessInfo },
        formatJson: true
      });

      const content = this.parseAIJson(response, {});
      return content;
    } catch (error) {
      this.log(`AI generation failed for ${section.type}`);
      throw error;
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









}