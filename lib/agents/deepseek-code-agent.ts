import { AIBaseAgent } from "./ai-base-agent";

/**
 * DeepSeek Code Agent - Specialized AI for code generation
 * Uses DeepSeek V3 model via HuggingFace Router
 *
 * Benefits:
 * - Excellent code generation quality
 * - Cost-effective (~€0.00014/1K tokens vs GLM's €0.001/1K)
 * - Strong reasoning capabilities
 * - Good at both code AND content
 */
export class DeepSeekCodeAgent extends AIBaseAgent {
  private readonly hfToken: string;
  private readonly model = "Qwen/Qwen2.5-Coder-32B-Instruct";
  private readonly apiUrl = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct";

  constructor() {
    super({
      name: "DeepSeek",
      role: "AI Code Generation Specialist",
      capabilities: [
        "HTML/CSS/JavaScript generation",
        "Responsive web design",
        "Modern web components",
        "SEO-optimized code",
        "Accessible markup (WCAG)",
        "Performance optimization"
      ],
      temperature: 0.3,
      maxTokens: 8000
    });

    this.hfToken = process.env.HF_TOKEN || process.env.NEXT_PUBLIC_HF_TOKEN || "";

    if (!this.hfToken) {
      throw new Error("HF_TOKEN required for DeepSeek agent");
    }
  }

  protected getDefaultSystemPrompt(): string {
    return `You are an expert full-stack web developer specializing in creating modern, responsive, and accessible websites.

Your expertise includes:
- Semantic HTML5 markup
- Modern CSS (Flexbox, Grid, animations)
- Vanilla JavaScript for interactivity
- Responsive design (mobile-first)
- Web accessibility (WCAG AA standards)
- SEO best practices
- Performance optimization

When generating code:
1. Use semantic HTML elements appropriately
2. Write clean, maintainable CSS
3. Ensure cross-browser compatibility
4. Make it mobile-responsive
5. Include proper meta tags for SEO
6. Add ARIA labels for accessibility
7. Optimize for performance (lazy loading, etc.)
8. Include subtle animations for better UX

Always generate complete, production-ready code.`;
  }

  /**
   * Generate complete HTML website from design system and content
   */
  async generateWebsite(input: {
    structure: any;
    designSystem: any;
    content: any;
  }): Promise<string> {
    try {
      this.log("Generating website with DeepSeek V3...");

      const prompt = this.buildWebsitePrompt(input);

      const html = await this.generateWithDeepSeek(prompt);

      if (!html || html.length < 100) {
        throw new Error("Generated HTML is too short or empty");
      }

      this.log("Website generated successfully");
      return html;
    } catch (error) {
      this.log(`DeepSeek generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate blog article with SEO optimization
   */
  async generateBlogArticle(input: {
    title: string;
    topic: string;
    keywords: string[];
    tone: string;
    businessContext: any;
  }): Promise<string> {
    try {
      this.log(`Generating blog article: ${input.title}...`);

      const prompt = `Create a comprehensive, SEO-optimized blog article on the following topic:

Title: ${input.title}
Topic: ${input.topic}
Keywords: ${input.keywords.join(", ")}
Tone: ${input.tone}
Business Context: ${JSON.stringify(input.businessContext, null, 2)}

Requirements:
1. Write a compelling introduction (2-3 paragraphs)
2. Create 4-6 main sections with H2 headings
3. Include H3 subheadings where appropriate
4. Natural keyword integration (avoid keyword stuffing)
5. Add a strong conclusion with CTA
6. Length: 1200-1800 words
7. Include relevant examples and insights
8. Write in ${input.tone} tone
9. Make it valuable and actionable for readers

Format as HTML with proper semantic markup (article, header, section tags).`;

      const article = await this.generateWithDeepSeek(prompt);

      this.log("Blog article generated successfully");
      return article;
    } catch (error) {
      this.log(`Blog generation failed: ${error}`);
      throw error;
    }
  }

  private buildWebsitePrompt(input: any): string {
    const { structure, designSystem, content } = input;

    return `Generate a complete, modern, responsive website with the following specifications:

## Business Information
- Name: ${structure.businessName}
- Industry: ${structure.industry}

## Site Structure
${JSON.stringify(structure.sections, null, 2)}

## Design System
- Colors: ${JSON.stringify(designSystem.colorPalette, null, 2)}
- Typography: ${JSON.stringify(designSystem.typography, null, 2)}
- Spacing: ${JSON.stringify(designSystem.spacing, null, 2)}

## Content
${JSON.stringify(content, null, 2)}

## Requirements

Create a SINGLE, COMPLETE HTML file that includes:

1. **DOCTYPE and HTML5 structure**
   - Proper meta tags (viewport, charset, description)
   - SEO meta tags (Open Graph, Twitter Cards)
   - Favicon placeholder

2. **Embedded CSS** (in <style> tag)
   - Use the design system colors and typography
   - Mobile-first responsive design
   - Smooth animations and transitions
   - Modern layout (Flexbox/Grid)
   - Beautiful hover effects

3. **Complete Sections**
   - Implement ALL sections from the structure
   - Use content provided for each section
   - Create visually appealing layouts
   - Include navigation menu
   - Add footer with copyright

4. **Embedded JavaScript** (in <script> tag)
   - Mobile menu toggle
   - Smooth scroll navigation
   - Form validation (if contact form exists)
   - Any interactive elements
   - Scroll animations

5. **Best Practices**
   - Semantic HTML elements
   - ARIA labels for accessibility
   - Alt text for images (use placeholders)
   - Proper heading hierarchy
   - Clean, readable code

Return ONLY the complete HTML code, nothing else. No markdown, no explanations.`;
  }

  private async generateWithDeepSeek(prompt: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.log(`DeepSeek API call attempt ${attempt}/${maxRetries}...`);

        const fullPrompt = `${this.getDefaultSystemPrompt()}\n\n${prompt}`;

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 8000,
              temperature: 0.3,
              return_full_text: false
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

        if (!content) {
          throw new Error("No content in DeepSeek response");
        }

        // Extract HTML if it's wrapped in markdown code blocks
        const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
        if (htmlMatch) {
          return htmlMatch[1].trim();
        }

        // Extract any code block
        const codeMatch = content.match(/```\n([\s\S]*?)\n```/);
        if (codeMatch) {
          return codeMatch[1].trim();
        }

        return content.trim();
      } catch (error: any) {
        lastError = error;
        this.log(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("DeepSeek generation failed after all retries");
  }
}
