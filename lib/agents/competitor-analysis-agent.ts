import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import { generateAIResponse } from '@/lib/ai-service';
import { parseAIGeneratedJson } from './json-sanitizer';

export async function runRealCompetitorAnalysisAgent(business: any): Promise<any> {
  console.log(`[Agent Concurrent IA] Analyse RÉELLE pour ${business.name}...`);
  
  // Essayer d'abord la version simplifiée
  try {
    const { runSimplifiedCompetitorAnalysisAgent } = await import('./competitor-analysis-agent-simplified');
    const simplifiedResult = await runSimplifiedCompetitorAnalysisAgent(business);
    if (simplifiedResult) {
      console.log('[Agent Concurrent IA] Utilisation de l\'analyse simplifiée');
      return simplifiedResult;
    }
  } catch (simplifiedError) {
    console.log('[Agent Concurrent IA] Erreur avec la version simplifiée, tentative complète...');
  }
  
  const mistralKey = process.env.MISTRAL_API_KEY;
  const useMistral = mistralKey && mistralKey !== 'placeholder' && mistralKey.length > 10;
  
  const systemContext = `Tu es un expert en analyse concurrentielle avec 15 ans d'expérience.
Tu dois fournir une analyse concurrentielle SPÉCIFIQUE et DÉTAILLÉE.

RÈGLES CRITIQUES POUR LE JSON:
1. RÉPONDS UNIQUEMENT EN JSON VALIDE, SANS AUCUN TEXTE AVANT OU APRÈS
2. N'UTILISE JAMAIS de formatage markdown (pas de **, *, __, _, etc.)
3. Utilise uniquement des guillemets doubles " pour les chaînes
4. Échappe correctement les caractères spéciaux dans les chaînes
5. Assure-toi que le JSON est COMPLET et bien fermé
6. Pour l'industrie "${business.industry}" et le business "${business.name}", fournis des concurrents RÉELS et SPÉCIFIQUES
7. Limite chaque tableau à 5 éléments maximum pour éviter la troncature`;

  const prompt = `Analyse concurrentielle pour ${business.name} dans l'industrie ${business.industry}.

Description: ${business.description}

Génère UNIQUEMENT ce JSON (pas de texte, pas de markdown):
{
  "main_competitors": [
    {
      "name": "Nom du concurrent réel",
      "strengths": ["Force 1", "Force 2", "Force 3"],
      "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
      "market_share": "XX%"
    }
  ],
  "competitive_advantages": ["Avantage 1", "Avantage 2", "Avantage 3"],
  "threats": ["Menace 1", "Menace 2", "Menace 3"],
  "opportunities": ["Opportunité 1", "Opportunité 2", "Opportunité 3"],
  "competitive_positioning": {
    "current_position": "Description courte",
    "desired_position": "Description courte",
    "key_differentiators": ["Diff 1", "Diff 2", "Diff 3"]
  },
  "competitive_strategy": {
    "approach": "Description de la stratégie",
    "tactics": ["Tactique 1", "Tactique 2", "Tactique 3", "Tactique 4"],
    "timeline": "3-6 mois"
  }
}

Limite: 3 concurrents max, textes courts et précis.`;

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
        maxTokens: 4000,
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
        console.log("[Agent Concurrent IA] Longueur du contenu:", response.content?.length);
        console.log("[Agent Concurrent IA] Début du contenu:", response.content?.substring(0, 500));
        console.log("[Agent Concurrent IA] Fin du contenu:", response.content?.substring(Math.max(0, (response.content?.length || 0) - 200)));
        
        // Vérifier si le JSON semble tronqué
        const lastChar = response.content?.trim().slice(-1);
        if (lastChar !== '}' && lastChar !== ']') {
          console.error("[Agent Concurrent IA] ATTENTION: Le JSON semble être tronqué. Dernier caractère:", lastChar);
        }
        
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