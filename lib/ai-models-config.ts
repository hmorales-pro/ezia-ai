export interface AIModel {
  id: string;
  name: string;
  provider: string;
  task: 'conversational' | 'text-generation' | 'text2text-generation';
  maxTokens: number;
  description?: string;
}

export const AI_MODELS: Record<string, AIModel> = {
  // Modèles conversationnels
  "microsoft/DialoGPT-medium": {
    id: "microsoft/DialoGPT-medium",
    name: "DialoGPT",
    provider: "huggingface",
    task: "conversational",
    maxTokens: 1024,
    description: "Modèle conversationnel optimisé pour le dialogue"
  },
  "facebook/blenderbot-400M-distill": {
    id: "facebook/blenderbot-400M-distill",
    name: "BlenderBot",
    provider: "huggingface",
    task: "conversational",
    maxTokens: 1024,
    description: "Modèle de chat développé par Facebook"
  },
  
  // Modèles de génération de texte
  "gpt2": {
    id: "gpt2",
    name: "GPT-2",
    provider: "huggingface",
    task: "text-generation",
    maxTokens: 1024,
    description: "Modèle de génération de texte classique"
  },
  "microsoft/Phi-3-mini-4k-instruct": {
    id: "microsoft/Phi-3-mini-4k-instruct",
    name: "Phi-3 Mini",
    provider: "huggingface",
    task: "text-generation",
    maxTokens: 4096,
    description: "Modèle compact et efficace de Microsoft"
  },
  
  // Modèles text2text
  "google/flan-t5-base": {
    id: "google/flan-t5-base",
    name: "FLAN-T5",
    provider: "huggingface",
    task: "text2text-generation",
    maxTokens: 512,
    description: "Modèle polyvalent pour diverses tâches"
  },
  "google/flan-t5-large": {
    id: "google/flan-t5-large",
    name: "FLAN-T5 Large",
    provider: "huggingface",
    task: "text2text-generation",
    maxTokens: 1024,
    description: "Version plus puissante de FLAN-T5"
  }
};

// Modèle par défaut pour chaque type de tâche
export const DEFAULT_MODELS = {
  conversational: "microsoft/DialoGPT-medium",
  "text-generation": "microsoft/Phi-3-mini-4k-instruct",
  "text2text-generation": "google/flan-t5-base"
};

// Fonction pour obtenir un modèle compatible
export function getCompatibleModel(preferredModel: string, task: AIModel['task']): string {
  const model = AI_MODELS[preferredModel];
  
  // Si le modèle préféré est compatible avec la tâche
  if (model && model.task === task) {
    return preferredModel;
  }
  
  // Sinon, retourner le modèle par défaut pour cette tâche
  return DEFAULT_MODELS[task];
}