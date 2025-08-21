import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    try {
      jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { businessInfo, existingItems, keepExisting } = await request.json();
    
    // Construire le prompt pour générer un calendrier complet
    const prompt = buildCalendarPrompt(businessInfo);
    
    console.log("[Calendar AI] Generating calendar with AI for", businessInfo.name);
    
    // D'abord essayer avec l'IA réelle
    if (MISTRAL_API_KEY) {
      try {
        console.log("[Calendar AI] Using Mistral AI...");
        
        const systemContext = `Tu es un expert en stratégie de contenu digital.
Tu dois générer un calendrier de contenu CONCRET et ACTIONNABLE.
IMPORTANT: Réponds uniquement avec les suggestions de contenu dans le format demandé, sans introduction ni conclusion.`;
        
        const response = await generateWithMistralAPI(prompt, systemContext, MISTRAL_API_KEY);
        
        if (response.success && response.content) {
          console.log("[Calendar AI] Mistral response received");
          const suggestions = parseCalendarSuggestions(response.content, businessInfo);
          
          if (suggestions.length > 0) {
            console.log("[Calendar AI] Generated", suggestions.length, "AI suggestions");
            return NextResponse.json({ 
              success: true,
              suggestions: suggestions,
              keepExisting,
              aiGenerated: true
            });
          }
        }
      } catch (error: any) {
        console.error("[Calendar AI] Mistral error:", error.message);
      }
    } else {
      console.log("[Calendar AI] No Mistral API key found");
    }
    
    // Fallback vers suggestions de base si l'IA échoue
    console.log("[Calendar AI] Using fallback suggestions");
    const basicSuggestions = generateBasicSuggestions(businessInfo);
    
    return NextResponse.json({ 
      success: true,
      suggestions: basicSuggestions,
      keepExisting,
      aiGenerated: false
    });

  } catch (error) {
    console.error("Error regenerating calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildCalendarPrompt(businessInfo: any) {
  const { name, description, industry, marketAnalysis, marketingStrategy } = businessInfo;
  
  let prompt = `Tu es un expert en stratégie de contenu pour ${name}, ${description} dans l'industrie ${industry}.\n\n`;
  
  prompt += `MISSION: Génère un calendrier de contenu RÉEL et PUBLIABLE pour les 30 prochains jours.\n\n`;
  
  prompt += `CONTEXTE BUSINESS:\n`;
  prompt += `- Entreprise: ${name}\n`;
  prompt += `- Description: ${description}\n`;
  prompt += `- Industrie: ${industry}\n\n`;
  
  if (marketAnalysis?.trends_analysis?.current_trends) {
    prompt += `TENDANCES DU MARCHÉ:\n`;
    marketAnalysis.trends_analysis.current_trends.slice(0, 5).forEach((trend: string, i: number) => {
      prompt += `${i + 1}. ${trend}\n`;
    });
    prompt += `\n`;
  }
  
  if (marketingStrategy?.target_segments) {
    prompt += `AUDIENCES CIBLES:\n`;
    if (Array.isArray(marketingStrategy.target_segments)) {
      marketingStrategy.target_segments.slice(0, 3).forEach((segment: any, i: number) => {
        prompt += `${i + 1}. ${segment.description || segment}\n`;
      });
    }
    prompt += `\n`;
  }
  
  if (marketingStrategy?.content_strategy?.content_calendar?.themes_by_month) {
    const themes = Object.values(marketingStrategy.content_strategy.content_calendar.themes_by_month).flat();
    prompt += `THÈMES MARKETING:\n`;
    themes.slice(0, 5).forEach((theme: any, i: number) => {
      prompt += `${i + 1}. ${theme}\n`;
    });
    prompt += `\n`;
  }
  
  prompt += `FORMAT DE RÉPONSE (génère 15-20 suggestions):\n`;
  prompt += `Pour chaque suggestion, utilise EXACTEMENT ce format:\n\n`;
  prompt += `Type: [article|social|video|email|ad|image]\n`;
  prompt += `Titre: [titre accrocheur et spécifique, pas de placeholder]\n`;
  prompt += `Description: [description détaillée de 2-3 phrases du contenu réel]\n`;
  prompt += `Plateforme: [linkedin,facebook,instagram,twitter,youtube,website,email]\n`;
  prompt += `Objectif: [Promotion|Engagement|Éducation|Notoriété|Conversion]\n\n`;
  
  prompt += `IMPORTANT:\n`;
  prompt += `- Génère du contenu SPÉCIFIQUE à ${name} et ${industry}\n`;
  prompt += `- Pas de placeholders comme [date] ou [produit]\n`;
  prompt += `- Varie les types de contenu et les plateformes\n`;
  prompt += `- Alterne entre différents objectifs marketing\n`;
  prompt += `- Adapte le ton selon la plateforme\n\n`;
  
  prompt += `Commence la génération maintenant:`;
  
  return prompt;
}

function parseCalendarSuggestions(text: string, businessInfo: any) {
  // Parser la réponse pour extraire les suggestions
  const suggestions = [];
  const lines = text.split('\n');
  
  let currentSuggestion: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter le début d'une nouvelle suggestion
    if (line.toLowerCase().startsWith('type:')) {
      // Sauvegarder la suggestion précédente si elle est complète
      if (currentSuggestion && currentSuggestion.type && currentSuggestion.title) {
        suggestions.push(currentSuggestion);
      }
      
      // Créer une nouvelle suggestion
      const typeValue = line.substring(5).trim().toLowerCase();
      // Valider le type
      if (['article', 'social', 'video', 'email', 'ad', 'image'].includes(typeValue)) {
        currentSuggestion = {
          type: typeValue,
          ai_generated: true,
          status: 'suggested'
        };
      } else {
        currentSuggestion = null;
      }
    } else if (currentSuggestion) {
      // Extraire les autres champs
      if (line.toLowerCase().startsWith('titre:')) {
        currentSuggestion.title = line.substring(6).trim();
      } else if (line.toLowerCase().startsWith('description:')) {
        // Capturer la description qui peut être sur plusieurs lignes
        let description = line.substring(12).trim();
        
        // Continuer à lire les lignes suivantes si elles ne commencent pas par un label
        let j = i + 1;
        while (j < lines.length && 
               !lines[j].toLowerCase().startsWith('type:') &&
               !lines[j].toLowerCase().startsWith('titre:') &&
               !lines[j].toLowerCase().startsWith('plateforme:') &&
               !lines[j].toLowerCase().startsWith('objectif:') &&
               lines[j].trim() !== '') {
          description += ' ' + lines[j].trim();
          j++;
        }
        i = j - 1; // Ajuster l'index
        
        currentSuggestion.description = description;
      } else if (line.toLowerCase().startsWith('plateforme:')) {
        const platformStr = line.substring(11).trim();
        // Gérer différents formats de séparateurs
        const platforms = platformStr.split(/[,;\/]/).map(p => p.trim().toLowerCase());
        currentSuggestion.platform = platforms.filter(p => 
          ['linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'website', 'email'].includes(p)
        );
        // Si aucune plateforme valide, utiliser des defaults selon le type
        if (currentSuggestion.platform.length === 0) {
          currentSuggestion.platform = getDefaultPlatforms(currentSuggestion.type);
        }
      } else if (line.toLowerCase().startsWith('objectif:')) {
        currentSuggestion.marketingObjective = line.substring(9).trim();
      }
    }
  }
  
  // Ajouter la dernière suggestion si elle est valide
  if (currentSuggestion && currentSuggestion.type && currentSuggestion.title) {
    suggestions.push(currentSuggestion);
  }
  
  // Assigner des dates aux suggestions
  const today = new Date();
  suggestions.forEach((suggestion, index) => {
    // Distribuer uniformément sur 30 jours
    const daysOffset = Math.floor((index / suggestions.length) * 30);
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    
    suggestion.date = date.toISOString().split('T')[0];
    suggestion.id = `ai-${Date.now()}-${index}`;
    suggestion.time = getOptimalTime(suggestion.type);
    
    // Ajouter des valeurs par défaut si manquantes
    if (!suggestion.description) {
      suggestion.description = `Contenu ${suggestion.type} pour ${businessInfo.name}`;
    }
    if (!suggestion.platform || suggestion.platform.length === 0) {
      suggestion.platform = getDefaultPlatforms(suggestion.type);
    }
    if (!suggestion.marketingObjective) {
      suggestion.marketingObjective = "Engagement";
    }
  });
  
  return suggestions;
}

function getDefaultPlatforms(type: string): string[] {
  const platformMap: Record<string, string[]> = {
    article: ["website", "linkedin"],
    video: ["youtube", "facebook", "instagram"],
    image: ["instagram", "facebook", "twitter"],
    social: ["linkedin", "facebook", "instagram"],
    email: ["email"],
    ad: ["facebook", "linkedin", "instagram"]
  };
  
  return platformMap[type] || ["website"];
}

function getOptimalTime(type: string): string {
  const times: Record<string, string[]> = {
    social: ['09:00', '12:00', '18:00', '20:00'],
    article: ['10:00', '14:00'],
    email: ['08:00', '11:00'],
    video: ['12:30', '19:00'],
    ad: ['11:00', '15:00', '19:00'],
    image: ['13:00', '17:00']
  };
  
  const typeTimes = times[type] || times.article;
  return typeTimes[Math.floor(Math.random() * typeTimes.length)];
}

function generateBasicSuggestions(businessInfo: any): any[] {
  const { name, description, industry } = businessInfo;
  const today = new Date();
  const suggestions = [];
  
  // Types de contenu variés
  const contentTypes = [
    { type: 'article', title: `Les tendances ${industry} en 2024`, desc: `Article sur les dernières innovations dans ${industry}` },
    { type: 'social', title: `Découvrez ${name}`, desc: `Post de présentation de notre entreprise et nos valeurs` },
    { type: 'video', title: `Tour virtuel de ${name}`, desc: `Vidéo immersive pour découvrir nos locaux et notre équipe` },
    { type: 'email', title: `Newsletter mensuelle`, desc: `Les actualités et offres exclusives de ${name}` },
    { type: 'image', title: `Infographie ${industry}`, desc: `Visualisation des données clés du secteur` },
    { type: 'ad', title: `Promotion spéciale`, desc: `Campagne publicitaire pour nos nouveaux services` },
    { type: 'article', title: `Guide pratique ${industry}`, desc: `Conseils et bonnes pratiques pour réussir` },
    { type: 'social', title: `Témoignage client`, desc: `Partage d'une success story avec ${name}` },
    { type: 'video', title: `Tutoriel express`, desc: `Comment utiliser nos services en 5 minutes` },
    { type: 'email', title: `Invitation événement`, desc: `Rejoignez-nous pour notre prochain webinar` },
    { type: 'image', title: `Avant/Après`, desc: `Visualisation de nos réalisations` },
    { type: 'social', title: `Question du jour`, desc: `Engagez votre communauté avec une question pertinente` },
    { type: 'article', title: `Étude de cas ${name}`, desc: `Analyse détaillée d'un projet réussi` },
    { type: 'ad', title: `Offre limitée`, desc: `Promotion flash pour nouveaux clients` },
    { type: 'video', title: `Interview expert`, desc: `Discussion avec un leader du secteur ${industry}` }
  ];
  
  contentTypes.forEach((content, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + Math.floor(index * 2));
    
    suggestions.push({
      id: `basic-${Date.now()}-${index}`,
      type: content.type,
      title: content.title,
      description: content.desc,
      date: date.toISOString().split('T')[0],
      time: getOptimalTime(content.type),
      platform: getDefaultPlatforms(content.type),
      marketingObjective: ['Notoriété', 'Engagement', 'Conversion', 'Éducation'][index % 4],
      ai_generated: true,
      status: 'suggested'
    });
  });
  
  return suggestions;
}