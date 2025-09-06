import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';

export async function runSimplifiedMarketingStrategyAgent(business: any, marketAnalysis: any): Promise<any> {
  console.log(`[Agent Marketing Simplifié] Génération pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Exemple JSON concret pour guider l'IA
  const exampleJson = {
    vision: "Devenir leader en 5 ans",
    mission: "Offrir excellence et innovation",
    unique_value_proposition: "Solution unique pour clients",
    positioning: "Premium accessible",
    key_messages: ["Message 1", "Message 2"],
    channels: ["Canal 1", "Canal 2"],
    content_pillars: ["Pilier 1", "Pilier 2"],
    immediate_actions: [
      { action: "Action 1", timeline: "1 mois" },
      { action: "Action 2", timeline: "2 mois" }
    ]
  };
  
  const systemContext = `Tu es un expert en stratégie marketing.
IMPORTANT: Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.
La réponse doit être un JSON exactement comme l'exemple fourni, mais avec du contenu spécifique au business.
Maximum 10 mots par champ texte, 2 éléments par tableau.`;

  const prompt = `Pour ${business.name} (${business.industry}):
${business.description}

Voici l'EXACT format JSON attendu (remplace les valeurs):
${JSON.stringify(exampleJson, null, 2)}

Génère une stratégie marketing CONCISE en respectant EXACTEMENT ce format.`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Marketing Simplifié] Utilisation de Mistral AI avec format JSON');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Marketing Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 1000,
        temperature: 0.3
      });
    }
    
    if (response.success && response.content) {
      try {
        // Parser directement le JSON (devrait être valide grâce à response_format)
        const strategy = JSON.parse(response.content);
        console.log('[Agent Marketing Simplifié] JSON parsé avec succès');
        return strategy;
      } catch (parseError) {
        console.error('[Agent Marketing Simplifié] Erreur parsing:', parseError);
        // Fallback basique
        return generateMinimalStrategy(business);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error('[Agent Marketing Simplifié] Erreur:', error);
    return generateMinimalStrategy(business);
  }
}

function generateMinimalStrategy(business: any): any {
  const industryName = business.industry || "votre secteur";
  
  return {
    vision: `Leader ${industryName} en 5 ans`,
    mission: `Excellence et innovation ${industryName}`,
    unique_value_proposition: `Solution unique pour ${industryName}`,
    positioning: "Premium accessible",
    key_messages: ["Qualité supérieure", "Service exceptionnel"],
    channels: ["Digital", "Direct"],
    content_pillars: ["Expertise", "Innovation"],
    immediate_actions: [
      { action: "Lancer site web", timeline: "1 mois" },
      { action: "Campagne sociale", timeline: "2 mois" }
    ]
  };
}