import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getStorage } from "@/lib/storage/unified-storage";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, businessName, html, css, prompt } = await request.json();
    const storage = getStorage();

    // Vérifier que le business appartient à l'utilisateur
    const business = await storage.getBusinessById(businessId, user.id);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Générer un ID unique pour le site
    const siteId = `site-${businessName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`;
    const websiteUrl = `https://ezia-demo-${siteId}.vercel.app`;

    // Créer le contenu HTML complet
    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <style>${css || getDefaultCSS()}</style>
</head>
<body>
${html || getDefaultHTML(businessName, business.description)}
</body>
</html>`;

    // Simuler la création du site (en production, cela créerait vraiment un Space HuggingFace)
    console.log(`[DEMO] Site web créé pour ${businessName}`);
    console.log(`[DEMO] URL: ${websiteUrl}`);
    console.log(`[DEMO] Contenu HTML: ${fullHtml.length} caractères`);

    // Vérifier s'il existe déjà un site pour ce business
    const projects = await storage.getAllProjects(user.id);
    const existingWebsite = projects.find(p => 
      p.businessId === businessId && 
      p.status !== 'archived'
    );
    
    let savedWebsite;
    
    if (existingWebsite) {
      // Mettre à jour le site existant
      const updates = {
        html: fullHtml,
        css: css || getDefaultCSS(),
        js: "",
        prompt: prompt || `Site web pour ${businessName}`,
        version: (existingWebsite.version || 1) + 1,
        versions: [...(existingWebsite.versions || []), {
          version: (existingWebsite.version || 1) + 1,
          html: fullHtml,
          css: css || getDefaultCSS(),
          js: "",
          prompt: prompt || `Site web pour ${businessName}`,
          createdAt: new Date().toISOString(),
          createdBy: 'Ezia AI'
        }]
      };
      
      savedWebsite = await storage.updateProject(
        existingWebsite.projectId || existingWebsite.id,
        updates
      );
    } else {
      // Créer un nouveau site
      const projectData = {
        userId: user.id,
        businessId: businessId,
        businessName: businessName,
        name: `Site Web ${businessName}`,
        description: `Site web généré automatiquement pour ${businessName}`,
        html: fullHtml,
        css: css || getDefaultCSS(),
        js: "",
        prompt: prompt || `Site web pour ${businessName}`,
        version: 1,
        versions: [{
          version: 1,
          html: fullHtml,
          css: css || getDefaultCSS(),
          js: "",
          prompt: prompt || `Site web pour ${businessName}`,
          createdAt: new Date().toISOString(),
          createdBy: 'Ezia AI'
        }],
        status: 'published',
        metadata: {
          generatedBy: 'ezia-ai',
          siteId: siteId,
          websiteUrl: websiteUrl
        }
      };
      
      savedWebsite = await storage.createProject(projectData);
    }

    // Mettre à jour le business avec l'URL du site
    await storage.updateBusiness(businessId, {
      website_url: websiteUrl,
      space_id: siteId,
      websiteGeneratedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      project: {
        id: savedWebsite.projectId || savedWebsite._id,
        space_id: siteId,
        name: `Site Web ${businessName}`,
        url: websiteUrl,
        html: fullHtml,
        publicUrl: `/sites/public/${savedWebsite.projectId || savedWebsite._id}`
      },
      message: "Site web créé avec succès (mode démo)"
    });

  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    );
  }
}

function getDefaultCSS() {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

nav h1 {
    font-size: 1.5rem;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

nav a:hover {
    opacity: 0.8;
}

.hero {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    text-align: center;
    padding: 5rem 2rem;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.hero p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.75rem 2rem;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
}

section h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
    color: #333;
}

section p {
    text-align: center;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    nav ul {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .hero h2 {
        font-size: 2rem;
    }
}`;
}

function getDefaultHTML(businessName: string, description: string) {
  return `
    <header>
        <nav>
            <h1>${businessName}</h1>
            <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="accueil" class="hero">
            <h2>Bienvenue chez ${businessName}</h2>
            <p>${description}</p>
            <a href="#contact" class="cta-button">Contactez-nous</a>
        </section>
        
        <section id="services">
            <h2>Nos Services</h2>
            <p>Découvrez comment nous pouvons vous aider à atteindre vos objectifs.</p>
        </section>
        
        <section id="apropos">
            <h2>À Propos de Nous</h2>
            <p>Notre histoire, nos valeurs et notre engagement envers l'excellence.</p>
        </section>
        
        <section id="contact">
            <h2>Contactez-nous</h2>
            <p>Nous sommes là pour répondre à toutes vos questions.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 ${businessName}. Tous droits réservés. | Créé avec Ezia</p>
    </footer>`;
}