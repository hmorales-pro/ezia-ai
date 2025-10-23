/**
 * Service de streaming pour Mistral AI
 * Permet d'afficher le contenu généré en temps réel (comme ChatGPT)
 */

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export interface StreamOptions {
  apiKey: string;
  model?: string;
  systemContext: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  onChunk?: (text: string) => void;
}

/**
 * Génère du contenu en streaming avec Mistral AI
 * Retourne un ReadableStream compatible avec SSE (Server-Sent Events)
 */
export async function streamMistralResponse(options: StreamOptions): Promise<ReadableStream> {
  const {
    apiKey,
    model = "mistral-medium-latest",
    systemContext,
    prompt,
    maxTokens = 5000,
    temperature = 0.7,
    onChunk
  } = options;

  console.log("[Mistral Streaming] Démarrage du streaming...");
  console.log("[Mistral Streaming] Modèle:", model);
  console.log("[Mistral Streaming] Max tokens:", maxTokens);

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true // ← Active le streaming
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Mistral Streaming] Erreur API:", error);
    throw new Error(`Mistral API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error("No response body from Mistral API");
  }

  // Créer un ReadableStream qui traite les chunks SSE
  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("[Mistral Streaming] ✅ Streaming terminé");
            controller.close();
            break;
          }

          // Décoder le chunk
          buffer += decoder.decode(value, { stream: true });

          // Traiter les lignes SSE (format: "data: {...}\n\n")
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Garder la dernière ligne incomplète

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();

              // Ignorer le message [DONE]
              if (data === '[DONE]') {
                continue;
              }

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;

                if (content) {
                  // Envoyer le chunk au client
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));

                  // Callback optionnel
                  if (onChunk) {
                    onChunk(content);
                  }
                }
              } catch (e) {
                // Ignorer les erreurs de parsing (chunks incomplets)
                console.debug("[Mistral Streaming] Parse error (normal):", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("[Mistral Streaming] ❌ Erreur:", error);
        controller.error(error);
      }
    }
  });
}

/**
 * Version fallback sans streaming (si l'API ne supporte pas)
 * Simule le streaming en découpant le texte final
 */
export async function simulateStreaming(
  fullContent: string,
  delayMs: number = 20
): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      console.log("[Simulate Streaming] Démarrage simulation...");

      // Découper le contenu en mots
      const words = fullContent.split(' ');

      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');

        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ content: word })}\n\n`)
        );

        // Petit délai pour simuler l'écriture progressive
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      console.log("[Simulate Streaming] ✅ Terminé");
      controller.close();
    }
  });
}
