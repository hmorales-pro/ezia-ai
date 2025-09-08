import { generateWithMistralAPI } from './mistral-ai-service';

interface WebAnalysisResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  businessType?: string;
  mainServices?: string[];
  targetAudience?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  recommendations?: string[];
  error?: string;
}

export class WebAnalyzer {
  /**
   * Analyse une URL et extrait des informations business
   */
  static async analyzeUrl(url: string): Promise<WebAnalysisResult> {
    try {
      // Valider l'URL
      const validUrl = this.validateUrl(url);
      if (!validUrl) {
        // Détecter le type d'erreur
        let errorMessage = "URL invalide.";
        if (url.includes('httsp://') || url.includes('htps://')) {
          errorMessage = "Protocole mal orthographié détecté. L'URL a été corrigée automatiquement.";
          // Réessayer avec la correction
          const correctedUrl = url.replace(/^ht+[ps]+:\/\//, 'https://');
          const retryUrl = this.validateUrl(correctedUrl);
          if (retryUrl) {
            return this.analyzeUrl(correctedUrl);
          }
        }
        
        return {
          success: false,
          url,
          error: `${errorMessage} Veuillez fournir une URL complète (ex: https://example.com)`
        };
      }

      // Fetch le contenu de la page
      const pageContent = await this.fetchPageContent(validUrl);
      if (!pageContent) {
        return {
          success: false,
          url: validUrl,
          error: "Impossible de récupérer le contenu de la page. Vérifiez l'URL et réessayez."
        };
      }

      // Analyser avec Mistral
      const analysis = await this.analyzeContent(pageContent, validUrl);
      
      return {
        success: true,
        url: validUrl,
        ...analysis
      };
    } catch (error) {
      console.error('[WebAnalyzer] Erreur:', error);
      return {
        success: false,
        url,
        error: error instanceof Error ? error.message : "Erreur lors de l'analyse"
      };
    }
  }

  /**
   * Valide et normalise une URL
   */
  private static validateUrl(url: string): string | null {
    try {
      // Nettoyer l'URL
      let normalizedUrl = url.trim();
      
      // Vérifier et corriger les protocoles mal orthographiés courants
      if (normalizedUrl.startsWith('htps://') || normalizedUrl.startsWith('httsp://')) {
        normalizedUrl = normalizedUrl.replace(/^ht+[ps]+:\/\//, 'https://');
      } else if (normalizedUrl.startsWith('htp://')) {
        normalizedUrl = normalizedUrl.replace(/^htp:\/\//, 'http://');
      }
      
      // Ajouter le protocole si manquant
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const urlObj = new URL(normalizedUrl);
      
      // Vérifier que l'URL a un hostname valide
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return null;
      }
      
      return urlObj.href;
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère le contenu HTML d'une page
   */
  private static async fetchPageContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EziaBot/1.0; +https://ezia.ai)'
        },
        signal: AbortSignal.timeout(10000) // 10 secondes timeout
      });

      if (!response.ok) {
        console.error('[WebAnalyzer] Erreur HTTP:', response.status);
        return null;
      }

      const html = await response.text();
      
      // Extraire le texte principal et les métadonnées
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      
      // Nettoyer le HTML et extraire le texte
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 5000); // Limiter à 5000 caractères

      return `
URL: ${url}
Titre: ${titleMatch ? titleMatch[1].trim() : 'Non trouvé'}
Description: ${descriptionMatch ? descriptionMatch[1].trim() : 'Non trouvée'}
H1: ${h1Match ? h1Match[1].trim() : 'Non trouvé'}

Contenu principal:
${textContent}
      `.trim();
    } catch (error) {
      console.error('[WebAnalyzer] Erreur fetch:', error);
      return null;
    }
  }

  /**
   * Analyse le contenu avec Mistral
   */
  private static async analyzeContent(content: string, url: string): Promise<Partial<WebAnalysisResult>> {
    const systemPrompt = `Tu es un expert en analyse business et marketing digital. 
Analyse le contenu de ce site web et fournis une analyse structurée en français.`;

    const userPrompt = `Analyse ce site web et fournis les informations suivantes de manière concise:

${content}

Fournis ton analyse sous cette forme exacte:
1. Titre du site: [titre]
2. Description: [description en 1-2 phrases]
3. Type de business: [type]
4. Services principaux: [liste de 3-5 services]
5. Audience cible: [description de l'audience]
6. Points forts: [3 points forts identifiés]
7. Points faibles: [3 points à améliorer]
8. Opportunités: [3 opportunités de croissance]
9. Recommandations: [3 recommandations stratégiques]`;

    try {
      const response = await generateWithMistralAPI(userPrompt, systemPrompt);
      
      if (!response.success || !response.content) {
        // Utiliser une analyse par défaut
        return this.getDefaultAnalysis(content, url);
      }

      // Parser la réponse
      const parsed = this.parseAnalysisResponse(response.content);
      return parsed;
    } catch (error) {
      console.error('[WebAnalyzer] Erreur Mistral:', error);
      return this.getDefaultAnalysis(content, url);
    }
  }

  /**
   * Parse la réponse de Mistral
   */
  private static parseAnalysisResponse(content: string): Partial<WebAnalysisResult> {
    const result: Partial<WebAnalysisResult> = {};

    // Extraire chaque section
    const titleMatch = content.match(/1\.\s*Titre[^:]*:\s*(.+)/i);
    const descMatch = content.match(/2\.\s*Description[^:]*:\s*(.+)/i);
    const typeMatch = content.match(/3\.\s*Type[^:]*:\s*(.+)/i);
    const servicesMatch = content.match(/4\.\s*Services[^:]*:\s*(.+)/i);
    const audienceMatch = content.match(/5\.\s*Audience[^:]*:\s*(.+)/i);
    const strengthsMatch = content.match(/6\.\s*Points forts[^:]*:\s*([\s\S]+?)(?=\d+\.|$)/i);
    const weaknessesMatch = content.match(/7\.\s*Points faibles[^:]*:\s*([\s\S]+?)(?=\d+\.|$)/i);
    const opportunitiesMatch = content.match(/8\.\s*Opportunités[^:]*:\s*([\s\S]+?)(?=\d+\.|$)/i);
    const recommendationsMatch = content.match(/9\.\s*Recommandations[^:]*:\s*([\s\S]+?)(?=$)/i);

    if (titleMatch) result.title = titleMatch[1].trim().replace(/\*\*/g, '');
    if (descMatch) result.description = descMatch[1].trim().replace(/\*\*/g, '');
    if (typeMatch) result.businessType = typeMatch[1].trim().replace(/\*\*/g, '');
    if (servicesMatch) {
      // Nettoyer et parser les services
      const servicesText = servicesMatch[1].replace(/\*\*/g, '').replace(/[-–—]\s*/g, '');
      result.mainServices = servicesText
        .split(/[,;•\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 5 && !s.match(/^[:\s]*$/));
    }
    if (audienceMatch) {
      // Nettoyer l'audience cible
      result.targetAudience = audienceMatch[1]
        .replace(/\*\*/g, '')
        .replace(/^[-–—]\s*/, '')
        .trim();
    }

    // Parser les listes
    if (strengthsMatch) result.strengths = this.parseList(strengthsMatch[1]);
    if (weaknessesMatch) result.weaknesses = this.parseList(weaknessesMatch[1]);
    if (opportunitiesMatch) result.opportunities = this.parseList(opportunitiesMatch[1]);
    if (recommendationsMatch) result.recommendations = this.parseList(recommendationsMatch[1]);

    return result;
  }

  /**
   * Parse une liste à partir du texte
   */
  private static parseList(text: string): string[] {
    // Nettoyer le texte des balises Markdown
    const cleanText = text
      .replace(/\*\*/g, '') // Retirer les **
      .replace(/\*/g, '')   // Retirer les *
      .replace(/###?\s*/g, '') // Retirer les ###
      .replace(/\s*:\s*$/gm, '') // Retirer les : en fin de ligne
      .trim();
    
    // Séparer par lignes et nettoyer
    return cleanText
      .split(/\n+/)
      .map(item => {
        // Retirer les puces, numéros, tirets, etc.
        return item
          .replace(/^[-•*\d.)\s]+/, '')
          .replace(/^\s*[-–—]\s*/, '')
          .trim();
      })
      .filter(item => {
        // Filtrer les lignes vides et trop courtes
        return item.length > 10 && !item.match(/^[#\s]*$/);
      })
      .slice(0, 5); // Limiter à 5 éléments
  }

  /**
   * Analyse par défaut si Mistral échoue
   */
  private static getDefaultAnalysis(content: string, url: string): Partial<WebAnalysisResult> {
    const titleMatch = content.match(/Titre:\s*(.+)/);
    const descMatch = content.match(/Description:\s*(.+)/);

    return {
      title: titleMatch ? titleMatch[1] : new URL(url).hostname,
      description: descMatch ? descMatch[1] : "Site web professionnel",
      businessType: "Site vitrine",
      mainServices: ["Services professionnels", "Consultation", "Support client"],
      targetAudience: "Entreprises et particuliers",
      strengths: [
        "Présence en ligne établie",
        "Site web fonctionnel",
        "Informations accessibles"
      ],
      weaknesses: [
        "Optimisation SEO à améliorer",
        "Expérience mobile à vérifier",
        "Contenu à enrichir"
      ],
      opportunities: [
        "Développer la stratégie de contenu",
        "Améliorer la conversion",
        "Intégrer des outils d'analyse"
      ],
      recommendations: [
        "Optimiser le référencement naturel",
        "Créer un blog avec du contenu régulier",
        "Ajouter des témoignages clients"
      ]
    };
  }
}