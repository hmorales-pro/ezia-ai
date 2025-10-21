/**
 * MarketResearchDeepSeek - Analyse de marché avec DeepSeek V3
 *
 * Architecture JSON-first en 2 phases :
 * - Phase 1: Génération JSON structuré (DeepSeek V3 avec schéma strict)
 * - Phase 2: Parsing JSON + Agent de normalisation en fallback (Qwen 2.5)
 *
 * ✅ Avantages:
 * - Pas de regex fragiles pour parser du Markdown
 * - Structures de réponses imposées via JSON Schema
 * - Agent de normalisation pour corriger les réponses malformées
 * - Mapping direct vers le schéma MongoDB
 */

import { generateWithDeepSeek, generateWithQwen } from '../deepseek-ai-service';

interface MarketResearchInput {
  businessId: string;
  userId: string;
  businessName: string;
  industry: string;
  description: string;
  targetMarket?: string;
}

export class MarketResearchDeepSeek {
  /**
   * Génération complète de l'analyse de marché
   */
  async generateMarketAnalysis(input: MarketResearchInput) {
    try {
      console.log(`🚀 [DeepSeek] Analyse de marché pour ${input.businessName}...`);

      // Phase 1: Génération analyse complète
      const analysisMarkdown = await this.phase1_generateAnalysis(input);

      if (!analysisMarkdown) {
        throw new Error('Échec génération analyse');
      }

      // Phase 2: Extraction structurée
      const structuredData = await this.phase2_extractStructure(analysisMarkdown, input);

      // Construire l'objet final
      const analysis = {
        businessId: input.businessId,
        userId: input.userId,
        industry: input.industry,
        business_name: input.businessName,
        business_description: input.description,
        ...structuredData,
        meta: {
          generated_at: new Date(),
          next_refresh_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          refresh_frequency: 'monthly',
          ai_model: 'DeepSeek-V3',
          data_sources: [{
            name: 'DeepSeek V3 Knowledge Base',
            type: 'api' as const,
            collected_at: new Date(),
            reliability: 'high' as const
          }],
          analysis_depth: 'deep_comprehensive'
        },
        reports: {
          markdown: analysisMarkdown,
        },
      };

      console.log(`✅ [DeepSeek] Analyse terminée avec MOI: ${structuredData.scoring.market_opportunity_index}/100`);

      return {
        success: true,
        analysis,
      };

    } catch (error) {
      console.error('❌ [DeepSeek] Erreur:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * PHASE 1: Génération de l'analyse complète en JSON structuré
   */
  private async phase1_generateAnalysis(input: MarketResearchInput): Promise<string> {
    console.log('📊 [Phase 1] Génération analyse JSON structurée...');

    const prompt = `Tu es un consultant senior en stratégie de marché. Génère une analyse de marché **complète et détaillée** pour :

**Entreprise**: ${input.businessName}
**Secteur**: ${input.industry}
**Concept**: ${input.description}

IMPORTANT: Tu DOIS retourner UNIQUEMENT un objet JSON valide (pas de texte avant/après, pas de \`\`\`json).

{
  "market_size": "Estimation chiffrée en milliards € pour ${input.industry}",
  "growth_rate": "Taux de croissance % avec période",
  "trends": [
    {
      "name": "Nom tendance",
      "description": "Description 2-3 phrases",
      "impact": "Élevé",
      "source": "Source ou URL (optionnel)"
    }
  ],
  "competitors": [
    {
      "name": "Nom concurrent",
      "description": "Description détaillée du concurrent (2-3 phrases: type, activité, positionnement)",
      "website": "URL du site web (https://...)",
      "strengths": ["Force 1", "Force 2", "Force 3"],
      "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
      "positioning": "Description positionnement stratégique (1-2 phrases)"
    }
  ],
  "opportunities": [
    {
      "title": "Titre opportunité",
      "description": "Description détaillée (2-3 phrases)",
      "impact": "Élevé|Moyen|Faible",
      "difficulty": "Élevé|Moyen|Faible",
      "examples": "Exemples concrets ou acteurs similaires (optionnel)"
    }
  ],
  "threats": [
    {
      "title": "Titre menace",
      "description": "Description détaillée",
      "severity": "Élevée|Moyenne|Faible",
      "probability": "Élevée|Moyenne|Faible"
    }
  ],
  "customer_segments": [
    {"name": "Segment 1", "description": "Description"}
  ],
  "customer_needs": ["Besoin 1", "Besoin 2", "Besoin 3"],
  "buying_behavior": "Paragraphe décrivant comportements",
  "ocean_blue": {
    "eliminate": ["Facteur 1: Justification", "Facteur 2: Justification"],
    "reduce": ["Facteur 1: Justification", "Facteur 2: Justification"],
    "increase": ["Facteur 1: Justification", "Facteur 2: Justification"],
    "create": ["Facteur 1: Justification", "Facteur 2: Justification"],
    "target_market": "Description nouveau marché créé"
  },
  "scoring": {
    "market_attractiveness": 85,
    "competitive_intensity": 70,
    "entry_difficulty": 60,
    "growth_potential": 90,
    "customer_demand": 80,
    "justification": "Explication du scoring"
  }
}

**IMPORTANT**:
- Retourne SEULEMENT le JSON (pas de texte autour)
- Adapte tout au secteur ${input.industry} et au concept ${input.businessName}
- 5-7 tendances avec sources si disponibles
- 5-8 concurrents RÉELS avec sites web (URLs complètes https://...)
- 5-8 opportunités avec exemples concrets
- 5-8 menaces réalistes
- Scores entre 0-100
- URLs: vérifie qu'elles sont valides et pertinentes`;

    // Essayer DeepSeek V3 avec JSON mode
    let response = await generateWithDeepSeek(
      prompt,
      'Expert consultant en stratégie de marché. Tu retournes UNIQUEMENT du JSON valide, sans texte autour.',
      { maxTokens: 8000, temperature: 0.3 } // Température basse pour plus de précision
    );

    // Si DeepSeek échoue, utiliser Qwen en fallback
    if (!response.success || !response.content) {
      console.log('⚠️ [Phase 1] DeepSeek échoué, tentative avec Qwen...');
      response = await generateWithQwen(
        prompt,
        'Expert consultant en stratégie de marché. Tu retournes UNIQUEMENT du JSON valide.',
        { maxTokens: 8000, temperature: 0.3 }
      );
    }

    if (!response.success || !response.content) {
      throw new Error('Échec génération avec DeepSeek et Qwen');
    }

    console.log(`✅ [Phase 1] JSON généré (${response.content.length} caractères)`);
    return response.content;
  }

  /**
   * PHASE 2: Parsing et normalisation du JSON
   */
  private async phase2_extractStructure(jsonString: string, input: MarketResearchInput) {
    console.log('🔍 [Phase 2] Parsing JSON structuré...');

    let data: any;

    try {
      // Tentative de parsing direct
      const cleanJson = this.cleanJsonResponse(jsonString);
      data = JSON.parse(cleanJson);
      console.log('✅ [Phase 2] JSON parsé avec succès');
    } catch (error) {
      console.warn('⚠️ [Phase 2] Parsing JSON échoué, tentative avec agent de normalisation...');

      // Fallback: Agent de normalisation (Qwen 2.5)
      data = await this.normalizeWithAgent(jsonString);

      if (!data) {
        throw new Error('Échec du parsing JSON et de la normalisation');
      }
    }

    // Validation et mapping vers le schéma MongoDB
    return this.mapToMongoSchema(data, input);
  }

  /**
   * Nettoie la réponse JSON (supprime markdown, texte autour)
   */
  private cleanJsonResponse(text: string): string {
    // Supprimer les blocs de code markdown
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Chercher le premier { et le dernier }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned.trim();
  }

  /**
   * Agent de normalisation - Fallback si le JSON est mal formé
   */
  private async normalizeWithAgent(malformedJson: string): Promise<any | null> {
    console.log('🔧 [Normalization Agent] Tentative de réparation du JSON...');

    const prompt = `Tu es un expert en normalisation de données. On a reçu une réponse qui devrait être du JSON mais qui est mal formée.

**Réponse reçue:**
${malformedJson.substring(0, 3000)}

**Tâche**: Extraire les données et retourner un JSON valide avec cette structure EXACTE:

{
  "market_size": "string",
  "growth_rate": "string",
  "trends": [{"name": "string", "description": "string", "impact": "Élevé|Moyen|Faible"}],
  "competitors": [{"name": "string", "description": "string", "strengths": ["string"], "weaknesses": ["string"], "positioning": "string"}],
  "opportunities": [{"title": "string", "description": "string", "impact": "Élevé|Moyen|Faible", "difficulty": "Élevé|Moyen|Faible"}],
  "threats": [{"title": "string", "description": "string", "severity": "Élevée|Moyenne|Faible", "probability": "Élevée|Moyenne|Faible"}],
  "customer_segments": [{"name": "string", "description": "string"}],
  "customer_needs": ["string"],
  "buying_behavior": "string",
  "ocean_blue": {
    "eliminate": ["Facteur: Justification"],
    "reduce": ["Facteur: Justification"],
    "increase": ["Facteur: Justification"],
    "create": ["Facteur: Justification"],
    "target_market": "string"
  },
  "scoring": {
    "market_attractiveness": 0-100,
    "competitive_intensity": 0-100,
    "entry_difficulty": 0-100,
    "growth_potential": 0-100,
    "customer_demand": 0-100,
    "justification": "string"
  }
}

Retourne SEULEMENT le JSON valide, sans texte autour.`;

    try {
      const response = await generateWithQwen(
        prompt,
        'Expert en normalisation de données JSON. Tu retournes UNIQUEMENT du JSON valide.',
        { maxTokens: 6000, temperature: 0.1 }
      );

      if (response.success && response.content) {
        const cleaned = this.cleanJsonResponse(response.content);
        return JSON.parse(cleaned);
      }
    } catch (error) {
      console.error('❌ [Normalization Agent] Échec:', error);
    }

    return null;
  }

  /**
   * Mappe les données JSON vers le schéma MongoDB
   */
  private mapToMongoSchema(data: any, input: MarketResearchInput): any {
    console.log('🗺️ [Phase 2] Mapping vers schéma MongoDB...');

    // Calculer le MOI si pas fourni
    let moi = data.scoring?.market_opportunity_index;
    if (!moi) {
      const ma = data.scoring?.market_attractiveness || 50;
      const ci = data.scoring?.competitive_intensity || 50;
      const ed = data.scoring?.entry_difficulty || 50;
      const gp = data.scoring?.growth_potential || 50;
      const cd = data.scoring?.customer_demand || 50;

      moi = Math.round(
        ma * 0.25 +
        (100 - ci) * 0.20 +
        (100 - ed) * 0.15 +
        gp * 0.25 +
        cd * 0.15
      );
    }

    const market_overview = {
      market_size: data.market_size || 'Données non disponibles',
      growth_rate: data.growth_rate || 'Données non disponibles',
      key_trends: (data.trends || []).slice(0, 7).map((t: any) => ({
        name: t.name || 'Tendance',
        description: t.description || '',
        impact: (t.impact === 'Élevé' || t.impact === 'Faible') ? t.impact : 'Moyen',
        source: t.source || undefined // Nouveau champ optionnel
      })),
      market_maturity: this.estimateMaturity(data.growth_rate || '0%')
    };

    const competition = {
      competitive_landscape: `Marché ${input.industry} avec ${(data.competitors || []).length} acteurs principaux analysés.`,
      main_competitors: (data.competitors || []).map((c: any) => ({
        name: c.name || 'Concurrent',
        description: c.description || '',
        website: c.website || undefined, // Nouveau champ URL
        position: c.positioning || undefined, // Optionnel
        strengths: c.strengths || [],
        weaknesses: c.weaknesses || [],
        market_position: c.positioning || 'Non défini',
        threat_level: this.estimateThreatLevel(
          (c.strengths || []).length,
          (c.weaknesses || []).length
        )
      })),
      competitive_intensity: data.scoring?.competitive_intensity || 50,
      entry_barriers: []
    };

    const customer_analysis = {
      target_segments: (data.customer_segments || []).map((s: any) => ({
        name: s.name || 'Segment',
        description: s.description || '',
        size_estimate: 'Moyen'
      })),
      customer_needs: data.customer_needs || [],
      buying_behavior: data.buying_behavior || '',
      customer_pain_points: []
    };

    const ocean_blue_strategy = {
      eliminate: (data.ocean_blue?.eliminate || []).map(this.cleanOceanItem),
      reduce: (data.ocean_blue?.reduce || []).map(this.cleanOceanItem),
      increase: (data.ocean_blue?.increase || []).map(this.cleanOceanItem),
      create: (data.ocean_blue?.create || []).map(this.cleanOceanItem),
      target_market: data.ocean_blue?.target_market || 'Marché à définir',
      value_innovation: 'Innovation stratégique basée sur différenciation'
    };

    const scoring = {
      market_attractiveness: data.scoring?.market_attractiveness || 50,
      competitive_intensity: data.scoring?.competitive_intensity || 50,
      entry_difficulty: data.scoring?.entry_difficulty || 50,
      growth_potential: data.scoring?.growth_potential || 50,
      customer_demand: data.scoring?.customer_demand || 50,
      market_opportunity_index: moi,
      confidence_level: moi > 60 ? 'high' : moi > 40 ? 'medium' : 'low',
      scoring_rationale: data.scoring?.justification || `MOI ${moi}/100 basé sur analyse DeepSeek V3.`
    };

    console.log(`✅ [Phase 2] Mapping terminé: ${market_overview.key_trends.length} tendances, ${competition.main_competitors.length} concurrents, ${(data.opportunities || []).length} opportunités`);

    return {
      market_overview,
      competition,
      customer_analysis,
      opportunities: (data.opportunities || []).slice(0, 8).map((o: any, i: number) => ({
        title: o.title || `Opportunité ${i + 1}`,
        description: o.description || '',
        potential_impact: this.normalizeImpact(o.impact),
        difficulty: this.normalizeDifficulty(o.difficulty),
        timeframe: 'court_terme' as const,
        examples: o.examples || undefined // Nouveau champ optionnel
      })),
      threats: (data.threats || []).slice(0, 8).map((t: any, i: number) => ({
        title: t.title || `Menace ${i + 1}`,
        description: t.description || '',
        severity: this.normalizeSeverity(t.severity),
        probability: this.normalizeProbability(t.probability),
        mitigation_strategy: 'À définir'
      })),
      ocean_blue_strategy,
      scoring
    };
  }

  /**
   * Nettoie un item Ocean Blue (supprimer markdown, normaliser format)
   */
  private cleanOceanItem(item: string): string {
    if (typeof item !== 'string') return String(item);
    return item.replace(/\*\*/g, '').trim();
  }

  // Normalisation des valeurs
  private normalizeImpact(val: string): 'Élevé' | 'Moyen' | 'Faible' {
    if (!val) return 'Moyen';
    const normalized = val.toLowerCase();
    if (normalized.includes('élev') || normalized.includes('haut')) return 'Élevé';
    if (normalized.includes('faible') || normalized.includes('bas')) return 'Faible';
    return 'Moyen';
  }

  private normalizeDifficulty(val: string): 'Élevé' | 'Moyen' | 'Faible' {
    return this.normalizeImpact(val); // Même logique
  }

  private normalizeSeverity(val: string): 'Élevée' | 'Moyenne' | 'Faible' {
    if (!val) return 'Moyenne';
    const normalized = val.toLowerCase();
    if (normalized.includes('élev') || normalized.includes('haut')) return 'Élevée';
    if (normalized.includes('faible') || normalized.includes('bas')) return 'Faible';
    return 'Moyenne';
  }

  private normalizeProbability(val: string): 'Élevée' | 'Moyenne' | 'Faible' {
    return this.normalizeSeverity(val); // Même logique
  }

  // ==================== HELPERS ====================

  private estimateMaturity(growthRate: string): 'émergent' | 'croissance' | 'mature' | 'déclin' {
    const rate = parseFloat(growthRate);
    if (isNaN(rate)) return 'mature';
    if (rate > 10) return 'émergent';
    if (rate > 5) return 'croissance';
    if (rate > 0) return 'mature';
    return 'déclin';
  }

  private estimateThreatLevel(strengths: number, weaknesses: number): 'Élevé' | 'Moyen' | 'Faible' {
    const ratio = strengths / Math.max(weaknesses, 1);
    if (ratio > 1.5) return 'Élevé';
    if (ratio > 0.8) return 'Moyen';
    return 'Faible';
  }
}
