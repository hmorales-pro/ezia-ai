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
5. Structure ta réponse en JSON avec un champ "sources" listant toutes les références utilisées`
          },
          {
            role: "user",
            content: `Recherche et analyse avec données web actuelles pour: ${query}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        stream: false,
        response_format: { type: "json_object" },
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
    const content = data.choices[0]?.message?.content;
    
    // Extraire les sources si présentes dans le JSON
    let sources = [];
    try {
      const parsed = JSON.parse(content);
      sources = parsed.sources || [];
    } catch (e) {
      console.log("[Mistral Search] Pas de sources structurées dans la réponse");
    }
    
    return {
      success: true,
      content: content,
      sources: sources
    };
    
  } catch (error: any) {
    console.error("[Mistral Search] Exception:", error.message);
    return fallbackToStandardModel(query, context, mistralApiKey);
  }
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