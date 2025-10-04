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

Generate a complete design system in JSON format following this EXACT structure:
{
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutral": {
      "50": "#hex (lightest)",
      "100": "#hex",
      "200": "#hex",
      "300": "#hex",
      "400": "#hex",
      "500": "#hex (base)",
      "600": "#hex",
      "700": "#hex",
      "800": "#hex",
      "900": "#hex (darkest)"
    },
    "success": "#hex",
    "warning": "#hex",
    "error": "#hex",
    "info": "#hex"
  },
  "typography": {
    "fontFamily": {
      "heading": "Font Name for headings (e.g., 'Inter', 'Poppins')",
      "body": "Font Name for body text (e.g., 'Open Sans', 'Roboto')",
      "mono": "Monospace font (e.g., 'Fira Code', 'JetBrains Mono')"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "1rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 3px rgba(0,0,0,0.1)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 25px rgba(0,0,0,0.15)",
    "xl": "0 20px 40px rgba(0,0,0,0.2)"
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
      const designSystem = this.buildDesignSystem(designData);

      // Validate and enhance if needed
      return this.validateDesignSystem(designSystem);

    } catch (error) {
      this.log(`AI design generation failed: ${error}`);
      throw error;
    }
  }

  private buildDesignSystem(data: any): DesignSystem {
    // AI should return the exact structure, but we validate and ensure completeness
    const colorPalette: ColorPalette = data.colorPalette || {
      primary: "#000000",
      secondary: "#666666",
      accent: "#0066cc",
      neutral: {
        "50": "#fafafa",
        "100": "#f5f5f5",
        "200": "#e5e5e5",
        "300": "#d4d4d4",
        "400": "#a3a3a3",
        "500": "#737373",
        "600": "#525252",
        "700": "#404040",
        "800": "#262626",
        "900": "#171717"
      },
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    };

    const typography: Typography = data.typography || {
      fontFamily: {
        heading: "Inter",
        body: "Open Sans",
        mono: "Fira Code"
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    };

    const spacing = data.spacing || {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem",
      "3xl": "4rem"
    };

    const components = this.generateComponentStyles(colorPalette, typography);
    const animations = this.generateAnimations();

    return {
      colorPalette,
      colors: {
        primary: colorPalette.primary,
        secondary: colorPalette.secondary,
        accent: colorPalette.accent,
        neutral: colorPalette.neutral,
        success: colorPalette.success,
        warning: colorPalette.warning,
        error: colorPalette.error,
        info: colorPalette.info
      },
      typography: {
        ...typography,
        headingFont: typography.fontFamily.heading,
        bodyFont: typography.fontFamily.body
      },
      spacing,
      layout: {
        maxWidth: "1280px",
        containerPadding: "1rem"
      },
      components,
      animations,
      breakpoints: {
        mobile: "640px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1280px"
      }
    };
  }

  private validateDesignSystem(system: DesignSystem): DesignSystem {
    // Return as-is, let AI handle all design decisions
    return system;
  }


  private generateComponentStyles(colors: ColorPalette, typography: Typography): any {
    return {
      button: {
        primary: {
          background: colors.primary,
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: typography.fontWeight.semibold
        },
        secondary: {
          background: "transparent",
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          padding: "10px 22px",
          borderRadius: "8px",
          fontWeight: typography.fontWeight.semibold
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
        fontSize: typography.fontSize.base
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