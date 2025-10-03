import { AIBaseAgent } from "./ai-base-agent";
import { SiteStructure, DesignSystem, GeneratedHTML } from "@/types/agents";
import { AIResponseValidator } from "./validators/ai-response-validator";
import { DeepSeekCodeAgent } from "./deepseek-code-agent";

/**
 * Enhanced Lex Site Builder with DeepSeek integration
 * Now uses DeepSeek V3 for superior code generation at lower cost
 */
export class LexSiteBuilderEnhanced extends AIBaseAgent {
  private deepseek: DeepSeekCodeAgent;

  constructor() {
    super({
      name: "Lex",
      role: "Enhanced Site Builder with DeepSeek V3",
      capabilities: [
        "Building complete multi-section websites",
        "Using DeepSeek V3 for code generation",
        "Proper HTML rendering from JSON content",
        "Creating responsive designs",
        "Implementing interactive features",
        "Optimizing for performance and SEO"
      ],
      temperature: 0.3,
      maxTokens: 8000
    });

    this.deepseek = new DeepSeekCodeAgent();
  }

  protected getDefaultSystemPrompt(): string {
    return `You are Lex, an expert fullstack web developer and the lead builder in the Ezia multi-agent system.

Your role is to:
1. Coordinate with DeepSeek V3 to generate complete, production-ready HTML
2. Create visually stunning websites with modern CSS and JavaScript
3. Ensure all content is properly rendered (never show raw JSON)
4. Implement responsive designs with smooth animations
5. Generate semantic HTML5 with accessibility in mind
6. Include all interactive features and forms`;
  }

  async buildSite(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): Promise<GeneratedHTML> {
    this.log("Starting enhanced site generation...");
    
    // Validate inputs
    const structureValidation = AIResponseValidator.validateSiteStructure(structure);
    if (!structureValidation.isValid) {
      throw new Error(`Invalid site structure: ${structureValidation.errors.join(', ')}`);
    }
    
    const designValidation = AIResponseValidator.validateDesignSystem(designSystem);
    if (!designValidation.isValid) {
      this.log(`Design system validation failed: ${designValidation.errors.join(', ')}`);
      // Request AI to complete the design system
      designSystem = await this.requestCompleteDesignSystem(designSystem, designValidation);
    }
    
    let lastError: Error | null = null;
    let generatedHTML: GeneratedHTML | null = null;

    // Try generation with DeepSeek V3
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.log(`Attempting DeepSeek V3 generation (attempt ${attempt}/3)...`);

        const html = await this.deepseek.generateWebsite({
          structure,
          designSystem,
          content
        });

        // Validate the generated HTML
        const htmlValidation = AIResponseValidator.validateHTML(html);
        if (!htmlValidation.isValid) {
          throw new Error(`HTML validation failed: ${htmlValidation.errors.join(', ')}`);
        }

        generatedHTML = {
          html,
          sections: structure.sections,
          metadata: structure.metadata,
        };
        break;
      } catch (error) {
        lastError = error as Error;
        this.log(`DeepSeek generation attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    // If DeepSeek failed, try with AI-assisted template generation
    if (!generatedHTML) {
      this.log("DeepSeek failed after 3 attempts, using AI-assisted template generation...");

      try {
        generatedHTML = await this.generateAIAssistedHTML(structure, designSystem, content);
      } catch (templateError) {
        this.log(`AI-assisted template generation also failed: ${templateError}`);
        throw new Error(
          `Failed to generate website after multiple attempts. ` +
          `Last error: ${lastError?.message || 'Unknown error'}. ` +
          `Please check AI service availability.`
        );
      }
    }

    return generatedHTML;
  }

  private generateEnhancedHTML(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): GeneratedHTML {
    this.log("Using enhanced template generation...");
    
    const css = this.generateEnhancedCSS(designSystem);
    const navHtml = this.generateEnhancedNavigation(structure.navigation, designSystem, structure.businessName);
    const sectionsHtml = structure.sections
      .map(section => this.generateEnhancedSection(section, designSystem, content[section.id]))
      .join('\n');
    const footerHtml = this.generateEnhancedFooter(structure.businessName, designSystem);
    
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.metadata.title}</title>
    <meta name="description" content="${structure.metadata.description}">
    <meta name="keywords" content="${structure.metadata.keywords.join(", ")}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>${css}</style>
</head>
<body>
    ${navHtml}
    <main>
        ${sectionsHtml}
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

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            });
        }

        // Form handling
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                console.log('Form submitted:', Object.fromEntries(formData));
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = 'Merci ! Nous vous contacterons bientôt.';
                form.appendChild(successMsg);
                
                // Reset form
                setTimeout(() => {
                    form.reset();
                    successMsg.remove();
                }, 3000);
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
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

  private generateEnhancedSection(section: any, designSystem: DesignSystem, content: any): string {
    // Map section types to specific generators
    const sectionGenerators: Record<string, () => string> = {
      hero: () => this.generateHeroSection(section, content, designSystem),
      services: () => this.generateServicesSection(section, content, designSystem),
      menu: () => this.generateMenuSection(section, content, designSystem),
      about: () => this.generateAboutSection(section, content, designSystem),
      testimonials: () => this.generateTestimonialsSection(section, content, designSystem),
      gallery: () => this.generateGallerySection(section, content, designSystem),
      contact: () => this.generateContactSection(section, content, designSystem),
      reservation: () => this.generateReservationSection(section, content, designSystem),
      'current-season': () => this.generateSeasonSection(section, content, designSystem),
      'chef-story': () => this.generateChefSection(section, content, designSystem),
      blog: () => this.generateBlogSection(section, content, designSystem)
    };

    const generator = sectionGenerators[section.type] || (() => this.generateDefaultSection(section, content, designSystem));
    return generator();
  }

  private generateHeroSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, subheadline, cta, secondaryCta } = content || {};
    
    return `
    <section id="${section.id}" class="hero-section">
        <div class="hero-background"></div>
        <div class="container hero-content animate-on-scroll">
            <h1 class="hero-headline">${headline || section.title}</h1>
            ${subheadline ? `<p class="hero-subheadline">${subheadline}</p>` : ''}
            <div class="hero-buttons">
                ${cta ? `<a href="#reservation" class="btn btn-primary">${cta}</a>` : ''}
                ${secondaryCta ? `<a href="#menu" class="btn btn-secondary">${secondaryCta}</a>` : ''}
            </div>
        </div>
        <div class="hero-scroll-indicator">
            <i class="fas fa-chevron-down"></i>
        </div>
    </section>`;
  }

  private generateServicesSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, items } = content || {};
    const serviceItems = items || [];
    
    return `
    <section id="${section.id}" class="services-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title}</h2>
            <div class="services-grid">
                ${serviceItems.map((item: any, index: number) => `
                    <div class="service-card animate-on-scroll" style="animation-delay: ${index * 0.1}s">
                        <div class="service-icon">
                            <i class="fas ${this.getServiceIcon(item.name || item.title)}"></i>
                        </div>
                        <h3>${item.name || item.title}</h3>
                        <p>${item.description || item.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateMenuSection(section: any, content: any, designSystem: DesignSystem): string {
    const { categories, items, headline } = content || {};
    const menuCategories = categories || [];
    const menuItems = items || [];
    
    return `
    <section id="${section.id}" class="menu-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title}</h2>
            <div class="menu-filters animate-on-scroll">
                ${menuCategories.map((cat: string, i: number) => `
                    <button class="menu-filter ${i === 0 ? 'active' : ''}" data-category="${cat.toLowerCase()}">${cat}</button>
                `).join('')}
            </div>
            <div class="menu-grid">
                ${menuItems.map((item: any, index: number) => `
                    <div class="menu-item animate-on-scroll" data-category="${item.category || 'plats'}" style="animation-delay: ${index * 0.05}s">
                        <div class="menu-item-header">
                            <h3>${item.name}</h3>
                            <span class="menu-price">${item.price || '€€'}</span>
                        </div>
                        <p class="menu-description">${item.description}</p>
                        ${item.tags ? `
                            <div class="menu-tags">
                                ${item.tags.map((tag: string) => `<span class="menu-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateAboutSection(section: any, content: any, designSystem: DesignSystem): string {
    const { story, mission, values, headline } = content || {};
    
    return `
    <section id="${section.id}" class="about-section section">
        <div class="container">
            <div class="about-grid">
                <div class="about-content animate-on-scroll">
                    <h2 class="section-title">${headline || section.title}</h2>
                    ${story ? `<p class="about-story">${story}</p>` : ''}
                    ${mission ? `
                        <div class="about-highlight">
                            <h3>Notre Mission</h3>
                            <p>${mission}</p>
                        </div>
                    ` : ''}
                    ${values ? `
                        <div class="about-values">
                            <h3>Nos Valeurs</h3>
                            <ul>
                                ${values.map((value: string) => `<li>${value}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="about-image animate-on-scroll">
                    ${content?.image ? `<img src="${content.image}" alt="${section.title}" />` : ''}
                </div>
            </div>
        </div>
    </section>`;
  }

  private generateContactSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, address, phone, email, hours } = content || {};
    
    return `
    <section id="${section.id}" class="contact-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title}</h2>
            <div class="contact-grid">
                <div class="contact-form-wrapper animate-on-scroll">
                    <form class="contact-form">
                        <div class="form-group">
                            <label for="name">Nom</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" name="message" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Envoyer</button>
                    </form>
                </div>
                <div class="contact-info animate-on-scroll">
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <h3>Adresse</h3>
                            <p>${address || ''}</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <h3>Téléphone</h3>
                            <p>${phone || ''}</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <h3>Email</h3>
                            <p>${email || ''}</p>
                        </div>
                    </div>
                    ${hours ? `
                        <div class="contact-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <h3>Horaires</h3>
                                <p>${hours}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </section>`;
  }

  // Helper methods continue...
  private generateTestimonialsSection(section: any, content: any, designSystem: DesignSystem): string {
    const { items, headline } = content || {};
    if (!items || items.length === 0) {
      // Let AI handle missing content - don't provide fallbacks
      return `
    <section id="${section.id}" class="testimonials-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title}</h2>
            <p class="section-subtitle">Témoignages à venir...</p>
        </div>
    </section>`;
    }
    const testimonials = items;
    
    return `
    <section id="${section.id}" class="testimonials-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title}</h2>
            <div class="testimonials-grid">
                ${testimonials.map((item: any, index: number) => `
                    <div class="testimonial-card animate-on-scroll" style="animation-delay: ${index * 0.1}s">
                        <div class="testimonial-stars">
                            ${Array.from({length: item.rating || 5}, () => '<i class="fas fa-star"></i>').join('')}
                        </div>
                        <p class="testimonial-text">"${item.text}"</p>
                        <p class="testimonial-author">— ${item.author}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateGallerySection(section: any, content: any, designSystem: DesignSystem): string {
    const { images } = content || {};
    if (!images || images.length === 0) {
      // Let AI handle missing gallery images
      return `
    <section id="${section.id}" class="gallery-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${section.title}</h2>
            <p class="section-subtitle">Galerie en cours de création...</p>
        </div>
    </section>`;
    }
    
    return `
    <section id="${section.id}" class="gallery-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${section.title}</h2>
            <div class="gallery-grid">
                ${images.map((img, index) => `
                    <div class="gallery-item animate-on-scroll" style="animation-delay: ${index * 0.05}s">
                        <img src="${img}" alt="Gallery image ${index + 1}" loading="lazy">
                        <div class="gallery-overlay">
                            <i class="fas fa-expand"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateReservationSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, subheadline } = content || {};
    
    return `
    <section id="${section.id}" class="reservation-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || 'Réservez votre table'}</h2>
            ${subheadline ? `<p class="section-subtitle animate-on-scroll">${subheadline}</p>` : ''}
            <form class="reservation-form animate-on-scroll">
                <div class="form-row">
                    <div class="form-group">
                        <label for="res-date">Date</label>
                        <input type="date" id="res-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="res-time">Heure</label>
                        <select id="res-time" name="time" required>
                            <option value="">Sélectionner</option>
                            <option value="19:00">19:00</option>
                            <option value="19:30">19:30</option>
                            <option value="20:00">20:00</option>
                            <option value="20:30">20:30</option>
                            <option value="21:00">21:00</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="res-guests">Nombre de personnes</label>
                        <select id="res-guests" name="guests" required>
                            <option value="">Sélectionner</option>
                            ${Array.from({length: 8}, (_, i) => `<option value="${i+1}">${i+1} ${i === 0 ? 'personne' : 'personnes'}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-large">Réserver maintenant</button>
            </form>
        </div>
    </section>`;
  }

  private generateSeasonSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, content: seasonContent, features } = content || {};
    
    return `
    <section id="${section.id}" class="season-section section">
        <div class="season-background"></div>
        <div class="container">
            <div class="season-content animate-on-scroll">
                <span class="season-label">Saison actuelle</span>
                <h2 class="section-title">${headline || 'Menu d\'Automne'}</h2>
                <p class="season-description">${seasonContent || 'Découvrez notre menu saisonnier inspiré des meilleurs produits du moment.'}</p>
                ${features ? `
                    <div class="season-features">
                        ${features.map((feature: string) => `
                            <div class="season-feature">
                                <i class="fas fa-check"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <a href="#menu" class="btn btn-primary">Explorer le menu</a>
            </div>
        </div>
    </section>`;
  }

  private generateChefSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, story, philosophy, signature } = content || {};
    
    return `
    <section id="${section.id}" class="chef-section section">
        <div class="container">
            <div class="chef-grid">
                <div class="chef-image animate-on-scroll">
                    ${content?.image ? `<img src="${content.image}" alt="Notre Chef" />` : ''}
                </div>
                <div class="chef-content animate-on-scroll">
                    <h2 class="section-title">${headline || 'Notre Chef'}</h2>
                    ${story ? `<p class="chef-story">${story}</p>` : ''}
                    ${philosophy ? `
                        <blockquote class="chef-philosophy">
                            <p>"${philosophy}"</p>
                        </blockquote>
                    ` : ''}
                    ${signature ? `
                        <div class="chef-signature">
                            <h3>Plat Signature</h3>
                            <p>${signature}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </section>`;
  }

  private generateBlogSection(section: any, content: any, designSystem: DesignSystem): string {
    const { headline, subheadline, articles, showLatestPosts } = content || {};
    const displayCount = showLatestPosts || 3;
    const blogArticles = articles || [];

    return `
    <section id="${section.id}" class="blog-section section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${headline || section.title || 'Notre Blog'}</h2>
            ${subheadline ? `<p class="section-subtitle animate-on-scroll">${subheadline}</p>` : ''}

            <div class="blog-grid">
                ${blogArticles.length > 0 ? blogArticles.slice(0, displayCount).map((article: any, index: number) => `
                    <article class="blog-card animate-on-scroll" style="animation-delay: ${index * 0.1}s">
                        ${article.image ? `
                            <div class="blog-card-image">
                                <img src="${article.image}" alt="${article.title}" loading="lazy">
                            </div>
                        ` : ''}
                        <div class="blog-card-content">
                            <div class="blog-card-meta">
                                <span class="blog-date">${article.publishedAt || article.date || new Date().toLocaleDateString('fr-FR')}</span>
                                ${article.readTime ? `<span class="blog-read-time"><i class="fas fa-clock"></i> ${article.readTime} min</span>` : ''}
                            </div>
                            <h3 class="blog-card-title">${article.title}</h3>
                            <p class="blog-card-excerpt">${article.excerpt || article.description || ''}</p>
                            ${article.tags && article.tags.length > 0 ? `
                                <div class="blog-card-tags">
                                    ${article.tags.slice(0, 3).map((tag: string) => `<span class="blog-tag">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                            <a href="/blog/${article.slug || '#'}" class="blog-card-link">
                                Lire l'article <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </article>
                `).join('') : `
                    <div class="blog-placeholder">
                        <i class="fas fa-blog"></i>
                        <p>Les premiers articles arrivent bientôt...</p>
                    </div>
                `}
            </div>

            ${blogArticles.length > displayCount ? `
                <div class="blog-cta">
                    <a href="/blog" class="btn btn-primary">Voir tous les articles</a>
                </div>
            ` : ''}
        </div>
    </section>`;
  }

  private generateDefaultSection(section: any, content: any, designSystem: DesignSystem): string {
    // Handle any content type gracefully
    let contentHtml = '';

    if (typeof content === 'object' && content !== null) {
      if (content.headline) {
        contentHtml += `<h3>${content.headline}</h3>`;
      }
      if (content.content) {
        contentHtml += `<p>${content.content}</p>`;
      }
      if (content.items && Array.isArray(content.items)) {
        contentHtml += '<div class="items-grid">';
        content.items.forEach((item: any) => {
          contentHtml += `
            <div class="item-card">
              ${item.title ? `<h4>${item.title}</h4>` : ''}
              ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
          `;
        });
        contentHtml += '</div>';
      }
      if (content.cta) {
        contentHtml += `<a href="#contact" class="btn btn-primary">${content.cta}</a>`;
      }
    } else if (content) {
      contentHtml = `<p>${content}</p>`;
    }

    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="section-title animate-on-scroll">${section.title}</h2>
            <div class="section-content animate-on-scroll">
                ${contentHtml}
            </div>
        </div>
    </section>`;
  }

  private generateEnhancedNavigation(navItems: any[], designSystem: DesignSystem, businessName: string): string {
    return `
    <nav class="navbar">
        <div class="container">
            <div class="navbar-content">
                <a href="#" class="navbar-brand">
                    <span class="brand-name">${businessName}</span>
                </a>
                
                <ul class="navbar-menu" id="mobile-menu">
                    ${navItems.map(item => `
                        <li><a href="${item.href}" class="navbar-link">${item.label}</a></li>
                    `).join('')}
                    <li class="navbar-cta">
                        <a href="#reservation" class="btn btn-primary">Réserver</a>
                    </li>
                </ul>
                
                <button class="navbar-toggle" id="mobile-menu-btn" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </nav>`;
  }

  private generateEnhancedFooter(businessName: string, designSystem: DesignSystem): string {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <h3 class="footer-title">${businessName}</h3>
                    <p>${designSystem.description || ''}</p>
                    <div class="footer-social">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="#about">À propos</a></li>
                        <li><a href="#menu">Menu</a></li>
                        <li><a href="#reservation">Réservation</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Informations</h4>
                    <ul>
                        <li><a href="#">Mentions légales</a></li>
                        <li><a href="#">Politique de confidentialité</a></li>
                        <li><a href="#">CGV</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Newsletter</h4>
                    <p>Inscrivez-vous pour recevoir nos dernières actualités</p>
                    <form class="newsletter-form">
                        <input type="email" placeholder="Votre email" required>
                        <button type="submit" class="btn btn-primary">S'inscrire</button>
                    </form>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 ${businessName}. Tous droits réservés.</p>
                <p class="footer-credit">Propulsé par <strong>Ezia Multi-Agent System</strong> avec DeepSeek V3</p>
            </div>
        </div>
    </footer>`;
  }

  private generateEnhancedCSS(designSystem: DesignSystem): string {
    const { colors, typography, spacing, animations } = designSystem;
    
    return `
        /* Enhanced CSS with proper styling */
        :root {
            /* Colors */
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
            --color-accent: ${colors.accent};
            --color-background: ${colors.background};
            --color-surface: ${colors.surface};
            --color-text: ${colors.text};
            --color-text-light: ${colors.textLight};
            
            /* Typography */
            --font-heading: ${typography.headingFont};
            --font-body: ${typography.bodyFont};
            --font-size-base: ${typography.baseSize};
            --line-height: ${typography.lineHeight};
            
            /* Spacing */
            --spacing-xs: ${spacing.xs};
            --spacing-sm: ${spacing.sm};
            --spacing-md: ${spacing.md};
            --spacing-lg: ${spacing.lg};
            --spacing-xl: ${spacing.xl};
            --spacing-xxl: ${spacing.xxl};
            
            /* Other */
            --transition: all 0.3s ease;
            --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
            --shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
        }
        
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: var(--font-body);
            font-size: var(--font-size-base);
            line-height: var(--line-height);
            color: var(--color-text);
            background-color: var(--color-background);
            overflow-x: hidden;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            font-weight: ${typography.headingWeight};
            line-height: 1.2;
            margin-bottom: var(--spacing-md);
            color: var(--color-text);
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
            padding: var(--spacing-xxl) 0;
            position: relative;
        }
        
        /* Buttons */
        .btn {
            display: inline-block;
            padding: var(--spacing-sm) var(--spacing-lg);
            font-weight: 600;
            text-decoration: none;
            border-radius: 50px;
            transition: var(--transition);
            cursor: pointer;
            border: none;
            font-family: var(--font-body);
            font-size: 1rem;
            text-align: center;
        }
        
        .btn-primary {
            background-color: var(--color-primary);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--color-secondary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
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
        
        .btn-large {
            padding: var(--spacing-md) var(--spacing-xl);
            font-size: 1.1rem;
        }
        
        /* Navigation */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-sm);
            z-index: 1000;
            transition: var(--transition);
        }
        
        .navbar-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-md) 0;
        }
        
        .navbar-brand {
            text-decoration: none;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-primary);
            font-family: var(--font-heading);
        }
        
        .navbar-menu {
            display: flex;
            list-style: none;
            align-items: center;
            gap: var(--spacing-lg);
            margin: 0;
            padding: 0;
        }
        
        .navbar-link {
            text-decoration: none;
            color: var(--color-text);
            font-weight: 500;
            transition: var(--transition);
            position: relative;
        }
        
        .navbar-link::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--color-primary);
            transition: width 0.3s ease;
        }
        
        .navbar-link:hover::after {
            width: 100%;
        }
        
        .navbar-toggle {
            display: none;
            flex-direction: column;
            gap: 4px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
        }
        
        .navbar-toggle span {
            width: 25px;
            height: 3px;
            background: var(--color-text);
            transition: var(--transition);
            border-radius: 3px;
        }
        
        .navbar-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .navbar-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .navbar-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        /* Hero Section */
        .hero-section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            position: relative;
        }
        
        .hero-content {
            text-align: center;
            color: white;
            z-index: 2;
        }
        
        .hero-headline {
            font-size: clamp(2.5rem, 5vw, 4rem);
            margin-bottom: var(--spacing-md);
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-subheadline {
            font-size: clamp(1.2rem, 2vw, 1.5rem);
            font-weight: 300;
            margin-bottom: var(--spacing-xl);
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .hero-buttons {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .hero-scroll-indicator {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 1.5rem;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateX(-50%) translateY(0);
            }
            40% {
                transform: translateX(-50%) translateY(-10px);
            }
            60% {
                transform: translateX(-50%) translateY(-5px);
            }
        }
        
        /* Services Section */
        .services-section {
            background: var(--color-surface);
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--spacing-lg);
            margin-top: var(--spacing-xl);
        }
        
        .service-card {
            background: white;
            padding: var(--spacing-xl);
            border-radius: 15px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
        }
        
        .service-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }
        
        .service-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-md);
            background: var(--color-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
        }
        
        /* Menu Section */
        .menu-filters {
            display: flex;
            justify-content: center;
            gap: var(--spacing-sm);
            margin: var(--spacing-xl) 0;
            flex-wrap: wrap;
        }
        
        .menu-filter {
            padding: var(--spacing-sm) var(--spacing-md);
            background: white;
            border: 2px solid var(--color-primary);
            border-radius: 25px;
            color: var(--color-primary);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .menu-filter.active,
        .menu-filter:hover {
            background: var(--color-primary);
            color: white;
        }
        
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: var(--spacing-lg);
        }
        
        .menu-item {
            background: white;
            padding: var(--spacing-lg);
            border-radius: 10px;
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
        }
        
        .menu-item:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }
        
        .menu-item-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: var(--spacing-sm);
        }
        
        .menu-price {
            color: var(--color-primary);
            font-weight: 700;
            font-size: 1.2rem;
        }
        
        .menu-description {
            color: var(--color-text-light);
            line-height: 1.6;
        }
        
        .menu-tags {
            display: flex;
            gap: var(--spacing-xs);
            margin-top: var(--spacing-sm);
            flex-wrap: wrap;
        }
        
        .menu-tag {
            padding: 0.25rem 0.5rem;
            background: var(--color-accent);
            color: white;
            font-size: 0.75rem;
            border-radius: 15px;
            font-weight: 500;
        }
        
        /* About Section */
        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-xl);
            align-items: center;
        }
        
        .about-content h2 {
            margin-bottom: var(--spacing-lg);
        }
        
        .about-story {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: var(--spacing-lg);
            color: var(--color-text-light);
        }
        
        .about-highlight {
            background: var(--color-surface);
            padding: var(--spacing-lg);
            border-radius: 10px;
            margin: var(--spacing-lg) 0;
            border-left: 4px solid var(--color-primary);
        }
        
        .about-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
        }
        
        /* Testimonials */
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--spacing-lg);
            margin-top: var(--spacing-xl);
        }
        
        .testimonial-card {
            background: white;
            padding: var(--spacing-xl);
            border-radius: 10px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            position: relative;
        }
        
        .testimonial-stars {
            color: gold;
            font-size: 1.2rem;
            margin-bottom: var(--spacing-md);
        }
        
        .testimonial-text {
            font-style: italic;
            line-height: 1.8;
            margin-bottom: var(--spacing-md);
            color: var(--color-text-light);
        }
        
        .testimonial-author {
            font-weight: 600;
            color: var(--color-primary);
        }
        
        /* Gallery */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-md);
            margin-top: var(--spacing-xl);
        }
        
        .gallery-item {
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            box-shadow: var(--shadow-sm);
            height: 300px;
            cursor: pointer;
        }
        
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .gallery-item:hover img {
            transform: scale(1.1);
        }
        
        .gallery-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .gallery-item:hover .gallery-overlay {
            opacity: 1;
        }
        
        .gallery-overlay i {
            color: white;
            font-size: 2rem;
        }
        
        /* Contact & Forms */
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-xl);
            margin-top: var(--spacing-xl);
        }
        
        .form-group {
            margin-bottom: var(--spacing-md);
        }
        
        .form-group label {
            display: block;
            margin-bottom: var(--spacing-xs);
            font-weight: 600;
            color: var(--color-text);
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: var(--spacing-sm);
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            font-family: var(--font-body);
            transition: var(--transition);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--color-primary);
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-md);
        }
        
        .contact-item {
            display: flex;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        
        .contact-item i {
            font-size: 1.5rem;
            color: var(--color-primary);
            width: 30px;
        }
        
        /* Reservation Form */
        .reservation-form {
            max-width: 800px;
            margin: var(--spacing-xl) auto 0;
            background: white;
            padding: var(--spacing-xl);
            border-radius: 15px;
            box-shadow: var(--shadow-lg);
        }
        
        /* Season Section */
        .season-section {
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .season-content {
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .season-label {
            display: inline-block;
            padding: var(--spacing-xs) var(--spacing-md);
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
        }
        
        .season-description {
            font-size: 1.2rem;
            max-width: 800px;
            margin: var(--spacing-lg) auto;
            line-height: 1.8;
        }
        
        .season-features {
            display: flex;
            justify-content: center;
            gap: var(--spacing-lg);
            margin: var(--spacing-xl) 0;
            flex-wrap: wrap;
        }
        
        .season-feature {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        /* Blog Section */
        .blog-section {
            background: var(--color-surface);
        }

        .blog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: var(--spacing-xl);
            margin-top: var(--spacing-xl);
        }

        .blog-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
            display: flex;
            flex-direction: column;
        }

        .blog-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }

        .blog-card-image {
            width: 100%;
            height: 220px;
            overflow: hidden;
        }

        .blog-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-card-image img {
            transform: scale(1.05);
        }

        .blog-card-content {
            padding: var(--spacing-lg);
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .blog-card-meta {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
            margin-bottom: var(--spacing-sm);
            font-size: 0.9rem;
            color: var(--color-text-light);
        }

        .blog-date {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .blog-read-time {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .blog-card-title {
            font-size: 1.4rem;
            margin-bottom: var(--spacing-sm);
            line-height: 1.3;
            color: var(--color-text);
        }

        .blog-card-excerpt {
            color: var(--color-text-light);
            line-height: 1.6;
            margin-bottom: var(--spacing-md);
            flex: 1;
        }

        .blog-card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs);
            margin-bottom: var(--spacing-md);
        }

        .blog-tag {
            padding: 0.25rem 0.75rem;
            background: var(--color-surface);
            color: var(--color-primary);
            font-size: 0.85rem;
            border-radius: 20px;
            font-weight: 500;
        }

        .blog-card-link {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs);
            color: var(--color-primary);
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
        }

        .blog-card-link:hover {
            gap: var(--spacing-sm);
        }

        .blog-placeholder {
            grid-column: 1 / -1;
            text-align: center;
            padding: var(--spacing-xxl);
            color: var(--color-text-light);
        }

        .blog-placeholder i {
            font-size: 3rem;
            margin-bottom: var(--spacing-md);
            color: var(--color-primary);
        }

        .blog-cta {
            text-align: center;
            margin-top: var(--spacing-xl);
        }

        /* Footer */
        .footer {
            background: var(--color-text);
            color: white;
            padding: var(--spacing-xxl) 0 var(--spacing-lg);
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
        }
        
        .footer-title {
            color: white;
            margin-bottom: var(--spacing-md);
        }
        
        .footer h4 {
            color: white;
            font-size: 1.1rem;
            margin-bottom: var(--spacing-md);
        }
        
        .footer ul {
            list-style: none;
        }
        
        .footer ul li {
            margin-bottom: var(--spacing-xs);
        }
        
        .footer a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: var(--transition);
        }
        
        .footer a:hover {
            color: white;
        }
        
        .footer-social {
            display: flex;
            gap: var(--spacing-md);
            margin-top: var(--spacing-md);
        }
        
        .footer-social a {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .footer-social a:hover {
            background: var(--color-primary);
        }
        
        .newsletter-form {
            display: flex;
            gap: var(--spacing-sm);
            margin-top: var(--spacing-md);
        }
        
        .newsletter-form input {
            flex: 1;
            padding: var(--spacing-sm);
            border: none;
            border-radius: 5px;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: var(--spacing-lg);
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .footer-credit {
            margin-top: var(--spacing-sm);
            font-size: 0.9rem;
            color: rgba(255,255,255,0.6);
        }
        
        /* Animations */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Success Message */
        .success-message {
            margin-top: var(--spacing-md);
            padding: var(--spacing-md);
            background: var(--color-primary);
            color: white;
            border-radius: 8px;
            text-align: center;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            /* Navigation */
            .navbar-menu {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: var(--spacing-lg);
                box-shadow: var(--shadow-lg);
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            
            .navbar-menu.active {
                transform: translateX(0);
            }
            
            .navbar-toggle {
                display: flex;
            }
            
            .navbar-cta {
                width: 100%;
                margin-top: var(--spacing-md);
            }
            
            .navbar-cta .btn {
                width: 100%;
            }
            
            /* Hero */
            .hero-buttons {
                flex-direction: column;
                width: 100%;
                max-width: 300px;
                margin: 0 auto;
            }
            
            .hero-buttons .btn {
                width: 100%;
            }
            
            /* Grids */
            .about-grid,
            .contact-grid {
                grid-template-columns: 1fr;
            }
            
            .about-image {
                order: -1;
                margin-bottom: var(--spacing-lg);
            }
            
            .menu-grid {
                grid-template-columns: 1fr;
            }
            
            /* Forms */
            .form-row {
                grid-template-columns: 1fr;
            }
            
            /* Footer */
            .footer-grid {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .footer-social {
                justify-content: center;
            }
            
            .newsletter-form {
                flex-direction: column;
            }
            
            .newsletter-form input,
            .newsletter-form .btn {
                width: 100%;
            }
        }
        
        /* Utility Classes */
        .section-title {
            text-align: center;
            margin-bottom: var(--spacing-lg);
        }
        
        .section-subtitle {
            text-align: center;
            font-size: 1.2rem;
            color: var(--color-text-light);
            max-width: 800px;
            margin: 0 auto var(--spacing-xl);
        }
    `;
  }

  private getServiceIcon(serviceName: string): string {
    // Let AI determine appropriate icons based on service name
    return "fa-circle";
  }

  private extractAndCleanHTML(content: string): string {
    let html = content;
    const docTypeIndex = html.indexOf("<!DOCTYPE");
    if (docTypeIndex > 0) {
      html = html.substring(docTypeIndex);
    }

    if (!html.startsWith("<!DOCTYPE")) {
      html = "<!DOCTYPE html>\n" + html;
    }

    const htmlEndIndex = html.lastIndexOf("</html>");
    if (htmlEndIndex > 0) {
      html = html.substring(0, htmlEndIndex + 7);
    }

    if (!html.includes("</html>")) {
      html += "\n</body>\n</html>";
    }

    return html;
  }

  private ensureDesignSystemComplete(partial: Partial<DesignSystem>): DesignSystem {
    // Return the partial design system as-is, let AI handle missing values
    // This ensures no hardcoded fallbacks
    return partial as DesignSystem;
  }

  private async requestCompleteDesignSystem(
    partial: Partial<DesignSystem>,
    validation: any
  ): Promise<DesignSystem> {
    this.log("Requesting AI to complete design system...");
    
    const prompt = `Complete the missing design system fields based on the validation errors.

Current design system:
${JSON.stringify(partial, null, 2)}

Validation errors:
${validation.errors.join('\n')}

Required corrections:
${validation.suggestions.join('\n')}

Generate a complete design system in JSON format with all required fields properly filled.`;
    
    try {
      const response = await this.generateWithAI({
        prompt,
        formatJson: true,
        maxRetries: 2
      });
      
      const completed = this.parseAIJson(response, partial);
      
      // Validate again
      const revalidation = AIResponseValidator.validateDesignSystem(completed);
      if (!revalidation.isValid) {
        throw new Error(`Completed design system still invalid: ${revalidation.errors.join(', ')}`);
      }
      
      return completed as DesignSystem;
    } catch (error) {
      this.log(`Failed to complete design system: ${error}`);
      throw error;
    }
  }

  private async generateAIAssistedHTML(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): Promise<GeneratedHTML> {
    this.log("Generating HTML with AI assistance...");
    
    // Instead of using hardcoded templates, request AI to generate HTML
    const prompt = `Generate a complete, modern website HTML based on the following specifications.

Business Information:
- Name: ${structure.businessName}
- Industry: ${structure.industry}
- Description: ${structure.description}

Design System:
${JSON.stringify(designSystem, null, 2)}

Sections to include:
${structure.sections.map(s => `- ${s.title} (${s.type})`).join('\n')}

Content for sections:
${JSON.stringify(content, null, 2)}

Requirements:
1. Generate complete, valid HTML5 document
2. Include all sections with proper content
3. Apply the design system colors and typography
4. Make it fully responsive
5. Include smooth animations and interactions
6. Add proper navigation and footer
7. Ensure all content is rendered (no JSON strings in output)

Output ONLY the complete HTML code.`;
    
    try {
      const html = await this.generateWithAI({
        prompt,
        maxRetries: 2
      });
      
      const cleanedHTML = this.extractAndCleanHTML(html);
      
      // Validate the HTML
      const validation = AIResponseValidator.validateHTML(cleanedHTML);
      if (!validation.isValid) {
        throw new Error(`Generated HTML validation failed: ${validation.errors.join(', ')}`);
      }
      
      return {
        html: cleanedHTML,
        sections: structure.sections,
        metadata: structure.metadata
      };
    } catch (error) {
      this.log(`AI-assisted HTML generation failed: ${error}`);
      throw error;
    }
  }
}