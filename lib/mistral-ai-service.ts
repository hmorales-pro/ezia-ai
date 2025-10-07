interface MistralResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Configuration Mistral AI
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-large-latest";

export async function generateWithMistralAPI(
  prompt: string,
  systemContext: string,
  apiKey?: string
): Promise<MistralResponse> {
  const mistralApiKey = apiKey || process.env.MISTRAL_API_KEY;

  console.log("[Mistral] Vérification de la clé API...");
  console.log("[Mistral] Clé présente:", !!mistralApiKey);

  if (!mistralApiKey || mistralApiKey === 'placeholder' || mistralApiKey.length < 10) {
    const error = "Clé API Mistral requise. Configurez MISTRAL_API_KEY dans .env.local";
    console.error("[Mistral]", error);
    throw new Error(error);
  }

  console.log("[Mistral] Appel à l'API Mistral avec le modèle:", MISTRAL_MODEL);

  // Déterminer les paramètres de génération basés sur le contexte
  // IMPORTANT: Ne pas forcer JSON mode si on génère du HTML
  const isHTMLGeneration = prompt.toLowerCase().includes("html") ||
                           prompt.toLowerCase().includes("<!doctype") ||
                           systemContext.toLowerCase().includes("html");

  const isComplexGeneration = !isHTMLGeneration && (
    systemContext.toLowerCase().includes("json") ||
    systemContext.toLowerCase().includes("structure") ||
    prompt.toLowerCase().includes("json")
  );

  const maxTokens = isComplexGeneration ? 8000 : (isHTMLGeneration ? 16000 : 4000);

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        stream: false,
        ...(isComplexGeneration ? { response_format: { type: "json_object" } } : {})
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mistral] API error:", response.status, errorText);

      // Try fallback to smaller model
      if (response.status === 404 || response.status === 400) {
        console.log("[Mistral] Tentative avec mistral-small-latest...");

        const fallbackResponse = await fetch(MISTRAL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mistralApiKey}`
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
              { role: "system", content: systemContext },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
            stream: false,
            ...(isComplexGeneration ? { response_format: { type: "json_object" } } : {})
          })
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return {
            success: true,
            content: fallbackData.choices[0]?.message?.content || ""
          };
        }
      }

      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0]?.message?.content || ""
    };
  } catch (error: any) {
    console.error("[Mistral] Exception:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
