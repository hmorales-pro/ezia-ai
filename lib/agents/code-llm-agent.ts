import { HfInference } from "@huggingface/inference";

export class CodeLLMAgent {
  private hf: HfInference;
  private hfToken: string;
  // Modèles de code disponibles sur HuggingFace
  private models = {
    glm45: "zai-org/GLM-4.5:novita",
    codellama: "codellama/CodeLlama-7b-Instruct-hf",
    starcoder: "bigcode/starcoder",
    santacoder: "bigcode/santacoder",
    codegen: "Salesforce/codegen-2B-multi",
    // Alternative : utiliser un modèle généraliste puissant
    mixtral: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    zephyr: "HuggingFaceH4/zephyr-7b-beta"
  };
  
  private selectedModel: string;

  constructor(model: keyof typeof CodeLLMAgent.prototype.models = "glm45") {
    const token = process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;
    if (!token) {
      throw new Error("HuggingFace token not found");
    }
    this.hfToken = token;
    this.hf = new HfInference(token);
    this.selectedModel = this.models[model] || this.models.glm45;
  }

  async generateWebsite(context: {
    businessName: string;
    industry: string;
    description: string;
    features?: string[];
  }): Promise<{ html: string; metadata: any }> {
    console.log(`🤖 Using ${this.selectedModel} for code generation...`);

    try {
      // Si c'est GLM-4.5, utiliser l'API router
      if (this.selectedModel === this.models.glm45) {
        return await this.generateWithGLM45(context);
      }
      
      const prompt = this.createWebsitePrompt(context);
      
      // Appel au modèle
      const response = await this.hf.textGeneration({
        model: this.selectedModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 4000,
          temperature: 0.8,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      });

      const html = this.extractAndCleanHTML(response.generated_text);

      return {
        html,
        metadata: {
          model: this.selectedModel,
          generatedAt: new Date().toISOString(),
          context
        }
      };

    } catch (error: any) {
      console.error("Error with code generation:", error);
      
      // Si le modèle n'est pas disponible, essayer avec un autre
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        console.log("🔄 Trying alternative model...");
        return this.generateWithAlternativeApproach(context);
      }
      
      throw error;
    }
  }

  private async generateWithGLM45(context: any): Promise<{ html: string; metadata: any }> {
    console.log("🚀 Using GLM-4.5 via HuggingFace router...");
    
    const systemPrompt = `You are an expert fullstack web developer. Generate COMPLETE multi-section websites with ALL sections fully implemented.
Each section must have substantial content. DO NOT create single-page placeholders.
The website must be production-ready with all features working.`;

    const userPrompt = `Create a COMPLETE multi-section website for:
- Business: ${context.businessName}
- Industry: ${context.industry}
- Description: ${context.description}

MANDATORY SECTIONS (all must be included with full content):

1. NAVIGATION BAR - Fixed navigation with links to all sections

2. HERO SECTION - Eye-catching intro with:
   - Large headline
   - Compelling subtitle
   - Call-to-action buttons
   - Background image or gradient

3. ABOUT SECTION - Detailed presentation:
   - Company story (minimum 3 paragraphs)
   - Mission and values
   - What makes them unique

4. SERVICES/MENU SECTION - Complete offering:
   - At least 6 items/services with descriptions
   - Prices if applicable
   - Visual cards or grid layout

5. FEATURES/WHY US SECTION - Key benefits:
   - At least 4 feature cards
   - Icons or visuals
   - Detailed descriptions

6. TESTIMONIALS SECTION - Social proof:
   - At least 3 customer reviews
   - Names and ratings

7. GALLERY SECTION - Visual showcase:
   - Image grid or carousel
   - At least 6 image placeholders

8. CONTACT SECTION - Complete contact info:
   - Contact form with validation
   - Address, phone, email
   - Business hours
   - Map or location info

9. FOOTER - Professional footer with:
   - Quick links
   - Social media
   - Copyright

STYLE REQUIREMENTS:
- Modern CSS with animations
- Fully responsive design
- Professional color scheme for ${context.industry}
- Smooth scroll behavior
- Hover effects
- Form validation

Generate the COMPLETE HTML with ALL sections fully implemented. Each section must have real, substantial content - no placeholders!`;

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "zai-org/GLM-4.5:novita",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: userPrompt
              }
            ],
            max_tokens: 8000,
            temperature: 0.7,
            stream: false
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("GLM-4.5 API error:", error);
        throw new Error(`GLM-4.5 API error: ${error}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      // Extract HTML from the response
      const html = this.extractAndCleanHTML(content);
      
      return {
        html,
        metadata: {
          model: "GLM-4.5 (via HuggingFace Router)",
          generatedAt: new Date().toISOString(),
          context
        }
      };
      
    } catch (error) {
      console.error("Error with GLM-4.5:", error);
      console.log("Falling back to alternative approach...");
      return this.generateWithAlternativeApproach(context);
    }
  }

  private createWebsitePrompt(context: any): string {
    return `<|system|>
You are an expert web developer. Generate complete HTML websites with embedded CSS and JavaScript.
</s>
<|user|>
Create a modern, responsive website for:
- Business: ${context.businessName}
- Industry: ${context.industry}
- Description: ${context.description}

Requirements:
1. Complete HTML5 document
2. Embedded CSS in <style> tags
3. Responsive design
4. Modern UI with animations
5. Contact form
6. SEO meta tags
7. Professional design for ${context.industry} industry

Output only the HTML code, no explanations.
</s>
<|assistant|>
<!DOCTYPE html>`;
  }

  private extractAndCleanHTML(content: string): string {
    // Commencer par <!DOCTYPE html> si le modèle l'a inclus
    let html = content;
    
    // Si le modèle a ajouté du texte avant
    const docTypeIndex = html.indexOf("<!DOCTYPE");
    if (docTypeIndex > 0) {
      html = html.substring(docTypeIndex);
    }
    
    // S'assurer que le HTML commence correctement
    if (!html.startsWith("<!DOCTYPE")) {
      html = "<!DOCTYPE html>\n" + html;
    }
    
    // Nettoyer les marqueurs de fin potentiels
    const endTags = ["</html>", "</body>", "</|assistant|>", "</s>"];
    for (const tag of endTags) {
      const index = html.lastIndexOf(tag);
      if (index > 0 && tag === "</html>") {
        html = html.substring(0, index + 7);
        break;
      }
    }
    
    // S'assurer que le HTML est complet
    if (!html.includes("</html>")) {
      html += "\n</body>\n</html>";
    }
    
    return html;
  }

  private async generateWithAlternativeApproach(context: any): Promise<{ html: string; metadata: any }> {
    // Approche alternative : générer par sections
    console.log("🔧 Using section-based generation approach...");
    
    const sections = await this.generateSections(context);
    const html = this.assembleSections(sections, context);
    
    return {
      html,
      metadata: {
        model: "Alternative approach",
        generatedAt: new Date().toISOString(),
        context,
        note: "Generated using section-based approach"
      }
    };
  }

  private async generateSections(context: any): Promise<any> {
    // Générer différentes sections séparément
    const prompts = {
      header: `Generate a navigation header HTML for ${context.businessName}`,
      hero: `Generate a hero section HTML for ${context.businessName} in ${context.industry}`,
      features: `Generate a features section HTML for a ${context.industry} business`,
      contact: `Generate a contact form section HTML`
    };
    
    const sections: any = {};
    
    for (const [key, prompt] of Object.entries(prompts)) {
      try {
        const response = await this.hf.textGeneration({
          model: this.selectedModel,
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7
          }
        });
        sections[key] = response.generated_text;
      } catch (error) {
        console.error(`Error generating ${key}:`, error);
        sections[key] = this.getFallbackSection(key, context);
      }
    }
    
    return sections;
  }

  private assembleSections(sections: any, context: any): string {
    const { businessName, industry, description } = context;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - ${industry}</title>
    <meta name="description" content="${description}">
    <style>
        /* Modern CSS Reset */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        :root {
            --primary: ${this.getIndustryColor(industry)};
            --secondary: #2c3e50;
            --text: #333;
            --bg: #ffffff;
            --gray: #f8f9fa;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--bg);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header Styles */
        header {
            background: var(--bg);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        /* Hero Section */
        .hero {
            margin-top: 80px;
            padding: 80px 0;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: fadeInUp 0.8s ease;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: var(--primary);
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: fadeInUp 0.8s ease 0.4s both;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        /* Features Section */
        .features {
            padding: 80px 0;
            background: var(--gray);
        }
        
        .features h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: var(--secondary);
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
        }
        
        .feature-card {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: var(--primary);
            border-radius: 50%;
        }
        
        /* Contact Section */
        .contact {
            padding: 80px 0;
        }
        
        .contact h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: var(--secondary);
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        /* Footer */
        footer {
            background: var(--secondary);
            color: white;
            text-align: center;
            padding: 40px 0;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .features h2 { font-size: 2rem; }
            .feature-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    ${sections.header || this.getFallbackSection('header', context)}
    
    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>${description}</p>
            <a href="#contact" class="btn">Nous contacter</a>
        </div>
    </section>
    
    ${sections.features || this.getFallbackSection('features', context)}
    ${sections.contact || this.getFallbackSection('contact', context)}
    
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
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Form submission
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Merci pour votre message ! Nous vous contacterons bientôt.');
                form.reset();
            });
        }
    </script>
</body>
</html>`;
  }

  private getIndustryColor(industry: string): string {
    const colors: Record<string, string> = {
      restaurant: "#e74c3c",
      ecommerce: "#3498db",
      consulting: "#2c3e50",
      health: "#27ae60",
      education: "#f39c12",
      tech: "#9b59b6",
      realestate: "#1abc9c",
      fitness: "#e67e22",
      beauty: "#fd79a8",
      travel: "#00b894"
    };
    return colors[industry] || "#3498db";
  }

  private getFallbackSection(section: string, context: any): string {
    const sections: Record<string, string> = {
      header: `
        <header>
            <nav class="container">
                <div class="logo">${context.businessName}</div>
                <div class="nav-links">
                    <a href="#features">Services</a>
                    <a href="#about">À propos</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
        </header>
      `,
      features: `
        <section class="features" id="features">
            <div class="container">
                <h2>Nos Services</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-icon"></div>
                        <h3>Service Premium</h3>
                        <p>Une qualité exceptionnelle pour votre satisfaction.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"></div>
                        <h3>Innovation</h3>
                        <p>Des solutions modernes adaptées à vos besoins.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"></div>
                        <h3>Support 24/7</h3>
                        <p>Une équipe dédiée à votre service.</p>
                    </div>
                </div>
            </div>
        </section>
      `,
      contact: `
        <section class="contact" id="contact">
            <div class="container">
                <h2>Contactez-nous</h2>
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label for="name">Nom</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn">Envoyer</button>
                </form>
            </div>
        </section>
      `
    };
    
    return sections[section] || "";
  }
}