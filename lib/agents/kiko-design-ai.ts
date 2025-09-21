import { AIBaseAgent } from "./ai-base-agent";
import { DesignSystem, ColorPalette, Typography } from "@/types/agents";

export class KikoDesignAIAgent extends AIBaseAgent {
  constructor() {
    super({
      name: "Kiko",
      role: "AI Design System and Visual Identity Specialist",
      capabilities: [
        "Create cohesive color palettes",
        "Design typography systems",
        "Generate component styles",
        "Define spacing and layout rules",
        "Create animation guidelines"
      ],
      temperature: 0.5,
      maxTokens: 4000
    });
  }

  protected getDefaultSystemPrompt(): string {
    return `You are Kiko, an expert AI designer specializing in creating comprehensive design systems for websites.

Your expertise includes:
- Color theory and psychology
- Typography and readability
- Visual hierarchy and composition
- Brand identity design
- Accessibility standards (WCAG)
- Modern design trends
- Responsive design principles
- Motion design and micro-interactions

When creating design systems:
1. Consider the industry and brand personality
2. Ensure colors work well together and have proper contrast
3. Select appropriate fonts for the business type
4. Create a cohesive visual language
5. Maintain accessibility standards (WCAG AA minimum)
6. Design for multiple screen sizes
7. Include subtle animations for better UX

Always provide hex color codes and specific font recommendations.`;
  }

  async createDesignSystem(input: {
    businessName: string;
    industry: string;
    brandPersonality?: string[];
  }): Promise<DesignSystem> {
    try {
      this.log(`Creating AI-powered design system for ${input.businessName}...`);

      const designPrompt = `Create a comprehensive design system for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Brand Personality: ${input.brandPersonality?.join(", ") || "professional, modern, trustworthy"}

Generate a complete design system in JSON format:
{
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutral": "#hex",
    "success": "#hex",
    "warning": "#hex",
    "error": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "fontFamily": "Font Name",
    "headingFont": "Font Name for headings",
    "baseFontSize": "16px",
    "fontWeights": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeights": {
      "tight": 1.2,
      "normal": 1.6,
      "relaxed": 1.8
    }
  },
  "spacing": {
    "base": "8px",
    "scale": [0, 4, 8, 12, 16, 24, 32, 48, 64, 96]
  },
  "borderRadius": {
    "small": "4px",
    "medium": "8px",
    "large": "16px",
    "full": "9999px"
  },
  "shadows": {
    "small": "0 1px 3px rgba(0,0,0,0.1)",
    "medium": "0 4px 6px rgba(0,0,0,0.1)",
    "large": "0 10px 25px rgba(0,0,0,0.15)"
  }
}

Consider these industry-specific guidelines:
- Restaurant: Warm, inviting colors; readable fonts; appetite-stimulating palette
- E-commerce: Trust-building colors; clear CTAs; professional appearance
- Consulting: Corporate colors; authoritative fonts; sophisticated palette
- Health: Calming colors; clean design; trustworthy appearance
- Tech: Modern colors; clean lines; innovative feel

Ensure all colors have proper contrast ratios for accessibility.`;

      const response = await this.generateWithAI({
        prompt: designPrompt,
        context: input,
        formatJson: true
      });

      const designData = this.parseAIJson<any>(response, {});
      
      // Build complete design system
      const designSystem = this.buildDesignSystem(designData, input);
      
      // Validate and enhance if needed
      return this.validateDesignSystem(designSystem, input);

    } catch (error) {
      this.log(`AI design generation failed: ${error}`);
      throw error;
    }
  }

  private buildDesignSystem(data: any, input: any): DesignSystem {
    // Convert AI response to proper DesignSystem format
    const colors = data.colors || {};
    
    const colorPalette: ColorPalette = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      neutral: colors.neutral ? this.generateNeutralScale(colors.neutral) : {},
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info
    };

    const typography: Typography = data.typography || {};

    const spacing = data.spacing || {};

    const components = this.generateComponentStyles(colorPalette, typography);
    const animations = this.generateAnimations();

    return {
      colors: colorPalette,
      colorPalette, // Legacy support
      typography,
      spacing,
      components,
      animations,
      breakpoints: {
        mobile: "640px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1280px"
      },
      borderRadius: data.borderRadius || {},
      shadows: data.shadows || {}
    };
  }

  private validateDesignSystem(system: DesignSystem, input: any): DesignSystem {
    // Return as-is, let AI handle all design decisions
    return system;
  }




  private generateNeutralScale(base: string): Record<string, string> {
    // Let AI generate the neutral scale
    return { "500": base };
  }


  private generateComponentStyles(colors: ColorPalette, typography: Typography): any {
    return {
      button: {
        primary: {
          background: colors.primary,
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: typography.fontWeights.semibold
        },
        secondary: {
          background: "transparent",
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          padding: "10px 22px",
          borderRadius: "8px",
          fontWeight: typography.fontWeights.semibold
        }
      },
      card: {
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      },
      input: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #E5E5E5",
        fontSize: typography.baseFontSize
      }
    };
  }

  private generateAnimations(): any {
    return {
      fadeIn: {
        keyframes: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        duration: "0.5s",
        easing: "ease-out"
      },
      slideUp: {
        keyframes: {
          from: { 
            opacity: 0,
            transform: "translateY(20px)"
          },
          to: {
            opacity: 1,
            transform: "translateY(0)"
          }
        },
        duration: "0.6s",
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      },
      scaleIn: {
        keyframes: {
          from: {
            opacity: 0,
            transform: "scale(0.9)"
          },
          to: {
            opacity: 1,
            transform: "scale(1)"
          }
        },
        duration: "0.4s",
        easing: "ease-out"
      }
    };
  }

}