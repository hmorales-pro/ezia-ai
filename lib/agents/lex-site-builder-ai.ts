import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, DesignSystem, GeneratedHTML } from "@/types/agents";

export class LexSiteBuilderAIAgent extends AIBaseAgent {
  private hfToken: string;
  
  constructor() {
    super({
      name: "Lex",
      role: "Site Structure and HTML Builder with GLM-4.5",
      capabilities: [
        "Building complete multi-section websites",
        "Using GLM-4.5 for code generation",
        "Coordinating with Mistral agents",
        "Creating responsive designs",
        "Implementing interactive features",
        "Optimizing for performance and SEO"
      ],
      temperature: 0.7,
      maxTokens: 8000
    });
    
    // Get HuggingFace token for GLM-4.5
    const token = process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;
    if (!token) {
      throw new Error("HuggingFace token not found for GLM-4.5");
    }
    this.hfToken = token;
  }

  protected getDefaultSystemPrompt(): string {
    return `You are Lex, an expert fullstack web developer and the lead builder in the Ezia multi-agent system.
    
Your role is to:
1. Take input from other agents (Site Architect, Kiko Design, Milo Copywriting)
2. Build complete, production-ready websites using GLM-4.5
3. Ensure all sections are fully implemented with real content
4. Create responsive, modern designs with smooth animations
5. Implement all interactive features and forms
6. Optimize for performance and SEO

You work with:
- Site Architect: Provides the structure and sections needed
- Kiko: Provides the design system and visual style
- Milo: Provides the content and copywriting

Your output must be a complete HTML file with embedded CSS and JavaScript, ready for deployment.`;
  }

  async buildSite(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): Promise<GeneratedHTML> {
    this.log("Starting site generation with GLM-4.5...");
    
    try {
      // Generate the complete website using GLM-4.5
      const html = await this.generateWebsiteWithGLM45({
        structure,
        designSystem,
        content,
        businessContext: {
          name: structure.businessName,
          industry: structure.industry,
          description: structure.description
        }
      });

      return {
        html,
        sections: structure.sections,
        metadata: structure.metadata,
      };
    } catch (error) {
      this.log(`GLM-4.5 generation failed, falling back to template approach: ${error}`);
      // Fallback to template-based generation
      return this.generateWithTemplates(structure, designSystem, content);
    }
  }

  private async generateWebsiteWithGLM45(context: {
    structure: SiteStructure;
    designSystem: DesignSystem;
    content: Record<string, any>;
    businessContext: any;
  }): Promise<string> {
    const { structure, designSystem, content, businessContext } = context;
    
    // Build a comprehensive prompt with all agent inputs
    const systemPrompt = `You are an expert fullstack web developer building a complete website.
Use the provided structure, design system, and content to create a production-ready website.
The website must be fully responsive, modern, and include all requested sections with substantial content.`;

    const userPrompt = `Create a complete website for ${businessContext.name} (${businessContext.industry} industry).

STRUCTURE PROVIDED BY SITE ARCHITECT:
${JSON.stringify(structure, null, 2)}

DESIGN SYSTEM PROVIDED BY KIKO:
Colors: ${JSON.stringify(designSystem.colors)}
Typography: ${JSON.stringify(designSystem.typography)}
Layout style: ${designSystem.layout.style}

CONTENT PROVIDED BY MILO:
${JSON.stringify(content, null, 2)}

REQUIREMENTS:
1. Create a complete HTML5 document
2. Include ALL sections from the structure with full content
3. Use the exact colors and typography from the design system
4. Make it fully responsive (mobile-first)
5. Add smooth animations and transitions
6. Include interactive JavaScript for:
   - Smooth scrolling navigation
   - Mobile menu toggle
   - Form validation
   - Any interactive elements
7. SEO optimization with proper meta tags
8. Professional footer with all links

Generate the complete HTML with all CSS and JavaScript embedded. Each section must have substantial, relevant content - no placeholders!`;

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "zai-org/GLM-4.5:novita",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: userPrompt
              }
            ],
            max_tokens: 12000,
            temperature: 0.7,
            stream: false
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GLM-4.5 API error: ${error}`);
      }

      const result = await response.json();
      const generatedContent = result.choices[0].message.content;
      
      // Extract and clean HTML
      return this.extractAndCleanHTML(generatedContent);
      
    } catch (error) {
      this.log(`Error with GLM-4.5 generation: ${error}`);
      throw error;
    }
  }

  private extractAndCleanHTML(content: string): string {
    // Start with the content
    let html = content;
    
    // Find the DOCTYPE declaration
    const docTypeIndex = html.indexOf("<!DOCTYPE");
    if (docTypeIndex > 0) {
      html = html.substring(docTypeIndex);
    }
    
    // Ensure proper start
    if (!html.startsWith("<!DOCTYPE")) {
      html = "<!DOCTYPE html>\n" + html;
    }
    
    // Clean any trailing content after </html>
    const htmlEndIndex = html.lastIndexOf("</html>");
    if (htmlEndIndex > 0) {
      html = html.substring(0, htmlEndIndex + 7);
    }
    
    // Ensure the HTML is complete
    if (!html.includes("</html>")) {
      html += "\n</body>\n</html>";
    }
    
    return html;
  }

  private generateWithTemplates(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): GeneratedHTML {
    this.log("Using template-based fallback generation...");
    
    // Generate CSS from design system
    const css = this.generateCSS(designSystem);
    
    // Build sections
    const sectionHtml = structure.sections
      .map(section => this.generateSectionTemplate(section, designSystem, content[section.id]))
      .join('\n');
    
    // Build navigation
    const navHtml = this.generateNavigationTemplate(structure.navigation, designSystem);
    
    // Build footer
    const footerHtml = this.generateFooterTemplate(structure.businessName, designSystem);
    
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.metadata.title}</title>
    <meta name="description" content="${structure.metadata.description}">
    <meta name="keywords" content="${structure.metadata.keywords.join(", ")}">
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        ${css}
    </style>
</head>
<body>
    ${navHtml}
    <main>
        ${sectionHtml}
    </main>
    ${footerHtml}
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Merci pour votre message ! Nous vous contacterons bientôt.');
                form.reset();
            });
        });
    </script>
</body>
</html>`;

    return {
      html,
      sections: structure.sections,
      metadata: structure.metadata
    };
  }

  private generateCSS(designSystem: DesignSystem): string {
    // Ensure design system has all required properties with defaults
    const safeDesignSystem = this.ensureDesignSystemComplete(designSystem);
    const { colors, typography, spacing, animations } = safeDesignSystem;
    
    return `
        /* CSS Variables */
        :root {
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
            --color-accent: ${colors.accent};
            --color-background: ${colors.background};
            --color-surface: ${colors.surface};
            --color-text: ${colors.text};
            --color-text-light: ${colors.textLight};
            
            --font-heading: ${typography.headingFont};
            --font-body: ${typography.bodyFont};
            
            --spacing-xs: ${spacing.xs};
            --spacing-sm: ${spacing.sm};
            --spacing-md: ${spacing.md};
            --spacing-lg: ${spacing.lg};
            --spacing-xl: ${spacing.xl};
        }
        
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-body);
            font-size: ${typography.baseSize};
            line-height: ${typography.lineHeight};
            color: var(--color-text);
            background-color: var(--color-background);
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            font-weight: ${typography.headingWeight};
            line-height: 1.2;
            margin-bottom: var(--spacing-md);
        }
        
        h1 { font-size: ${typography.scale.h1}; }
        h2 { font-size: ${typography.scale.h2}; }
        h3 { font-size: ${typography.scale.h3}; }
        h4 { font-size: ${typography.scale.h4}; }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--spacing-md);
        }
        
        .section {
            padding: var(--spacing-xl) 0;
        }
        
        /* Buttons */
        .btn {
            display: inline-block;
            padding: var(--spacing-sm) var(--spacing-lg);
            background-color: var(--color-primary);
            color: white;
            text-decoration: none;
            border-radius: ${designSystem.borderRadius.md};
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            background-color: var(--color-secondary);
            transform: translateY(-2px);
            box-shadow: ${designSystem.shadows.md};
        }
        
        .btn-secondary {
            background-color: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
        }
        
        .btn-secondary:hover {
            background-color: var(--color-primary);
            color: white;
        }
        
        /* Cards */
        .card {
            background: var(--color-surface);
            border-radius: ${designSystem.borderRadius.lg};
            padding: var(--spacing-lg);
            box-shadow: ${designSystem.shadows.sm};
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: ${designSystem.shadows.lg};
        }
        
        /* Forms */
        .form-input {
            width: 100%;
            padding: var(--spacing-sm);
            border: 2px solid #e0e0e0;
            border-radius: ${designSystem.borderRadius.sm};
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--color-primary);
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translateX(-30px);
            }
            to { 
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .animate-fadeIn {
            animation: fadeIn ${animations.duration} ${animations.easing};
        }
        
        .animate-slideUp {
            animation: slideUp ${animations.duration} ${animations.easing};
        }
        
        .animate-slideIn {
            animation: slideIn ${animations.duration} ${animations.easing};
        }
        
        /* Grid system */
        .grid {
            display: grid;
            gap: var(--spacing-lg);
        }
        
        .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        
        /* Responsive utilities */
        @media (max-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(1, 1fr); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(1, 1fr); }
            .md\\:grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
            .md\\:hidden { display: none; }
        }
        
        @media (min-width: 769px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
            .md\\:flex { display: flex; }
        }
        
        /* Navigation styles */
        nav {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        /* Utility classes */
        .text-center { text-align: center; }
        .text-primary { color: var(--color-primary); }
        .text-secondary { color: var(--color-secondary); }
        .bg-primary { background-color: var(--color-primary); }
        .bg-secondary { background-color: var(--color-secondary); }
        .hidden { display: none; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .gap-4 { gap: var(--spacing-md); }
        .mb-4 { margin-bottom: var(--spacing-md); }
        .mb-8 { margin-bottom: var(--spacing-xl); }
    `;
  }

  private generateNavigationTemplate(navItems: any[], designSystem: DesignSystem): string {
    return `
    <nav>
        <div class="container">
            <div class="flex justify-between items-center" style="height: 70px;">
                <div class="flex items-center">
                    <span class="text-2xl font-bold text-primary">Logo</span>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center gap-4">
                    ${navItems.map(item => `
                        <a href="${item.href}" class="nav-link">${item.label}</a>
                    `).join('')}
                    <a href="#contact" class="btn">Contact</a>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
            
            <!-- Mobile Navigation -->
            <div id="mobile-menu" class="hidden">
                ${navItems.map(item => `
                    <a href="${item.href}" class="block py-2">${item.label}</a>
                `).join('')}
                <a href="#contact" class="btn w-full mt-4">Contact</a>
            </div>
        </div>
    </nav>`;
  }

  private generateSectionTemplate(section: any, designSystem: DesignSystem, content: any): string {
    // Implementation would generate appropriate HTML for each section type
    // This is simplified for brevity
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-8">${section.title}</h2>
            <div>
                ${JSON.stringify(content || section.content)}
            </div>
        </div>
    </section>`;
  }

  private generateFooterTemplate(businessName: string, designSystem: DesignSystem): string {
    return `
    <footer style="background: var(--color-text); color: white; padding: var(--spacing-xl) 0;">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div>
                    <h3>${businessName}</h3>
                    <p style="color: rgba(255,255,255,0.8);">Votre partenaire de confiance.</p>
                </div>
                <div>
                    <h4>Liens rapides</h4>
                    <ul style="list-style: none;">
                        <li><a href="#services" style="color: rgba(255,255,255,0.8);">Services</a></li>
                        <li><a href="#about" style="color: rgba(255,255,255,0.8);">À propos</a></li>
                        <li><a href="#contact" style="color: rgba(255,255,255,0.8);">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Légal</h4>
                    <ul style="list-style: none;">
                        <li><a href="#" style="color: rgba(255,255,255,0.8);">Mentions légales</a></li>
                        <li><a href="#" style="color: rgba(255,255,255,0.8);">CGV</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Suivez-nous</h4>
                    <div class="flex gap-4">
                        <a href="#" style="color: white;"><i class="fab fa-facebook text-xl"></i></a>
                        <a href="#" style="color: white;"><i class="fab fa-instagram text-xl"></i></a>
                        <a href="#" style="color: white;"><i class="fab fa-linkedin text-xl"></i></a>
                    </div>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: var(--spacing-lg); text-align: center;">
                <p>&copy; 2024 ${businessName}. Tous droits réservés. | Propulsé par Ezia Multi-Agent System avec GLM-4.5</p>
            </div>
        </div>
    </footer>`;
  }

  private ensureDesignSystemComplete(partial: Partial<DesignSystem>): DesignSystem {
    return {
      colors: {
        primary: "#8B4513",
        secondary: "#D2B48C",
        accent: "#CD853F",
        background: "#FFFFFF",
        surface: "#F8F8F8",
        text: "#333333",
        textLight: "#666666",
        ...partial.colors
      },
      typography: {
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Inter', sans-serif",
        baseSize: "16px",
        scale: {
          h1: "2.5rem",
          h2: "2rem",
          h3: "1.75rem",
          h4: "1.5rem",
          h5: "1.25rem",
          h6: "1rem"
        },
        lineHeight: "1.6",
        headingWeight: "700",
        bodyWeight: "400",
        ...(partial.typography || {}),
        scale: {
          h1: "2.5rem",
          h2: "2rem",
          h3: "1.75rem",
          h4: "1.5rem",
          h5: "1.25rem",
          h6: "1rem",
          ...(partial.typography?.scale || {})
        }
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        xxl: "3rem",
        ...partial.spacing
      },
      layout: {
        maxWidth: "1200px",
        gridColumns: 12,
        breakpoints: {
          mobile: "640px",
          tablet: "768px",
          desktop: "1024px",
          wide: "1280px"
        },
        style: "modern",
        ...partial.layout
      },
      animations: {
        duration: "0.3s",
        easing: "ease-in-out",
        ...partial.animations
      },
      shadows: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.2)",
        ...partial.shadows
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
        ...partial.borderRadius
      }
    };
  }
}