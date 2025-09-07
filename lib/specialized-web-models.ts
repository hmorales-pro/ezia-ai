import { HfInference } from '@huggingface/inference';

/**
 * Modèles spécialisés pour la génération web
 * Recherche constante de nouveaux modèles sur HuggingFace
 */
export const SPECIALIZED_WEB_MODELS = {
  // Modèles pour génération de code HTML/CSS
  codeGeneration: {
    // Modèles spécialisés dans le web dev
    'web-coder': 'bigcode/starcoder2-15b',
    'html-css-specialist': 'Salesforce/codegen2-16B',
    'frontend-expert': 'WizardLM/WizardCoder-15B-V1.0',
    
    // Modèles optimisés pour HTML/CSS/JS
    'web-optimizer': 'deepseek-ai/deepseek-coder-33b-instruct',
    'responsive-design': 'microsoft/phi-2', // Léger mais efficace pour patterns CSS
  },

  // Modèles pour design et UX
  designPatterns: {
    'ui-patterns': 'google/flan-t5-xxl', // Pour générer des patterns UI
    'color-schemes': 'microsoft/layoutlmv3-base', // Pour analyse de layouts
  },

  // Modèles pour contenu web
  contentGeneration: {
    'seo-content': 'google/flan-ul2', // Excellent pour contenu SEO
    'marketing-copy': 'EleutherAI/gpt-j-6b', // Pour copy marketing
    'blog-writer': 'bigscience/bloom-7b1', // Pour articles de blog
  },

  // Modèles multimodaux (future)
  multimodal: {
    'design-to-code': 'microsoft/git-base', // Image to code
    'screenshot-to-html': 'Salesforce/blip-vqa-base', // Analyse visuelle
  }
};

export class SpecializedWebGenerator {
  private hf: HfInference;
  private modelCache: Map<string, any> = new Map();

  constructor(hfToken?: string) {
    this.hf = new HfInference(hfToken || process.env.HF_TOKEN);
  }

  /**
   * Génère une structure HTML/CSS optimisée avec un modèle spécialisé
   */
  async generateWebStructure(businessContext: {
    name: string;
    type: string;
    description: string;
    features?: string[];
    style?: 'modern' | 'classic' | 'minimal' | 'bold';
    colors?: string[];
  }): Promise<string> {
    // Construire un prompt spécialisé pour la génération web
    const prompt = this.buildWebGenerationPrompt(businessContext);
    
    try {
      // Utiliser un modèle spécialisé dans le code web
      const result = await this.hf.textGeneration({
        model: SPECIALIZED_WEB_MODELS.codeGeneration['web-optimizer'],
        inputs: prompt,
        parameters: {
          max_new_tokens: 4096,
          temperature: 0.3, // Basse pour du code précis
          top_p: 0.95,
          return_full_text: false,
          // Forcer la génération de code HTML valide
          stop_sequences: ['</html>', '```'],
        }
      });

      // Nettoyer et valider le HTML généré
      return this.cleanAndValidateHTML(result.generated_text);
    } catch (error) {
      console.error('Erreur avec le modèle principal, fallback...', error);
      
      // Fallback sur un autre modèle
      return this.fallbackGeneration(businessContext);
    }
  }

  /**
   * Génère du contenu SEO-optimisé pour le site
   */
  async generateSEOContent(business: {
    name: string;
    description: string;
    keywords?: string[];
    targetAudience?: string;
  }): Promise<{
    title: string;
    metaDescription: string;
    h1: string;
    heroText: string;
    ctaText: string;
  }> {
    const prompt = `Generate SEO-optimized content for a business website:
Business: ${business.name}
Description: ${business.description}
Keywords: ${business.keywords?.join(', ') || 'not specified'}
Target: ${business.targetAudience || 'general audience'}

Generate:
1. Page title (60 chars max)
2. Meta description (160 chars max)
3. H1 heading
4. Hero section text (2-3 sentences)
5. Main CTA button text

Format as JSON.`;

    try {
      const result = await this.hf.textGeneration({
        model: SPECIALIZED_WEB_MODELS.contentGeneration['seo-content'],
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      // Parser le JSON ou extraire les infos
      return this.parseSEOContent(result.generated_text);
    } catch (error) {
      // Contenu par défaut
      return {
        title: `${business.name} - ${business.description.substring(0, 40)}`,
        metaDescription: business.description.substring(0, 160),
        h1: business.name,
        heroText: business.description,
        ctaText: 'En savoir plus'
      };
    }
  }

  /**
   * Génère des articles de blog thématiques
   */
  async generateBlogPost(topic: {
    title: string;
    business: string;
    industry: string;
    keywords?: string[];
    tone?: 'professional' | 'casual' | 'technical';
    length?: 'short' | 'medium' | 'long';
  }): Promise<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  }> {
    const wordCount = {
      short: 500,
      medium: 1000,
      long: 2000
    }[topic.length || 'medium'];

    const prompt = `Write a ${topic.tone || 'professional'} blog post for ${topic.business} (${topic.industry} industry).
Topic: ${topic.title}
Target length: ${wordCount} words
Keywords to include: ${topic.keywords?.join(', ') || 'none'}

Structure:
- Engaging introduction
- Main points with subheadings
- Practical examples
- Conclusion with call-to-action

Write in French.`;

    try {
      const result = await this.hf.textGeneration({
        model: SPECIALIZED_WEB_MODELS.contentGeneration['blog-writer'],
        inputs: prompt,
        parameters: {
          max_new_tokens: wordCount * 2, // Tokens ≈ 0.75 * words
          temperature: 0.8,
          top_p: 0.9,
          return_full_text: false,
        }
      });

      return this.formatBlogPost(result.generated_text, topic);
    } catch (error) {
      console.error('Erreur génération blog:', error);
      throw error;
    }
  }

  /**
   * Analyse une image/screenshot pour générer du code
   * (Future - quand les modèles seront plus matures)
   */
  async imageToCode(imageUrl: string): Promise<string> {
    // TODO: Implémenter quand les modèles vision-to-code seront plus matures
    throw new Error('Fonctionnalité en développement');
  }

  /**
   * Construit un prompt optimisé pour la génération web
   */
  private buildWebGenerationPrompt(context: any): string {
    return `You are an expert web developer specializing in modern, responsive websites.
Generate a complete single-page website for:

Business: ${context.name}
Type: ${context.type}
Description: ${context.description}
Style: ${context.style || 'modern'}
Features: ${context.features?.join(', ') || 'standard business website'}

Requirements:
- Mobile-first responsive design
- Semantic HTML5
- Modern CSS (flexbox, grid)
- Accessible (ARIA labels)
- SEO optimized
- Fast loading
- Beautiful typography
- Smooth animations
- Contact form
- Social media links

Use inline CSS for simplicity. Include modern JavaScript for interactivity.
Generate the complete HTML file:`;
  }

  /**
   * Nettoie et valide le HTML généré
   */
  private cleanAndValidateHTML(html: string): string {
    // Retirer les marqueurs de code
    html = html.replace(/```html?/gi, '').replace(/```/g, '');
    
    // S'assurer que le HTML est complet
    if (!html.includes('<!DOCTYPE')) {
      html = '<!DOCTYPE html>\n' + html;
    }
    
    if (!html.includes('<html')) {
      html = '<!DOCTYPE html>\n<html lang="fr">\n' + html + '\n</html>';
    }
    
    // Validation basique
    const hasHead = html.includes('<head>') && html.includes('</head>');
    const hasBody = html.includes('<body>') && html.includes('</body>');
    
    if (!hasHead || !hasBody) {
      throw new Error('HTML invalide généré');
    }
    
    return html;
  }

  /**
   * Génération de fallback avec un modèle plus simple
   */
  private async fallbackGeneration(context: any): Promise<string> {
    try {
      const result = await this.hf.textGeneration({
        model: 'microsoft/phi-2',
        inputs: `Create a simple but modern website HTML for ${context.name}. Include CSS and make it responsive.`,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.5,
        }
      });
      
      return this.cleanAndValidateHTML(result.generated_text);
    } catch (error) {
      // Dernier recours : template de base
      return this.generateBaseTemplate(context);
    }
  }

  /**
   * Template de base en cas d'échec total
   */
  private generateBaseTemplate(context: any): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${context.name}</title>
    <style>
        /* CSS moderne généré */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        /* ... reste du CSS ... */
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${context.name}</h1>
            <p>${context.description}</p>
        </div>
    </header>
    <!-- Reste du contenu -->
</body>
</html>`;
  }

  /**
   * Parse le contenu SEO depuis la réponse
   */
  private parseSEOContent(text: string): any {
    try {
      // Essayer de parser comme JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback : extraire manuellement
    }
    
    // Extraction manuelle si pas de JSON
    return {
      title: this.extractBetween(text, 'title:', '\n') || 'Site web professionnel',
      metaDescription: this.extractBetween(text, 'description:', '\n') || '',
      h1: this.extractBetween(text, 'h1:', '\n') || 'Bienvenue',
      heroText: this.extractBetween(text, 'hero:', '\n') || '',
      ctaText: this.extractBetween(text, 'cta:', '\n') || 'Contactez-nous'
    };
  }

  /**
   * Formate un article de blog
   */
  private formatBlogPost(content: string, topic: any): any {
    // Extraire le titre si présent
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic.title;
    
    // Créer un excerpt
    const excerpt = content.substring(0, 200).replace(/[#*]/g, '').trim() + '...';
    
    // Extraire des tags pertinents
    const tags = topic.keywords || [];
    
    return {
      title,
      content,
      excerpt,
      tags,
      seoTitle: title.substring(0, 60),
      seoDescription: excerpt.substring(0, 160)
    };
  }

  /**
   * Utilitaire pour extraire du texte
   */
  private extractBetween(text: string, start: string, end: string): string {
    const startIdx = text.indexOf(start);
    if (startIdx === -1) return '';
    
    const contentStart = startIdx + start.length;
    const endIdx = text.indexOf(end, contentStart);
    
    return text.substring(contentStart, endIdx === -1 ? undefined : endIdx).trim();
  }
}

// Export singleton
export const webGenerator = new SpecializedWebGenerator();