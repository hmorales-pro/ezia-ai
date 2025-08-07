import { HfInference } from "@huggingface/inference";

const MISTRAL_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

interface MistralResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export async function generateWithMistral(
  prompt: string,
  systemContext: string,
  token?: string
): Promise<MistralResponse> {
  const hfToken = token || process.env.DEFAULT_HF_TOKEN || process.env.HF_TOKEN;
  
  if (!hfToken) {
    return {
      success: false,
      error: "Aucun token HuggingFace configuré"
    };
  }

  const hf = new HfInference(hfToken);
  
  try {
    // Format du prompt pour Mistral Instruct
    const formattedPrompt = `<s>[INST] ${systemContext}

${prompt} [/INST]`;

    const response = await hf.textGeneration({
      model: MISTRAL_MODEL,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1,
        return_full_text: false,
        stop: ["</s>", "[INST]", "[/INST]"]
      }
    });

    return {
      success: true,
      content: response.generated_text.trim()
    };
  } catch (error: any) {
    console.error("Mistral generation error:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la génération"
    };
  }
}

// Prompts spécifiques pour chaque type d'analyse
export const MISTRAL_PROMPTS = {
  market_analysis: `Tu es Ezia, une experte en analyse de marché et stratégie business. 
Tu dois fournir une analyse de marché détaillée et professionnelle en français.
Format ta réponse en utilisant des sections claires avec des titres en gras (**Titre**).
Sois concret, précis et donne des exemples pertinents.`,

  marketing_strategy: `Tu es Ezia, une experte en marketing digital et croissance d'entreprise.
Tu dois créer une stratégie marketing complète et actionnable en français.
Inclus des tactiques spécifiques, des canaux recommandés et des KPIs à suivre.
Format ta réponse avec des sections claires et des points d'action concrets.`,

  competitor_analysis: `Tu es Ezia, une analyste business spécialisée en veille concurrentielle.
Tu dois fournir une analyse concurrentielle approfondie en français.
Identifie les forces, faiblesses, opportunités et menaces.
Propose des stratégies de différenciation concrètes.`,

  content_calendar: `Tu es Ezia, une experte en content marketing et réseaux sociaux.
Tu dois créer un calendrier de contenu détaillé pour 30 jours en français.
Inclus des idées de posts, les meilleurs moments pour publier, et les hashtags recommandés.
Adapte le contenu à chaque plateforme sociale.`,

  branding: `Tu es Ezia, une experte en branding et identité de marque.
Tu dois développer une stratégie de marque complète en français.
Inclus la personnalité de marque, le ton de voix, les valeurs, et des recommandations visuelles.
Sois créative mais professionnelle.`,

  social_media: `Tu es Ezia, une experte en stratégie réseaux sociaux.
Tu dois créer une stratégie social media complète en français.
Identifie les meilleures plateformes, les types de contenu, et la fréquence de publication.
Inclus des exemples concrets et des bonnes pratiques.`
};