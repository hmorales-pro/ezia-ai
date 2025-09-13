import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, DesignSystem, GeneratedHTML } from "@/types/agents";

export class LexSiteBuilderAIAgent extends AIBaseAgent {
  constructor() {
    super({
      name: "Lex",
      role: "AI Site Structure and HTML Builder",
      capabilities: [
        "Generate semantic HTML structure",
        "Create responsive layouts",
        "Implement modern web standards",
        "Optimize for SEO and performance",
        "Build interactive components"
      ],
      temperature: 0.3,
      maxTokens: 8000
    });
  }

  protected getDefaultSystemPrompt(): string {
    return `You are Lex, an expert AI web developer and site builder. Your role is to create professional, modern, and responsive HTML websites.

Your expertise includes:
- Semantic HTML5 structure
- Responsive design with mobile-first approach
- Modern CSS with Tailwind-like utility classes
- Accessibility best practices (WCAG compliance)
- SEO optimization
- Performance optimization
- Interactive JavaScript components

When generating HTML:
1. Use semantic HTML5 elements (header, nav, main, section, article, footer)
2. Include proper meta tags for SEO
3. Implement responsive design with breakpoints
4. Add smooth animations and transitions
5. Include interactive features (smooth scroll, mobile menu, form handling)
6. Optimize images with proper alt text
7. Use modern CSS features and utility classes
8. Ensure cross-browser compatibility

Style guidelines:
- Use a consistent color scheme based on the provided design system
- Implement proper spacing and typography
- Create visual hierarchy with font sizes and weights
- Add hover states and transitions for interactive elements
- Use CSS Grid and Flexbox for layouts

Always generate complete, production-ready HTML that looks professional and modern.`;
  }

  async buildSite(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): Promise<GeneratedHTML> {
    try {
      this.log("Starting AI-powered site generation...");

      // Generate the complete HTML site
      const htmlPrompt = `Generate a complete, professional HTML website for ${structure.businessName}.

Business Context:
- Name: ${structure.businessName}
- Industry: ${structure.industry || "general business"}
- Target Audience: ${structure.targetAudience || "general public"}

Site Structure:
${JSON.stringify(structure.sections.map(s => ({ type: s.type, title: s.title })), null, 2)}

Design System:
- Primary Color: ${designSystem.colors.primary}
- Secondary Color: ${designSystem.colors.secondary}
- Font Family: ${designSystem.typography.fontFamily}
- Base Font Size: ${designSystem.typography.baseFontSize}

Content to Include:
${JSON.stringify(content, null, 2)}

Requirements:
1. Create a complete HTML document with all sections
2. Use the exact colors and fonts from the design system
3. Make it fully responsive with mobile menu
4. Include smooth scrolling navigation
5. Add professional animations (fade-in, slide-up)
6. Implement a working contact form
7. Use Font Awesome icons where appropriate
8. Include proper SEO meta tags
9. Add a professional footer with links and social media

The HTML should be modern, professional, and ready for production use. Include inline CSS styles using a utility-class approach similar to Tailwind CSS.`;

      const html = await this.generateWithAI({
        prompt: htmlPrompt,
        context: {
          structure,
          designSystem,
          content
        }
      });

      // Clean and validate the generated HTML
      const cleanedHtml = this.cleanAIOutput(html);

      // Extract metadata for the response
      const metadata = this.extractMetadata(cleanedHtml, structure);

      return {
        html: cleanedHtml,
        sections: structure.sections,
        metadata
      };

    } catch (error) {
      this.log(`AI generation failed, falling back to enhanced template: ${error}`);
      return this.generateEnhancedTemplate(structure, designSystem, content);
    }
  }

  async buildSection(
    section: any,
    designSystem: DesignSystem,
    content: any
  ): Promise<string> {
    const sectionPrompt = `Generate an HTML section for a ${section.type} section.

Section Details:
- Type: ${section.type}
- Title: ${section.title}
- ID: ${section.id}

Design System:
- Primary Color: ${designSystem.colors.primary}
- Secondary Color: ${designSystem.colors.secondary}
- Font: ${designSystem.typography.fontFamily}

Content:
${JSON.stringify(content, null, 2)}

Requirements:
1. Create a semantic HTML section with proper structure
2. Use the design system colors and typography
3. Make it responsive with mobile-first approach
4. Add subtle animations (fade-in, slide-up)
5. Include appropriate icons if needed
6. Ensure proper spacing and visual hierarchy

Generate only the HTML for this section, including inline styles.`;

    try {
      const sectionHtml = await this.generateWithAI({
        prompt: sectionPrompt,
        context: { section, designSystem, content }
      });

      return this.cleanAIOutput(sectionHtml);
    } catch (error) {
      this.log(`Failed to generate section ${section.type}, using fallback`);
      return this.generateSectionFallback(section, designSystem, content);
    }
  }

  private extractMetadata(html: string, structure: SiteStructure): any {
    // Extract title from HTML if present
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : structure.metadata.title;

    // Extract description from meta tag if present
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/);
    const description = descMatch ? descMatch[1] : structure.metadata.description;

    return {
      ...structure.metadata,
      title,
      description
    };
  }

  private generateEnhancedTemplate(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): GeneratedHTML {
    // Enhanced fallback template with dynamic content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.metadata.title}</title>
    <meta name="description" content="${structure.metadata.description}">
    <meta name="keywords" content="${structure.metadata.keywords.join(", ")}">
    
    <!-- Font Imports -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${designSystem.typography.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --color-primary: ${designSystem.colors.primary};
            --color-secondary: ${designSystem.colors.secondary};
            --color-accent: ${designSystem.colors.accent};
            --color-neutral: ${designSystem.colors.neutral};
            --font-family: '${designSystem.typography.fontFamily}', sans-serif;
            --font-size-base: ${designSystem.typography.baseFontSize};
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-family);
            font-size: var(--font-size-base);
            line-height: 1.6;
            color: #333;
        }
        
        /* Utility Classes */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .section {
            padding: 80px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: var(--color-primary);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
            background: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
        }
        
        .btn-secondary:hover {
            background: var(--color-primary);
            color: white;
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
        
        .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slideUp {
            animation: slideUp 0.8s ease-out;
        }
        
        /* Grid System */
        .grid {
            display: grid;
            gap: 2rem;
        }
        
        .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        
        @media (max-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(1, 1fr); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(1, 1fr); }
            .md\\:grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
        }
        
        /* Components */
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        /* Forms */
        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--color-primary);
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        
        h1 { font-size: 3rem; }
        h2 { font-size: 2.5rem; }
        h3 { font-size: 2rem; }
        h4 { font-size: 1.5rem; }
        
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            h2 { font-size: 1.75rem; }
        }
    </style>
</head>
<body>
    ${this.generateNav(structure.navigation, designSystem)}
    <main>
        ${structure.sections.map(section => 
          this.generateSectionFallback(section, designSystem, content[section.id])
        ).join('\n')}
    </main>
    ${this.generateFooter(structure.businessName, designSystem)}
    
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

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Form handler
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Merci pour votre message! Nous vous contacterons bientôt.');
                contactForm.reset();
            });
        }
    </script>
</body>
</html>`;

    return {
      html,
      sections: structure.sections,
      metadata: structure.metadata
    };
  }

  private generateNav(navigation: any[], designSystem: DesignSystem): string {
    return `
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div class="container">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <span class="text-2xl font-bold" style="color: var(--color-primary);">Logo</span>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-8">
                    ${navigation.map(item => `
                        <a href="${item.href}" class="text-gray-700 hover:text-primary transition-colors">
                            ${item.label}
                        </a>
                    `).join('')}
                    <button class="btn">Commencer</button>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden p-2">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
            
            <!-- Mobile Navigation -->
            <div id="mobile-menu" class="hidden md:hidden pb-4">
                ${navigation.map(item => `
                    <a href="${item.href}" class="block py-2 text-gray-700">
                        ${item.label}
                    </a>
                `).join('')}
                <button class="btn w-full mt-4">Commencer</button>
            </div>
        </div>
    </nav>`;
  }

  private generateFooter(businessName: string, designSystem: DesignSystem): string {
    return `
    <footer class="bg-gray-900 text-white py-12">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">${businessName}</h3>
                    <p class="text-gray-400">Votre partenaire de confiance.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Liens rapides</h4>
                    <ul class="space-y-2">
                        <li><a href="#services" class="text-gray-400 hover:text-white">Services</a></li>
                        <li><a href="#about" class="text-gray-400 hover:text-white">À propos</a></li>
                        <li><a href="#contact" class="text-gray-400 hover:text-white">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Légal</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white">Confidentialité</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">Conditions</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Suivez-nous</h4>
                    <div class="flex gap-4">
                        <a href="#" class="text-gray-400 hover:text-white text-xl"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white text-xl"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white text-xl"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white text-xl"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 text-center">
                <p class="text-gray-400">&copy; 2024 ${businessName}. Tous droits réservés. | Propulsé par Ezia AI</p>
            </div>
        </div>
    </footer>`;
  }

  private generateSectionFallback(section: any, designSystem: DesignSystem, content: any): string {
    const sectionTypes: Record<string, () => string> = {
      hero: () => `
        <section id="${section.id}" class="section relative min-h-screen flex items-center justify-center" style="padding-top: 80px; background: linear-gradient(135deg, ${designSystem.colors.primary}20 0%, ${designSystem.colors.secondary}20 100%);">
            <div class="container text-center">
                <h1 class="animate-fadeIn mb-4">${content?.headline || section.title}</h1>
                <p class="text-xl text-gray-600 mb-8 animate-slideUp" style="animation-delay: 0.2s;">
                    ${content?.subheadline || 'Découvrez nos solutions innovantes'}
                </p>
                <div class="flex gap-4 justify-center animate-slideUp" style="animation-delay: 0.4s;">
                    <a href="#contact" class="btn">
                        ${content?.cta || 'Commencer'} <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                    <a href="#services" class="btn-secondary">En savoir plus</a>
                </div>
            </div>
        </section>`,
      
      services: () => `
        <section id="${section.id}" class="section bg-gray-50">
            <div class="container">
                <h2 class="text-center mb-12">${section.title}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${(content?.items || []).map((item: any, i: number) => `
                        <div class="card animate-slideUp" style="animation-delay: ${i * 0.1}s;">
                            <div class="text-center">
                                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${designSystem.colors.primary}20;">
                                    <i class="fas fa-star text-2xl" style="color: ${designSystem.colors.primary};"></i>
                                </div>
                                <h3 class="text-xl font-semibold mb-3">${item.name}</h3>
                                <p class="text-gray-600">${item.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>`,
      
      contact: () => `
        <section id="${section.id}" class="section" style="background-color: ${designSystem.colors.neutral};">
            <div class="container">
                <h2 class="text-center mb-12" style="color: white;">${section.title}</h2>
                <div class="max-w-2xl mx-auto">
                    <form id="contact-form" class="bg-white p-8 rounded-lg shadow-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Nom</label>
                                <input type="text" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Email</label>
                                <input type="email" class="form-input" required>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-2">Message</label>
                            <textarea class="form-input" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn w-full">Envoyer</button>
                    </form>
                </div>
            </div>
        </section>`
    };

    const generator = sectionTypes[section.type] || (() => `
        <section id="${section.id}" class="section">
            <div class="container">
                <h2 class="text-center mb-12">${section.title}</h2>
                <div class="max-w-4xl mx-auto text-center">
                    <p class="text-lg text-gray-600">
                        ${JSON.stringify(content || {})}
                    </p>
                </div>
            </div>
        </section>
    `);

    return generator();
  }
}