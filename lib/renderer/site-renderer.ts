import { StreamingEvent, SiteTheme, SitePage, Block, SiteAsset, SiteStructure, PhaseStartEvent, PhaseCompleteEvent, CompleteEvent, ErrorEvent } from '../schemas/site-generator';

// Block rendering registry
export interface BlockRenderer {
  name: string;
  render: (block: Block, theme: SiteTheme, customBlocks?: Record<string, any>) => string;
  category: string;
  description?: string;
}

export class SiteRenderer {
  private blocks: Map<string, BlockRenderer> = new Map();
  private customBlocks: Map<string, any> = new Map();
  private cssBuffer: string[] = [];

  constructor() {
    this.registerDefaultBlocks();
  }

  // Register a new block renderer
  registerBlock(name: string, renderer: BlockRenderer) {
    this.blocks.set(name, renderer);
  }

  // Register a custom block spec
  registerCustomBlock(name: string, spec: any) {
    this.customBlocks.set(name, spec);
    
    // Automatically create a renderer for custom blocks
    this.registerBlock(name, {
      name,
      category: spec.category || 'custom',
      description: spec.description,
      render: (block, theme) => this.renderCustomBlock(block, spec)
    });
  }

  // Get all registered blocks
  getBlocks(): BlockRenderer[] {
    return Array.from(this.blocks.values());
  }

  // Render a complete page
  renderPage(page: SitePage, theme: SiteTheme, customBlocks?: Record<string, any>): string {
    const htmlBlocks = page.blocks.map(block => {
      const renderer = this.blocks.get(block.component);
      if (!renderer) {
        console.warn(`No renderer found for block: ${block.component}`);
        return '';
      }
      return renderer.render(block, theme, customBlocks);
    }).filter(Boolean);

    return htmlBlocks.join('\n');
  }

  // Render a complete site
  renderSite(site: SiteStructure): string {
    this.cssBuffer = []; // Reset CSS buffer

    // Collect custom CSS from custom blocks
    if (site.customBlocks) {
      Object.entries(site.customBlocks).forEach(([name, spec]) => {
        if (spec.css) {
          this.cssBuffer.push(`/* Custom block: ${name} */\n${spec.css}\n`);
        }
      });
    }

    // Generate CSS variables from theme
    const cssVariables = this.generateCSSVariables(site.theme);

    // Render homepage
    const homePage = site.pages.find(p => p.id === 'home');
    if (!homePage) {
      throw new Error('Home page not found');
    }

    const content = this.renderPage(homePage, site.theme, site.customBlocks);

    return `<!DOCTYPE html>
<html lang="${site.locale || 'fr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${homePage.title} - ${site.title}</title>
  ${homePage.meta?.description ? `<meta name="description" content="${homePage.meta.description}">` : ''}
  ${homePage.meta?.keywords?.length ? `<meta name="keywords" content="${homePage.meta.keywords.join(', ')}">` : ''}
  
  <style>
    ${cssVariables}
    
    ${this.cssBuffer.join('\n')}
    
    /* Base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body);
      color: var(--color-text);
      background-color: var(--color-background);
      line-height: var(--line-height-normal);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
      margin-bottom: var(--spacing-md);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }
    
    .section {
      padding: var(--spacing-3xl) 0;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 0 var(--spacing-sm);
      }
      
      .section {
        padding: var(--spacing-xl) 0;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }

  // Generate CSS variables from theme
  private generateCSSVariables(theme: SiteTheme): string {
    const { tokens } = theme;
    
    return `
    :root {
      /* Colors */
      --color-primary: ${tokens.colors.primary};
      --color-secondary: ${tokens.colors.secondary};
      --color-accent: ${tokens.colors.accent};
      --color-background: ${tokens.colors.background};
      --color-surface: ${tokens.colors.surface};
      --color-text: ${tokens.colors.text};
      --color-text-secondary: ${tokens.colors.textSecondary};
      --color-border: ${tokens.colors.border};
      --color-error: ${tokens.colors.error};
      --color-success: ${tokens.colors.success};
      --color-warning: ${tokens.colors.warning};
      --color-info: ${tokens.colors.info};
      
      /* Typography */
      --font-heading: ${tokens.typography.fontFamily.heading};
      --font-body: ${tokens.typography.fontFamily.body};
      --font-mono: ${tokens.typography.fontFamily.mono};
      
      --font-size-xs: ${tokens.typography.fontSize.xs};
      --font-size-sm: ${tokens.typography.fontSize.sm};
      --font-size-base: ${tokens.typography.fontSize.base};
      --font-size-lg: ${tokens.typography.fontSize.lg};
      --font-size-xl: ${tokens.typography.fontSize.xl};
      --font-size-2xl: ${tokens.typography.fontSize['2xl']};
      --font-size-3xl: ${tokens.typography.fontSize['3xl']};
      --font-size-4xl: ${tokens.typography.fontSize['4xl']};
      
      --font-weight-light: ${tokens.typography.fontWeight.light};
      --font-weight-normal: ${tokens.typography.fontWeight.normal};
      --font-weight-medium: ${tokens.typography.fontWeight.medium};
      --font-weight-semibold: ${tokens.typography.fontWeight.semibold};
      --font-weight-bold: ${tokens.typography.fontWeight.bold};
      
      --line-height-tight: ${tokens.typography.lineHeight.tight};
      --line-height-normal: ${tokens.typography.lineHeight.normal};
      --line-height-relaxed: ${tokens.typography.lineHeight.relaxed};
      
      /* Spacing */
      --spacing-px: ${tokens.spacing.px};
      --spacing-xs: ${tokens.spacing.xs};
      --spacing-sm: ${tokens.spacing.sm};
      --spacing-md: ${tokens.spacing.md};
      --spacing-lg: ${tokens.spacing.lg};
      --spacing-xl: ${tokens.spacing.xl};
      --spacing-2xl: ${tokens.spacing['2xl']};
      --spacing-3xl: ${tokens.spacing['3xl']};
      --spacing-4xl: ${tokens.spacing['4xl']};
      
      /* Border Radius */
      --radius-none: ${tokens.borderRadius.none};
      --radius-sm: ${tokens.borderRadius.sm};
      --radius-md: ${tokens.borderRadius.md};
      --radius-lg: ${tokens.borderRadius.lg};
      --radius-full: ${tokens.borderRadius.full};
      
      /* Shadows */
      --shadow-sm: ${tokens.shadows.sm};
      --shadow-md: ${tokens.shadows.md};
      --shadow-lg: ${tokens.shadows.lg};
      --shadow-xl: ${tokens.shadows.xl};
    }
    `;
  }

  // Render custom block using its template
  private renderCustomBlock(block: Block, spec: any): string {
    if (!spec.template) return '';
    
    // Simple template engine using moustache syntax
    let html = spec.template;
    
    // Replace simple variables
    Object.entries(block.props).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value || ''));
    });
    
    // Handle arrays (e.g., {{#steps}}...{{/steps}})
    html = html.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, key, template) => {
      const array = block.props[key];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemHtml = template;
        Object.entries(item).forEach(([itemKey, itemValue]) => {
          const regex = new RegExp(`{{${itemKey}}}`, 'g');
          itemHtml = itemHtml.replace(regex, String(itemValue || ''));
        });
        return itemHtml;
      }).join('');
    });
    
    return html;
  }

  // Register default blocks
  private registerDefaultBlocks() {
    // Hero Section
    this.registerBlock('Hero', {
      name: 'Hero',
      category: 'layout',
      description: 'Hero section with title, subtitle and CTA',
      render: (block, theme) => {
        const { headline, subheadline, cta, ctaUrl, backgroundImage } = block.props;
        
        return `
        <section class="hero section" style="${backgroundImage ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center;` : ''}">
          <div class="container">
            <h1 style="font-size: var(--font-size-4xl); color: var(--color-primary); margin-bottom: var(--spacing-lg);">
              ${headline || 'Welcome'}
            </h1>
            ${subheadline ? `<p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); margin-bottom: var(--spacing-xl);">${subheadline}</p>` : ''}
            ${cta && ctaUrl ? `
            <a href="${ctaUrl}" style="
              display: inline-block;
              padding: var(--spacing-md) var(--spacing-xl);
              background-color: var(--color-primary);
              color: white;
              text-decoration: none;
              border-radius: var(--radius-md);
              font-weight: var(--font-weight-semibold);
              transition: all 0.3s ease;
            " onmouseover="this.style.backgroundColor='var(--color-accent)'" onmouseout="this.style.backgroundColor='var(--color-primary)'">
              ${cta}
            </a>` : ''}
          </div>
        </section>`;
      }
    });

    // Feature Grid
    this.registerBlock('FeatureGrid', {
      name: 'FeatureGrid',
      category: 'content',
      description: 'Grid of features with icons',
      render: (block, theme) => {
        const { title, features } = block.props;
        
        if (!Array.isArray(features)) return '';
        
        return `
        <section class="features section">
          <div class="container">
            ${title ? `<h2 style="text-align: center; margin-bottom: var(--spacing-2xl);">${title}</h2>` : ''}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg);">
              ${features.map(feature => `
                <div style="text-align: center; padding: var(--spacing-lg); border-radius: var(--radius-lg); background-color: var(--color-surface);">
                  ${feature.icon ? `<div style="font-size: var(--font-size-3xl); margin-bottom: var(--spacing-md);">${feature.icon}</div>` : ''}
                  ${feature.title ? `<h3 style="color: var(--color-primary); margin-bottom: var(--spacing-sm);">${feature.title}</h3>` : ''}
                  ${feature.description ? `<p style="color: var(--color-text-secondary);">${feature.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </section>`;
      }
    });

    // Testimonials
    this.registerBlock('Testimonials', {
      name: 'Testimonials',
      category: 'content',
      description: 'Customer testimonials carousel',
      render: (block, theme) => {
        const { title, testimonials } = block.props;
        
        if (!Array.isArray(testimonials)) return '';
        
        return `
        <section class="testimonials section" style="background-color: var(--color-surface);">
          <div class="container">
            ${title ? `<h2 style="text-align: center; margin-bottom: var(--spacing-2xl);">${title}</h2>` : ''}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-lg);">
              ${testimonials.map(testimonial => `
                <div style="padding: var(--spacing-xl); border-radius: var(--radius-lg); background-color: var(--color-background); box-shadow: var(--shadow-md);">
                  ${testimonial.quote ? `<blockquote style="font-style: italic; margin-bottom: var(--spacing-md); color: var(--color-text);">"${testimonial.quote}"</blockquote>` : ''}
                  <div style="display: flex; align-items: center;">
                    ${testimonial.avatar ? `<img src="${testimonial.avatar}" alt="${testimonial.name}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: var(--spacing-md);">` : ''}
                    <div>
                      ${testimonial.name ? `<cite style="font-weight: var(--font-weight-semibold); color: var(--color-primary);">${testimonial.name}</cite>` : ''}
                      ${testimonial.role ? `<div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">${testimonial.role}</div>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>`;
      }
    });

    // CTA Section
    this.registerBlock('CTASection', {
      name: 'CTASection',
      category: 'conversion',
      description: 'Call to action section',
      render: (block, theme) => {
        const { title, description, cta, ctaUrl, backgroundColor } = block.props;
        
        return `
        <section class="cta section" style="${backgroundColor ? `background-color: ${backgroundColor};` : `background-color: var(--color-primary);`}">
          <div class="container" style="text-align: center;">
            ${title ? `<h2 style="color: white; margin-bottom: var(--spacing-md);">${title}</h2>` : ''}
            ${description ? `<p style="color: rgba(255, 255, 255, 0.9); margin-bottom: var(--spacing-xl); font-size: var(--font-size-lg);">${description}</p>` : ''}
            ${cta && ctaUrl ? `
            <a href="${ctaUrl}" style="
              display: inline-block;
              padding: var(--spacing-md) var(--spacing-xl);
              background-color: white;
              color: var(--color-primary);
              text-decoration: none;
              border-radius: var(--radius-md);
              font-weight: var(--font-weight-bold);
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              ${cta}
            </a>` : ''}
          </div>
        </section>`;
      }
    });

    // Contact Form
    this.registerBlock('ContactForm', {
      name: 'ContactForm',
      category: 'form',
      description: 'Contact form',
      render: (block, theme) => {
        const { title, email, phone, address } = block.props;
        
        return `
        <section class="contact section">
          <div class="container">
            ${title ? `<h2 style="text-align: center; margin-bottom: var(--spacing-2xl);">${title}</h2>` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-2xl);">
              <div>
                <form onsubmit="alert('Form submitted!'); return false;" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                  <input type="text" placeholder="Your Name" required style="padding: var(--spacing-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-base);">
                  <input type="email" placeholder="Your Email" required style="padding: var(--spacing-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-base);">
                  <textarea placeholder="Your Message" rows="5" required style="padding: var(--spacing-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-base); resize: vertical;"></textarea>
                  <button type="submit" style="
                    padding: var(--spacing-md) var(--spacing-xl);
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: var(--font-weight-semibold);
                    cursor: pointer;
                    transition: all 0.3s ease;
                  " onmouseover="this.style.backgroundColor='var(--color-accent)'" onmouseout="this.style.backgroundColor='var(--color-primary)'">
                    Send Message
                  </button>
                </form>
              </div>
              <div>
                ${email ? `<p style="margin-bottom: var(--spacing-md);"><strong>Email:</strong> <a href="mailto:${email}" style="color: var(--color-primary);">${email}</a></p>` : ''}
                ${phone ? `<p style="margin-bottom: var(--spacing-md);"><strong>Phone:</strong> <a href="tel:${phone}" style="color: var(--color-primary);">${phone}</a></p>` : ''}
                ${address ? `<p style="margin-bottom: var(--spacing-md);"><strong>Address:</strong> ${address}</p>` : ''}
              </div>
            </div>
          </div>
        </section>`;
      }
    });
  }
}

// Export singleton instance
export const siteRenderer = new SiteRenderer();