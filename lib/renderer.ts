import Ajv from 'ajv';
import siteSchema from './schemas/site.schema.json';
import themeSchema from './schemas/theme.schema.json';
import blockSchema from './schemas/block.schema.json';

// Component registry with built-in components
const componentRegistry = new Map();

// Register built-in components
function registerBuiltInComponents() {
  // Hero component
  componentRegistry.set('Hero', {
    render: (props: any, theme: any) => `
      <section class="hero" style="background: linear-gradient(135deg, ${theme.tokens.colors.primary}10, ${theme.tokens.colors.secondary}10); padding: 6rem 2rem; text-align: center;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <h1 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize['4xl']}; font-weight: ${theme.tokens.typography.fontWeight.bold}; color: ${theme.tokens.colors.text}; margin-bottom: 1.5rem;">
            ${escapeHtml(props.title || '')}
          </h1>
          <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.xl}; color: ${theme.tokens.colors.textSecondary}; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            ${escapeHtml(props.description || '')}
          </p>
          ${props.ctaText ? `
            <button style="background: ${theme.tokens.colors.primary}; color: white; padding: 1rem 2rem; border: none; border-radius: ${theme.tokens.borderRadius.md}; font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; font-weight: ${theme.tokens.typography.fontWeight.medium}; cursor: pointer; transition: all 0.2s;">
              ${escapeHtml(props.ctaText)}
            </button>
          ` : ''}
        </div>
      </section>
    `
  });

  // FeatureGrid component
  componentRegistry.set('FeatureGrid', {
    render: (props: any, theme: any) => `
      <section class="feature-grid" style="padding: 4rem 2rem; background: ${theme.tokens.colors.background};">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <h2 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize['3xl']}; font-weight: ${theme.tokens.typography.fontWeight.bold}; color: ${theme.tokens.colors.text}; text-align: center; margin-bottom: 3rem;">
            ${escapeHtml(props.title || '')}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            ${(props.features || []).map((feature: any) => `
              <div style="text-align: center; padding: 2rem; background: ${theme.tokens.colors.surface}; border-radius: ${theme.tokens.borderRadius.lg}; box-shadow: ${theme.tokens.shadows.sm};">
                ${feature.icon ? `<div style="font-size: 3rem; margin-bottom: 1rem;">${escapeHtml(feature.icon)}</div>` : ''}
                <h3 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize.xl}; font-weight: ${theme.tokens.typography.fontWeight.semibold}; color: ${theme.tokens.colors.text}; margin-bottom: 1rem;">
                  ${escapeHtml(feature.title || '')}
                </h3>
                <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; color: ${theme.tokens.colors.textSecondary}; line-height: ${theme.tokens.typography.lineHeight.normal};">
                  ${escapeHtml(feature.description || '')}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `
  });

  // TestimonialCarousel component
  componentRegistry.set('TestimonialCarousel', {
    render: (props: any, theme: any) => `
      <section class="testimonials" style="padding: 4rem 2rem; background: ${theme.tokens.colors.surface};">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <h2 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize['3xl']}; font-weight: ${theme.tokens.typography.fontWeight.bold}; color: ${theme.tokens.colors.text}; text-align: center; margin-bottom: 3rem;">
            ${escapeHtml(props.title || 'Ce que disent nos clients')}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
            ${(props.testimonials || []).map((testimonial: any) => `
              <div style="padding: 2rem; background: ${theme.tokens.colors.background}; border-radius: ${theme.tokens.borderRadius.lg}; box-shadow: ${theme.tokens.shadows.md};">
                <div style="font-size: 2rem; color: ${theme.tokens.colors.primary}; margin-bottom: 1rem;">"</div>
                <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; color: ${theme.tokens.colors.textSecondary}; line-height: ${theme.tokens.typography.lineHeight.relaxed}; margin-bottom: 1.5rem; font-style: italic;">
                  ${escapeHtml(testimonial.quote || '')}
                </p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: ${theme.tokens.colors.primary}20; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${theme.tokens.colors.primary};">
                    ${testimonial.name ? testimonial.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize.base}; font-weight: ${theme.tokens.typography.fontWeight.semibold}; color: ${theme.tokens.colors.text}; margin: 0;">
                      ${escapeHtml(testimonial.name || '')}
                    </h4>
                    <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.sm}; color: ${theme.tokens.colors.textSecondary}; margin: 0;">
                      ${escapeHtml(testimonial.role || '')}
                    </p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `
  });

  // CTASection component
  componentRegistry.set('CTASection', {
    render: (props: any, theme: any) => `
      <section class="cta" style="background: ${theme.tokens.colors.primary}; padding: 4rem 2rem; text-align: center;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize['3xl']}; font-weight: ${theme.tokens.typography.fontWeight.bold}; color: white; margin-bottom: 1.5rem;">
            ${escapeHtml(props.title || '')}
          </h2>
          <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.xl}; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
            ${escapeHtml(props.description || '')}
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            ${props.primaryButtonText ? `
              <button style="background: white; color: ${theme.tokens.colors.primary}; padding: 1rem 2rem; border: none; border-radius: ${theme.tokens.borderRadius.md}; font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; font-weight: ${theme.tokens.typography.fontWeight.semibold}; cursor: pointer; transition: all 0.2s;">
                ${escapeHtml(props.primaryButtonText)}
              </button>
            ` : ''}
            ${props.secondaryButtonText ? `
              <button style="background: transparent; color: white; padding: 1rem 2rem; border: 2px solid white; border-radius: ${theme.tokens.borderRadius.md}; font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; font-weight: ${theme.tokens.typography.fontWeight.medium}; cursor: pointer; transition: all 0.2s;">
                ${escapeHtml(props.secondaryButtonText)}
              </button>
            ` : ''}
          </div>
        </div>
      </section>
    `
  });

  // HeaderNav component
  componentRegistry.set('HeaderNav', {
    render: (props: any, theme: any) => `
      <header class="header" style="background: ${theme.tokens.colors.surface}; padding: 1rem 2rem; box-shadow: ${theme.tokens.shadows.sm}; position: sticky; top: 0; z-index: 100;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize.xl}; font-weight: ${theme.tokens.typography.fontWeight.bold}; color: ${theme.tokens.colors.primary};">
            ${escapeHtml(props.logo || props.siteTitle || '')}
          </div>
          <nav style="display: flex; gap: 2rem;">
            ${(props.links || []).map((link: any) => `
              <a href="${escapeHtml(link.href || '#')}" style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; color: ${theme.tokens.colors.text}; text-decoration: none; font-weight: ${theme.tokens.typography.fontWeight.medium}; transition: color 0.2s;">
                ${escapeHtml(link.label || '')}
              </a>
            `).join('')}
          </nav>
        </div>
      </header>
    `
  });

  // FooterSimple component
  componentRegistry.set('FooterSimple', {
    render: (props: any, theme: any) => `
      <footer class="footer" style="background: ${theme.tokens.colors.text}; color: white; padding: 3rem 2rem 2rem;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <div>
              <h3 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize.lg}; font-weight: ${theme.tokens.typography.fontWeight.bold}; margin-bottom: 1rem;">
                ${escapeHtml(props.siteTitle || '')}
              </h3>
              <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.base}; color: rgba(255, 255, 255, 0.8); line-height: ${theme.tokens.typography.lineHeight.relaxed};">
                ${escapeHtml(props.description || '')}
              </p>
            </div>
            ${(props.columns || []).map((column: any) => `
              <div>
                <h4 style="font-family: ${theme.tokens.typography.fontFamily.heading}; font-size: ${theme.tokens.typography.fontSize.base}; font-weight: ${theme.tokens.typography.fontWeight.semibold}; margin-bottom: 1rem;">
                  ${escapeHtml(column.title || '')}
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${(column.links || []).map((link: any) => `
                    <li style="margin-bottom: 0.5rem;">
                      <a href="${escapeHtml(link.href || '#')}" style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.sm}; color: rgba(255, 255, 255, 0.8); text-decoration: none; transition: color 0.2s;">
                        ${escapeHtml(link.label || '')}
                      </a>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 2rem; text-align: center;">
            <p style="font-family: ${theme.tokens.typography.fontFamily.body}; font-size: ${theme.tokens.typography.fontSize.sm}; color: rgba(255, 255, 255, 0.6); margin: 0;">
              ${escapeHtml(props.copyright || `© ${new Date().getFullYear()} ${props.siteTitle || ''}. Tous droits réservés.`)}
            </p>
          </div>
        </div>
      </footer>
    `
  });
}

// Initialize built-in components
registerBuiltInComponents();

// Custom component registry
const customComponents = new Map();

// Register a custom component specification
export function registerCustomSpec(name: string, spec: any) {
  customComponents.set(name, spec);
}

// Simple template engine with moustache syntax
function renderTemplate(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = getNestedValue(data, key.trim());
    return value !== undefined ? escapeHtml(String(value)) : '';
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// HTML escape function
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize JSON Schema validators
const ajv = new Ajv();
const validateSite = ajv.compile(siteSchema);
const validateTheme = ajv.compile(themeSchema);
const validateBlock = ajv.compile(blockSchema);

// Main renderer class
export class SiteRenderer {
  private site: any;
  private theme: any;

  constructor(site: any) {
    // Validate site structure
    if (!validateSite(site)) {
      throw new Error(`Invalid site structure: ${ajv.errorsText(validateSite.errors)}`);
    }

    // Validate theme
    if (!validateTheme(site.theme)) {
      throw new Error(`Invalid theme structure: ${ajv.errorsText(validateTheme.errors)}`);
    }

    this.site = site;
    this.theme = site.theme;
  }

  // Render complete site
  renderSite(): string {
    const { title, description, pages, navigation, assets } = this.site;

    return `
<!DOCTYPE html>
<html lang="${this.site.locale || 'fr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <style>
        ${this.generateGlobalCSS()}
        ${this.generateThemeCSS()}
    </style>
</head>
<body>
    ${navigation.header ? this.renderBlock({
        id: 'header',
        type: 'navigation',
        component: 'HeaderNav',
        props: {
          ...navigation.header,
          siteTitle: title
        }
      }) : ''}
    
    <main>
        ${pages.map((page: any) => this.renderPage(page)).join('')}
    </main>

    ${navigation.footer ? this.renderBlock({
        id: 'footer',
        type: 'navigation',
        component: 'FooterSimple',
        props: {
          ...navigation.footer,
          siteTitle: title
        }
      }) : ''}
</body>
</html>`;
  }

  // Render a single page
  renderPage(page: any): string {
    const pageContent = page.blocks.map((block: any) => this.renderBlock(block)).join('');
    
    return `
      <div id="page-${page.id}" class="page" data-page="${page.slug}">
        ${pageContent}
      </div>
    `;
  }

  // Render a single block
  renderBlock(block: any): string {
    // Validate block structure
    if (!validateBlock(block)) {
      console.warn(`Invalid block structure: ${ajv.errorsText(validateBlock.errors)}`);
      return '';
    }

    const { component, props, spec } = block;

    // Check if it's a custom component
    if (spec && customComponents.has(component)) {
      return this.renderCustomBlock(block);
    }

    // Use built-in component
    const componentDef = componentRegistry.get(component);
    if (!componentDef) {
      console.warn(`Component not found: ${component}`);
      return '';
    }

    return componentDef.render(props, this.theme);
  }

  // Render custom block with spec
  renderCustomBlock(block: any): string {
    const { component, props, spec } = block;
    const customSpec = customComponents.get(component);

    if (!customSpec) {
      console.warn(`Custom spec not found: ${component}`);
      return '';
    }

    // Render template with props
    const html = renderTemplate(customSpec.template, props);

    // Wrap with scoped CSS
    return `
      <div class="custom-component custom-${component}" data-block-id="${block.id}">
        <style>
          .custom-${component} {
            ${customSpec.css}
          }
        </style>
        ${html}
      </div>
    `;
  }

  // Generate global CSS
  private generateGlobalCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: ${this.theme.tokens.typography.fontFamily.body};
        font-size: ${this.theme.tokens.typography.fontSize.base};
        line-height: ${this.theme.tokens.typography.lineHeight.normal};
        color: ${this.theme.tokens.colors.text};
        background: ${this.theme.tokens.colors.background};
      }
      
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 ${this.theme.tokens.spacing.md};
      }
      
      button {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      button:hover {
        transform: translateY(-1px);
        box-shadow: ${this.theme.tokens.shadows.lg};
      }
      
      a:hover {
        color: ${this.theme.tokens.colors.primary};
      }
      
      @media (max-width: 768px) {
        .container {
          padding: 0 ${this.theme.tokens.spacing.sm};
        }
        
        nav {
          flex-direction: column;
          gap: ${this.theme.tokens.spacing.md};
        }
      }
    `;
  }

  // Generate theme CSS with fallbacks
  private generateThemeCSS(): string {
    const { tokens } = this.theme;
    
    // Provide fallback values for missing tokens
    const spacing = tokens.spacing || {};
    const colors = tokens.colors || {};
    const typography = tokens.typography || {};
    const borderRadius = tokens.borderRadius || {};
    const shadows = tokens.shadows || {};
    
    return `
      :root {
        /* Colors with fallbacks */
        --color-primary: ${colors.primary || '#6D3FC8'};
        --color-secondary: ${colors.secondary || '#5A35A5'};
        --color-accent: ${colors.accent || '#FF6B6B'};
        --color-background: ${colors.background || '#FFFFFF'};
        --color-surface: ${colors.surface || '#F8F9FA'};
        --color-text: ${colors.text || '#1A202C'};
        --color-text-secondary: ${colors.textSecondary || '#4A5568'};
        --color-border: ${colors.border || '#E2E8F0'};
        --color-error: ${colors.error || '#E53E3E'};
        --color-success: ${colors.success || '#38A169'};
        --color-warning: ${colors.warning || '#DD6B20'};
        --color-info: ${colors.info || '#3182CE'};
        
        /* Typography with fallbacks */
        --font-heading: ${typography.fontFamily?.heading || "'Playfair Display', serif"};
        --font-body: ${typography.fontFamily?.body || "'Inter', sans-serif"};
        --font-mono: ${typography.fontFamily?.mono || "'IBM Plex Mono', monospace"};
        
        --text-xs: ${typography.fontSize?.xs || '0.75rem'};
        --text-sm: ${typography.fontSize?.sm || '0.875rem'};
        --text-base: ${typography.fontSize?.base || '1rem'};
        --text-lg: ${typography.fontSize?.lg || '1.125rem'};
        --text-xl: ${typography.fontSize?.xl || '1.25rem'};
        --text-2xl: ${typography.fontSize?.['2xl'] || '1.5rem'};
        --text-3xl: ${typography.fontSize?.['3xl'] || '1.875rem'};
        --text-4xl: ${typography.fontSize?.['4xl'] || '2.25rem'};
        
        --font-light: ${typography.fontWeight?.light || 300};
        --font-normal: ${typography.fontWeight?.normal || 400};
        --font-medium: ${typography.fontWeight?.medium || 500};
        --font-semibold: ${typography.fontWeight?.semibold || 600};
        --font-bold: ${typography.fontWeight?.bold || 700};
        
        --leading-tight: ${typography.lineHeight?.tight || '1.1'};
        --leading-normal: ${typography.lineHeight?.normal || '1.5'};
        --leading-relaxed: ${typography.lineHeight?.relaxed || '1.75'};
        
        /* Spacing with fallbacks */
        --spacing-xs: ${spacing.xs || '0.5rem'};
        --spacing-sm: ${spacing.sm || '0.75rem'};
        --spacing-md: ${spacing.md || '1rem'};
        --spacing-lg: ${spacing.lg || '1.5rem'};
        --spacing-xl: ${spacing.xl || '2rem'};
        --spacing-2xl: ${spacing['2xl'] || '3rem'};
        --spacing-3xl: ${spacing['3xl'] || '4rem'};
        --spacing-4xl: ${spacing['4xl'] || '6rem'};
        
        /* Border radius with fallbacks */
        --radius-none: ${borderRadius.none || '0'};
        --radius-sm: ${borderRadius.sm || '0.125rem'};
        --radius-md: ${borderRadius.md || '0.375rem'};
        --radius-lg: ${borderRadius.lg || '0.5rem'};
        --radius-full: ${borderRadius.full || '9999px'};
        
        /* Shadows with fallbacks */
        --shadow-sm: ${shadows.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
        --shadow-md: ${shadows.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
        --shadow-lg: ${shadows.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
        --shadow-xl: ${shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
      }
    `;
  }
}

// Utility function to render a site
export function renderSite(site: any): string {
  const renderer = new SiteRenderer(site);
  return renderer.renderSite();
}
