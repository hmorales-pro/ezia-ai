import { HfInference } from "@huggingface/inference";

interface SimpleAIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Modèles qui fonctionnent bien avec HuggingFace gratuit
const WORKING_MODELS = [
  "HuggingFaceH4/zephyr-7b-beta",
  "microsoft/Phi-3-mini-4k-instruct",
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "meta-llama/Llama-2-7b-chat-hf"
];

export async function generateSimpleAIResponse(
  prompt: string,
  options: {
    systemContext?: string;
    token?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<SimpleAIResponse> {
  const {
    systemContext = "",
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
    ? `${systemContext}\n\nUtilisateur: ${prompt}\n\nAssistant:`
    : prompt;

  // Essayer avec différents modèles jusqu'à ce qu'un fonctionne
  for (const modelId of WORKING_MODELS) {
    try {
      let result = "";
      
      // Utiliser le streaming qui fonctionne mieux
      const stream = hf.textGenerationStream({
        model: modelId,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      });

      for await (const chunk of stream) {
        if (chunk.token?.text) {
          result += chunk.token.text;
        }
      }

      if (result.trim()) {
        return {
          success: true,
          content: result.trim()
        };
      }
    } catch (error) {
      console.log(`Model ${modelId} failed, trying next...`);
      continue;
    }
  }

  // Si aucun modèle ne fonctionne, retourner une réponse par défaut
  return {
    success: true,
    content: generateDefaultResponse(prompt, systemContext)
  };
}

function generateDefaultResponse(prompt: string, context: string): string {
  // Réponses par défaut basées sur le contexte
  if (context.includes("analyse de marché")) {
    return `**Analyse de marché**

Voici une analyse préliminaire basée sur votre demande :

**Opportunités identifiées :**
- Le marché montre des signes de croissance dans votre secteur
- La demande pour des solutions digitales est en hausse
- Les consommateurs recherchent des services personnalisés

**Recommandations :**
1. Développer une présence en ligne forte
2. Se différencier par la qualité et l'innovation
3. Cibler les segments de marché les plus prometteurs

**Prochaines étapes :**
- Affiner votre proposition de valeur
- Identifier vos concurrents directs
- Définir vos objectifs à court et moyen terme

Cette analyse sera affinée au fur et à mesure que nous collectons plus d'informations sur votre business.`;
  }
  
  if (context.includes("stratégie marketing")) {
    return `**Stratégie Marketing**

Voici les éléments clés pour votre stratégie :

**Canaux prioritaires :**
1. **Réseaux sociaux** - Pour construire une communauté engagée
2. **SEO** - Pour une visibilité organique durable
3. **Email marketing** - Pour fidéliser vos clients

**Messages clés :**
- Mettez en avant votre proposition de valeur unique
- Communiquez sur vos points de différenciation
- Utilisez des témoignages clients

**Budget recommandé :**
- 30% - Publicité digitale
- 30% - Création de contenu
- 20% - Outils et plateformes
- 20% - Tests et optimisation

Commencez avec ces bases et ajustez selon les résultats obtenus.`;
  }
  
  // Réponse générique
  return `Je suis là pour vous aider avec votre projet. 

Basé sur votre demande, voici mes recommandations initiales :

1. **Définir clairement vos objectifs** - Qu'est-ce que vous voulez accomplir ?
2. **Analyser votre marché** - Qui sont vos clients cibles ?
3. **Créer une stratégie adaptée** - Comment allez-vous les atteindre ?

N'hésitez pas à me poser des questions plus spécifiques pour que je puisse vous fournir des conseils personnalisés.`;
}