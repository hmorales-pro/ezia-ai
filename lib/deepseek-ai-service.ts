/**
 * DeepSeek AI Service
 * Service pour utiliser DeepSeek V3 via HuggingFace Inference API
 */

import { HfInference } from "@huggingface/inference";

interface DeepSeekResponse {
  success: boolean;
  content?: string;
  error?: string;
}

interface DeepSeekOptions {
  maxTokens?: number;
  temperature?: number;
  token?: string;
}

/**
 * Génère une réponse avec DeepSeek V3 via HuggingFace
 */
export async function generateWithDeepSeek(
  prompt: string,
  systemContext: string,
  options: DeepSeekOptions = {}
): Promise<DeepSeekResponse> {
  const {
    maxTokens = 4000,
    temperature = 0.7,
    token
  } = options;

  // Récupérer le token HuggingFace
  const hfToken = token || process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;

  console.log('[DeepSeek] Vérification token HuggingFace...');
  console.log('[DeepSeek] Token présent:', !!hfToken);

  if (!hfToken) {
    console.error('[DeepSeek] ❌ Aucun token HuggingFace configuré');
    return {
      success: false,
      error: 'Token HuggingFace manquant'
    };
  }

  try {
    const hf = new HfInference(hfToken);

    console.log('[DeepSeek] Appel API DeepSeek V3...');
    console.log(`[DeepSeek] Max tokens: ${maxTokens}, Temperature: ${temperature}`);

    // Construire le prompt au format chat
    const messages = [
      { role: "system" as const, content: systemContext },
      { role: "user" as const, content: prompt }
    ];

    // Utiliser DeepSeek V3 via HuggingFace
    // Modèle: deepseek-ai/DeepSeek-V3 ou deepseek-ai/deepseek-coder-33b-instruct
    const response = await hf.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3",
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    });

    const content = response.choices[0]?.message?.content || '';

    console.log(`[DeepSeek] ✅ Réponse reçue (${content.length} caractères)`);

    return {
      success: true,
      content
    };

  } catch (error: any) {
    console.error('[DeepSeek] ❌ Erreur API:', error);

    // Si DeepSeek V3 n'est pas disponible, essayer DeepSeek Coder
    if (error.message?.includes('not found') || error.message?.includes('unavailable')) {
      console.log('[DeepSeek] Tentative avec DeepSeek Coder 33B...');

      try {
        const hf = new HfInference(hfToken!);

        const messages = [
          { role: "system" as const, content: systemContext },
          { role: "user" as const, content: prompt }
        ];

        const response = await hf.chatCompletion({
          model: "deepseek-ai/deepseek-coder-33b-instruct",
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false,
        });

        const content = response.choices[0]?.message?.content || '';

        console.log(`[DeepSeek Coder] ✅ Réponse reçue (${content.length} caractères)`);

        return {
          success: true,
          content
        };

      } catch (fallbackError: any) {
        console.error('[DeepSeek Coder] ❌ Erreur:', fallbackError);
        return {
          success: false,
          error: `DeepSeek API error: ${fallbackError.message}`
        };
      }
    }

    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Alternative : Utiliser Qwen 2.5 (Alibaba Cloud) si DeepSeek échoue
 */
export async function generateWithQwen(
  prompt: string,
  systemContext: string,
  options: DeepSeekOptions = {}
): Promise<DeepSeekResponse> {
  const {
    maxTokens = 4000,
    temperature = 0.7,
    token
  } = options;

  const hfToken = token || process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;

  if (!hfToken) {
    return {
      success: false,
      error: 'Token HuggingFace manquant'
    };
  }

  try {
    const hf = new HfInference(hfToken);

    console.log('[Qwen] Appel API Qwen 2.5 72B...');

    const messages = [
      { role: "system" as const, content: systemContext },
      { role: "user" as const, content: prompt }
    ];

    // Qwen 2.5 72B Instruct
    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    });

    const content = response.choices[0]?.message?.content || '';

    console.log(`[Qwen] ✅ Réponse reçue (${content.length} caractères)`);

    return {
      success: true,
      content
    };

  } catch (error: any) {
    console.error('[Qwen] ❌ Erreur API:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}
