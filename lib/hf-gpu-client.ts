import { HfInference } from '@huggingface/inference';

// Configuration pour différents modèles GPU sur HF
export const HF_GPU_MODELS = {
  // Génération d'images
  image: {
    'stable-diffusion': 'stabilityai/stable-diffusion-xl-base-1.0',
    'dalle-mini': 'dalle-mini/dalle-mini',
    'midjourney-style': 'prompthero/openjourney-v4'
  },
  
  // LLMs pour génération de contenu
  text: {
    'mistral': 'mistralai/Mistral-7B-Instruct-v0.2',
    'llama': 'meta-llama/Llama-2-70b-chat-hf',
    'codellama': 'codellama/CodeLlama-34b-Instruct-hf'
  },
  
  // Analyse d'images
  vision: {
    'clip': 'openai/clip-vit-base-patch32',
    'blip': 'Salesforce/blip-image-captioning-large'
  },
  
  // Audio/Voix
  audio: {
    'whisper': 'openai/whisper-large-v3',
    'bark': 'suno/bark'
  }
} as const;

export class HuggingFaceGPUClient {
  private hf: HfInference;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 3600000; // 1 heure

  constructor() {
    this.hf = new HfInference(process.env.HF_TOKEN);
  }

  /**
   * Génère une image via GPU HF
   */
  async generateImage(prompt: string, options?: {
    model?: string;
    width?: number;
    height?: number;
    steps?: number;
  }): Promise<Blob> {
    const model = options?.model || HF_GPU_MODELS.image['stable-diffusion'];
    
    try {
      const result = await this.hf.textToImage({
        model,
        inputs: prompt,
        parameters: {
          width: options?.width || 1024,
          height: options?.height || 1024,
          num_inference_steps: options?.steps || 50
        }
      });
      
      return result;
    } catch (error) {
      console.error('HF GPU Image Generation Error:', error);
      throw new Error(`Failed to generate image: ${error}`);
    }
  }

  /**
   * Analyse une image avec un modèle vision
   */
  async analyzeImage(imageUrl: string, task: 'caption' | 'classify' = 'caption'): Promise<string> {
    const model = task === 'caption' 
      ? HF_GPU_MODELS.vision.blip 
      : HF_GPU_MODELS.vision.clip;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const result = await this.hf.imageToText({
        model,
        data: blob
      });
      
      return result.generated_text || 'No description available';
    } catch (error) {
      console.error('HF GPU Vision Error:', error);
      throw new Error(`Failed to analyze image: ${error}`);
    }
  }

  /**
   * Génère du code via CodeLlama sur GPU
   */
  async generateCode(prompt: string, language?: string): Promise<string> {
    const cacheKey = `code:${prompt}:${language}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const systemPrompt = language 
      ? `You are an expert ${language} developer. Generate clean, efficient code.`
      : 'You are an expert developer. Generate clean, efficient code.';
    
    try {
      const result = await this.hf.textGeneration({
        model: HF_GPU_MODELS.text.codellama,
        inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.3,
          top_p: 0.95,
          return_full_text: false
        }
      });
      
      const code = result.generated_text;
      this.setCache(cacheKey, code);
      
      return code;
    } catch (error) {
      console.error('HF GPU Code Generation Error:', error);
      throw new Error(`Failed to generate code: ${error}`);
    }
  }

  /**
   * Transcrit de l'audio en texte via Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const result = await this.hf.automaticSpeechRecognition({
        model: HF_GPU_MODELS.audio.whisper,
        data: audioBlob
      });
      
      return result.text;
    } catch (error) {
      console.error('HF GPU Audio Transcription Error:', error);
      throw new Error(`Failed to transcribe audio: ${error}`);
    }
  }

  /**
   * Génère du contenu marketing optimisé
   */
  async generateMarketingContent(
    business: string, 
    type: 'slogan' | 'description' | 'social-post'
  ): Promise<string> {
    const prompts = {
      'slogan': `Create a catchy, memorable slogan for ${business}. Be creative and concise.`,
      'description': `Write a compelling business description for ${business}. Focus on value proposition and benefits.`,
      'social-post': `Create an engaging social media post for ${business}. Include relevant hashtags and call-to-action.`
    };
    
    try {
      const result = await this.hf.textGeneration({
        model: HF_GPU_MODELS.text.mistral,
        inputs: prompts[type],
        parameters: {
          max_new_tokens: type === 'slogan' ? 50 : 300,
          temperature: 0.8,
          top_p: 0.9
        }
      });
      
      return result.generated_text;
    } catch (error) {
      console.error('HF GPU Marketing Generation Error:', error);
      throw new Error(`Failed to generate ${type}: ${error}`);
    }
  }

  /**
   * Cache simple pour éviter les appels répétés
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Nettoyage du cache si trop gros
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Vérifie la disponibilité des services GPU
   */
  async checkGPUAvailability(): Promise<{
    available: boolean;
    models: string[];
    quota?: number;
  }> {
    try {
      // Test avec un modèle léger
      await this.hf.textGeneration({
        model: HF_GPU_MODELS.text.mistral,
        inputs: 'test',
        parameters: { max_new_tokens: 1 }
      });
      
      return {
        available: true,
        models: Object.values(HF_GPU_MODELS).flatMap(m => Object.values(m))
      };
    } catch (error: any) {
      return {
        available: false,
        models: [],
        quota: error.message.includes('quota') ? 0 : undefined
      };
    }
  }
}

// Export singleton
export const hfGPUClient = new HuggingFaceGPUClient();