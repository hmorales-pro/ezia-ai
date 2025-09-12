import { BaseAgent } from "./base-agent";
import { DesignSystem, ColorPalette, Typography } from "@/types/agents";

export class KikoDesignAgent extends BaseAgent {
  constructor() {
    super("Kiko", "Design System and Visual Identity Specialist");
  }

  async createDesignSystem(input: {
    businessName: string;
    industry: string;
    brandPersonality?: string[];
  }): Promise<DesignSystem> {
    const colorPalette = this.generateColorPalette(input.industry, input.brandPersonality);
    const typography = this.generateTypography(input.industry);
    const spacing = this.generateSpacingSystem();
    const components = this.generateComponentStyles(colorPalette, typography);

    return {
      colorPalette,
      typography,
      spacing,
      components,
      animations: this.generateAnimations(),
      breakpoints: {
        mobile: "640px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1280px",
      },
    };
  }

  private generateColorPalette(industry: string, personality?: string[]): ColorPalette {
    const industryPalettes: Record<string, ColorPalette> = {
      restaurant: {
        primary: "#8B4513", // Saddle Brown
        secondary: "#D2691E", // Chocolate
        accent: "#FF6347", // Tomato
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      "e-commerce": {
        primary: "#4F46E5", // Indigo
        secondary: "#7C3AED", // Purple
        accent: "#EC4899", // Pink
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      consulting: {
        primary: "#1E40AF", // Blue
        secondary: "#0F766E", // Teal
        accent: "#7C2D12", // Brown
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        success: "#059669",
        warning: "#D97706",
        error: "#DC2626",
        info: "#2563EB",
      },
      default: {
        primary: "#3B82F6",
        secondary: "#8B5CF6",
        accent: "#F59E0B",
        neutral: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
    };

    return industryPalettes[industry.toLowerCase()] || industryPalettes.default;
  }

  private generateTypography(industry: string): Typography {
    const industryTypography: Record<string, Typography> = {
      restaurant: {
        fontFamily: {
          heading: "'Playfair Display', serif",
          body: "'Open Sans', sans-serif",
          mono: "'Courier New', monospace",
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
          "5xl": "3rem",
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      "e-commerce": {
        fontFamily: {
          heading: "'Inter', sans-serif",
          body: "'Inter', sans-serif",
          mono: "'JetBrains Mono', monospace",
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
          "5xl": "3rem",
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      consulting: {
        fontFamily: {
          heading: "'Merriweather', serif",
          body: "'Source Sans Pro', sans-serif",
          mono: "'Fira Code', monospace",
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
          "5xl": "3rem",
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      default: {
        fontFamily: {
          heading: "'Poppins', sans-serif",
          body: "'Roboto', sans-serif",
          mono: "'Roboto Mono', monospace",
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
          "5xl": "3rem",
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
    };

    return industryTypography[industry.toLowerCase()] || industryTypography.default;
  }

  private generateSpacingSystem() {
    return {
      0: "0",
      1: "0.25rem",
      2: "0.5rem",
      3: "0.75rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      8: "2rem",
      10: "2.5rem",
      12: "3rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      32: "8rem",
    };
  }

  private generateComponentStyles(colors: ColorPalette, typography: Typography) {
    return {
      button: {
        primary: {
          base: `
            background-color: ${colors.primary};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: ${typography.fontWeight.medium};
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            font-family: ${typography.fontFamily.body};
          `,
          hover: `
            background-color: ${colors.primary}dd;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          `,
        },
        secondary: {
          base: `
            background-color: transparent;
            color: ${colors.primary};
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: ${typography.fontWeight.medium};
            transition: all 0.2s ease;
            border: 2px solid ${colors.primary};
            cursor: pointer;
            font-family: ${typography.fontFamily.body};
          `,
          hover: `
            background-color: ${colors.primary}10;
          `,
        },
      },
      card: {
        base: `
          background-color: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          transition: all 0.2s ease;
        `,
        hover: `
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        `,
      },
      input: {
        base: `
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid ${colors.neutral[300]};
          border-radius: 0.375rem;
          font-family: ${typography.fontFamily.body};
          font-size: ${typography.fontSize.base};
          transition: all 0.2s ease;
          background-color: white;
        `,
        focus: `
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primary}20;
        `,
      },
    };
  }

  private generateAnimations() {
    return {
      fadeIn: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
      slideUp: `
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
      slideIn: `
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `,
    };
  }

  async generateCSS(designSystem: DesignSystem): Promise<string> {
    const { colorPalette, typography, spacing, components, animations } = designSystem;

    return `
/* Design System CSS Generated by Kiko */

/* CSS Reset and Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Root Variables */
:root {
  /* Colors */
  --color-primary: ${colorPalette.primary};
  --color-secondary: ${colorPalette.secondary};
  --color-accent: ${colorPalette.accent};
  --color-success: ${colorPalette.success};
  --color-warning: ${colorPalette.warning};
  --color-error: ${colorPalette.error};
  --color-info: ${colorPalette.info};
  
  /* Neutral Colors */
  ${Object.entries(colorPalette.neutral)
    .map(([key, value]) => `--color-neutral-${key}: ${value};`)
    .join("\n  ")}
  
  /* Typography */
  --font-heading: ${typography.fontFamily.heading};
  --font-body: ${typography.fontFamily.body};
  --font-mono: ${typography.fontFamily.mono};
  
  /* Font Sizes */
  ${Object.entries(typography.fontSize)
    .map(([key, value]) => `--text-${key}: ${value};`)
    .join("\n  ")}
  
  /* Spacing */
  ${Object.entries(spacing)
    .map(([key, value]) => `--space-${key}: ${value};`)
    .join("\n  ")}
}

/* Base Typography */
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: ${typography.lineHeight.normal};
  color: var(--color-neutral-900);
  background-color: var(--color-neutral-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: ${typography.fontWeight.bold};
  line-height: ${typography.lineHeight.tight};
  color: var(--color-neutral-900);
}

h1 { font-size: var(--text-5xl); margin-bottom: var(--space-6); }
h2 { font-size: var(--text-4xl); margin-bottom: var(--space-5); }
h3 { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
h4 { font-size: var(--text-2xl); margin-bottom: var(--space-3); }
h5 { font-size: var(--text-xl); margin-bottom: var(--space-3); }
h6 { font-size: var(--text-lg); margin-bottom: var(--space-2); }

p {
  margin-bottom: var(--space-4);
  line-height: ${typography.lineHeight.relaxed};
}

/* Animations */
${Object.values(animations).join("\n")}

/* Component Styles */

/* Buttons */
.btn {
  ${components.button.primary.base}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn:hover {
  ${components.button.primary.hover}
}

.btn-secondary {
  ${components.button.secondary.base}
}

.btn-secondary:hover {
  ${components.button.secondary.hover}
}

/* Cards */
.card {
  ${components.card.base}
}

.card:hover {
  ${components.card.hover}
}

/* Forms */
.form-input {
  ${components.input.base}
}

.form-input:focus {
  ${components.input.focus}
}

/* Utility Classes */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.section {
  padding: var(--space-16) 0;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }

/* Responsive Design */
@media (min-width: 640px) {
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\\:flex-row { flex-direction: row; }
}

@media (min-width: 768px) {
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\\:text-left { text-align: left; }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Animations */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out;
}
    `;
  }
}