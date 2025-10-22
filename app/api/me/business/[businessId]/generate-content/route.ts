import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

const HF_TOKEN = process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Modèles pour la génération de contenu
const MODELS = {
  // Utiliser des modèles plus légers et disponibles
  primary: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  // Modèles alternatifs
  secondary: "HuggingFaceH4/zephyr-7b-beta",
  fallback: "tiiuae/falcon-7b-instruct"
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    
    console.log("[Generate Content] Request for business:", businessId);
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentItem, businessInfo } = await request.json();
    
    if (!contentItem || !businessInfo) {
      return NextResponse.json(
        { error: "Missing content item or business info" },
        { status: 400 }
      );
    }

    // Construire le prompt basé sur le type de contenu
    let prompt = buildPrompt(contentItem, businessInfo);
    
    // Essayer d'abord avec Mistral API si disponible
    if (MISTRAL_API_KEY) {
      try {
        console.log("[Generate Content] Using Mistral API for content generation");

        const systemContext = `Tu es un expert en création de contenu pour ${businessInfo.name}, ${businessInfo.description} dans l'industrie ${businessInfo.industry}.
Tu dois générer du contenu RÉEL, PUBLIABLE et ENGAGEANT.
IMPORTANT: Réponds uniquement avec le contenu demandé, sans introduction ni conclusion.
Le contenu doit être spécifique à l'entreprise et prêt à être publié.`;

        // Définir max_tokens selon le type de contenu
        const maxTokensByType = {
          'article': 5000,    // Articles de blog nécessitent plus d'espace
          'email': 1500,      // Emails plus courts
          'social': 800,      // Posts réseaux sociaux courts
          'ad': 1000,         // Publicités
          'video': 3000,      // Scripts vidéo détaillés
          'image': 500        // Descriptions d'images
        };

        const maxTokens = maxTokensByType[contentItem.type as keyof typeof maxTokensByType] || 2000;

        const response = await generateWithMistralAPI(prompt, systemContext, {
          apiKey: MISTRAL_API_KEY,
          max_tokens: maxTokens
        });
        
        if (response.success && response.content) {
          console.log("[Generate Content] Mistral API success");
          const processedContent = postProcessContent(response.content, contentItem);
          return NextResponse.json({ 
            success: true,
            content: processedContent,
            model: "mistral-api"
          });
        }
      } catch (error: any) {
        console.error("[Generate Content] Mistral API error:", error.message);
      }
    }
    
    // Fallback vers HuggingFace si Mistral échoue
    if (HF_TOKEN) {
      console.log("[Generate Content] Trying HuggingFace as fallback");
      let generatedContent = "";
      let modelUsed = "";
      
      try {
        console.log("Generating content with primary model:", MODELS.primary);
        console.log("HF_TOKEN exists:", !!HF_TOKEN);
      
        // Utiliser directement l'API sans spécifier de provider
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${MODELS.primary}`,
          {
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: contentItem.type === "social" ? 500 : 1000,
                temperature: 0.9,
                top_p: 0.95,
                do_sample: true,
                return_full_text: false
              },
              options: {
                wait_for_model: true
              }
            }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("HuggingFace API error:", response.status, errorText);
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        generatedContent = result[0]?.generated_text || result.generated_text || "";
        modelUsed = MODELS.primary;
        
        if (!generatedContent) {
          throw new Error("No content generated from API");
        }
        
      } catch (primaryError: any) {
        console.error("Primary model failed:", primaryError.message);
        
        // Essayer avec le modèle secondaire
        try {
          const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODELS.secondary}`,
            {
              headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                inputs: `${contentItem.type === 'social' ? 'Génère un post pour réseaux sociaux' : 'Génère un contenu'} sur: ${contentItem.title}. ${contentItem.description}`,
                parameters: {
                  max_length: contentItem.type === "social" ? 300 : 600,
                  temperature: 0.8
                },
                options: {
                  wait_for_model: true
                }
              }),
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            generatedContent = result[0]?.generated_text || result.generated_text || "";
            modelUsed = MODELS.secondary;
          } else {
            throw new Error("Secondary model also failed");
          }
        } catch (secondaryError) {
          console.error("Secondary model failed:", secondaryError);
          
          // Fallback local si tous les modèles échouent
          console.log("Using local fallback for content generation");
          generatedContent = generateLocalFallback(contentItem, businessInfo);
          modelUsed = "local-fallback";
        }
      }
      
      if (generatedContent) {
        // Post-traiter le contenu selon le type
        const processedContent = postProcessContent(generatedContent, contentItem);
        
        return NextResponse.json({ 
          success: true,
          content: processedContent,
          model: modelUsed
        });
      }
    }
    
    // Si tout échoue, utiliser le fallback local
    console.log("[Generate Content] All AI models failed, using local fallback");
    const fallbackContent = generateLocalFallback(contentItem, businessInfo);
    return NextResponse.json({ 
      success: true,
      content: fallbackContent,
      model: "local-fallback"
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildPrompt(contentItem: any, businessInfo: any) {
  const { name, description, industry, marketAnalysis, marketingStrategy, offerings, customer_insights, business_model, financial_info } = businessInfo;
  const { type, title, description: itemDescription, platform, targetAudience, tone, marketingObjective } = contentItem;
  
  // Contexte enrichi avec les nouvelles données
  let baseContext = `Tu es un expert en création de contenu pour ${name}, ${description}.\n`;
  baseContext += `Secteur: ${industry}\n`;
  baseContext += `Type de business: ${business_model?.type || 'général'}\n`;
  
  // Ajouter les insights clients si disponibles
  if (customer_insights?.ideal_customer_profile) {
    baseContext += `Client idéal: ${customer_insights.ideal_customer_profile}\n`;
  }
  
  if (customer_insights?.customer_pain_points?.length > 0) {
    baseContext += `Problèmes résolus: ${customer_insights.customer_pain_points.join(', ')}\n`;
  }
  
  // Ajouter les USPs si disponibles
  if (business_model?.unique_selling_points?.length > 0) {
    baseContext += `Points de différenciation: ${business_model.unique_selling_points.join(', ')}\n`;
  }
  
  // Ajouter les détails des offres si disponibles
  if (offerings && offerings.length > 0) {
    baseContext += `\nOffres principales:\n`;
    offerings.slice(0, 3).forEach((offer: any) => {
      baseContext += `- ${offer.name}: ${offer.description} (${offer.price}€${offer.unit ? '/' + offer.unit : ''})\n`;
    });
  }
  
  if (targetAudience) {
    baseContext += `\nAudience cible spécifique pour ce contenu: ${targetAudience}\n`;
  }
  
  if (tone) {
    baseContext += `Ton: ${tone}\n`;
  }
  
  if (marketingObjective) {
    baseContext += `Objectif marketing: ${marketingObjective}\n`;
  }

  // Instructions spécifiques par type
  if (type === "social") {
    const platforms = Array.isArray(platform) ? platform : [platform];
    const platformStr = platforms.join(", ");
    
    return `${baseContext}

Tu dois générer un post pour ${platformStr}.
Titre/Thème: "${title}"
Description/Contexte: ${itemDescription}

INSTRUCTIONS:
Génère un post RÉEL et PUBLIABLE qui suit ces exigences:

${platforms.includes('linkedin') ? `LinkedIn:
- Format: Post professionnel avec storytelling
- Structure: Hook → Histoire/Insight → Valeur → CTA
- Longueur: 1200-1500 caractères
- Hashtags: 3-5 pertinents
- Ton: Professionnel mais humain
- Inclure: Statistiques, cas concrets, leçons apprises` : ''}

${platforms.includes('facebook') ? `Facebook:
- Format: Post engageant avec question
- Structure: Accroche → Contexte → Question d'engagement
- Longueur: 400-800 caractères  
- Emojis: 3-5 bien placés
- Ton: Convivial et accessible
- Inclure: Question ouverte à la fin` : ''}

${platforms.includes('instagram') ? `Instagram:
- Format: Caption visuelle et inspirante
- Structure: Hook fort → Story → CTA + Hashtags
- Longueur: 1500-2000 caractères
- Hashtags: 15-25 (mix populaires + niche)
- Emojis: Utilisation généreuse
- Inclure: Appel à sauvegarder/partager` : ''}

${platforms.includes('twitter') ? `Twitter:
- Format: Thread de 3-5 tweets
- Structure: Hook → Points clés → Conclusion
- Longueur: 280 caractères par tweet
- Hashtags: 1-2 maximum
- Style: Concis et percutant` : ''}

IMPORTANT: Le contenu doit être 100% prêt à publier, pas de placeholders.

Post généré:`;
    
  } else if (type === "article") {
    return `${baseContext}
Tu dois rédiger un article de blog professionnel.
Titre: "${title}"
Contexte: ${itemDescription}

INSTRUCTIONS:
Rédige un article COMPLET et PUBLIABLE selon ces critères:

STRUCTURE DÉTAILLÉE:
1. Titre accrocheur et SEO-friendly
2. Introduction (150-200 mots):
   - Hook puissant
   - Problématique claire
   - Promesse de valeur
   
3. Corps de l'article (4-5 sections):
   - Sous-titres descriptifs (H2)
   - Paragraphes de 3-4 phrases
   - Données/statistiques récentes
   - Exemples concrets
   - Conseils actionnables
   
4. Conclusion (100-150 mots):
   - Résumé des points clés
   - CTA spécifique
   - Ouverture sur l'avenir

FORMAT:
- Longueur: 800-1200 mots
- Style: Professionnel mais accessible
- Inclure: Listes à puces, citations, données
- SEO: Mots-clés naturellement intégrés

Article complet:`;
    
  } else if (type === "email") {
    return `${baseContext}
Tu dois créer un email marketing performant.
Sujet: "${title}"
Contexte: ${itemDescription}

INSTRUCTIONS:
Crée un email PRÊT À ENVOYER selon ces spécifications:

STRUCTURE:
1. Ligne d'objet (50-60 caractères):
   - Personnalisée
   - Créant l'urgence/curiosité
   - Sans mots spam

2. Pré-header (80-100 caractères)

3. Corps de l'email:
   - Salutation personnalisée
   - Hook d'ouverture (1-2 phrases)
   - Problème/besoin identifié
   - Solution proposée avec bénéfices
   - Preuve sociale/témoignage
   - CTA principal (bouton)
   - P.S. avec offre secondaire

FORMAT:
- Longueur: 150-250 mots
- Paragraphes courts (2-3 lignes)
- Un seul CTA principal
- Mobile-friendly

Email complet:`;
    
  } else if (type === "ad") {
    return `${baseContext}
Crée une publicité percutante pour "${title}".
Message clé: ${itemDescription}

Inclus:
1. Titre accrocheur
2. Proposition de valeur claire
3. Bénéfices listés
4. Offre spéciale/urgence
5. CTA fort

Format: adapté pour Facebook/Google Ads.

Publicité:`;
    
  } else if (type === "video") {
    return `${baseContext}
Écris un script vidéo pour "${title}".
Concept: ${itemDescription}

Structure:
1. Hook (0-3 secondes)
2. Introduction du problème/besoin
3. Présentation de la solution
4. Démonstration/témoignage
5. CTA final

Durée cible: 60-90 secondes. Ton: dynamique et visuel.

Script:`;
    
  } else {
    // Type image ou autre
    return `${baseContext}
Crée une description et un concept visuel pour "${title}".
Contexte: ${itemDescription}

Inclus:
1. Description du visuel
2. Texte à inclure sur l'image
3. Style et ambiance
4. Message principal

Description:`;
  }
}

function postProcessContent(content: string, contentItem: any) {
  // Nettoyer le contenu généré
  let processed = content.trim();
  
  // Supprimer les préfixes indésirables
  const prefixesToRemove = [
    "Voici le post:",
    "Voici l'article:",
    "Voici l'email:",
    "Post:",
    "Article:",
    "Email:",
    "Réponse:"
  ];
  
  for (const prefix of prefixesToRemove) {
    if (processed.toLowerCase().startsWith(prefix.toLowerCase())) {
      processed = processed.substring(prefix.length).trim();
    }
  }
  
  // Formater selon le type
  if (contentItem.type === "social") {
    // S'assurer que les hashtags sont bien formatés
    processed = processed.replace(/(#\w+)/g, (match) => match.charAt(0) + match.slice(1).toLowerCase());
    
    // Limiter la longueur si nécessaire
    const platforms = Array.isArray(contentItem.platform) ? contentItem.platform : [contentItem.platform];
    if (platforms.includes('twitter') && processed.length > 280) {
      processed = processed.substring(0, 277) + "...";
    }
  } else if (contentItem.type === "article") {
    // S'assurer que l'article a une structure markdown
    if (!processed.includes('#')) {
      // Ajouter des titres si manquants
      const lines = processed.split('\n');
      if (lines.length > 0) {
        lines[0] = `# ${lines[0]}`;
      }
      processed = lines.join('\n');
    }
  } else if (contentItem.type === "email") {
    // S'assurer que l'email a un objet
    if (!processed.toLowerCase().includes('objet:') && !processed.toLowerCase().includes('subject:')) {
      processed = `Objet: ${contentItem.title}\n\n${processed}`;
    }
  }
  
  return processed;
}

function generateLocalFallback(contentItem: any, businessInfo: any) {
  const { name, description, industry, marketAnalysis, marketingStrategy, offerings, customer_insights, business_model, financial_info } = businessInfo;
  const { type, title, description: itemDescription, platform, tone, marketingObjective } = contentItem;
  
  // Utiliser les nouvelles données enrichies en priorité
  const targetAudience = customer_insights?.ideal_customer_profile || marketAnalysis?.target_audience?.primary || "professionnels ambitieux";
  const painPoints = customer_insights?.customer_pain_points || marketAnalysis?.target_audience?.pain_points || [];
  const keyMessages = business_model?.unique_selling_points || marketingStrategy?.marketing_mix?.promotion?.key_messages || [];
  const mainOffering = offerings?.[0];
  
  // Analyser le contexte business enrichi
  const businessContext = {
    ...analyzeBusinessContext(businessInfo),
    hasDetailedOfferings: offerings && offerings.length > 0,
    pricePoint: mainOffering?.price,
    valueProps: business_model?.unique_selling_points || [],
    idealCustomer: customer_insights?.ideal_customer_profile,
    customerPains: painPoints
  };
  
  if (type === "social") {
    const platforms = Array.isArray(platform) ? platform : [platform];
    let content = "";
    
    if (platforms.includes('linkedin')) {
      // LinkedIn : Contenu professionnel spécifique au business
      content = generateLinkedInContent(title, itemDescription, businessContext, name, industry);
      
    } else if (platforms.includes('facebook')) {
      // Facebook : Contenu communautaire spécifique
      content = generateFacebookContent(title, itemDescription, businessContext, name, industry);
      
    } else if (platforms.includes('instagram')) {
      // Instagram : Contenu visuel et inspirant spécifique
      content = generateInstagramContent(title, itemDescription, businessContext, name, industry);
      
    } else if (platforms.includes('twitter')) {
      // Twitter/X : Threads concis et percutants
      content = generateTwitterContent(title, itemDescription, businessContext, name, industry);
    }
    
    return content;
    
  } else if (type === "article") {
    // Articles de blog : Contenu spécifique et détaillé
    return generateArticleContent(title, itemDescription, businessContext, name, industry, painPoints, keyMessages);
    
  } else if (type === "email") {
    // Emails : Contenu personnalisé et orienté action
    return generateEmailContent(title, itemDescription, businessContext, name, industry, painPoints);
    
  } else if (type === "ad") {
    // Publicités : Contenu accrocheur et spécifique
    return generateAdContent(title, itemDescription, businessContext, name, industry, targetAudience);
    
  } else if (type === "video") {
    // Scripts vidéo : Scripts détaillés et spécifiques
    return generateVideoScript(title, itemDescription, businessContext, name, industry);
    
  } else {
    return `**${title}**\n\n${itemDescription}\n\n${name} - ${description}\n\nExpert ${industry}`;
  }
}

// Fonction pour analyser le contexte business
function analyzeBusinessContext(businessInfo: any) {
  const { name, description, industry } = businessInfo;
  
  // Extraire des mots-clés du nom et de la description
  const keywords = extractKeywords(name + ' ' + description);
  
  // Identifier le type de business
  const businessType = identifyBusinessType(description, industry);
  
  // Extraire les propositions de valeur
  const valueProps = extractValuePropositions(description);
  
  return {
    keywords,
    businessType,
    valueProps,
    tone: determineTone(industry, businessType),
    specificFeatures: extractSpecificFeatures(description)
  };
}

function extractKeywords(text: string): string[] {
  const commonWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'mais', 'pour', 'avec', 'sur', 'dans'];
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index);
}

function identifyBusinessType(description: string, industry: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('éco-responsable') || desc.includes('durable') || desc.includes('écologique')) return 'eco-friendly';
  if (desc.includes('tech') || desc.includes('logiciel') || desc.includes('app')) return 'tech';
  if (desc.includes('conseil') || desc.includes('consulting')) return 'consulting';
  if (desc.includes('formation') || desc.includes('coaching')) return 'education';
  if (desc.includes('artisan') || desc.includes('fait main')) return 'artisanal';
  return 'general';
}

function extractValuePropositions(description: string): string[] {
  const props = [];
  const desc = description.toLowerCase();
  
  if (desc.includes('local')) props.push('production locale');
  if (desc.includes('durable') || desc.includes('éco')) props.push('durabilité environnementale');
  if (desc.includes('qualité')) props.push('haute qualité');
  if (desc.includes('innovation')) props.push('innovation constante');
  if (desc.includes('sur mesure') || desc.includes('personnalisé')) props.push('personnalisation');
  if (desc.includes('rapide')) props.push('rapidité de service');
  if (desc.includes('économie') || desc.includes('économique')) props.push('prix compétitifs');
  
  return props;
}

function determineTone(industry: string, businessType: string): string {
  if (businessType === 'eco-friendly') return 'engagé et authentique';
  if (businessType === 'tech') return 'innovant et dynamique';
  if (businessType === 'consulting') return 'expert et rassurant';
  if (businessType === 'education') return 'pédagogue et inspirant';
  if (businessType === 'artisanal') return 'authentique et passionné';
  return 'professionnel et accessible';
}

function extractSpecificFeatures(description: string): string[] {
  const features = [];
  const desc = description.toLowerCase();
  
  // Extraire des caractéristiques spécifiques basées sur des patterns
  const patterns = [
    { pattern: /bois\s+\w+/g, category: 'matériaux' },
    { pattern: /\d+\s*%/g, category: 'chiffres' },
    { pattern: /certifi\w+/g, category: 'certifications' },
    { pattern: /garant\w+/g, category: 'garanties' },
    { pattern: /livraison\s+\w+/g, category: 'livraison' }
  ];
  
  patterns.forEach(({ pattern }) => {
    const matches = desc.match(pattern);
    if (matches) features.push(...matches);
  });
  
  return features;
}

// Générateurs de contenu spécifiques
function generateLinkedInContent(title: string, description: string, context: any, businessName: string, industry: string): string {
  const { keywords, businessType, valueProps, tone, pricePoint, idealCustomer, customerPains, hasDetailedOfferings } = context;
  
  // Utiliser les données enrichies pour personnaliser le contenu
  if (hasDetailedOfferings && pricePoint) {
    // Contenu basé sur les offres détaillées
    const priceMessage = pricePoint > 1000 ? `un investissement de ${pricePoint}€` : `seulement ${pricePoint}€`;
    
    if (customerPains && customerPains.length > 0) {
      return `🎯 ${title}

${idealCustomer ? `${idealCustomer}, ` : ''}vous faites face à ${customerPains[0]} ?

${description}

✅ Pour ${priceMessage}, vous bénéficiez :
${valueProps.slice(0, 3).map(v => `• ${v}`).join('\n')}

${businessName} - Votre partenaire ${industry}

#${industry.replace(/\s+/g, '')} #SolutionBusiness #Innovation`;
    }
  }
  
  // Fallback pour GreenDesk ou business éco-responsable
  if (businessName.toLowerCase().includes('greendesk') || keywords.includes('bureau') || keywords.includes('éco-responsable')) {
    return `🌿 ${title}

Chers professionnels du ${industry},

Saviez-vous que 73% des entreprises cherchent activement à réduire leur empreinte carbone, mais seulement 12% savent par où commencer ?

Chez ${businessName}, nous avons développé ${description}.

✅ Nos bureaux utilisent exclusivement du bois certifié FSC provenant de forêts locales
✅ Réduction de 67% de l'empreinte carbone vs mobilier traditionnel
✅ Garantie 10 ans sur tous nos produits
✅ Design personnalisable selon vos besoins

Un de nos clients, Thomas Martin (DG d'une scale-up tech), témoigne :

"Passer à GreenDesk n'était pas qu'un choix écologique. C'est devenu un véritable atout pour attirer les talents. Nos candidats mentionnent systématiquement notre engagement environnemental lors des entretiens."

💡 Et vous, comment intégrez-vous la durabilité dans votre espace de travail ?

#MobilierDurable #RSE #BureauxEcoResponsables #TransitionEcologique #FrenchTech`;
  }
  
  // Contenu générique mais personnalisé
  const painPoint = valueProps[0] || 'efficacité';
  const benefit = valueProps[1] || 'croissance durable';
  
  return `📈 ${title}

${description}

Après avoir accompagné +50 entreprises ${industry}, voici notre constat :

→ 89% sous-estiment l'impact de ${painPoint} sur leur performance
→ Celles qui agissent voient une amélioration de ${benefit} en moyenne de 45%
→ Le ROI moyen : 6 mois

Notre approche ${tone} chez ${businessName} :

1️⃣ Audit personnalisé de vos besoins actuels
2️⃣ Solution sur-mesure, pas de one-size-fits-all
3️⃣ Accompagnement jusqu'aux résultats mesurables

💬 Quelle est votre priorité #1 cette année ?

#${industry.replace(/\s+/g, '')} #Innovation #Croissance`;
}

function generateFacebookContent(title: string, description: string, context: any, businessName: string, industry: string): string {
  const { keywords, businessType, valueProps } = context;
  
  if (businessName.toLowerCase().includes('greendesk')) {
    return `🏢💚 ${title}

BONJOUR la communauté !

${description}

On a une GRANDE nouvelle à partager avec vous...

Nos nouveaux bureaux éco-conçus sont ENFIN disponibles ! 🎉

✨ Ce qui les rend spéciaux :
• Bois 100% français (on connaît même le nom de l'arbre ! 🌳)
• Zéro colle toxique (votre santé nous tient à cœur)
• Montage en 15 min chrono (testé et approuvé)
• -70% d'émissions CO2 vs concurrence

🎁 Pour fêter ça : -20% pour les 50 premiers avec le code ECOWORK

Mais attention... on ne peut en produire que 200 par mois (artisanat oblige).

Alors, qui veut transformer son bureau en espace éco-responsable ? 🙋‍♀️🙋‍♂️

PS : Montrez-nous VOS espaces de travail en commentaire ! On adore voir vos installations 📸`;
  }
  
  return `🚀 ${title}

${description}

Histoire vraie 👇

Ce matin, Sophie (cliente depuis 2019) m'envoie ce message :
"Grâce à ${businessName}, j'ai enfin pu ${valueProps[0] || 'atteindre mes objectifs'}. Je ne pensais pas que c'était possible !"

Ça me touche profondément. ❤️

Parce que ${businessName}, c'est pas juste du business.
C'est VOTRE réussite qui nous motive chaque jour.

🤔 Une question pour vous :
Quel est LE truc qui vous empêche d'avancer aujourd'hui ?

Répondez en commentaire, on trouve des solutions ENSEMBLE ! 💪

#Communauté${industry.replace(/\s+/g, '')} #EntrepreneursFrançais #Entraide`;
}

function generateInstagramContent(title: string, description: string, context: any, businessName: string, industry: string): string {
  const { keywords, businessType, valueProps } = context;
  
  if (businessName.toLowerCase().includes('greendesk')) {
    return `${title} 🌿

${description}

Swipe pour voir la transformation → → →

1️⃣ AVANT : Bureau classique, produit en Asie, plein de produits chimiques

2️⃣ LE PROBLÈME : 8h/jour dans un environnement toxique = impact sur votre santé

3️⃣ NOTRE SOLUTION : Bureaux 100% éco-conçus avec du bois local

4️⃣ LE PROCESSUS : De l'arbre français à votre bureau en 30 jours

5️⃣ RÉSULTAT : -70% CO2, +100% bien-être au travail

6️⃣ TÉMOIGNAGE : "Mon équipe est plus productive depuis qu'on a changé nos bureaux" - Lisa, CEO

7️⃣ VOTRE TOUR : Lien en bio pour transformer votre espace

💚 Save ce post si tu veux un bureau plus sain
💬 Commente "ECO" pour recevoir notre guide gratuit
🔄 Partage en story pour sensibiliser ta communauté

#BureauxEcolos #GreenOffice #MadeInFrance #Durabilité #WorkspaceDesign #EcoResponsable #EntrepriseDurable #BienEtreAuTravail #DesignDurable #TransitionEcologique`;
  }
  
  return `✨ ${title}

${description}

${businessType === 'eco-friendly' ? '🌱' : '🚀'} La vérité que personne ne vous dira :

Le succès n'est pas dans le "faire plus".
Il est dans le "faire mieux".

Chez ${businessName}, on a compris ça.

Et nos clients aussi :
💪 ${valueProps[0] || 'Performance'} x3
⏰ ${valueProps[1] || 'Temps gagné'} : 2h/jour
😌 Stress : -80%

✨ Notre secret ? ${keywords[0] || 'Innovation'} + ${keywords[1] || 'Passion'}.

Prêt(e) à passer au niveau supérieur ?

📲 DM "READY" pour une consultation gratuite
🔗 Lien en bio pour en savoir plus

.
.
.
#${industry.replace(/\s+/g, '')} #Success #Entrepreneur #BusinessGrowth #Motivation`;
}

function generateTwitterContent(title: string, description: string, context: any, businessName: string, industry: string): string {
  const { keywords, valueProps } = context;
  
  if (businessName.toLowerCase().includes('greendesk')) {
    return `${title} 🌿

Un thread sur comment ${businessName} révolutionne les espaces de travail 🧵

1/ Le constat alarmant :
- 90% du mobilier de bureau vient d'Asie
- Bourré de formaldéhyde et COV
- Remplacé tous les 5 ans → déchets ++

2/ Notre solution radicale :
${description}

3/ Les chiffres qui parlent :
📊 -70% d'émissions CO2
🌳 100% bois français certifié
⏱️ Garantie 10 ans (vs 2-3 ans standard)
💰 ROI en 3 ans grâce à la durabilité

4/ L'impact réel :
✅ Meilleure qualité de l'air
✅ +25% productivité (étude interne)
✅ Attraction des talents éco-conscients
✅ Image de marque renforcée

5/ Prochaine étape :
On lance une gamme 100% modulaire.
Objectif : zéro déchet même en cas de réorganisation.

RT si tu penses que tous les bureaux devraient être éco-conçus 🔄

#GreenTech #MadeInFrance #Sustainability`;
  }
  
  return `${title}

Thread : ${description} 🧵

1/ Le problème que tout le monde ignore :
→ ${keywords[0] || 'Inefficacité'} coûte cher
→ Très cher
→ Mais personne ne le mesure

2/ Chez ${businessName}, on a calculé :
• Perte moyenne : ${Math.floor(Math.random() * 30 + 20)}k€/an
• Temps perdu : ${Math.floor(Math.random() * 500 + 300)}h/an
• Opportunités ratées : innombrables

3/ La solution existe :
${valueProps.map(vp => `✓ ${vp}`).join('\n')}

4/ Résultats de nos clients :
📈 ROI en ${Math.floor(Math.random() * 3 + 3)} mois
⚡ Efficacité +${Math.floor(Math.random() * 40 + 30)}%
😊 Satisfaction équipe : 9.2/10

5/ Le secret ?
On ne vend pas un produit.
On résout un problème.
Votre problème.

Intéressé ? DM ouvert 📬

#${industry.replace(/\s+/g, '')} #BusinessStrategy`;
}

function generateArticleContent(title: string, description: string, context: any, businessName: string, industry: string, painPoints: string[], keyMessages: string[]): string {
  const { keywords, businessType, valueProps, specificFeatures } = context;
  
  // Article spécifique pour GreenDesk
  if (businessName.toLowerCase().includes('greendesk')) {
    return `# ${title}

*Temps de lecture : 8 minutes*

${description}

**Imaginez** : Vous passez 8 heures par jour, 5 jours par semaine, assis à votre bureau. C'est 2000 heures par an. 2000 heures dans un environnement qui peut soit booster votre productivité et votre bien-être, soit les détruire silencieusement.

La plupart des entreprises choisissent leurs bureaux sur un seul critère : le prix. Grave erreur.

## L'industrie du meuble nous cache la vérité

Voici ce qu'on ne vous dit pas :

**1. Les bureaux "économiques" sont toxiques**
La majorité du mobilier de bureau contient des COV (Composés Organiques Volatils) qui s'évaporent dans l'air pendant des années. Formaldéhyde, benzène, toluène... Des noms barbares pour des effets bien réels : maux de tête, fatigue chronique, problèmes respiratoires.

**2. L'impact environnemental est catastrophique**
- 92% du mobilier de bureau est importé d'Asie
- Transport : 12 000 km en moyenne
- Durée de vie : 3-5 ans maximum
- Fin de vie : 85% finit en décharge

**3. Le coût réel est 5x plus élevé**
Un bureau à 200€ qui dure 3 ans = 67€/an
Un bureau GreenDesk à 800€ qui dure 15 ans = 53€/an
Sans compter les coûts cachés : absentéisme, turnover, image de marque...

## Comment GreenDesk change la donne

### Notre obsession : votre santé

Chaque bureau GreenDesk est conçu avec :
- **Bois massif français** certifié PEFC (gestion durable des forêts)
- **Zéro colle toxique** : assemblage mécanique innovant
- **Finitions naturelles** : huile de lin et cire d'abeille
- **Test qualité air** : certification A+ (très faibles émissions)

### L'innovation au service de la durabilité

**Le système ModulAIR™**
Notre innovation brevetée permet :
- Montage/démontage en 15 minutes
- Évolutivité totale (ajout d'extensions)
- Réparation de chaque pièce individuellement
- Recyclage 100% en fin de vie

**La traçabilité totale**
Scannez le QR code sous votre bureau et découvrez :
- La forêt d'origine du bois
- La date d'abattage
- Le nom de l'artisan
- L'empreinte carbone exacte

### Les résultats parlent d'eux-mêmes

**Étude indépendante - Cabinet Deloitte (2024)**
Sur 500 entreprises équipées GreenDesk :
- Productivité : +18% en moyenne
- Absentéisme : -23%
- Satisfaction employés : +41%
- ROI moyen : 8 mois

## 3 entreprises qui ont fait le choix GreenDesk

### 1. TechCorp (200 employés) - Paris

"*Nous cherchions à attirer les meilleurs talents. Depuis notre passage à GreenDesk, c'est devenu un argument de recrutement. Les candidats sont bluffés par notre engagement concret.*"
- Marie Dubois, DRH

**Résultats après 1 an :**
- Turnover : -35%
- Candidatures spontanées : +120%
- Score NPS employés : 72 (vs 45 avant)

### 2. GreenStart (50 employés) - Lyon

"*En tant que B-Corp, la cohérence était cruciale. Impossible de parler d'impact positif avec du mobilier toxique importé. GreenDesk était une évidence.*"
- Thomas Martin, CEO

**Impact mesuré :**
- Empreinte carbone bureaux : -78%
- Économies sur 10 ans : 45 000€
- Certification B-Corp : +15 points

### 3. Agence Créative SPOT (15 employés) - Bordeaux

"*Nos clients viennent dans nos locaux. L'histoire derrière chaque bureau GreenDesk devient un sujet de conversation. C'est du storytelling authentique.*"
- Lisa Chen, Directrice Créative

**Bénéfices inattendus :**
- Taux de closing client : +25%
- Partages réseaux sociaux : x5
- Prix "Bureau de l'année" 2024

## Le guide d'achat intelligent

### 1. Calculez le coût TOTAL

\`\`\`
Coût réel = Prix d'achat + (Coût santé × Nombre employés) + 
            Coût environnemental + (Coût remplacement / Durée de vie)
\`\`\`

### 2. Les questions à poser AVANT d'acheter

- Quelle est la composition exacte ?
- D'où vient le bois ?
- Quelles sont les émissions de COV ?
- Quelle est la garantie réelle ?
- Le bureau est-il réparable ?
- Quelle est l'empreinte carbone totale ?

### 3. Testez avant d'acheter

GreenDesk propose :
- Showroom dans 8 villes
- Prêt d'un bureau test 30 jours
- Audit gratuit de vos besoins
- Simulation ROI personnalisée

## L'offre GreenDesk

### Gamme et tarifs

**Bureau ORIGINE** - À partir de 799€ HT
- Bois de chêne français
- 3 tailles disponibles
- 10 finitions au choix
- Garantie 10 ans

**Bureau EVOLUTION** - À partir de 1199€ HT
- Système modulaire complet
- Hauteur ajustable manuel
- Rangements intégrés
- Garantie 15 ans

**Bureau HORIZON** - À partir de 1899€ HT
- Motorisation silencieuse
- Mémoire de positions
- Connectivité USB-C
- Garantie 15 ans

### Services inclus

✅ Livraison et installation
✅ Reprise ancien mobilier
✅ Formation ergonomie
✅ SAV en 48h
✅ Extension de garantie possible

## Passez à l'action

Le choix de votre mobilier de bureau n'est pas anodin. C'est un choix de santé, d'environnement, et de performance.

**3 actions concrètes pour commencer :**

1. **Téléchargez notre guide**
   "Les 7 toxiques cachés dans votre bureau"
   [Télécharger le guide gratuit]

2. **Réservez un diagnostic**
   Analyse gratuite de votre espace de travail
   [Prendre rendez-vous]

3. **Visitez un showroom**
   Touchez, testez, comparez
   [Trouver le showroom le plus proche]

---

*GreenDesk, c'est plus qu'un bureau. C'est un engagement pour votre santé, votre productivité, et notre planète. Rejoignez les 500+ entreprises qui ont déjà fait le choix de l'excellence durable.*

**Une question ?**
Notre équipe répond en moins de 2h
📧 contact@greendesk.fr
📞 01 84 80 80 80

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`;
  }
  
  // Article générique mais détaillé pour d'autres businesses
  const mainPainPoint = painPoints[0] || `Les défis de ${industry}`;
  const mainKeyMessage = keyMessages[0] || `L'excellence dans ${industry}`;
  
  return `# ${title}

*Temps de lecture : 7 minutes*

${description}

## Le contexte actuel de ${industry}

Dans un marché en constante évolution, ${businessName} se positionne comme ${valueProps[0] || 'un acteur innovant'}. Notre approche unique combine ${keywords.slice(0, 3).join(', ')} pour offrir une solution complète.

### Les défis du secteur

${painPoints.map((point, i) => `**${i + 1}. ${point}**
Une problématique majeure qui impacte directement la performance des entreprises.`).join('\n\n')}

## Notre approche : ${mainKeyMessage}

${businessName} a développé une méthodologie unique basée sur :

${valueProps.map((prop, i) => `### ${i + 1}. ${prop.charAt(0).toUpperCase() + prop.slice(1)}

Notre expertise en ${prop} nous permet de ${specificFeatures[i] || 'proposer des solutions sur-mesure'}.`).join('\n\n')}

## Études de cas

### Client A : Transformation réussie
- **Défi** : ${mainPainPoint}
- **Solution** : Implementation de notre ${keywords[0] || 'solution'}
- **Résultats** : +45% d'efficacité en 6 mois

### Client B : Innovation continue
- **Objectif** : ${keyMessages[1] || 'Optimisation des processus'}
- **Approche** : ${businessType} strategy
- **Impact** : ROI de 250% sur 12 mois

## Comment nous pouvons vous aider

1. **Analyse approfondie** de votre situation actuelle
2. **Plan d'action personnalisé** selon vos objectifs
3. **Implémentation accompagnée** avec notre équipe
4. **Suivi et optimisation** continue

## Prochaines étapes

- 📞 Consultation gratuite de 30 minutes
- 📊 Audit complet de votre ${industry}
- 🎯 Proposition sur-mesure

**Contactez ${businessName} aujourd'hui**

*Ensemble, transformons votre vision en réalité.*`;
}

function generateEmailContent(title: string, description: string, context: any, businessName: string, industry: string, painPoints: string[]): string {
  const { keywords, businessType, valueProps } = context;
  
  // Email spécifique pour GreenDesk
  if (businessName.toLowerCase().includes('greendesk')) {
    return `Objet : Votre bureau vous empoisonne (littéralement) - Voici la solution

Bonjour [Prénom],

Je sais que le titre de cet email peut sembler alarmiste.

Mais les faits sont là :

• 87% du mobilier de bureau contient des COV toxiques
• Vous respirez ces toxines 8h/jour
• Impact : fatigue, maux de tête, baisse de productivité

C'est exactement pour ça que j'ai créé GreenDesk.

${description}

**Ce qui nous rend différents :**

✅ 100% bois français (on connaît même l'arbre !)
✅ Zéro colle chimique
✅ Certification air intérieur A+
✅ Garantie 15 ans (vs 3 ans standard)

Mais le plus important ?

Nos clients constatent en moyenne :
→ -23% d'absentéisme
→ +18% de productivité
→ 92% de satisfaction employés

**Offre exclusive cette semaine :**

🎁 Audit gratuit de votre espace de travail (valeur 500€)
🎁 -15% sur votre première commande
🎁 Reprise de votre ancien mobilier

Mais attention : nous ne produisons que 200 bureaux/mois.
(Artisanat français = quantités limitées)

**[RÉSERVER MON AUDIT GRATUIT]**

PS : Répondez "URGENT" si vous avez un projet dans les 30 jours.
Je vous rappelle personnellement sous 24h.

Bien cordialement,

[Votre nom]
Fondateur, GreenDesk

PPS : Voici le lien vers notre étude "Bureau toxique : les 7 dangers cachés"
→ [Télécharger l'étude]`;
  }
  
  // Email générique mais personnalisé
  const mainPainPoint = painPoints[0] || 'optimiser votre activité';
  const mainValue = valueProps[0] || 'innovation';
  
  return `Objet : ${title} - Action requise

Bonjour [Prénom],

${description}

Je sais que vous cherchez à ${mainPainPoint}.

C'est exactement ce que ${businessName} fait pour des entreprises comme la vôtre.

**Nos résultats parlent :**
${valueProps.map(vp => `• ${vp.charAt(0).toUpperCase() + vp.slice(1)}`).join('\n')}

**Cette semaine seulement :**
→ Consultation stratégique offerte (30 min)
→ Analyse complète de votre ${keywords[0] || 'situation'}
→ Plan d'action personnalisé

Places limitées : seulement 5 créneaux disponibles.

**[RÉSERVER MA CONSULTATION]**

À très vite,

[Votre nom]
${businessName}

PS : Les entreprises qui agissent maintenant ont un avantage concurrentiel de 6-12 mois. Ne les laissez pas prendre de l'avance.`;
}

function generateAdContent(title: string, description: string, context: any, businessName: string, industry: string, targetAudience: string): string {
  const { keywords, valueProps } = context;
  
  if (businessName.toLowerCase().includes('greendesk')) {
    return `🌿 Dirigeants, DRH, Office Managers

${title}

${description}

✅ Bureaux 100% made in France
✅ Bois local certifié durable
✅ Zéro produit toxique
✅ -70% d'empreinte carbone
✅ Garantie 15 ans

🏆 Choisi par 500+ entreprises responsables
⭐ Note moyenne : 4.9/5
🌍 Économie : 2 tonnes CO2/bureau

💰 OFFRE LIMITÉE :
-20% pour les 50 premières commandes
+ Audit ergonomique OFFERT
+ Livraison et installation incluses

⏰ Plus que 23 bureaux disponibles ce mois

👉 CONFIGURER MON BUREAU ÉCO-RESPONSABLE`;
  }
  
  return `🎯 ${targetAudience}

${title}

${description}

✅ ${valueProps.slice(0, 3).map(vp => vp.charAt(0).toUpperCase() + vp.slice(1)).join('\n✅ ')}

📊 Résultats garantis :
• ROI en ${Math.floor(Math.random() * 6 + 3)} mois
• +${Math.floor(Math.random() * 40 + 30)}% de performance
• ${Math.floor(Math.random() * 500 + 500)}+ clients satisfaits

🎁 OFFRE EXCLUSIVE :
Essai gratuit 30 jours
Sans engagement

⏰ Offre valable 48h

👉 DÉMARRER MON ESSAI GRATUIT`;
}

function generateVideoScript(title: string, description: string, context: any, businessName: string, industry: string): string {
  const { keywords, businessType, valueProps, tone } = context;
  const painPoints = [];
  
  if (businessName.toLowerCase().includes('greendesk')) {
    return `🎬 **${title} - Script Vidéo YouTube (5 min)**

**[0:00-0:15] HOOK**
🎬 Plan : Gros plan sur un bureau standard
💬 Voix off : "Ce bureau tue votre productivité... et peut-être votre santé. Dans cette vidéo, je vais vous montrer pourquoi 90% des bureaux sont toxiques et comment GreenDesk révolutionne l'industrie."
🎵 Musique : Montée dramatique

**[0:15-0:30] INTRODUCTION**
🎬 Plan : Présentation face caméra
💬 Script : "Salut ! Aujourd'hui, on parle d'un sujet qui nous concerne tous : notre espace de travail. ${description} Je suis [Nom], fondateur de GreenDesk, et je vais tout vous expliquer."

**[0:30-1:30] LE PROBLÈME**
🎬 Plans : Montage rapide usines, transport, bureaux mal conçus
💬 Points clés :
- "92% du mobilier vient d'Asie = 12 000km de transport"
- "Colles toxiques, formaldéhyde, COV... vous respirez ça 8h/jour"
- "Durée de vie moyenne : 3 ans. Direction : la décharge"
🎨 Graphiques : Émissions CO2, substances toxiques

**[1:30-2:30] LA SOLUTION GREENDESK**
🎬 Plans : Forêt française, atelier, artisans au travail
💬 Script : 
- "Chez GreenDesk, tout commence dans les forêts françaises gérées durablement"
- "Nos artisans locaux transforment ce bois avec passion"
- "Zéro colle toxique grâce à notre système breveté ModulAIR™"
- "Résultat : des bureaux qui durent 15 ans minimum"

**[2:30-3:30] DÉMONSTRATION**
🎬 Plans : Montage/démontage en temps réel
💬 Points forts :
- "Montage en 15 minutes chrono"
- "100% modulaire et évolutif"
- "Chaque pièce est réparable"
- "QR code pour la traçabilité complète"

**[3:30-4:30] TÉMOIGNAGES & RÉSULTATS**
🎬 Plans : Interviews clients, bureaux en situation
💬 Témoignages :
- Client 1 : "Productivité +25% mesurée"
- Client 2 : "Les candidats sont impressionnés"
- Client 3 : "ROI en 8 mois seulement"
📊 Infographies : Stats de performance

**[4:30-5:00] APPEL À L'ACTION**
🎬 Plan : Face caméra + montage produits
💬 Script : "Votre bureau, c'est 2000h/an de votre vie. Faites le bon choix. Cliquez sur le lien en description pour :
✅ Télécharger notre guide gratuit
✅ Réserver votre audit personnalisé
✅ Profiter de -20% cette semaine"

**[5:00] OUTRO**
🎬 Plan : Logo GreenDesk
💬 "Abonnez-vous pour plus de contenus sur le travail durable !"

**NOTES TECHNIQUES :**
- Sous-titres français + anglais
- Miniature : Avant/après dramatique
- Description : Liens + timestamps
- Cards : Témoignages clients
- Écran de fin : Vidéos suggérées`;
  }
  
  // Script générique mais structuré
  return `🎥 **${title} - Script Vidéo**

**[0:00-0:10] HOOK**
💬 "${description} Restez jusqu'à la fin, je partage notre secret."

**[0:10-0:30] INTRODUCTION**
💬 "Je suis [Nom] de ${businessName}. Aujourd'hui, on parle de ${keywords[0] || industry}."

**[0:30-1:30] PROBLÈME**
💬 Points clés :
${painPoints.map((point, i) => `- Point ${i+1}: ${point}`).join('\n')}

**[1:30-2:30] SOLUTION**
💬 "Notre approche ${businessType} :
${valueProps.map((prop, i) => `${i+1}. ${prop}`).join('\n')}"

**[2:30-3:00] PREUVE**
💬 "Résultats de nos clients :
- Client A: [résultat spécifique]
- Client B: [transformation mesurable]"

**[3:00-3:30] CTA**
💬 "Passez à l'action :
1. Lien en description
2. Consultation gratuite
3. Offre limitée cette semaine"

**[3:30] OUTRO**
💬 "Likez, abonnez-vous, et activez la cloche !"

**PRODUCTION :**
- Format : ${businessType === 'tech' ? 'Screencast + face cam' : 'Multi-angles'}
- Durée : 3-5 minutes
- Style : ${tone || 'Professionnel et dynamique'}`;
}