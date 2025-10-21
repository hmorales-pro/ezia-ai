import { generateWithMistralAPI } from '../mistral-ai-service';
import type {
  IMarketAnalysis,
  IMarketOverview,
  ICompetitionAnalysis,
  ICustomerAnalysis,
  IOpportunity,
  IThreat,
  IOceanBlueStrategy,
  IScoring,
  IDataSource
} from '@/models/MarketAnalysis';

export interface MarketResearchInput {
  businessId: string;
  userId: string;
  businessName: string;
  industry: string;
  description: string;
  targetMarket?: string;
  existingData?: {
    competitors?: string[];
    customerInsights?: string;
    marketSize?: string;
  };
}

export interface MarketResearchResult {
  analysis: Omit<IMarketAnalysis, '_id' | 'createdAt' | 'updatedAt'>;
  success: boolean;
  error?: string;
}

export class MarketResearchAgent {
  /**
   * Génère une analyse de marché complète en utilisant MistralAI
   */
  async generateMarketAnalysis(input: MarketResearchInput): Promise<MarketResearchResult> {
    try {
      console.log(`🔍 [MarketResearchAgent] Démarrage analyse pour ${input.businessName} (${input.industry})`);

      // Construire le prompt structuré pour MistralAI
      const prompt = this.buildAnalysisPrompt(input);

      // Appeler MistralAI avec le prompt
      const mistralResponse = await generateWithMistralAPI(
        prompt,
        "Tu es un expert en analyse de marché et en stratégie Ocean Blue. Tu dois retourner uniquement un JSON valide et structuré."
      );

      if (!mistralResponse.success || !mistralResponse.content) {
        throw new Error(mistralResponse.error || 'Erreur lors de l\'appel à MistralAI');
      }

      const response = mistralResponse.content;

      console.log(`✅ [MarketResearchAgent] Réponse MistralAI reçue (${response.length} caractères)`);

      // Parser la réponse JSON
      const analysisData = this.parseAnalysisResponse(response);

      // Calculer le Market Opportunity Index (MOI)
      const scoring = this.calculateScoring(analysisData);

      // Construire l'analyse complète
      const analysis: Omit<IMarketAnalysis, '_id' | 'createdAt' | 'updatedAt'> = {
        businessId: input.businessId,
        userId: input.userId,
        industry: input.industry,
        business_name: input.businessName,
        business_description: input.description,
        market_overview: analysisData.market_overview,
        competition: analysisData.competition,
        customer_analysis: analysisData.customer_analysis,
        opportunities: analysisData.opportunities,
        threats: analysisData.threats,
        ocean_blue_strategy: analysisData.ocean_blue_strategy,
        scoring: scoring,
        meta: {
          analysis_version: '1.0',
          generated_at: new Date(),
          last_updated: new Date(),
          next_refresh_date: this.calculateNextRefreshDate('monthly'),
          refresh_frequency: 'monthly',
          data_sources: this.getDataSources(),
          llm_model: 'mistral-large-latest',
          analyst_notes: `Analyse générée automatiquement pour ${input.businessName}`,
        },
        reports: {
          markdown: this.generateMarkdownReport(analysisData, scoring),
        },
      };

      console.log(`🎯 [MarketResearchAgent] MOI calculé: ${scoring.market_opportunity_index}/100`);

      return {
        success: true,
        analysis,
      };

    } catch (error) {
      console.error('❌ [MarketResearchAgent] Erreur:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse de marché',
        analysis: {} as any,
      };
    }
  }

  /**
   * Construit le prompt pour MistralAI
   */
  private buildAnalysisPrompt(input: MarketResearchInput): string {
    return `Tu es un expert en analyse de marché et en stratégie Ocean Blue. Tu dois analyser le marché pour l'entreprise suivante et retourner un JSON structuré.

**ENTREPRISE:**
- Nom: ${input.businessName}
- Secteur: ${input.industry}
- Description: ${input.description}
${input.targetMarket ? `- Marché cible: ${input.targetMarket}` : ''}
${input.existingData?.competitors ? `- Concurrents connus: ${input.existingData.competitors.join(', ')}` : ''}
${input.existingData?.customerInsights ? `- Insights clients: ${input.existingData.customerInsights}` : ''}
${input.existingData?.marketSize ? `- Taille de marché connue: ${input.existingData.marketSize}` : ''}

**MISSION:**
Réalise une analyse de marché complète incluant:
1. Vue d'ensemble du marché (taille, croissance, tendances, segments)
2. Analyse concurrentielle (principaux concurrents, paysage, barrières, avantages)
3. Analyse client (personas, besoins, critères d'achat, décideurs)
4. Opportunités (titre, description, impact, délai)
5. Menaces (titre, description, sévérité, probabilité, mitigation)
6. Stratégie Ocean Blue (éliminer, réduire, augmenter, créer, proposition de valeur)

**FORMAT DE RÉPONSE:**
Retourne UNIQUEMENT un JSON valide avec cette structure exacte:

\`\`\`json
{
  "market_overview": {
    "market_size": "Taille estimée du marché en €/$ avec source",
    "growth_rate": "Taux de croissance annuel avec période",
    "trends": ["Tendance 1", "Tendance 2", "Tendance 3"],
    "key_drivers": ["Driver 1", "Driver 2", "Driver 3"],
    "segments": [
      {
        "name": "Nom du segment",
        "size": "Taille/part du segment",
        "growth": "Croissance du segment",
        "characteristics": ["Caractéristique 1", "Caractéristique 2"]
      }
    ]
  },
  "competition": {
    "main_competitors": [
      {
        "name": "Nom concurrent",
        "position": "Leader/Challenger/Niche",
        "strengths": ["Force 1", "Force 2"],
        "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
        "market_share": "Part de marché estimée",
        "pricing": "Stratégie tarifaire",
        "differentiation": "Différenciation principale"
      }
    ],
    "competitive_landscape": "Description synthétique du paysage concurrentiel",
    "entry_barriers": ["Barrière 1", "Barrière 2", "Barrière 3"],
    "competitive_advantages": ["Avantage 1", "Avantage 2", "Avantage 3"]
  },
  "customer_analysis": {
    "personas": [
      {
        "name": "Nom du persona",
        "demographics": {
          "age": "Tranche d'âge",
          "location": "Localisation",
          "industry": "Secteur d'activité",
          "company_size": "Taille entreprise",
          "role": "Poste/fonction"
        },
        "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
        "needs": ["Besoin 1", "Besoin 2", "Besoin 3"],
        "buying_behavior": ["Comportement 1", "Comportement 2"],
        "communication_channels": ["Canal 1", "Canal 2", "Canal 3"]
      }
    ],
    "customer_needs": ["Besoin global 1", "Besoin global 2"],
    "buying_criteria": ["Critère 1", "Critère 2", "Critère 3"],
    "decision_makers": ["Décideur type 1", "Décideur type 2"]
  },
  "opportunities": [
    {
      "title": "Titre opportunité",
      "description": "Description détaillée",
      "potential_impact": "high|medium|low",
      "timeframe": "Court/moyen/long terme avec estimation",
      "required_resources": ["Ressource 1", "Ressource 2"]
    }
  ],
  "threats": [
    {
      "title": "Titre menace",
      "description": "Description détaillée",
      "severity": "high|medium|low",
      "probability": "high|medium|low",
      "mitigation": ["Action mitigation 1", "Action mitigation 2"]
    }
  ],
  "ocean_blue_strategy": {
    "eliminate": ["Élément à éliminer 1", "Élément à éliminer 2"],
    "reduce": ["Élément à réduire 1", "Élément à réduire 2"],
    "increase": ["Élément à augmenter 1", "Élément à augmenter 2"],
    "create": ["Nouvel élément à créer 1", "Nouvel élément à créer 2"],
    "value_proposition": "Proposition de valeur unique en une phrase claire",
    "target_market": "Description du marché cible spécifique"
  }
}
\`\`\`

**IMPORTANT:**
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Base-toi sur des données réalistes et actuelles pour le secteur ${input.industry}
- Sois précis et factuel dans tes estimations
- Pour la stratégie Ocean Blue, sois créatif et différenciant
- Assure-toi que tous les champs requis sont remplis`;
  }

  /**
   * Parse la réponse JSON de MistralAI
   */
  private parseAnalysisResponse(response: string): any {
    try {
      // Extraire le JSON de la réponse (peut être enrobé dans ```json```)
      let jsonStr = response.trim();

      // Supprimer les backticks si présents
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // Nettoyer les caractères de contrôle invalides dans les chaînes JSON
      // Remplacer les retours à la ligne, tabulations et autres caractères de contrôle
      jsonStr = jsonStr
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')  // Supprimer caractères de contrôle
        .replace(/\s+/g, ' ')  // Normaliser les espaces multiples
        .trim();

      const parsed = JSON.parse(jsonStr);

      // Valider la structure minimale
      if (!parsed.market_overview || !parsed.competition || !parsed.customer_analysis) {
        throw new Error('Structure JSON invalide: champs requis manquants');
      }

      return parsed;
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error);
      console.error('Réponse reçue:', response.substring(0, 500));
      throw new Error('Impossible de parser la réponse de l\'IA');
    }
  }

  /**
   * Calcule le Market Opportunity Index (MOI) et les scores
   */
  private calculateScoring(data: any): IScoring {
    // Scoring sur 100 pour chaque dimension

    // 1. Attractivité du marché (taille + croissance + tendances positives)
    const marketAttractiveness = this.scoreMarketAttractiveness(data.market_overview);

    // 2. Intensité concurrentielle (nombre concurrents + barrières + concentration)
    const competitiveIntensity = this.scoreCompetitiveIntensity(data.competition);

    // 3. Difficulté d'entrée (barrières + ressources requises)
    const entryDifficulty = this.scoreEntryDifficulty(data.competition, data.opportunities);

    // 4. Potentiel de croissance (tendances + opportunités - menaces)
    const growthPotential = this.scoreGrowthPotential(
      data.market_overview,
      data.opportunities,
      data.threats
    );

    // 5. Demande client (personas + pain points + needs)
    const customerDemand = this.scoreCustomerDemand(data.customer_analysis);

    // Calcul du MOI global (formule pondérée)
    const moi = Math.round(
      marketAttractiveness * 0.25 +
      (100 - competitiveIntensity) * 0.20 + // Inverser: moins de concurrence = meilleur
      (100 - entryDifficulty) * 0.15 +      // Inverser: moins de barrières = meilleur
      growthPotential * 0.25 +
      customerDemand * 0.15
    );

    // Niveau de confiance basé sur la complétude des données
    const confidenceLevel = this.assessConfidence(data);

    return {
      market_attractiveness: marketAttractiveness,
      competitive_intensity: competitiveIntensity,
      entry_difficulty: entryDifficulty,
      growth_potential: growthPotential,
      customer_demand: customerDemand,
      market_opportunity_index: moi,
      confidence_level: confidenceLevel,
      scoring_rationale: this.generateScoringRationale(
        moi,
        marketAttractiveness,
        competitiveIntensity,
        growthPotential
      ),
    };
  }

  /**
   * Score l'attractivité du marché (0-100)
   */
  private scoreMarketAttractiveness(marketOverview: IMarketOverview): number {
    let score = 50; // Base

    // Taille du marché
    if (marketOverview.market_size.includes('milliard') || marketOverview.market_size.includes('billion')) {
      score += 20;
    } else if (marketOverview.market_size.includes('million')) {
      score += 10;
    }

    // Taux de croissance
    const growthMatch = marketOverview.growth_rate.match(/(\d+)/);
    if (growthMatch) {
      const growthRate = parseInt(growthMatch[1]);
      if (growthRate >= 20) score += 20;
      else if (growthRate >= 10) score += 15;
      else if (growthRate >= 5) score += 10;
    }

    // Tendances positives
    score += Math.min(marketOverview.trends.length * 2, 10);

    return Math.min(score, 100);
  }

  /**
   * Score l'intensité concurrentielle (0-100, plus élevé = plus compétitif)
   */
  private scoreCompetitiveIntensity(competition: ICompetitionAnalysis): number {
    let score = 30; // Base

    // Nombre de concurrents
    const competitorCount = competition.main_competitors.length;
    score += Math.min(competitorCount * 10, 30);

    // Présence de leaders dominants
    const hasLeader = competition.main_competitors.some(c => c.position?.toLowerCase().includes('leader'));
    if (hasLeader) score += 20;

    // Barrières à l'entrée (plus de barrières = plus difficile pour nouveaux entrants = moins compétitif pour nous)
    score -= Math.min(competition.entry_barriers.length * 5, 20);

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Score la difficulté d'entrée (0-100)
   */
  private scoreEntryDifficulty(competition: ICompetitionAnalysis, opportunities: IOpportunity[]): number {
    let score = 40; // Base

    // Barrières à l'entrée
    score += Math.min(competition.entry_barriers.length * 8, 40);

    // Opportunités high impact réduisent la difficulté
    const highImpactOpp = opportunities.filter(o => o.potential_impact === 'high').length;
    score -= highImpactOpp * 10;

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Score le potentiel de croissance (0-100)
   */
  private scoreGrowthPotential(
    marketOverview: IMarketOverview,
    opportunities: IOpportunity[],
    threats: IThreat[]
  ): number {
    let score = 50; // Base

    // Tendances du marché
    score += Math.min(marketOverview.trends.length * 3, 15);

    // Opportunités
    opportunities.forEach(opp => {
      if (opp.potential_impact === 'high') score += 10;
      else if (opp.potential_impact === 'medium') score += 5;
      else score += 2;
    });

    // Menaces (réduisent le potentiel)
    threats.forEach(threat => {
      if (threat.severity === 'high' && threat.probability === 'high') score -= 10;
      else if (threat.severity === 'high' || threat.probability === 'high') score -= 5;
      else score -= 2;
    });

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Score la demande client (0-100)
   */
  private scoreCustomerDemand(customerAnalysis: ICustomerAnalysis): number {
    let score = 40; // Base

    // Nombre de personas identifiés
    score += Math.min(customerAnalysis.personas.length * 10, 20);

    // Pain points identifiés
    const totalPainPoints = customerAnalysis.personas.reduce(
      (sum, p) => sum + p.pain_points.length,
      0
    );
    score += Math.min(totalPainPoints * 3, 20);

    // Besoins globaux
    score += Math.min(customerAnalysis.customer_needs.length * 4, 20);

    return Math.min(score, 100);
  }

  /**
   * Évalue le niveau de confiance de l'analyse
   */
  private assessConfidence(data: any): 'high' | 'medium' | 'low' {
    let score = 0;

    // Vérifier la complétude des données
    if (data.market_overview?.segments?.length > 0) score++;
    if (data.competition?.main_competitors?.length >= 3) score++;
    if (data.customer_analysis?.personas?.length >= 2) score++;
    if (data.opportunities?.length >= 3) score++;
    if (data.threats?.length >= 2) score++;
    if (data.ocean_blue_strategy?.create?.length > 0) score++;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Génère le rationale du scoring
   */
  private generateScoringRationale(
    moi: number,
    attractiveness: number,
    intensity: number,
    growth: number
  ): string {
    let rationale = `MOI de ${moi}/100. `;

    if (moi >= 70) {
      rationale += 'Marché très attractif avec fort potentiel. ';
    } else if (moi >= 50) {
      rationale += 'Marché modérément attractif avec opportunités à saisir. ';
    } else {
      rationale += 'Marché difficile nécessitant une approche différenciée. ';
    }

    rationale += `Attractivité marché: ${attractiveness}/100. `;
    rationale += `Intensité concurrentielle: ${intensity}/100. `;
    rationale += `Potentiel croissance: ${growth}/100.`;

    return rationale;
  }

  /**
   * Calcule la prochaine date de rafraîchissement
   */
  private calculateNextRefreshDate(frequency: 'weekly' | 'monthly' | 'quarterly'): Date {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() + 3));
    }
  }

  /**
   * Retourne les sources de données utilisées
   */
  private getDataSources(): IDataSource[] {
    return [
      {
        name: 'MistralAI Large Model',
        type: 'api',
        collected_at: new Date(),
        reliability: 'high',
      },
      {
        name: 'Analyse automatique secteur',
        type: 'database',
        collected_at: new Date(),
        reliability: 'medium',
      },
    ];
  }

  /**
   * Génère un rapport Markdown
   */
  private generateMarkdownReport(data: any, scoring: IScoring): string {
    return `# Analyse de Marché

## 📊 Market Opportunity Index (MOI): ${scoring.market_opportunity_index}/100

**Niveau de confiance:** ${scoring.confidence_level === 'high' ? '🟢 Élevé' : scoring.confidence_level === 'medium' ? '🟡 Moyen' : '🔴 Faible'}

${scoring.scoring_rationale}

---

## Vue d'ensemble du marché

**Taille du marché:** ${data.market_overview.market_size}
**Taux de croissance:** ${data.market_overview.growth_rate}

### Tendances clés
${data.market_overview.trends.map((t: string) => `- ${t}`).join('\n')}

### Segments de marché
${data.market_overview.segments.map((s: any) => `
**${s.name}**
- Taille: ${s.size}
- Croissance: ${s.growth}
`).join('\n')}

---

## Analyse concurrentielle

**Paysage:** ${data.competition.competitive_landscape}

### Principaux concurrents
${data.competition.main_competitors.map((c: any) => `
**${c.name}** (${c.position})
- Forces: ${c.strengths.join(', ')}
- Faiblesses: ${c.weaknesses.join(', ')}
- Part de marché: ${c.market_share || 'N/A'}
`).join('\n')}

---

## Stratégie Ocean Blue

**Proposition de valeur:** ${data.ocean_blue_strategy.value_proposition}

**Marché cible:** ${data.ocean_blue_strategy.target_market}

| Éliminer | Réduire | Augmenter | Créer |
|----------|---------|-----------|-------|
${Math.max(
  data.ocean_blue_strategy.eliminate.length,
  data.ocean_blue_strategy.reduce.length,
  data.ocean_blue_strategy.increase.length,
  data.ocean_blue_strategy.create.length
) > 0 ? Array.from({
  length: Math.max(
    data.ocean_blue_strategy.eliminate.length,
    data.ocean_blue_strategy.reduce.length,
    data.ocean_blue_strategy.increase.length,
    data.ocean_blue_strategy.create.length
  )
}, (_, i) => `| ${data.ocean_blue_strategy.eliminate[i] || ''} | ${data.ocean_blue_strategy.reduce[i] || ''} | ${data.ocean_blue_strategy.increase[i] || ''} | ${data.ocean_blue_strategy.create[i] || ''} |`).join('\n') : ''}

---

## Opportunités

${data.opportunities.map((o: IOpportunity, i: number) => `
### ${i + 1}. ${o.title}
${o.description}

- **Impact potentiel:** ${o.potential_impact === 'high' ? '🔥 Élevé' : o.potential_impact === 'medium' ? '⚡ Moyen' : '💡 Faible'}
- **Délai:** ${o.timeframe}
${o.required_resources ? `- **Ressources:** ${o.required_resources.join(', ')}` : ''}
`).join('\n')}

---

## Menaces

${data.threats.map((t: IThreat, i: number) => `
### ${i + 1}. ${t.title}
${t.description}

- **Sévérité:** ${t.severity === 'high' ? '🔴 Élevée' : t.severity === 'medium' ? '🟡 Moyenne' : '🟢 Faible'}
- **Probabilité:** ${t.probability === 'high' ? '🔴 Élevée' : t.probability === 'medium' ? '🟡 Moyenne' : '🟢 Faible'}
${t.mitigation ? `- **Mitigation:** ${t.mitigation.join(', ')}` : ''}
`).join('\n')}

---

## Scoring détaillé

| Dimension | Score | Interprétation |
|-----------|-------|----------------|
| Attractivité du marché | ${scoring.market_attractiveness}/100 | ${scoring.market_attractiveness >= 70 ? '🟢 Très attractif' : scoring.market_attractiveness >= 50 ? '🟡 Modérément attractif' : '🔴 Peu attractif'} |
| Intensité concurrentielle | ${scoring.competitive_intensity}/100 | ${scoring.competitive_intensity >= 70 ? '🔴 Très compétitif' : scoring.competitive_intensity >= 50 ? '🟡 Modérément compétitif' : '🟢 Peu compétitif'} |
| Difficulté d'entrée | ${scoring.entry_difficulty}/100 | ${scoring.entry_difficulty >= 70 ? '🔴 Très difficile' : scoring.entry_difficulty >= 50 ? '🟡 Modérément difficile' : '🟢 Facile'} |
| Potentiel de croissance | ${scoring.growth_potential}/100 | ${scoring.growth_potential >= 70 ? '🟢 Très élevé' : scoring.growth_potential >= 50 ? '🟡 Modéré' : '🔴 Faible'} |
| Demande client | ${scoring.customer_demand}/100 | ${scoring.customer_demand >= 70 ? '🟢 Très forte' : scoring.customer_demand >= 50 ? '🟡 Modérée' : '🔴 Faible'} |

---

*Analyse générée automatiquement par Ezia Market Research Agent*
`;
  }
}
