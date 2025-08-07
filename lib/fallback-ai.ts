import { HfInference } from "@huggingface/inference";

// Modèles gratuits qui fonctionnent sans authentication spéciale
export const FALLBACK_MODELS = {
  "mistralai/Mistral-7B-Instruct-v0.2": {
    name: "Mistral 7B",
    provider: "huggingface",
    maxTokens: 4096
  },
  "microsoft/Phi-3-mini-4k-instruct": {
    name: "Phi-3 Mini",
    provider: "huggingface", 
    maxTokens: 4096
  }
};

export async function generateWithFallback(
  token: string,
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const hf = new HfInference(token);
  
  // Créer un prompt simplifié pour le modèle de fallback
  const simplifiedPrompt = `Create a modern, professional website with the following requirements:
${prompt}

Generate complete HTML with:
- Modern CSS styling
- Responsive design
- Professional appearance
- Clean structure

Start with <!DOCTYPE html> and include all necessary HTML:`;
  
  // Essayer avec Mistral d'abord
  try {
    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: simplifiedPrompt,
      parameters: {
        max_new_tokens: 4000,
        temperature: 0.7,
        stop: ["User:", "Human:", "Assistant:"],
        return_full_text: false
      }
    });
    
    // Extraire le HTML de la réponse
    let html = response.generated_text;
    
    // S'assurer que le HTML commence par <!DOCTYPE html>
    if (!html.includes("<!DOCTYPE html>")) {
      html = "<!DOCTYPE html>\n" + html;
    }
    
    // S'assurer que le HTML se termine par </html>
    if (!html.includes("</html>")) {
      // Chercher où ajouter </html>
      if (html.includes("</body>")) {
        html = html.replace("</body>", "</body>\n</html>");
      } else {
        html += "\n</body>\n</html>";
      }
    }
    
    return html;
  } catch (error) {
    console.error("Fallback model error:", error);
    
    // Si même le fallback échoue, retourner un template de base
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site en construction</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f0f0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            line-height: 1.6;
        }
        .error {
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Service temporairement indisponible</h1>
        <p>Nous ne pouvons pas générer votre site web pour le moment.</p>
        <p>Veuillez vous connecter ou réessayer plus tard.</p>
        <p class="error">Erreur: ${error}</p>
    </div>
</body>
</html>`;
  }
}