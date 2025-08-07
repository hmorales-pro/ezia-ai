import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { Project } from "@/models/Project";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import { agentSpeak, multiAgentConversation } from "@/lib/ai-agents";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { 
      businessId, 
      projectType, 
      projectDescription,
      projectName 
    } = await request.json();

    // Vérifier que le business appartient à l'utilisateur
    let business;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      business = await Business.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    }

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Contexte du projet pour les agents
    const projectContext = `
Business: ${business.name}
Type de projet: ${projectType}
Nom du projet: ${projectName || business.name}
Description: ${projectDescription}
Industrie: ${business.industry}
`;

    // Conversation multi-agents pour créer le projet
    const conversation = await multiAgentConversation(
      `Créer un ${projectType} pour ${business.name}: ${projectDescription}`,
      projectContext
    );

    // Extraire les contributions de chaque agent
    const contributions: Record<string, string> = {};
    conversation.forEach(item => {
      if (item.agent.id !== 'ezia' && item.agent.id !== 'user') {
        contributions[item.agent.id] = item.message;
      }
    });

    // Générer le code du projet
    const projectId = `proj_${nanoid(12)}`;
    const projectCode = await generateProjectCode(
      projectType,
      projectName || business.name,
      contributions
    );

    // Créer l'enregistrement du projet
    const project = {
      project_id: projectId,
      business_id: businessId,
      user_id: user.id,
      name: projectName || `${projectType} - ${business.name}`,
      type: projectType,
      description: projectDescription,
      status: 'active',
      code: projectCode,
      agents_contributions: contributions,
      created_at: new Date(),
      updated_at: new Date(),
      // URL de prévisualisation locale
      preview_url: `/preview/${projectId}`,
      // URL de déploiement (à implémenter avec Netlify/Vercel)
      deploy_url: null
    };

    // Sauvegarder le projet
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      await memoryDB.createProject(project);
    } else {
      await dbConnect();
      await Project.create(project);
    }

    // Mettre à jour le business avec le nouveau projet
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      await memoryDB.updateBusiness(businessId, {
        website_url: project.preview_url,
        space_id: projectId
      });
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          website_url: project.preview_url,
          space_id: projectId
        }
      );
    }

    return NextResponse.json({
      success: true,
      project,
      conversation,
      message: "Projet créé avec succès ! L'équipe a travaillé ensemble pour vous."
    });

  } catch (error: any) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

// Fonction pour générer le code du projet basé sur les contributions des agents
async function generateProjectCode(
  projectType: string,
  projectName: string,
  contributions: Record<string, string>
): Promise<string> {
  // Extraire les recommandations de chaque agent
  const branding = extractFromAgentResponse(contributions.milo, 'branding');
  const ux = extractFromAgentResponse(contributions.yuna, 'ux');
  const content = extractFromAgentResponse(contributions.vera, 'content');
  const technical = extractFromAgentResponse(contributions.kiko, 'technical');

  // Template de base selon le type de projet
  let template = '';
  
  switch (projectType) {
    case 'site-vitrine':
      template = generateSiteVitrineTemplate(projectName, branding, ux, content);
      break;
    case 'landing-page':
      template = generateLandingPageTemplate(projectName, branding, ux, content);
      break;
    case 'blog':
      template = generateBlogTemplate(projectName, branding, ux, content);
      break;
    case 'saas':
      template = generateSaaSTemplate(projectName, branding, ux, content, technical);
      break;
    default:
      template = generateSiteVitrineTemplate(projectName, branding, ux, content);
  }

  return template;
}

// Fonction pour extraire les infos des réponses des agents
function extractFromAgentResponse(response: string, type: string): any {
  // Extraction simplifiée - à améliorer avec du parsing plus sophistiqué
  return {
    raw: response,
    // TODO: Parser les réponses pour extraire couleurs, fonts, structure, etc.
  };
}

// Templates pour chaque type de projet
function generateSiteVitrineTemplate(
  name: string, 
  branding: any, 
  ux: any, 
  content: any
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Site Officiel</title>
    <style>
        :root {
            --primary: #6D3FC8;
            --secondary: #8B5CF6;
            --background: #FAF9F5;
            --text: #1F2937;
            --text-light: #6B7280;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        nav ul {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        nav a {
            text-decoration: none;
            color: var(--text);
            transition: color 0.3s;
        }
        
        nav a:hover {
            color: var(--primary);
        }
        
        .hero {
            padding: 5rem 0;
            text-align: center;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--text-light);
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-button {
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(109, 63, 200, 0.3);
        }
        
        .features {
            padding: 5rem 0;
            background: white;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .feature {
            text-align: center;
            padding: 2rem;
            border-radius: 10px;
            transition: transform 0.3s;
        }
        
        .feature:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
        }
        
        footer {
            background: var(--text);
            color: white;
            padding: 3rem 0;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            nav ul {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${name}</div>
            <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section id="accueil" class="hero">
        <div class="container">
            <h1>Bienvenue chez ${name}</h1>
            <p>Nous créons des solutions innovantes pour transformer votre vision en réalité</p>
            <a href="#contact" class="cta-button">Commencer maintenant</a>
        </div>
    </section>
    
    <section id="services" class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">Nos Services</h2>
            <p style="text-align: center; color: var(--text-light); max-width: 600px; margin: 0 auto;">
                Des solutions sur mesure pour répondre à tous vos besoins
            </p>
            
            <div class="features-grid">
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h3>Rapidité</h3>
                    <p>Des solutions livrées dans les meilleurs délais</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h3>Précision</h3>
                    <p>Une attention particulière à chaque détail</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Innovation</h3>
                    <p>Des technologies de pointe pour votre succès</p>
                </div>
            </div>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2024 ${name}. Créé avec ❤️ par Ezia</p>
        </div>
    </footer>
</body>
</html>`;
}

function generateLandingPageTemplate(
  name: string, 
  branding: any, 
  ux: any, 
  content: any
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Transformez votre idée en réalité</title>
    <style>
        :root {
            --primary: #6D3FC8;
            --secondary: #8B5CF6;
            --accent: #F59E0B;
            --background: #FAF9F5;
            --text: #1F2937;
            --text-light: #6B7280;
            --white: #FFFFFF;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0;
        }
        
        .logo {
            font-size: 1.75rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .hero {
            padding: 7rem 0 5rem;
            text-align: center;
            background: linear-gradient(180deg, var(--background) 0%, rgba(109, 63, 200, 0.05) 100%);
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            font-weight: 800;
            line-height: 1.1;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 1.5rem;
            color: var(--text-light);
            margin-bottom: 3rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-buttons {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-primary {
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 1.25rem 2.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(109, 63, 200, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(109, 63, 200, 0.4);
        }
        
        .btn-secondary {
            display: inline-block;
            background: transparent;
            color: var(--primary);
            padding: 1.25rem 2.5rem;
            border: 2px solid var(--primary);
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
        }
        
        .btn-secondary:hover {
            background: var(--primary);
            color: white;
            transform: translateY(-2px);
        }
        
        .benefits {
            padding: 5rem 0;
            background: white;
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .section-subtitle {
            text-align: center;
            color: var(--text-light);
            font-size: 1.25rem;
            margin-bottom: 4rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 3rem;
            margin-top: 3rem;
        }
        
        .benefit-card {
            text-align: center;
            padding: 2.5rem;
            border-radius: 20px;
            background: var(--background);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .benefit-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .benefit-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
        }
        
        .benefit-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .testimonial {
            padding: 5rem 0;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            text-align: center;
        }
        
        .testimonial-content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .testimonial-text {
            font-size: 1.75rem;
            font-style: italic;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .testimonial-author {
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .cta-section {
            padding: 5rem 0;
            text-align: center;
            background: white;
        }
        
        .cta-section h2 {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
        }
        
        .cta-section p {
            font-size: 1.25rem;
            color: var(--text-light);
            margin-bottom: 3rem;
        }
        
        footer {
            background: var(--text);
            color: white;
            padding: 3rem 0;
            text-align: center;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        
        .footer-links a:hover {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero p {
                font-size: 1.25rem;
            }
            
            .nav-links {
                display: none;
            }
            
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${name}</div>
            <ul class="nav-links">
                <li><a href="#benefits">Avantages</a></li>
                <li><a href="#testimonial">Témoignages</a></li>
                <li><a href="#cta">Commencer</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Votre succès commence <span class="gradient-text">ici</span></h1>
            <p>Découvrez comment ${name} peut transformer votre vision en réalité avec des solutions innovantes et personnalisées</p>
            <div class="cta-buttons">
                <a href="#cta" class="btn-primary">Commencer gratuitement</a>
                <a href="#benefits" class="btn-secondary">En savoir plus</a>
            </div>
        </div>
    </section>
    
    <section id="benefits" class="benefits">
        <div class="container">
            <h2 class="section-title">Pourquoi choisir <span class="gradient-text">${name}</span> ?</h2>
            <p class="section-subtitle">Des avantages conçus pour votre réussite</p>
            
            <div class="benefits-grid">
                <div class="benefit-card">
                    <div class="benefit-icon">⚡</div>
                    <h3>Rapidité et efficacité</h3>
                    <p>Lancez votre projet en quelques minutes, pas en quelques mois. Notre approche révolutionnaire accélère votre succès.</p>
                </div>
                <div class="benefit-card">
                    <div class="benefit-icon">🎯</div>
                    <h3>Solutions sur mesure</h3>
                    <p>Chaque projet est unique. Nous adaptons nos solutions à vos besoins spécifiques pour des résultats optimaux.</p>
                </div>
                <div class="benefit-card">
                    <div class="benefit-icon">🚀</div>
                    <h3>Évolution continue</h3>
                    <p>Votre succès ne s'arrête pas au lancement. Nous vous accompagnons dans votre croissance à long terme.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section id="testimonial" class="testimonial">
        <div class="container">
            <div class="testimonial-content">
                <p class="testimonial-text">"Grâce à ${name}, nous avons transformé notre idée en une réalité profitable en un temps record. L'accompagnement est exceptionnel !"</p>
                <p class="testimonial-author">- Client satisfait</p>
            </div>
        </div>
    </section>
    
    <section id="cta" class="cta-section">
        <div class="container">
            <h2>Prêt à <span class="gradient-text">transformer</span> votre idée ?</h2>
            <p>Rejoignez des milliers d'entrepreneurs qui ont choisi ${name}</p>
            <a href="#" class="btn-primary">Démarrer maintenant</a>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="#">Mentions légales</a>
                <a href="#">Confidentialité</a>
                <a href="#">Contact</a>
            </div>
            <p>&copy; 2024 ${name}. Créé avec ❤️ par Ezia et son équipe</p>
        </div>
    </footer>
</body>
</html>`;
}

function generateBlogTemplate(
  name: string, 
  branding: any, 
  ux: any, 
  content: any
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Blog</title>
    <style>
        :root {
            --primary: #6D3FC8;
            --secondary: #8B5CF6;
            --background: #FAF9F5;
            --text: #1F2937;
            --text-light: #6B7280;
            --white: #FFFFFF;
            --border: #E5E7EB;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text);
            line-height: 1.8;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: var(--white);
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0;
        }
        
        .logo {
            font-size: 1.75rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .hero {
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            padding: 4rem 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.25rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 3rem;
            padding: 4rem 0;
        }
        
        .blog-posts {
            display: grid;
            gap: 2rem;
        }
        
        .blog-post {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .blog-post:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }
        
        .post-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
        }
        
        .post-content {
            padding: 2rem;
        }
        
        .post-meta {
            display: flex;
            gap: 2rem;
            color: var(--text-light);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .post-category {
            color: var(--primary);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }
        
        .post-title {
            font-size: 1.75rem;
            margin-bottom: 1rem;
            color: var(--text);
            text-decoration: none;
            display: block;
            transition: color 0.3s;
        }
        
        .post-title:hover {
            color: var(--primary);
        }
        
        .post-excerpt {
            color: var(--text-light);
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        
        .read-more {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: gap 0.3s;
        }
        
        .read-more:hover {
            gap: 1rem;
        }
        
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        .widget {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .widget h3 {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            color: var(--primary);
        }
        
        .category-list {
            list-style: none;
        }
        
        .category-list li {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border);
        }
        
        .category-list li:last-child {
            border-bottom: none;
        }
        
        .category-list a {
            color: var(--text);
            text-decoration: none;
            display: flex;
            justify-content: space-between;
            transition: color 0.3s;
        }
        
        .category-list a:hover {
            color: var(--primary);
        }
        
        .category-count {
            background: var(--background);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .newsletter {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            text-align: center;
        }
        
        .newsletter h3 {
            color: white;
        }
        
        .newsletter p {
            margin-bottom: 1.5rem;
            opacity: 0.9;
        }
        
        .newsletter-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .newsletter-form input {
            padding: 0.75rem;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
        }
        
        .newsletter-form button {
            padding: 0.75rem 2rem;
            background: white;
            color: var(--primary);
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .newsletter-form button:hover {
            transform: translateY(-2px);
        }
        
        footer {
            background: var(--text);
            color: white;
            padding: 3rem 0;
            text-align: center;
            margin-top: 4rem;
        }
        
        @media (max-width: 968px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .hero h1 {
                font-size: 2rem;
            }
            
            .nav-links {
                display: none;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${name}</div>
            <ul class="nav-links">
                <li><a href="#">Accueil</a></li>
                <li><a href="#">Articles</a></li>
                <li><a href="#">À propos</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Bienvenue sur ${name}</h1>
            <p>Découvrez nos derniers articles et restez informé des dernières tendances</p>
        </div>
    </section>
    
    <div class="container">
        <div class="main-content">
            <div class="blog-posts">
                <article class="blog-post">
                    <div class="post-image">🚀</div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="post-category">Innovation</span>
                            <span>15 janvier 2024</span>
                            <span>5 min de lecture</span>
                        </div>
                        <a href="#" class="post-title">Les dernières innovations qui transforment notre industrie</a>
                        <p class="post-excerpt">Découvrez comment les nouvelles technologies révolutionnent notre façon de travailler et d'interagir avec nos clients. Une plongée passionnante dans le futur...</p>
                        <a href="#" class="read-more">Lire la suite →</a>
                    </div>
                </article>
                
                <article class="blog-post">
                    <div class="post-image">💡</div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="post-category">Conseils</span>
                            <span>12 janvier 2024</span>
                            <span>3 min de lecture</span>
                        </div>
                        <a href="#" class="post-title">5 conseils essentiels pour réussir votre projet digital</a>
                        <p class="post-excerpt">Lancez-vous dans l'aventure digitale avec ces conseils pratiques testés et approuvés par des experts. Du concept à la réalisation...</p>
                        <a href="#" class="read-more">Lire la suite →</a>
                    </div>
                </article>
                
                <article class="blog-post">
                    <div class="post-image">🌍</div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="post-category">Tendances</span>
                            <span>10 janvier 2024</span>
                            <span>7 min de lecture</span>
                        </div>
                        <a href="#" class="post-title">Les tendances du web design en 2024</a>
                        <p class="post-excerpt">Explorez les dernières tendances qui façonnent le web design moderne. Des couleurs vibrantes aux interactions immersives...</p>
                        <a href="#" class="read-more">Lire la suite →</a>
                    </div>
                </article>
            </div>
            
            <aside class="sidebar">
                <div class="widget">
                    <h3>Catégories</h3>
                    <ul class="category-list">
                        <li><a href="#">Innovation <span class="category-count">12</span></a></li>
                        <li><a href="#">Conseils <span class="category-count">8</span></a></li>
                        <li><a href="#">Tendances <span class="category-count">15</span></a></li>
                        <li><a href="#">Tutoriels <span class="category-count">6</span></a></li>
                        <li><a href="#">Actualités <span class="category-count">10</span></a></li>
                    </ul>
                </div>
                
                <div class="widget newsletter">
                    <h3>Newsletter</h3>
                    <p>Recevez nos derniers articles directement dans votre boîte mail</p>
                    <form class="newsletter-form">
                        <input type="email" placeholder="Votre email" required>
                        <button type="submit">S'abonner</button>
                    </form>
                </div>
                
                <div class="widget">
                    <h3>À propos</h3>
                    <p>${name} est votre source d'information de référence. Nous partageons les meilleures pratiques, conseils et actualités pour vous aider à réussir.</p>
                </div>
            </aside>
        </div>
    </div>
    
    <footer>
        <div class="container">
            <p>&copy; 2024 ${name}. Créé avec ❤️ par Ezia et son équipe</p>
        </div>
    </footer>
</body>
</html>`;
}

function generateSaaSTemplate(
  name: string, 
  branding: any, 
  ux: any, 
  content: any,
  technical: any
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - La solution SaaS qui transforme votre business</title>
    <style>
        :root {
            --primary: #6D3FC8;
            --secondary: #8B5CF6;
            --success: #10B981;
            --background: #FAF9F5;
            --dark: #1F2937;
            --text: #4B5563;
            --text-light: #9CA3AF;
            --white: #FFFFFF;
            --border: #E5E7EB;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        
        .logo {
            font-size: 1.75rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2.5rem;
            align-items: center;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .nav-cta {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            display: inline-block;
        }
        
        .btn-secondary {
            color: var(--primary);
            border: 2px solid var(--primary);
        }
        
        .btn-secondary:hover {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 15px rgba(109, 63, 200, 0.2);
        }
        
        .btn-primary:hover {
            background: var(--secondary);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(109, 63, 200, 0.3);
        }
        
        .hero {
            padding: 6rem 0;
            background: linear-gradient(135deg, var(--background) 0%, rgba(109, 63, 200, 0.05) 100%);
        }
        
        .hero-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        
        .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 800;
            color: var(--dark);
            line-height: 1.1;
            margin-bottom: 1.5rem;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero-text p {
            font-size: 1.25rem;
            color: var(--text);
            margin-bottom: 2rem;
        }
        
        .hero-cta {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .btn-large {
            padding: 1rem 2rem;
            font-size: 1.1rem;
        }
        
        .hero-visual {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            padding: 3rem;
            text-align: center;
        }
        
        .demo-dashboard {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            height: 300px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .metric {
            text-align: center;
            padding: 1rem;
            border-radius: 10px;
            background: var(--background);
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .metric-label {
            font-size: 0.875rem;
            color: var(--text-light);
        }
        
        .features {
            padding: 5rem 0;
            background: white;
        }
        
        .section-header {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 4rem;
        }
        
        .section-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--dark);
        }
        
        .section-subtitle {
            font-size: 1.25rem;
            color: var(--text);
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
        }
        
        .feature-card {
            text-align: center;
            padding: 2rem;
            border-radius: 15px;
            transition: transform 0.3s, box-shadow 0.3s;
            background: var(--background);
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
            color: var(--dark);
        }
        
        .pricing {
            padding: 5rem 0;
            background: var(--background);
        }
        
        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .pricing-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            position: relative;
            border: 2px solid transparent;
        }
        
        .pricing-card.featured {
            border-color: var(--primary);
            transform: scale(1.05);
            box-shadow: 0 20px 40px rgba(109, 63, 200, 0.2);
        }
        
        .pricing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        
        .pricing-card.featured:hover {
            transform: scale(1.05) translateY(-5px);
        }
        
        .badge {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .plan-name {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: var(--dark);
        }
        
        .plan-price {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary);
            margin: 1rem 0;
        }
        
        .plan-price span {
            font-size: 1rem;
            font-weight: normal;
            color: var(--text-light);
        }
        
        .plan-features {
            list-style: none;
            margin: 2rem 0;
            text-align: left;
        }
        
        .plan-features li {
            padding: 0.75rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text);
        }
        
        .plan-features li:before {
            content: "✓";
            display: inline-block;
            width: 20px;
            height: 20px;
            background: var(--success);
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 0.75rem;
            flex-shrink: 0;
        }
        
        .testimonials {
            padding: 5rem 0;
            background: white;
        }
        
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .testimonial-card {
            background: var(--background);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .testimonial-text {
            font-size: 1.125rem;
            color: var(--text);
            margin-bottom: 1.5rem;
            font-style: italic;
        }
        
        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .author-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .author-info {
            text-align: left;
        }
        
        .author-name {
            font-weight: 600;
            color: var(--dark);
        }
        
        .author-role {
            font-size: 0.875rem;
            color: var(--text-light);
        }
        
        .cta {
            padding: 5rem 0;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            text-align: center;
        }
        
        .cta h2 {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
        }
        
        .cta p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .btn-white {
            background: white;
            color: var(--primary);
            font-weight: 600;
        }
        
        .btn-white:hover {
            background: var(--background);
            transform: translateY(-2px);
        }
        
        footer {
            background: var(--dark);
            color: white;
            padding: 4rem 0 2rem;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 3rem;
            margin-bottom: 3rem;
        }
        
        .footer-section h4 {
            margin-bottom: 1.5rem;
            font-size: 1.125rem;
        }
        
        .footer-section ul {
            list-style: none;
        }
        
        .footer-section li {
            margin-bottom: 0.75rem;
        }
        
        .footer-section a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-section a:hover {
            color: white;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
        }
        
        @media (max-width: 968px) {
            .hero-content,
            .features-grid,
            .pricing-grid,
            .testimonials-grid,
            .footer-content {
                grid-template-columns: 1fr;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .nav-links {
                display: none;
            }
            
            .pricing-card.featured {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${name}</div>
            <ul class="nav-links">
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#pricing">Tarifs</a></li>
                <li><a href="#testimonials">Témoignages</a></li>
                <li><a href="#">Ressources</a></li>
            </ul>
            <div class="nav-cta">
                <a href="#" class="btn btn-secondary">Connexion</a>
                <a href="#" class="btn btn-primary">Essai gratuit</a>
            </div>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>La solution <span class="gradient-text">tout-en-un</span> pour votre croissance</h1>
                    <p>Automatisez vos processus, augmentez votre productivité et développez votre business avec ${name}.</p>
                    <div class="hero-cta">
                        <a href="#" class="btn btn-primary btn-large">Démarrer gratuitement</a>
                        <a href="#" class="btn btn-secondary btn-large">Voir la démo</a>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="demo-dashboard">📊 Dashboard</div>
                    <div class="metrics">
                        <div class="metric">
                            <div class="metric-value">+45%</div>
                            <div class="metric-label">Productivité</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">3h</div>
                            <div class="metric-label">Économisées/jour</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">98%</div>
                            <div class="metric-label">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section id="features" class="features">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Tout ce dont vous avez besoin</h2>
                <p class="section-subtitle">Des fonctionnalités puissantes pour simplifier votre quotidien</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>Automatisation</h3>
                    <p>Automatisez vos tâches répétitives et concentrez-vous sur l'essentiel</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Analytics avancés</h3>
                    <p>Suivez vos performances en temps réel avec des tableaux de bord intuitifs</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔗</div>
                    <h3>Intégrations</h3>
                    <p>Connectez-vous à tous vos outils préférés en quelques clics</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Sécurité maximale</h3>
                    <p>Vos données sont protégées avec un chiffrement de niveau bancaire</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Mobile first</h3>
                    <p>Accédez à vos données partout, à tout moment, sur tous vos appareils</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🌍</div>
                    <h3>Multi-langues</h3>
                    <p>Interface disponible en 15 langues pour vos équipes internationales</p>
                </div>
            </div>
        </div>
    </section>
    
    <section id="pricing" class="pricing">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Tarifs transparents</h2>
                <p class="section-subtitle">Choisissez le plan qui correspond à vos besoins</p>
            </div>
            
            <div class="pricing-grid">
                <div class="pricing-card">
                    <div class="plan-name">Starter</div>
                    <div class="plan-price">19€<span>/mois</span></div>
                    <ul class="plan-features">
                        <li>Jusqu'à 5 utilisateurs</li>
                        <li>10 GB de stockage</li>
                        <li>Intégrations basiques</li>
                        <li>Support par email</li>
                    </ul>
                    <a href="#" class="btn btn-secondary" style="width: 100%;">Commencer</a>
                </div>
                
                <div class="pricing-card featured">
                    <span class="badge">Populaire</span>
                    <div class="plan-name">Pro</div>
                    <div class="plan-price">49€<span>/mois</span></div>
                    <ul class="plan-features">
                        <li>Jusqu'à 25 utilisateurs</li>
                        <li>100 GB de stockage</li>
                        <li>Intégrations avancées</li>
                        <li>Support prioritaire</li>
                        <li>Analytics avancés</li>
                        <li>API access</li>
                    </ul>
                    <a href="#" class="btn btn-primary" style="width: 100%;">Commencer</a>
                </div>
                
                <div class="pricing-card">
                    <div class="plan-name">Enterprise</div>
                    <div class="plan-price">Sur mesure</div>
                    <ul class="plan-features">
                        <li>Utilisateurs illimités</li>
                        <li>Stockage illimité</li>
                        <li>Intégrations personnalisées</li>
                        <li>Support dédié</li>
                        <li>Formation sur site</li>
                        <li>SLA garanti</li>
                    </ul>
                    <a href="#" class="btn btn-secondary" style="width: 100%;">Nous contacter</a>
                </div>
            </div>
        </div>
    </section>
    
    <section id="testimonials" class="testimonials">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Ils nous font confiance</h2>
                <p class="section-subtitle">Découvrez ce que nos clients disent de nous</p>
            </div>
            
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p class="testimonial-text">"${name} a complètement transformé notre façon de travailler. Nous avons gagné 3 heures par jour en moyenne !"</p>
                    <div class="testimonial-author">
                        <div class="author-avatar">MC</div>
                        <div class="author-info">
                            <div class="author-name">Marie Curie</div>
                            <div class="author-role">CEO, TechCorp</div>
                        </div>
                    </div>
                </div>
                
                <div class="testimonial-card">
                    <p class="testimonial-text">"L'interface est intuitive et les fonctionnalités sont exactement ce dont nous avions besoin. Excellent rapport qualité/prix."</p>
                    <div class="testimonial-author">
                        <div class="author-avatar">PD</div>
                        <div class="author-info">
                            <div class="author-name">Pierre Dupont</div>
                            <div class="author-role">Directeur Opérations, StartupXYZ</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section class="cta">
        <div class="container">
            <h2>Prêt à transformer votre business ?</h2>
            <p>Rejoignez des milliers d'entreprises qui font confiance à ${name}</p>
            <a href="#" class="btn btn-white btn-large">Démarrer votre essai gratuit</a>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Produit</h4>
                    <ul>
                        <li><a href="#">Fonctionnalités</a></li>
                        <li><a href="#">Tarifs</a></li>
                        <li><a href="#">Roadmap</a></li>
                        <li><a href="#">Changelog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Entreprise</h4>
                    <ul>
                        <li><a href="#">À propos</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Carrières</a></li>
                        <li><a href="#">Presse</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Ressources</h4>
                    <ul>
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">API</a></li>
                        <li><a href="#">Guides</a></li>
                        <li><a href="#">Webinaires</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Centre d'aide</a></li>
                        <li><a href="#">Contact</a></li>
                        <li><a href="#">Status</a></li>
                        <li><a href="#">Sécurité</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${name}. Créé avec ❤️ par Ezia et son équipe. Tous droits réservés.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
}