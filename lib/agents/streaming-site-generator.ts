import { StreamingEvent, SiteStructure, SiteTheme, SitePage, Block, SiteAsset } from '../schemas/site-generator';
import { AIBaseAgent } from './ai-base-agent';
import { siteRenderer } from '../renderer/site-renderer';

export interface SiteGenerationConfig {
  prompt: string;
  industry?: string;
  tone?: string;
  pages?: string[];
  keywords?: string[];
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  locale?: string;
  domain?: string;
}

export class StreamingSiteGenerator extends AIBaseAgent {
  private siteId: string;
  private siteStructure: Partial<SiteStructure> = {};
  private customBlocks: Record<string, any> = {};
  private currentPage: SitePage | null = null;
  private currentBlockIndex = 0;

  constructor() {
    super({
      name: 'StreamingSiteGenerator',
      role: 'Web Design Expert',
      capabilities: ['website_generation', 'theme_design', 'content_creation', 'ux_design'],
      systemPrompt: 'You are an expert web designer and developer specializing in creating modern, responsive websites. You generate complete website structures with themes, content, and navigation.',
      temperature: 0.7,
      maxTokens: 4000
    });
    this.siteId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getDefaultSystemPrompt(): string {
    return 'You are an expert web designer and developer specializing in creating modern, responsive websites. You generate complete website structures with themes, content, and navigation.';
  }

  async *generateSite(config: SiteGenerationConfig): AsyncGenerator<StreamingEvent, void, unknown> {
    try {
      // Initialize site structure
      this.siteStructure = {
        id: this.siteId,
        title: '',
        description: '',
        locale: config.locale || 'fr',
        domain: config.domain,
        pages: [],
        assets: [],
        navigation: {
          header: { logo: '', links: [] },
          footer: { logo: '', links: [], copyright: '' }
        },
        customBlocks: {}
      };

      // Phase 1: Generate Theme
      yield* this.generateTheme(config);

      // Phase 2: Generate Site Structure
      yield* this.generateSiteStructure(config);

      // Phase 3: Generate Content for each page
      for (const page of this.siteStructure.pages!) {
        yield* this.generatePageContent(page);
      }

      // Phase 4: Generate Navigation
      yield* this.generateNavigation();

      // Complete
      yield {
        type: 'complete',
        payload: {
          siteId: this.siteId
        }
      };

    } catch (error) {
      yield {
        type: 'error',
        payload: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  private async *generateTheme(config: SiteGenerationConfig): AsyncGenerator<StreamingEvent> {
    yield {
      type: 'phase_start',
      payload: {
        phase: 'theme_generation',
        agent: this.name,
        description: 'Generating visual theme and design system'
      }
    };

    const prompt = `
You are a web design expert. Generate a complete theme for a website based on this description:

Business Description: ${config.prompt}
Industry: ${config.industry || 'General'}
Tone: ${config.tone || 'Professional'}

${config.colors ? `Color Preferences: Primary=${config.colors.primary}, Secondary=${config.colors.secondary}, Accent=${config.colors.accent}` : ''}
${config.fonts ? `Font Preferences: Heading=${config.fonts.heading}, Body=${config.fonts.body}` : ''}

Generate a JSON theme object with this structure:
{
  "name": "Theme Name",
  "tokens": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "text": "#hex",
      "textSecondary": "#hex",
      "border": "#hex",
      "error": "#hex",
      "success": "#hex",
      "warning": "#hex",
      "info": "#hex"
    },
    "typography": {
      "fontFamily": {
        "heading": "Font Name",
        "body": "Font Name",
        "mono": "Font Name"
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "fontWeight": {
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "tight": "1.25",
        "normal": "1.5",
        "relaxed": "1.75"
      }
    },
    "spacing": {
      "px": "1px",
      "xs": "0.5rem",
      "sm": "0.75rem",
      "md": "1rem",
      "lg": "1.5rem",
      "xl": "2rem",
      "2xl": "3rem",
      "3xl": "4rem",
      "4xl": "6rem"
    },
    "borderRadius": {
      "none": "0",
      "sm": "0.125rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  }
}

Consider:
- Color psychology and accessibility (contrast ratios)
- Typography hierarchy and readability
- Modern design trends
- Industry conventions
- Mobile-first responsive design
`;

    const theme = await this.generateWithAI({
      prompt: prompt,
      formatJson: true
    });

    // Validate theme
    try {
      const themeData = JSON.parse(theme);
      this.siteStructure.theme = themeData;
      
      yield {
        type: 'theme',
        payload: themeData
      };

      yield {
        type: 'phase_complete',
        payload: {
          phase: 'theme_generation',
          agent: this.name,
          result: themeData
        }
      };
    } catch (error) {
      throw new Error(`Invalid theme generated: ${error}`);
    }
  }

  private async *generateSiteStructure(config: SiteGenerationConfig): AsyncGenerator<StreamingEvent> {
    yield {
      type: 'phase_start',
      payload: {
        phase: 'structure_generation',
        agent: this.name,
        description: 'Analyzing business and generating site structure'
      }
    };

    const pages = config.pages || ['home'];
    
    const prompt = `
You are a business analyst and UX expert. Analyze this business and generate an optimal website structure:

Business Description: ${config.prompt}
Industry: ${config.industry || 'General'}
Required Pages: ${pages.join(', ')}
Keywords: ${config.keywords?.join(', ') || 'N/A'}

Generate a JSON response with:
{
  "title": "Business Name",
  "description": "Business Description for SEO",
  "pages": [
    {
      "id": "page-id",
      "title": "Page Title",
      "slug": "url-slug",
      "meta": {
        "description": "Meta description",
        "keywords": ["keyword1", "keyword2"]
      },
      "blocks": [
        {
          "id": "block-id",
          "type": "block-type",
          "component": "ComponentName",
          "props": {
            "title": "Section Title",
            "description": "Section content..."
          }
        }
      ]
    }
  ]
}

For each page, include relevant blocks based on the business type. Use these components:
- Hero: For main landing sections
- FeatureGrid: For showcasing services/products
- Testimonials: For social proof
- CTASection: For call-to-actions
- ContactForm: For contact pages
- About: For about sections

Include 3-7 blocks per page depending on complexity.
`;

    const structure = await this.generateWithAI({
      prompt: prompt,
      formatJson: true
    });

    try {
      const structureData = JSON.parse(structure);
      this.siteStructure.title = structureData.title;
      this.siteStructure.description = structureData.description;
      this.siteStructure.pages = structureData.pages;

      // Emit pages one by one
      for (let i = 0; i < structureData.pages.length; i++) {
        const page = structureData.pages[i];
        yield {
          type: 'page',
          payload: {
            page,
            index: i,
            total: structureData.pages.length
          }
        };
      }

      yield {
        type: 'phase_complete',
        payload: {
          phase: 'structure_generation',
          agent: this.name,
          result: structureData
        }
      };
    } catch (error) {
      throw new Error(`Invalid structure generated: ${error}`);
    }
  }

  private async *generatePageContent(page: SitePage): AsyncGenerator<StreamingEvent> {
    yield {
      type: 'phase_start',
      payload: {
        phase: 'content_generation',
        agent: this.name,
        description: `Generating content for page: ${page.title}`
      }
    };

    this.currentPage = page;
    this.currentBlockIndex = 0;

    // Generate detailed content for each block
    for (const block of page.blocks) {
      await this.generateBlockContent(block);
      
      yield {
        type: 'block',
        payload: {
          pageId: page.id,
          block,
          index: this.currentBlockIndex,
          total: page.blocks.length
        }
      };
      
      this.currentBlockIndex++;
    }

    yield {
      type: 'phase_complete',
      payload: {
        phase: 'content_generation',
        agent: this.name,
        result: { pageId: page.id, blockCount: page.blocks.length }
      }
    };
  }

  private async generateBlockContent(block: Block): Promise<void> {
    // For complex blocks, generate detailed content
    if (block.type === 'FeatureGrid' && Array.isArray(block.props.features)) {
      const prompt = `
For this business block, generate detailed feature content:

Block Type: ${block.type}
Title: ${block.props.title || ''}
Business Context: ${this.siteStructure.description}

Generate JSON with detailed features:
{
  "features": [
    {
      "title": "Feature Title",
      "description": "Detailed description of the feature and its benefits",
      "icon": "emoji or icon name"
    }
  ]
}

Generate 3-6 relevant features.
`;

      const content = await this.generateWithAI({
        prompt: prompt,
        formatJson: true
      });

      try {
        const featuresData = JSON.parse(content);
        block.props = { ...block.props, ...featuresData };
      } catch (error) {
        console.warn(`Failed to enhance block content: ${error}`);
      }
    }
  }

  private async *generateNavigation(): AsyncGenerator<StreamingEvent> {
    yield {
      type: 'phase_start',
      payload: {
        phase: 'navigation_generation',
        agent: this.name,
        description: 'Generating site navigation'
      }
    };

    const pages = this.siteStructure.pages || [];
    const navigation = {
      header: {
        logo: '',
        links: pages.slice(0, 5).map(p => ({
          label: p.title,
          href: p.slug === 'home' ? '/' : `/${p.slug}`
        }))
      },
      footer: {
        logo: '',
        links: pages.slice(0, 5).map(p => ({
          label: p.title,
          href: p.slug === 'home' ? '/' : `/${p.slug}`
        })),
        social: [],
        copyright: `© ${new Date().getFullYear()} ${this.siteStructure.title}`
      }
    };

    this.siteStructure.navigation = navigation;

    yield {
      type: 'navigation',
      payload: navigation
    };

    yield {
      type: 'phase_complete',
      payload: {
        phase: 'navigation_generation',
        agent: this.name,
        result: navigation
      }
    };
  }

  // Utility method to get complete site structure
  getSiteStructure(): SiteStructure {
    if (!this.siteStructure.theme || !this.siteStructure.pages) {
      throw new Error('Site generation not complete');
    }
    return this.siteStructure as SiteStructure;
  }

  // Utility method to render complete site
  renderSite(): string {
    const site = this.getSiteStructure();
    return siteRenderer.renderSite(site);
  }
}
