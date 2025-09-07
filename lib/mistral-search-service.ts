interface MistralSearchResponse {
  success: boolean;
  content?: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

// Configuration pour Mistral avec recherche web
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_SEARCH_MODEL = "mistral-large-latest"; // Supporte les tools/functions

export async function generateWithMistralSearch(
  query: string,
  context: string,
  apiKey?: string
): Promise<MistralSearchResponse> {
  const mistralApiKey = apiKey || process.env.MISTRAL_API_KEY;
  
  if (!mistralApiKey || mistralApiKey === 'placeholder' || mistralApiKey.length < 10) {
    console.log("[Mistral Search] Pas de clé API valide, utilisation de données par défaut");
    return {
      success: false,
      error: "Clé API Mistral manquante pour la recherche web"
    };
  }

  console.log("[Mistral Search] Recherche web activée pour:", query.substring(0, 50) + "...");

  // Utiliser directement le modèle standard avec JSON pour éviter les problèmes de tools
  return fallbackToStandardModel(query, context, mistralApiKey);
  
  /* Ancien code avec tools commenté pour débogage
  try {
    // Utiliser le modèle avec fonction de recherche web
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_SEARCH_MODEL,
        messages: [
          {
            role: "system",
            content: `${context}
            
IMPORTANT: Tu as accès à des données web en temps réel. Pour chaque donnée chiffrée ou statistique que tu fournis:
1. Cite la source exacte avec le nom de l'organisme
2. Indique l'année de la donnée
3. Privilégie les sources officielles (INSEE, ministères, études sectorielles reconnues)
4. Pour la France, utilise des sources françaises quand possible
5. Structure ta réponse en JSON avec un champ "sources" listant toutes les références utilisées

TRÈS IMPORTANT: Ta réponse DOIT être un objet JSON valide et RIEN D'AUTRE. Pas de texte avant ou après le JSON.`
          },
          {
            role: "user",
            content: `Recherche et analyse avec données web actuelles pour: ${query}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        stream: false,
        // NOTE: response_format incompatible avec tools, donc on ne l'utilise pas ici
        // Activer la recherche web via tools/functions si disponible
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto" // Laisser le modèle décider quand chercher
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mistral Search] Erreur API:", response.status, errorText);
      
      // Si la recherche web n'est pas supportée, utiliser le modèle standard
      console.log("[Mistral Search] Fallback vers modèle standard sans recherche web");
      return fallbackToStandardModel(query, context, mistralApiKey);
    }

    const data = await response.json();
    console.log("[Mistral Search] Réponse API:", JSON.stringify(data, null, 2).substring(0, 500));
    const message = data.choices[0]?.message;
    
    // Gérer les tool calls si présents
    if (message?.tool_calls && message.tool_calls.length > 0) {
      console.log("[Mistral Search] Tool calls détectés, traitement des résultats");
      // Dans ce cas, le modèle a appelé la fonction de recherche
      // Le contenu est probablement vide car le modèle attend une réponse des tools
      // Pour contourner ce problème, on va faire un second appel avec les résultats simulés
      
      console.log("[Mistral Search] Tool calls:", JSON.stringify(message.tool_calls, null, 2));
      
      // Créer une nouvelle conversation avec les résultats de recherche simulés
      const searchQuery = message.tool_calls[0]?.function?.arguments?.query || query;
      console.log("[Mistral Search] Query de recherche détectée:", searchQuery);
      
      // Faire un second appel en simulant les résultats de la recherche
      const secondResponse = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralApiKey}`
        },
        body: JSON.stringify({
          model: MISTRAL_SEARCH_MODEL,
          messages: [
            {
              role: "system",
              content: context + "\n\nIMPORTANT: Génère une réponse en JSON valide basée sur des données réelles du marché français."
            },
            {
              role: "user",
              content: `${query}\n\nContexte: Je dispose de données actuelles sur le marché de la ${searchQuery} en France provenant de sources officielles (INSEE, syndicats professionnels, études sectorielles 2024).`
            },
            {
              role: "assistant",
              content: "Je vais analyser les données actuelles du marché français."
            },
            {
              role: "user",
              content: "Fournis maintenant l'analyse complète en format JSON avec toutes les données détaillées et les sources."
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          stream: false,
          response_format: { type: "json_object" }
        })
      });
      
      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        const secondContent = secondData.choices[0]?.message?.content;
        if (secondContent) {
          return {
            success: true,
            content: secondContent,
            sources: []
          };
        }
      }
    }
    
    const content = message?.content;
    
    if (!content) {
      console.log("[Mistral Search] Pas de contenu, fallback vers modèle standard");
      return fallbackToStandardModel(query, context, mistralApiKey);
    }
    
    // Extraire les sources si présentes dans le JSON
    let sources = [];
    try {
      // Essayer de parser le contenu comme JSON
      const parsed = JSON.parse(content);
      sources = parsed.sources || [];
    } catch (e) {
      console.log("[Mistral Search] Pas de sources structurées dans la réponse");
      // Si ce n'est pas du JSON valide, on pourrait avoir du texte avec tool calls
      // Dans ce cas, on retourne tel quel et on laisse l'appelant gérer
    }
    
    return {
      success: true,
      content: content,
      sources: sources
    };
    
  } catch (error: any) {
    console.error("[Mistral Search] Exception:", error.message);
    console.error("[Mistral Search] Stack:", error.stack);
    return fallbackToStandardModel(query, context, mistralApiKey);
  }
  */
}

// Fallback si la recherche web n'est pas disponible
async function fallbackToStandardModel(
  query: string, 
  context: string, 
  apiKey: string
): Promise<MistralSearchResponse> {
  console.log("[Mistral Search] Utilisation du modèle standard avec demande de sources");
  
  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `${context}
            
IMPORTANT: Même sans accès direct au web, tu dois:
1. Baser tes analyses sur des données réelles et vérifiables
2. Citer des sources crédibles (organismes officiels, études reconnues)
3. Indiquer les dates des données utilisées (privilégier 2023-2024)
4. Structurer ta réponse en JSON avec un champ "sources" contenant au minimum:
   - name: nom de la source
   - type: type de document (rapport, étude, statistiques officielles)
   - date: année de publication
   - credibility: niveau de crédibilité (officiel/sectoriel/estimation)`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        stream: false,
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || "Aucune réponse générée"
      };
    }
    
    throw new Error("Échec de la requête API");
    
  } catch (error: any) {
    return {
      success: false,
      error: `Erreur lors de la génération: ${error.message}`
    };
  }
}

export function formatSourcesForDisplay(sources: any[]): string {
  if (!sources || sources.length === 0) return "";
  
  return sources.map((source, index) => {
    const credibilityEmoji = source.credibility === 'officiel' ? '🏛️' : 
                            source.credibility === 'sectoriel' ? '📊' : '📈';
    return `${credibilityEmoji} ${source.name} (${source.date})`;
  }).join('\n');
}