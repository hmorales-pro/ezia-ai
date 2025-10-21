/**
 * MarketingStrategyDeepSeek - Génération de stratégie marketing avec DeepSeek V3
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

interface MarketingStrategyInput {
  businessId: string;
  userId: string;
  businessName: string;
  industry: string;
  description: string;
  targetMarket?: string;
  marketAnalysis?: any; // Optionnel : données de l'analyse de marché
}

export class MarketingStrategyDeepSeek {
  /**
   * Génération complète de la stratégie marketing
   */
  async generateMarketingStrategy(input: MarketingStrategyInput) {
    try {
      console.log(`🚀 [DeepSeek Marketing] Stratégie marketing pour ${input.businessName}...`);

      // Phase 1: Génération JSON structuré
      const strategyJSON = await this.phase1_generateStrategy(input);

      if (!strategyJSON) {
        throw new Error('Échec génération stratégie');
      }

      // Phase 2: Parsing et validation
      const structuredData = await this.phase2_parseAndValidate(strategyJSON, input);

      // Construire l'objet final
      const strategy = {
        businessId: input.businessId,
        userId: input.userId,
        business_name: input.businessName,
        business_description: input.description,
        industry: input.industry,
        ...structuredData,
        meta: {
          generated_at: new Date(),
          next_refresh_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
          refresh_frequency: 'quarterly',
          ai_model: 'DeepSeek-V3',
          data_sources: [{
            name: 'DeepSeek V3 Knowledge Base',
            type: 'api' as const,
            collected_at: new Date(),
            reliability: 'high' as const
          }],
        },
        reports: {
          markdown: strategyJSON,
        },
      };

      console.log(`✅ [DeepSeek Marketing] Stratégie générée avec succès`);

      return {
        success: true,
        strategy,
      };

    } catch (error) {
      console.error('❌ [DeepSeek Marketing] Erreur:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * PHASE 1: Génération de la stratégie complète en JSON structuré
   */
  private async phase1_generateStrategy(input: MarketingStrategyInput): Promise<string> {
    console.log('📊 [Phase 1] Génération stratégie JSON structurée...');

    const marketContext = input.marketAnalysis ? `
**Contexte Analyse de Marché :**
- Taille du marché : ${input.marketAnalysis.market_overview?.market_size}
- Croissance : ${input.marketAnalysis.market_overview?.growth_rate}
- Concurrents principaux : ${input.marketAnalysis.competition?.main_competitors?.length || 0} identifiés
- Ocean Blue : ${input.marketAnalysis.ocean_blue_strategy?.target_market}
` : '';

    const prompt = `Tu es un expert en stratégie marketing et branding. Génère une stratégie marketing **complète et détaillée** pour :

**Entreprise** : ${input.businessName}
**Secteur** : ${input.industry}
**Concept** : ${input.description}
${marketContext}

IMPORTANT : Tu DOIS retourner UNIQUEMENT un objet JSON valide (pas de texte avant/après, pas de \`\`\`json).

{
  "executive_summary": {
    "vision": "Vision long-terme inspirante (2-3 phrases)",
    "mission": "Mission concrète de l'entreprise (2-3 phrases)",
    "unique_value_proposition": "Proposition de valeur unique qui différencie",
    "target_roi": "ROI visé (ex: +150% CA en 18 mois)"
  },
  "brand_positioning": {
    "brand_essence": "Essence de marque en 3-5 mots",
    "brand_promise": "Promesse de marque claire",
    "brand_personality": ["Trait 1", "Trait 2", "Trait 3", "Trait 4", "Trait 5"],
    "brand_values": ["Valeur 1", "Valeur 2", "Valeur 3", "Valeur 4"],
    "positioning_statement": "Statement de positionnement complet",
    "competitive_advantages": ["Avantage 1", "Avantage 2", "Avantage 3"]
  },
  "target_segments": [
    {
      "segment_name": "Nom du segment",
      "description": "Description détaillée",
      "demographics": "Âge, genre, revenus, localisation",
      "psychographics": "Valeurs, attitudes, comportements",
      "size_estimate": "Taille estimée du segment",
      "priority": "high|medium|low",
      "reach_strategy": "Comment atteindre ce segment"
    }
  ],
  "marketing_mix": {
    "product": {
      "core_offerings": ["Offre 1", "Offre 2", "Offre 3"],
      "unique_features": ["Feature 1", "Feature 2", "Feature 3"],
      "differentiation": "Ce qui différencie le produit/service"
    },
    "price": {
      "strategy": "Premium|Pénétration|Écrémage|Aligné",
      "positioning": "Justification du prix",
      "tactics": ["Tactique 1", "Tactique 2", "Tactique 3"]
    },
    "place": {
      "distribution_channels": ["Canal 1", "Canal 2", "Canal 3"],
      "online_presence": ["Site web", "Réseaux sociaux", "Marketplaces"],
      "partnerships": ["Partenaire potentiel 1", "Partenaire 2"]
    },
    "promotion": {
      "key_messages": ["Message 1", "Message 2", "Message 3"],
      "communication_channels": ["Canal 1", "Canal 2", "Canal 3"],
      "content_strategy": "Stratégie de contenu globale"
    }
  },
  "customer_journey": {
    "awareness": {
      "touchpoints": ["Point de contact 1", "Point 2"],
      "objectives": ["Objectif 1", "Objectif 2"],
      "kpis": ["KPI 1", "KPI 2"],
      "actions": ["Action marketing 1", "Action 2"]
    },
    "consideration": {
      "touchpoints": ["Point de contact 1", "Point 2"],
      "objectives": ["Objectif 1", "Objectif 2"],
      "kpis": ["KPI 1", "KPI 2"],
      "actions": ["Action marketing 1", "Action 2"]
    },
    "decision": {
      "touchpoints": ["Point de contact 1", "Point 2"],
      "objectives": ["Objectif 1", "Objectif 2"],
      "kpis": ["KPI 1", "KPI 2"],
      "actions": ["Action marketing 1", "Action 2"]
    },
    "retention": {
      "touchpoints": ["Point de contact 1", "Point 2"],
      "objectives": ["Objectif 1", "Objectif 2"],
      "kpis": ["KPI 1", "KPI 2"],
      "actions": ["Action marketing 1", "Action 2"]
    }
  },
  "campaign_ideas": [
    {
      "title": "Titre de la campagne",
      "objective": "Objectif principal",
      "target_segment": "Segment visé",
      "channels": ["Canal 1", "Canal 2"],
      "budget_estimate": "Budget estimé",
      "expected_roi": "ROI attendu",
      "timeline": "Durée de la campagne",
      "kpis": ["KPI 1", "KPI 2"]
    }
  ],
  "implementation_roadmap": [
    {
      "phase": "Phase 1 : Nom de la phase",
      "timeline": "Mois 1-3",
      "priority": "high|medium|low",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "budget": "Budget estimé",
      "success_metrics": ["Métrique 1", "Métrique 2"],
      "dependencies": ["Dépendance 1", "Dépendance 2"]
    }
  ],
  "total_budget_estimate": "Budget global estimé",
  "budget_allocation": {
    "product": 20,
    "price": 10,
    "place": 30,
    "promotion": 40
  }
}

**IMPORTANT** :
- Retourne SEULEMENT le JSON (pas de texte autour)
- Adapte tout au secteur ${input.industry} et au concept ${input.businessName}
- 3-5 segments cibles avec priorités différenciées
- 5-7 idées de campagnes concrètes et actionnables
- 4-6 phases dans la roadmap avec timelines réalistes
- Budget allocation = 100% total`;

    // Essayer DeepSeek V3 avec JSON mode
    let response = await generateWithDeepSeek(
      prompt,
      'Expert en stratégie marketing et branding. Tu retournes UNIQUEMENT du JSON valide, sans texte autour.',
      { maxTokens: 10000, temperature: 0.3 } // Température basse pour précision
    );

    // Si DeepSeek échoue, utiliser Qwen en fallback
    if (!response.success || !response.content) {
      console.log('⚠️ [Phase 1] DeepSeek échoué, tentative avec Qwen...');
      response = await generateWithQwen(
        prompt,
        'Expert en stratégie marketing. Tu retournes UNIQUEMENT du JSON valide.',
        { maxTokens: 8000, temperature: 0.3 } // Qwen limite à 8192
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
  private async phase2_parseAndValidate(jsonString: string, input: MarketingStrategyInput) {
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
${malformedJson.substring(0, 4000)}

**Tâche**: Extraire les données et retourner un JSON valide avec la structure de stratégie marketing (executive_summary, brand_positioning, target_segments, marketing_mix, customer_journey, campaign_ideas, implementation_roadmap, budget).

Retourne SEULEMENT le JSON valide, sans texte autour.`;

    try {
      const response = await generateWithQwen(
        prompt,
        'Expert en normalisation de données JSON. Tu retournes UNIQUEMENT du JSON valide.',
        { maxTokens: 8000, temperature: 0.1 }
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
  private mapToMongoSchema(data: any, input: MarketingStrategyInput): any {
    console.log('🗺️ [Phase 2] Mapping vers schéma MongoDB...');

    return {
      executive_summary: data.executive_summary || {
        vision: 'Vision à définir',
        mission: 'Mission à définir',
        unique_value_proposition: 'Proposition de valeur à définir',
        target_roi: 'ROI à définir'
      },
      brand_positioning: {
        brand_essence: data.brand_positioning?.brand_essence || 'Essence à définir',
        brand_promise: data.brand_positioning?.brand_promise || 'Promesse à définir',
        brand_personality: Array.isArray(data.brand_positioning?.brand_personality) ? data.brand_positioning.brand_personality : [],
        brand_values: Array.isArray(data.brand_positioning?.brand_values) ? data.brand_positioning.brand_values : [],
        positioning_statement: data.brand_positioning?.positioning_statement || 'Statement à définir',
        competitive_advantages: Array.isArray(data.brand_positioning?.competitive_advantages) ? data.brand_positioning.competitive_advantages : []
      },
      target_segments: (Array.isArray(data.target_segments) ? data.target_segments : []).map((s: any) => ({
        segment_name: s.segment_name || 'Segment',
        description: s.description || '',
        demographics: s.demographics || '',
        psychographics: s.psychographics || '',
        size_estimate: s.size_estimate || '',
        priority: this.normalizePriority(s.priority),
        reach_strategy: s.reach_strategy || ''
      })),
      marketing_mix: {
        product: {
          core_offerings: Array.isArray(data.marketing_mix?.product?.core_offerings) ? data.marketing_mix.product.core_offerings : [],
          unique_features: Array.isArray(data.marketing_mix?.product?.unique_features) ? data.marketing_mix.product.unique_features : [],
          differentiation: data.marketing_mix?.product?.differentiation || ''
        },
        price: {
          strategy: data.marketing_mix?.price?.strategy || '',
          positioning: data.marketing_mix?.price?.positioning || '',
          tactics: Array.isArray(data.marketing_mix?.price?.tactics) ? data.marketing_mix.price.tactics : []
        },
        place: {
          distribution_channels: Array.isArray(data.marketing_mix?.place?.distribution_channels) ? data.marketing_mix.place.distribution_channels : [],
          online_presence: Array.isArray(data.marketing_mix?.place?.online_presence) ? data.marketing_mix.place.online_presence : [],
          partnerships: Array.isArray(data.marketing_mix?.place?.partnerships) ? data.marketing_mix.place.partnerships : []
        },
        promotion: {
          key_messages: Array.isArray(data.marketing_mix?.promotion?.key_messages) ? data.marketing_mix.promotion.key_messages : [],
          communication_channels: Array.isArray(data.marketing_mix?.promotion?.communication_channels) ? data.marketing_mix.promotion.communication_channels : [],
          content_strategy: data.marketing_mix?.promotion?.content_strategy || ''
        }
      },
      customer_journey: {
        awareness: this.mapJourneyStage(data.customer_journey?.awareness),
        consideration: this.mapJourneyStage(data.customer_journey?.consideration),
        decision: this.mapJourneyStage(data.customer_journey?.decision),
        retention: this.mapJourneyStage(data.customer_journey?.retention)
      },
      campaign_ideas: (Array.isArray(data.campaign_ideas) ? data.campaign_ideas : []).map((c: any) => ({
        title: c.title || 'Campagne',
        objective: c.objective || '',
        target_segment: c.target_segment || '',
        channels: Array.isArray(c.channels) ? c.channels : [],
        budget_estimate: c.budget_estimate || '',
        expected_roi: c.expected_roi || '',
        timeline: c.timeline || '',
        kpis: Array.isArray(c.kpis) ? c.kpis : []
      })),
      implementation_roadmap: (Array.isArray(data.implementation_roadmap) ? data.implementation_roadmap : []).map((p: any) => ({
        phase: p.phase || 'Phase',
        timeline: p.timeline || '',
        priority: this.normalizePriority(p.priority),
        actions: Array.isArray(p.actions) ? p.actions : [],
        budget: p.budget || '',
        success_metrics: Array.isArray(p.success_metrics) ? p.success_metrics : [],
        dependencies: Array.isArray(p.dependencies) ? p.dependencies : []
      })),
      total_budget_estimate: data.total_budget_estimate || 'À définir',
      budget_allocation: data.budget_allocation || {
        product: 25,
        price: 10,
        place: 30,
        promotion: 35
      }
    };
  }

  private mapJourneyStage(stage: any) {
    return {
      touchpoints: Array.isArray(stage?.touchpoints) ? stage.touchpoints : [],
      objectives: Array.isArray(stage?.objectives) ? stage.objectives : [],
      kpis: Array.isArray(stage?.kpis) ? stage.kpis : [],
      actions: Array.isArray(stage?.actions) ? stage.actions : []
    };
  }

  private normalizePriority(val: string): 'high' | 'medium' | 'low' {
    if (!val) return 'medium';
    const normalized = val.toLowerCase();
    if (normalized.includes('high') || normalized.includes('élevé') || normalized.includes('haute')) return 'high';
    if (normalized.includes('low') || normalized.includes('faible') || normalized.includes('basse')) return 'low';
    return 'medium';
  }
}
