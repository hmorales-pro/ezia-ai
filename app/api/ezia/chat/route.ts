import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
// import { Project } from "@/models/Project";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import { streamAIResponse } from "@/lib/ai-stream";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, businessId, businessName, actionType, context } = await request.json();

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

    // Construire le prompt système basé sur l'action
    const systemPrompt = buildSystemPrompt(actionType, businessName, business, context);

    // Stream la réponse
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          let actionResult = null;

          await streamAIResponse(
            [...systemPrompt, ...messages],
            async (chunk) => {
              fullResponse += chunk;
              const data = encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`);
              controller.enqueue(data);
            }
          );

          // Exécuter l'action si nécessaire
          if (actionType !== "general") {
            actionResult = await executeAction(
              actionType,
              businessId,
              businessName,
              fullResponse,
              user,
              business,
              request
            );
          }

          // Sauvegarder l'interaction
          await saveInteraction(businessId, actionType, fullResponse, user.id);

          const doneData = encoder.encode(
            `data: ${JSON.stringify({ done: true, result: actionResult })}\n\n`
          );
          controller.enqueue(doneData);
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = encoder.encode(
            `data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`
          );
          controller.enqueue(errorData);
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Ezia chat error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(actionType: string, businessName: string, business: { name: string; description: string; industry: string; stage: string }, context: string) {
  const basePrompt = [{
    role: "system",
    content: `Tu es Ezia, l'assistante IA spécialisée en développement business. Tu aides l'utilisateur avec son business "${businessName}".

Informations sur le business:
- Nom: ${business.name}
- Description: ${business.description}
- Industrie: ${business.industry}
- Étape: ${business.stage}
${context ? `\nContexte supplémentaire: ${context}` : ""}

Tu es toujours positive, encourageante et orientée solutions. Tu donnes des conseils concrets et actionnables.`
  }];

  const actionPrompts: Record<string, Array<{ role: string; content: string }>> = {
    create_website: [{
      role: "system",
      content: `Tu vas aider à créer un site web professionnel en utilisant le moteur DeepSite intégré.
      
IMPORTANT: Tu peux créer un vrai site web fonctionnel grâce à DeepSite. Voici comment:
1. Demande le style souhaité (moderne, classique, minimaliste, etc.)
2. Demande les sections nécessaires (accueil, services, contact, etc.)
3. Propose une structure HTML/CSS complète
4. Explique que le site sera créé automatiquement et hébergé sur HuggingFace Spaces

Le site sera accessible via une URL unique et pourra être modifié à tout moment.`
    }],
    
    market_analysis: [{
      role: "system",
      content: `Tu vas effectuer une analyse de marché approfondie. Pose des questions sur:
- Les clients cibles (âge, localisation, besoins)
- La taille du marché
- Les tendances actuelles
- Les opportunités de croissance
- Les défis potentiels

Fournis une analyse structurée avec des recommandations concrètes.`
    }],
    
    marketing_strategy: [{
      role: "system",
      content: `Tu vas développer une stratégie marketing complète. Aborde:
- Le positionnement unique
- Les messages clés
- Les canaux de communication
- Le budget recommandé
- Les KPIs à suivre

Propose un plan d'action sur 3-6 mois.`
    }],
    
    content_calendar: [{
      role: "system",
      content: `Tu vas créer un calendrier de contenu détaillé. Inclus:
- Types de contenu (articles, vidéos, posts)
- Fréquence de publication
- Thèmes et sujets
- Canaux de distribution
- Exemples concrets de posts

Fournis un calendrier sur 30 jours minimum.`
    }],
    
    competitor_analysis: [{
      role: "system",
      content: `Tu vas analyser la concurrence. Examine:
- Forces et faiblesses des concurrents
- Leur positionnement
- Leurs prix
- Leurs canaux de distribution
- Les opportunités de différenciation

Fournis une matrice SWOT comparative.`
    }],
    
    branding: [{
      role: "system",
      content: `Tu vas aider à créer une identité de marque forte. Aborde:
- Les valeurs de la marque
- La personnalité de la marque
- Le ton de communication
- Les couleurs et l'identité visuelle
- Le slogan et les messages clés

Propose un guide de marque complet.`
    }],
    
    social_media: [{
      role: "system",
      content: `Tu vas développer une stratégie réseaux sociaux. Couvre:
- Les plateformes prioritaires
- Le type de contenu par plateforme
- La fréquence de publication
- Les hashtags et mots-clés
- Les métriques à suivre

Fournis un plan d'action concret sur 3 mois.`
    }]
  };

  return [...basePrompt, ...(actionPrompts[actionType] || [])];
}

async function executeAction(
  actionType: string,
  businessId: string,
  businessName: string,
  aiResponse: string,
  user: { id: string },
  business: { name: string; description: string; industry: string; stage: string },
  request: NextRequest
) {
  switch (actionType) {
    case "create_website":
      return await createWebsiteProject(businessId, businessName, aiResponse, user, business);
    
    case "market_analysis":
      return await updateMarketAnalysis(businessId, aiResponse, business);
    
    case "marketing_strategy":
      return await updateMarketingStrategy(businessId, aiResponse, business);
    
    case "content_calendar":
      return await createContentCalendar(businessId, aiResponse, business);
    
    case "competitor_analysis":
      return await updateCompetitorAnalysis(businessId, aiResponse, business);
    
    default:
      return null;
  }
}

async function createWebsiteProject(
  businessId: string,
  businessName: string,
  aiResponse: string,
  user: { id: string },
  business: { name: string; description: string }
) {
  try {
    // Extraire le code HTML/CSS de la réponse de l'IA
    const htmlMatch = aiResponse.match(/```html([\s\S]*?)```/);
    const cssMatch = aiResponse.match(/```css([\s\S]*?)```/);
    
    if (!htmlMatch || !cssMatch) {
      // Si pas de code trouvé, créer un template de base
      const defaultHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
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
            <p>${business.description}</p>
            <a href="#contact" class="cta-button">Contactez-nous</a>
        </section>
        
        <section id="services">
            <h2>Nos Services</h2>
            <p>Découvrez comment nous pouvons vous aider.</p>
        </section>
        
        <section id="apropos">
            <h2>À Propos</h2>
            <p>Notre histoire et nos valeurs.</p>
        </section>
        
        <section id="contact">
            <h2>Contactez-nous</h2>
            <p>Nous sommes là pour vous aider.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 ${businessName}. Tous droits réservés.</p>
    </footer>
</body>
</html>`;

      const defaultCss = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: #333;
    color: white;
    padding: 1rem 0;
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
}

.hero {
    background: #f4f4f4;
    text-align: center;
    padding: 4rem 2rem;
}

.cta-button {
    display: inline-block;
    background: #333;
    color: white;
    padding: 0.75rem 2rem;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 1rem;
}

section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem 0;
}`;

      // Créer un projet DeepSite
      const projectData = {
        namespace: user.id,
        repoId: `site-${businessName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`,
        name: `Site Web ${businessName}`,
        description: `Site web professionnel pour ${businessName}`,
        visibility: "public",
        framework: "static",
        businessId: businessId,
        code: defaultHtml,
        css: defaultCss
      };

      let createdProject;
      if (isUsingMemoryDB()) {
        // Implémenter la création en mémoire si nécessaire
        createdProject = projectData;
      } else {
        await dbConnect();
        
        // Créer le projet via l'API DeepSite existante  
        const projectResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/me/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN}`
          },
          body: JSON.stringify({
            namespace: user.id,
            repoId: projectData.repoId,
            name: projectData.name,
            description: projectData.description,
            visibility: projectData.visibility,
            framework: projectData.framework,
            code: defaultHtml
          })
        });
        
        if (!projectResponse.ok) {
          throw new Error('Failed to create project');
        }
        
        createdProject = await projectResponse.json();
        
        // Mettre à jour le business avec l'URL du site
        await Business.findOneAndUpdate(
          { business_id: businessId },
          { 
            website_url: `https://hmorales-${projectData.repoId}.hf.space`,
            space_id: projectData.repoId
          }
        );
      }

      return {
        type: "website_created",
        projectId: createdProject.repoId,
        url: `https://hmorales-${createdProject.repoId}.hf.space`,
        message: `Site web créé avec succès ! Il sera disponible dans quelques minutes.`
      };
    }

    // Si on a trouvé du code dans la réponse
    const html = htmlMatch[1].trim();
    const css = cssMatch[1].trim();

    // Créer le projet avec le code personnalisé
    const projectData = {
      namespace: user.id,
      repoId: `site-${businessName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`,
      name: `Site Web ${businessName}`,
      description: `Site web professionnel pour ${businessName}`,
      visibility: "public",
      framework: "static",
      businessId: businessId,
      code: html,
      css: css
    };

    let createdProject;
    if (isUsingMemoryDB()) {
      createdProject = projectData;
    } else {
      await dbConnect();
      
      // Créer le projet via l'API DeepSite existante
      const projectResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/me/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: user.id,
          repoId: projectData.repoId,
          name: projectData.name,
          description: projectData.description,
          visibility: projectData.visibility,
          framework: projectData.framework,
          code: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <style>${projectData.css}</style>
</head>
<body>
${projectData.code}
</body>
</html>`
        })
      });
      
      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }
      
      createdProject = await projectResponse.json();
      
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          website_url: `https://hmorales-${projectData.repoId}.hf.space`,
          space_id: projectData.repoId
        }
      );
    }

    return {
      type: "website_created",
      projectId: createdProject.repoId,
      url: `https://hmorales-${createdProject.repoId}.hf.space`,
      message: `Site web personnalisé créé ! Il sera disponible dans quelques minutes.`
    };
    
  } catch (error) {
    console.error("Error creating website:", error);
    return {
      type: "error",
      message: "Erreur lors de la création du site web"
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateMarketAnalysis(businessId: string, aiResponse: string, _business: { name: string; description: string }) {
  try {
    // Extraire les informations clés de la réponse
    const analysis = {
      target_audience: extractSection(aiResponse, "audience cible", "public cible"),
      value_proposition: extractSection(aiResponse, "proposition de valeur", "valeur unique"),
      market_size: extractSection(aiResponse, "taille du marché", "marché potentiel"),
      competitors: extractList(aiResponse, "concurrents"),
      opportunities: extractList(aiResponse, "opportunités"),
      threats: extractList(aiResponse, "menaces", "risques"),
      last_updated: new Date()
    };

    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      await memoryDB.update(
        { business_id: businessId },
        { market_analysis: analysis }
      );
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { market_analysis: analysis }
      );
    }

    return {
      type: "market_analysis_updated",
      message: "Analyse de marché mise à jour avec succès"
    };
  } catch (error) {
    console.error("Error updating market analysis:", error);
    return {
      type: "error",
      message: "Erreur lors de la mise à jour de l'analyse"
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateMarketingStrategy(businessId: string, aiResponse: string, _business: { name: string; description: string }) {
  try {
    const strategy = {
      positioning: extractSection(aiResponse, "positionnement"),
      key_messages: extractList(aiResponse, "messages clés"),
      channels: extractList(aiResponse, "canaux"),
      last_updated: new Date()
    };

    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      await memoryDB.update(
        { business_id: businessId },
        { marketing_strategy: strategy }
      );
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { marketing_strategy: strategy }
      );
    }

    return {
      type: "marketing_strategy_updated",
      message: "Stratégie marketing mise à jour"
    };
  } catch (error) {
    console.error("Error updating marketing strategy:", error);
    return {
      type: "error",
      message: "Erreur lors de la mise à jour"
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createContentCalendar(businessId: string, aiResponse: string, _business: { name: string; description: string }) {
  try {
    // Parser le calendrier de contenu depuis la réponse
    const calendarItems = extractCalendarItems(aiResponse);
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const currentBusiness = await memoryDB.findOne({ business_id: businessId });
      const existingCalendar = Array.isArray(currentBusiness?.marketing_strategy?.content_calendar) 
        ? currentBusiness.marketing_strategy.content_calendar 
        : [];
      const updatedCalendar = [
        ...existingCalendar,
        ...calendarItems
      ];
      
      await memoryDB.update(
        { business_id: businessId },
        { 
          marketing_strategy: {
            ...currentBusiness?.marketing_strategy,
            content_calendar: updatedCalendar
          }
        }
      );
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          $push: {
            "marketing_strategy.content_calendar": {
              $each: calendarItems
            }
          }
        }
      );
    }

    return {
      type: "content_calendar_created",
      itemsAdded: calendarItems.length,
      message: `${calendarItems.length} éléments ajoutés au calendrier`
    };
  } catch (error) {
    console.error("Error creating content calendar:", error);
    return {
      type: "error",
      message: "Erreur lors de la création du calendrier"
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateCompetitorAnalysis(businessId: string, aiResponse: string, _business: { name: string; description: string }) {
  try {
    const competitors = extractList(aiResponse, "concurrents");
    const opportunities = extractList(aiResponse, "opportunités de différenciation");
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const currentBusiness = await memoryDB.findOne({ business_id: businessId });
      
      await memoryDB.update(
        { business_id: businessId },
        { 
          market_analysis: {
            ...currentBusiness?.market_analysis,
            competitors,
            opportunities: [
              ...(Array.isArray(currentBusiness?.market_analysis?.opportunities) 
                ? currentBusiness.market_analysis.opportunities 
                : []),
              ...opportunities
            ]
          }
        }
      );
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          "market_analysis.competitors": competitors,
          $addToSet: {
            "market_analysis.opportunities": { $each: opportunities }
          }
        }
      );
    }

    return {
      type: "competitor_analysis_updated",
      message: "Analyse concurrentielle mise à jour"
    };
  } catch (error) {
    console.error("Error updating competitor analysis:", error);
    return {
      type: "error",
      message: "Erreur lors de l'analyse"
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveInteraction(businessId: string, actionType: string, summary: string, _userId: string) {
  try {
    const interaction = {
      timestamp: new Date(),
      agent: "Ezia",
      interaction_type: actionType,
      summary: summary.substring(0, 500),
      recommendations: []
    };

    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const business = await memoryDB.findOne({ business_id: businessId });
      if (business) {
        const interactions = business.ezia_interactions || [];
        interactions.push(interaction);
        await memoryDB.update(
          { business_id: businessId },
          { ezia_interactions: interactions }
        );
      }
    } else {
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          $push: {
            ezia_interactions: interaction
          }
        }
      );
    }
  } catch (error) {
    console.error("Error saving interaction:", error);
  }
}

// Fonctions utilitaires pour extraire des informations
function extractSection(text: string, ...keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\s]*([^.!?\n]+[.!?])`, 'i');
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return "";
}

function extractList(text: string, ...keywords: string[]): string[] {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\s]*([^.]+)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1]
        .split(/[,;•\-\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  }
  return [];
}

function extractCalendarItems(text: string): Array<{
  date: Date;
  type: string;
  content: string;
  status: string;
}> {
  const items: Array<{
    date: Date;
    type: string;
    content: string;
    status: string;
  }> = [];
  const dateRegex = /(\d{1,2}[\s/\-]\w+[\s/\-]?\d{0,4})/g;
  const lines = text.split('\n');
  
  lines.forEach(line => {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      const date = new Date(dateMatch[0]);
      if (!isNaN(date.getTime())) {
        items.push({
          date,
          type: "post",
          content: line.replace(dateMatch[0], '').trim(),
          status: "draft"
        });
      }
    }
  });
  
  return items.slice(0, 30); // Max 30 items
}