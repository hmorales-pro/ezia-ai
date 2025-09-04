import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

export async function runRealCompetitorAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Concurrent IA] Analyse RÉELLE pour ${business.name}...`);
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  const systemContext = `Tu es un expert en analyse concurrentielle avec 15 ans d'expérience.
Tu dois fournir une analyse concurrentielle SPÉCIFIQUE et DÉTAILLÉE.
IMPORTANT: 
- Sois TRÈS spécifique à l'industrie "${business.industry}" et au business "${business.name}"
- Identifie de VRAIS concurrents existants avec leurs forces/faiblesses réelles
- Utilise des données actuelles (2024) et des parts de marché réalistes
- RÉPONDS UNIQUEMENT EN JSON VALIDE, SANS TEXTE AVANT OU APRÈS
- Évite ABSOLUMENT les généralités`;

  const prompt = `Analyse concurrentielle complète pour:
Nom: ${business.name}
Description: ${business.description}
Industrie: ${business.industry}

Fournis une structure JSON avec:
{
  "main_competitors": [
    {
      "name": "Nom réel du concurrent",
      "strengths": ["3-4 forces spécifiques"],
      "weaknesses": ["2-3 faiblesses réelles"],
      "market_share": "Part de marché en %"
    }
  ],
  "competitive_advantages": ["3-4 avantages concurrentiels uniques"],
  "threats": ["3-4 menaces identifiées"],
  "opportunities": ["3-4 opportunités de marché"],
  "competitive_positioning": {
    "current_position": "Position actuelle sur le marché",
    "desired_position": "Position souhaitée",
    "key_differentiators": ["3-4 différenciateurs clés"]
  },
  "competitive_strategy": {
    "approach": "Stratégie recommandée",
    "tactics": ["4-5 tactiques spécifiques"],
    "timeline": "Calendrier de mise en œuvre"
  }
}`;

  try {
    let response;
    
    if (useMistral) {
      console.log('[Agent Concurrent IA] Utilisation de Mistral AI');
      response = await generateWithMistralAPI(prompt, systemContext);
    } else {
      console.log('[Agent Concurrent IA] Mistral non configuré, utilisation de HuggingFace');
      const hfResponse = await generateAIResponse(prompt, {
        systemContext: systemContext,
        preferredModel: "mistralai/Mistral-7B-Instruct-v0.2",
        maxTokens: 3000,
        temperature: 0.3
      });
      response = hfResponse;
    }
    
    if (response.success && response.content) {
      try {
        // Nettoyer la réponse pour extraire le JSON
        let jsonContent = response.content;
        
        // Extraire le JSON s'il est entouré de texte
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        const analysis = parseAIGeneratedJson(jsonContent);
        return analysis;
      } catch (parseError) {
        console.error("[Agent Concurrent IA] Erreur parsing JSON:", parseError);
        console.log("[Agent Concurrent IA] Contenu reçu:", response.content?.substring(0, 500));
        
        // Si on utilise HuggingFace, essayer de parser différemment
        if (!useMistral && response.content) {
          try {
            // Extraire le JSON même s'il est mal formaté
            const cleanedContent = response.content
              .replace(/```json\n?/gi, '')
              .replace(/```\n?/gi, '')
              .trim();
            const analysis = parseAIGeneratedJson(cleanedContent);
            return analysis;
          } catch (secondError) {
            console.error("[Agent Concurrent IA] Deuxième tentative de parsing échouée");
          }
        }
        
        // Ne pas utiliser le fallback générique
        throw new Error('Impossible de parser la réponse de l\'IA. Veuillez réessayer.');
      }
    }
    
    throw new Error("Pas de réponse de l'IA");
    
  } catch (error) {
    console.error("[Agent Concurrent IA] Erreur:", error);
    // Ne pas utiliser de fallback générique - forcer une vraie analyse
    throw new Error(`Erreur lors de l'analyse concurrentielle: ${error.message}`);
  }
}