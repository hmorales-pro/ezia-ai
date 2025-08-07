import { HfInference } from "@huggingface/inference";
import { AI_MODELS, getCompatibleModel } from "./ai-models-config";

interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
}

export async function generateAIResponse(
  prompt: string,
  options: {
    systemContext?: string;
    preferredModel?: string;
    token?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<AIResponse> {
  const {
    systemContext = "",
    preferredModel = "google/flan-t5-large",
    token,
    maxTokens = 1500,
    temperature = 0.7
  } = options;

  const hfToken = token || process.env.DEFAULT_HF_TOKEN || process.env.HF_TOKEN;
  
  if (!hfToken) {
    return {
      success: false,
      error: "Aucun token HuggingFace configuré"
    };
  }

  const hf = new HfInference(hfToken);
  
  // Construire le prompt complet
  const fullPrompt = systemContext 
    ? `${systemContext}\n\n${prompt}`
    : prompt;

  // Essayer différentes approches selon le modèle
  const attempts = [
    // Tentative 1: Text2Text (le plus polyvalent)
    async () => {
      const model = getCompatibleModel(preferredModel, "text2text-generation");
      const response = await hf.textToText({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: Math.min(maxTokens, AI_MODELS[model]?.maxTokens || 1024),
          temperature,
          do_sample: true
        }
      });
      return { 
        content: response.generated_text, 
        model 
      };
    },
    
    // Tentative 2: Conversational
    async () => {
      const model = getCompatibleModel(preferredModel, "conversational");
      const response = await hf.conversational({
        model,
        inputs: {
          past_user_inputs: [],
          generated_responses: [],
          text: fullPrompt
        },
        parameters: {
          max_new_tokens: Math.min(maxTokens, AI_MODELS[model]?.maxTokens || 1024),
          temperature
        }
      });
      return { 
        content: response.generated_responses[0], 
        model 
      };
    },
    
    // Tentative 3: Text Generation
    async () => {
      const model = getCompatibleModel(preferredModel, "text-generation");
      const response = await hf.textGeneration({
        model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: Math.min(maxTokens, AI_MODELS[model]?.maxTokens || 1024),
          temperature,
          return_full_text: false
        }
      });
      return { 
        content: response.generated_text, 
        model 
      };
    }
  ];

  // Essayer chaque approche jusqu'à ce qu'une fonctionne
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result.content) {
        return {
          success: true,
          content: result.content.trim(),
          model: result.model
        };
      }
    } catch (error) {
      // Continuer avec la prochaine tentative
      console.error("AI attempt failed:", error);
    }
  }

  // Si toutes les tentatives échouent
  return {
    success: false,
    error: "Impossible de générer une réponse avec les modèles disponibles"
  };
}

// Fonction spécialisée pour les analyses business
export async function generateBusinessAnalysis(
  businessInfo: {
    name: string;
    sector: string;
    description: string;
    target?: string;
  },
  analysisType: string,
  token?: string
): Promise<AIResponse> {
  const prompts: Record<string, string> = {
    market_analysis: `Analyse de marché pour ${businessInfo.name} (${businessInfo.sector}):
${businessInfo.description}
Cible: ${businessInfo.target || "Grand public"}

Fournis une analyse de marché détaillée incluant:
1. Taille et tendances du marché
2. Segments de clientèle
3. Opportunités de croissance
4. Défis potentiels
5. Recommandations stratégiques`,

    marketing_strategy: `Stratégie marketing pour ${businessInfo.name}:
Secteur: ${businessInfo.sector}
Description: ${businessInfo.description}

Crée une stratégie marketing complète avec:
1. Positionnement de marque
2. Canaux marketing prioritaires
3. Messages clés
4. Budget recommandé (en %)
5. KPIs à suivre`,

    competitor_analysis: `Analyse concurrentielle pour ${businessInfo.name} dans le secteur ${businessInfo.sector}:

Identifie et analyse:
1. Principaux concurrents (3-5)
2. Leurs forces et faiblesses
3. Leur positionnement
4. Opportunités de différenciation
5. Stratégies pour se démarquer`,

    content_calendar: `Calendrier de contenu pour ${businessInfo.name}:

Crée un planning de contenu sur 30 jours avec:
1. Types de contenu par semaine
2. Thèmes principaux
3. Fréquence de publication
4. Meilleurs moments pour publier
5. Idées de posts spécifiques`
  };

  const systemContext = `Tu es un agent spécialisé d'Ezia, expert en stratégie business. 
Tu fournis des analyses professionnelles, détaillées et actionnables en français.
Utilise un ton professionnel mais accessible.
Structure tes réponses avec des titres clairs et des points numérotés.`;

  const prompt = prompts[analysisType] || `Analyse ${analysisType} pour ${businessInfo.name}`;

  return generateAIResponse(prompt, {
    systemContext,
    token,
    preferredModel: "google/flan-t5-large",
    maxTokens: 2000,
    temperature: 0.8
  });
}