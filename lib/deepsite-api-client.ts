import { z } from 'zod';

// Configuration du client DeepSite HF
const DEEPSITE_CONFIG = {
  baseUrl: process.env.DEEPSITE_HF_URL || 'https://huggingface.co/spaces',
  spaceId: process.env.DEEPSITE_SPACE_ID || 'hmorales/deepsite-v2',
  apiEndpoint: '/api/predict',
  timeout: 120000 // 2 minutes pour génération
};

// Schémas de validation
const DeepSiteRequestSchema = z.object({
  prompt: z.string().min(10),
  html: z.string().optional(),
  style: z.enum(['modern', 'classic', 'minimal', 'colorful']).optional(),
  features: z.array(z.string()).optional()
});

const DeepSiteResponseSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
  js: z.string().optional(),
  preview_url: z.string().optional(),
  error: z.string().optional()
});

export type DeepSiteRequest = z.infer<typeof DeepSiteRequestSchema>;
export type DeepSiteResponse = z.infer<typeof DeepSiteResponseSchema>;

export class DeepSiteAPIClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    // Construction de l'URL complète du Space
    this.baseUrl = `${DEEPSITE_CONFIG.baseUrl}/${DEEPSITE_CONFIG.spaceId}`;
    
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'User-Agent': 'Ezia/1.0'
    };
  }

  /**
   * Génère un site web via DeepSite sur HF Spaces
   */
  async generateWebsite(request: DeepSiteRequest): Promise<DeepSiteResponse> {
    try {
      // Validation des données d'entrée
      const validatedRequest = DeepSiteRequestSchema.parse(request);

      // Appel à l'API DeepSite sur HF
      const response = await fetch(`${this.baseUrl}${DEEPSITE_CONFIG.apiEndpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          data: [
            validatedRequest.prompt,
            validatedRequest.html || '',
            validatedRequest.style || 'modern',
            validatedRequest.features?.join(',') || ''
          ]
        }),
        signal: AbortSignal.timeout(DEEPSITE_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`DeepSite API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Extraction des données de la réponse HF Spaces
      const generatedData = result.data?.[0] || {};
      
      return DeepSiteResponseSchema.parse({
        html: generatedData.html || generatedData.code || '',
        css: generatedData.css,
        js: generatedData.js,
        preview_url: generatedData.preview_url,
        error: generatedData.error
      });

    } catch (error) {
      console.error('DeepSite API Client Error:', error);
      
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid DeepSite data: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Modifie un site existant via DeepSite
   */
  async modifyWebsite(html: string, modifications: string): Promise<DeepSiteResponse> {
    return this.generateWebsite({
      prompt: modifications,
      html: html
    });
  }

  /**
   * Vérifie si DeepSite est disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(5000) // 5 secondes
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton pour l'utilisation dans l'app
export const deepSiteClient = new DeepSiteAPIClient();