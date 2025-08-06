import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN);

export async function streamAIResponse(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
) {
  try {
    // Utiliser un modèle de chat approprié
    const model = "meta-llama/Meta-Llama-3-8B-Instruct";
    
    // Formater les messages pour le modèle
    const prompt = messages
      .map(msg => {
        if (msg.role === "system") return `System: ${msg.content}`;
        if (msg.role === "user") return `User: ${msg.content}`;
        if (msg.role === "assistant") return `Assistant: ${msg.content}`;
        return msg.content;
      })
      .join("\n\n") + "\n\nAssistant:";

    // Générer la réponse en streaming
    const stream = await hf.textGenerationStream({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1,
        stop_sequences: ["User:", "System:"]
      }
    });

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.token.text) {
        fullText += chunk.token.text;
        onChunk(chunk.token.text);
      }
    }

    return fullText;
  } catch (error) {
    console.error("AI streaming error:", error);
    
    // Fallback sur une réponse non-streaming
    try {
      const response = await hf.textGeneration({
        model: "microsoft/phi-2",
        inputs: messages[messages.length - 1].content,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7
        }
      });
      
      const text = response.generated_text;
      // Simuler le streaming
      const words = text.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return text;
    } catch (fallbackError) {
      console.error("Fallback AI error:", fallbackError);
      throw new Error("Failed to generate AI response");
    }
  }
}