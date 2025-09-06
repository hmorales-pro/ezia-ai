import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';

export async function runSimplifiedCompetitorAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Concurrent Simplifié] Analyse pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  // Exemple JSON concret
  const exampleJson = {
    main_competitors: [
      {
        name: "Concurrent 1",
        strengths: ["Force 1", "Force 2"],
        weaknesses: ["Faiblesse 1", "Faiblesse 2"],
        market_share: "25%"
      },
      {
        name: "Concurrent 2",
        strengths: ["Force 1", "Force 2"],
        weaknesses: ["Faiblesse 1", "Faiblesse 2"],
        market_share: "15%"
      }
    ],
    competitive_advantages: ["Avantage 1", "Avantage 2"],
    positioning_strategy: "Positionnement unique et différencié"
  };
  
  const systemContext = `Tu es un expert en analyse concurrentielle.
IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide.
Utilise EXACTEMENT la structure de l'exemple fourni.
Maximum 10 mots par champ, 2 éléments par tableau.`;

  const prompt = `Analyse concurrentielle pour ${business.name} (${business.industry}):
${business.description}

Format JSON EXACT à respecter:
${JSON.stringify(exampleJson, null, 2)}

Génère une analyse RÉALISTE avec de VRAIS noms de concurrents dans ${business.industry}.`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Concurrent Simplifié] Utilisation de Mistral AI avec format JSON');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Concurrent Simplifié] Utilisation de HuggingFace');
      response = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 800,
        temperature: 0.3
      });
    }
    
    if (response.success && response.content) {
      try {
        const analysis = JSON.parse(response.content);
        console.log('[Agent Concurrent Simplifié] JSON parsé avec succès');
        return analysis;
      } catch (parseError) {
        console.error('[Agent Concurrent Simplifié] Erreur parsing:', parseError);
        return generateMinimalAnalysis(business);
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error('[Agent Concurrent Simplifié] Erreur:', error);
    return generateMinimalAnalysis(business);
  }
}

function generateMinimalAnalysis(business: any): any {
  const industryName = business.industry || "secteur";
  
  return {
    main_competitors: [
      {
        name: `Leader ${industryName}`,
        strengths: ["Position dominante", "Ressources"],
        weaknesses: ["Prix élevés", "Innovation lente"],
        market_share: "30%"
      },
      {
        name: `Challenger ${industryName}`,
        strengths: ["Innovation", "Agilité"],
        weaknesses: ["Budget limité", "Notoriété"],
        market_share: "15%"
      }
    ],
    competitive_advantages: ["Service personnalisé", "Innovation continue"],
    positioning_strategy: `Alternative moderne dans ${industryName}`
  };
}