import { HfInference } from "@huggingface/inference";

export class GLMFullStackAgent {
  private hf: HfInference;
  private modelId = "zai-org/GLM-4.5";

  constructor() {
    const token = process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;
    if (!token) {
      throw new Error("HuggingFace token not found");
    }
    this.hf = new HfInference(token);
  }

  async generateFullStackSite(context: {
    businessName: string;
    industry: string;
    description: string;
    features?: string[];
  }): Promise<{ html: string; metadata: any }> {
    console.log("🚀 GLM-4.5 Full-Stack Generation starting...");

    try {
      // Créer un prompt optimisé pour GLM-4.5
      const prompt = this.createFullStackPrompt(context);
      
      // Appeler le modèle via HuggingFace
      const response = await this.hf.textGeneration({
        model: this.modelId,
        inputs: prompt,
        parameters: {
          max_new_tokens: 8000,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      });

      // Extraire le HTML du résultat
      const generatedContent = response.generated_text;
      const html = this.extractHTML(generatedContent);

      return {
        html,
        metadata: {
          model: "GLM-4.5",
          generatedAt: new Date().toISOString(),
          context
        }
      };

    } catch (error) {
      console.error("Error with GLM-4.5:", error);
      // Fallback vers une génération alternative
      return this.generateFallbackSite(context);
    }
  }

  private createFullStackPrompt(context: any): string {
    return `You are GLM-4.5, an expert full-stack developer. Create a complete, production-ready website for the following business:

Business: ${context.businessName}
Industry: ${context.industry}
Description: ${context.description}
${context.features ? `Key Features: ${context.features.join(", ")}` : ""}

Requirements:
1. Create a COMPLETE single-file HTML website with embedded CSS and JavaScript
2. Make it modern, responsive, and professional
3. Include all necessary sections based on the industry
4. Use semantic HTML5 and modern CSS (flexbox/grid)
5. Add smooth scrolling and basic animations
6. Include a contact form and call-to-action buttons
7. Make it SEO-friendly with proper meta tags
8. Use a color scheme appropriate for the industry

IMPORTANT: 
- Generate ONLY the HTML code, starting with <!DOCTYPE html> and ending with </html>
- Do NOT include any markdown formatting or explanations
- Make the site immediately usable and visually appealing
- Include inline CSS in <style> tags
- Include inline JavaScript in <script> tags

Generate the complete HTML website now:`;
  }

  private extractHTML(content: string): string {
    // Extraire le HTML du contenu généré
    const htmlMatch = content.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    // Si pas de match direct, essayer de nettoyer
    let cleaned = content;
    
    // Retirer les balises de code markdown
    cleaned = cleaned.replace(/```html\s*/g, "");
    cleaned = cleaned.replace(/```\s*/g, "");
    
    // Retirer les explications avant/après
    const docTypeIndex = cleaned.indexOf("<!DOCTYPE");
    const htmlEndIndex = cleaned.lastIndexOf("</html>");
    
    if (docTypeIndex !== -1 && htmlEndIndex !== -1) {
      return cleaned.substring(docTypeIndex, htmlEndIndex + 7);
    }

    return cleaned;
  }

  private async generateFallbackSite(context: any): Promise<{ html: string; metadata: any }> {
    // Génération de secours si GLM-4.5 n'est pas accessible
    const { businessName, industry, description } = context;
    
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - ${industry}</title>
    <meta name="description" content="${description}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: #2c3e50;
            color: white;
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .hero {
            margin-top: 60px;
            padding: 80px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        section {
            padding: 60px 0;
        }
        
        h2 {
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        
        .card {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 30px 0;
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <h1>${businessName}</h1>
            <div>
                <a href="#about" class="btn">En savoir plus</a>
            </div>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Bienvenue chez ${businessName}</h1>
            <p>${description}</p>
            <a href="#contact" class="btn">Nous contacter</a>
        </div>
    </section>
    
    <section id="about">
        <div class="container">
            <h2>À propos</h2>
            <p>Nous sommes spécialisés dans le secteur ${industry}.</p>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. Tous droits réservés.</p>
        </div>
    </footer>
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>`;

    return {
      html,
      metadata: {
        model: "Fallback",
        generatedAt: new Date().toISOString(),
        context,
        note: "GLM-4.5 was not available, used fallback generation"
      }
    };
  }
}

// Fonction helper pour tester rapidement
export async function generateWithGLM(context: {
  businessName: string;
  industry: string;
  description: string;
}): Promise<string> {
  const agent = new GLMFullStackAgent();
  const result = await agent.generateFullStackSite(context);
  return result.html;
}