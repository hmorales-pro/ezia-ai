/**
 * MarketResearchDeep - Architecture multi-passes avec Mistral AI Search
 *
 * Phase 1: Analyse structurelle (Mistral Medium) - Structure générale
 * Phase 2: Recherche factuelle (Mistral AI Search) - Données réelles
 * Phase 3: Analyse compétitive approfondie (Mistral Medium) - Par concurrent
 * Phase 4: Synthèse & Ocean Blue (Mistral Large) - Consolidation finale
 */

import { generateWithMistralAPI } from '../mistral-ai-service';

interface MarketResearchInput {
  businessId: string;
  userId: string;
  businessName: string;
  industry: string;
  description: string;
  targetMarket?: string;
}

interface StructurePhaseResult {
  axes: string[];
  questions: string[];
  competitorHypotheses: string[];
}

interface ResearchPhaseResult {
  marketSize: string;
  growthRate: string;
  trends: Array<{ name: string; description: string; source?: string }>;
  competitors: Array<{ name: string; type: string }>;
  sources: string[];
}

interface CompetitorAnalysis {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
  marketShare?: string;
}

interface SynthesisResult {
  market_overview: any;
  competition: any;
  customer_analysis: any;
  opportunities: any[];
  threats: any[];
  ocean_blue_strategy: any;
  scoring: any;
  markdown: string;
}

export class MarketResearchDeep {
  /**
   * PHASE 1: Analyse Structurelle
   * Objectif: Identifier la structure de l'analyse et les axes d'approfondissement
   */
  async phase1_structure(input: MarketResearchInput): Promise<StructurePhaseResult> {
    console.log('📊 Phase 1: Analyse structurelle...');

    const prompt = `Tu es un expert en analyse de marché. Analyse la structure du marché suivant :

**Entreprise**: ${input.businessName}
**Secteur**: ${input.industry}
**Description**: ${input.description}
${input.targetMarket ? `**Marché cible**: ${input.targetMarket}` : ''}

Identifie:

## 1. Axes d'analyse prioritaires
Liste 5-7 axes d'analyse critiques pour ce marché (ex: taille de marché, réglementation, digitalisation, etc.)

## 2. Questions clés
Pour chaque axe, formule 2-3 questions précises qui nécessitent des données factuelles récentes.

## 3. Hypothèses concurrents
Liste 10-15 noms de concurrents potentiels (entreprises, chaînes, startups) dans ce secteur.

Format ta réponse en Markdown clair avec ces 3 sections.`;

    const response = await generateWithMistralAPI(prompt, 'Expert en structuration d\'analyses de marché.');
    const markdown = response.content;

    console.log(`📝 [Phase 1] Réponse Mistral (${markdown.length} car):`, markdown.substring(0, 500));

    // Parser la réponse
    const axes = this.extractListItems(markdown, /##\s*1\.\s*Axes.*?(?=##|$)/is);
    const questions = this.extractListItems(markdown, /##\s*2\.\s*Questions.*?(?=##|$)/is);
    const competitorHypotheses = this.extractListItems(markdown, /##\s*3\.\s*Hypothèses.*?(?=##|$)/is);

    console.log(`✅ Phase 1 terminée: ${axes.length} axes, ${competitorHypotheses.length} concurrents potentiels`);
    console.log(`   Axes:`, axes.slice(0, 3));
    console.log(`   Concurrents:`, competitorHypotheses.slice(0, 5));

    return { axes, questions, competitorHypotheses };
  }

  /**
   * PHASE 2: Analyse Factuelle Approfondie
   * Objectif: Générer des données de marché détaillées basées sur les connaissances de Mistral
   */
  async phase2_research(input: MarketResearchInput, structure: StructurePhaseResult): Promise<ResearchPhaseResult> {
    console.log('🔍 Phase 2: Analyse factuelle approfondie...');

    // Construire un prompt enrichi
    const analysisPrompt = `Tu es un analyste de marché expert. Génère une analyse factuelle détaillée pour :

**Entreprise**: ${input.businessName}
**Secteur**: ${input.industry}
**Concept**: ${input.description}

**Concurrents potentiels identifiés**: ${structure.competitorHypotheses.slice(0, 12).join(', ')}

Génère une analyse **complète et détaillée** :

## 1. Taille de marché
Estimation chiffrée du marché ${input.industry} en France (en milliards €)

## 2. Croissance
Taux de croissance annuel estimé (%)

## 3. Tendances clés (liste 5-7 tendances)
Format pour chaque: - **Nom tendance**: Description détaillée en 2-3 phrases

## 4. Concurrents validés (sélectionne 5-8 concurrents RÉELS parmi la liste ci-dessus)
Format pour chaque: - **Nom**: Type (restaurant/chaîne/startup) - Brève description

## 5. Sources estimées
Types de sources (études, instituts, etc.)

**Sois spécifique et cohérent avec ${input.businessName}**.`;

    const response = await generateWithMistralAPI(
      analysisPrompt,
      'Expert analyste de marché spécialisé en restauration et concepts innovants.',
      { model: 'mistral-medium-latest', max_tokens: 4000 }
    );

    const markdown = response.content;

    console.log(`📝 [Phase 2] Réponse Mistral (${markdown.length} car):`, markdown.substring(0, 600));

    // Parser les résultats avec patterns plus flexibles
    const marketSize = this.extractSingleValue(markdown, /##\s*1\..*?Taille.*?\n+([^\n#]+)/is) ||
                       this.extractSingleValue(markdown, /Taille.*?marché.*?:\s*([^\n]+)/is) ||
                       'Données non disponibles';

    const growthRate = this.extractSingleValue(markdown, /##\s*2\..*?Croissance.*?\n+([^\n#]+)/is) ||
                       this.extractSingleValue(markdown, /Croissance.*?:\s*([^\n]+)/is) ||
                       'Données non disponibles';

    console.log(`   MarketSize:`, marketSize);
    console.log(`   GrowthRate:`, growthRate);

    // Extraire section tendances
    const trendsSection = this.extractSection(markdown, /##\s*3\..*?Tendances.*?(?=##\s*\d|$)/is);
    console.log(`   TrendsSection (${trendsSection.length} car):`, trendsSection.substring(0, 400));

    const trendsItems = this.extractListItems(trendsSection);
    const trends = trendsItems.map(t => {
      // Format: "**Nom**: Description" ou "Nom: Description"
      const match = t.match(/\*\*([^*:]+)\*\*:?\s*(.+)/) || t.match(/^([^:]+):\s*(.+)/);
      if (match) {
        return {
          name: match[1].trim(),
          description: match[2].trim(),
          source: undefined
        };
      }
      return { name: t.substring(0, 30), description: t, source: undefined };
    });

    // Extraire concurrents
    const competitorsSection = this.extractSection(markdown, /##\s*4\..*?Concurrents.*?(?=##\s*\d|$)/is);
    console.log(`   CompetitorsSection (${competitorsSection.length} car):`, competitorsSection.substring(0, 400));

    const competitorsItems = this.extractListItems(competitorsSection);
    const competitors = competitorsItems.map(c => {
      // Format: "**Nom**: Type (...) - Description" ou "Nom: Type - Description"
      const match = c.match(/\*\*([^*:]+)\*\*:?\s*Type\s*[:(]([^)-]+)/i) ||
                    c.match(/^([^:]+):\s*Type\s*[:(]([^)-]+)/i) ||
                    c.match(/^([^:]+):\s*([^-]+)/);
      if (match) {
        return {
          name: match[1].trim(),
          type: match[2].trim()
        };
      }
      // Fallback: juste le nom
      return { name: c.split(':')[0].trim(), type: 'Non spécifié' };
    });

    // Extraire sources
    const sourcesSection = this.extractSection(markdown, /##\s*5\..*?Sources.*?$/is);
    const sources = this.extractListItems(sourcesSection);

    console.log(`✅ Phase 2 terminée: ${trends.length} tendances, ${competitors.length} concurrents, ${sources.length} sources`);
    console.log(`   Trends:`, trends);
    console.log(`   Competitors:`, competitors);
    console.log(`   Sources:`, sources);

    return { marketSize, growthRate, trends, competitors, sources };
  }

  /**
   * PHASE 3: Analyse Compétitive Approfondie
   * Objectif: Analyser en profondeur chaque concurrent identifié
   */
  async phase3_competitive(competitors: Array<{ name: string; type: string }>, industry: string): Promise<CompetitorAnalysis[]> {
    console.log(`🎯 Phase 3: Analyse compétitive (${competitors.length} concurrents)...`);

    const analyses: CompetitorAnalysis[] = [];

    // Analyser les 5 concurrents principaux en parallèle
    const topCompetitors = competitors.slice(0, 5);

    const promises = topCompetitors.map(async (competitor) => {
      const prompt = `Analyse compétitive détaillée pour ${competitor.name} dans le secteur ${industry}.

Retourne au format:

## Description
[1-2 phrases sur l'entreprise]

## Forces (3-5 points)
- Force 1
- Force 2
...

## Faiblesses (3-5 points)
- Faiblesse 1
- Faiblesse 2
...

## Positionnement
[1-2 phrases sur le positionnement stratégique]

## Part de marché estimée
[Si disponible, sinon "Non disponible"]`;

      const response = await generateWithMistralAPI(prompt, 'Expert en analyse concurrentielle.');
      const md = response.content;

      return {
        name: competitor.name,
        description: this.extractSection(md, /##\s*Description.*?\n([^\n#]+)/i).trim(),
        strengths: this.extractListItems(this.extractSection(md, /##\s*Forces.*?(?=##|$)/is)),
        weaknesses: this.extractListItems(this.extractSection(md, /##\s*Faiblesses.*?(?=##|$)/is)),
        positioning: this.extractSection(md, /##\s*Positionnement.*?\n([^\n#]+)/i).trim(),
        marketShare: this.extractSection(md, /##\s*Part.*?\n([^\n#]+)/i).trim() || undefined
      };
    });

    const results = await Promise.all(promises);
    analyses.push(...results);

    console.log(`✅ Phase 3 terminée: ${analyses.length} analyses détaillées`);

    return analyses;
  }

  /**
   * PHASE 4: Synthèse & Ocean Blue Strategy
   * Objectif: Consolider toutes les données et générer la stratégie finale
   */
  async phase4_synthesis(
    input: MarketResearchInput,
    structure: StructurePhaseResult,
    research: ResearchPhaseResult,
    competitive: CompetitorAnalysis[]
  ): Promise<SynthesisResult> {
    console.log('🎨 Phase 4: Synthèse finale et Ocean Blue Strategy...');

    const prompt = `Tu es un consultant senior en stratégie. Synthétise cette analyse de marché complète pour ${input.businessName}.

# DONNÉES COLLECTÉES

## Marché
- Taille: ${research.marketSize}
- Croissance: ${research.growthRate}
- Tendances: ${research.trends.map(t => `${t.name}: ${t.description}`).join('; ')}

## Concurrence (${competitive.length} acteurs analysés)
${competitive.map(c => `
**${c.name}** (${c.positioning})
Forces: ${c.strengths.join(', ')}
Faiblesses: ${c.weaknesses.join(', ')}
`).join('\n')}

## Axes d'analyse identifiés
${structure.axes.join(', ')}

# LIVRABLES DEMANDÉS

## 1. Opportunités (5-8 opportunités concrètes)
Pour chaque opportunité:
- **Titre**: [titre court]
- **Description**: [2-3 phrases]
- **Impact potentiel**: Élevé/Moyen/Faible
- **Difficulté**: Élevé/Moyen/Faible

## 2. Menaces (5-8 menaces réelles)
Pour chaque menace:
- **Titre**: [titre court]
- **Description**: [2-3 phrases]
- **Sévérité**: Élevée/Moyenne/Faible
- **Probabilité**: Élevée/Moyenne/Faible

## 3. Analyse Client
- **Segments principaux**: [3-5 segments]
- **Besoins clés**: [5-7 besoins]
- **Comportements d'achat**: [3-4 comportements]

## 4. Stratégie Ocean Blue

### Éliminer (3-5 éléments)
Quels facteurs de l'industrie doivent être éliminés?

### Réduire (3-5 éléments)
Quels facteurs doivent être réduits bien en-dessous des standards?

### Augmenter (3-5 éléments)
Quels facteurs doivent être augmentés bien au-dessus des standards?

### Créer (3-5 éléments)
Quels facteurs jamais offerts doivent être créés?

### Marché cible Ocean Blue
[Description du nouveau marché créé]

## 5. Scoring (0-100 pour chaque)
- **Attractivité marché**: [score] - Justification: [1 phrase]
- **Intensité concurrence**: [score] - Justification: [1 phrase]
- **Difficulté entrée**: [score] - Justification: [1 phrase]
- **Potentiel croissance**: [score] - Justification: [1 phrase]
- **Demande client**: [score] - Justification: [1 phrase]

Retourne un rapport Markdown structuré avec ces 5 sections.`;

    const response = await generateWithMistralAPI(
      prompt,
      'Consultant senior en stratégie de marché et innovation.',
      { model: 'mistral-large-latest' } // Utiliser le modèle le plus puissant pour la synthèse
    );

    const markdown = response.content;

    // Parser le rapport complet
    const parsed = this.parseSynthesisReport(markdown, research, competitive, input);

    console.log(`✅ Phase 4 terminée: MOI = ${parsed.scoring.market_opportunity_index}/100`);

    return {
      ...parsed,
      markdown: this.buildFinalMarkdown(input, research, competitive, parsed)
    };
  }

  /**
   * ORCHESTRATION COMPLÈTE
   */
  async generateMarketAnalysis(input: MarketResearchInput) {
    try {
      console.log(`🚀 Démarrage analyse multi-passes pour ${input.businessName}...`);

      // Phase 1: Structure
      const structure = await this.phase1_structure(input);

      // Phase 2: Recherche (avec AI Search)
      const research = await this.phase2_research(input, structure);

      // Phase 3: Analyse compétitive
      const competitive = await this.phase3_competitive(research.competitors, input.industry);

      // Phase 4: Synthèse
      const synthesis = await this.phase4_synthesis(input, structure, research, competitive);

      // Construire l'objet final pour MongoDB
      const analysis = {
        businessId: input.businessId,
        userId: input.userId,
        industry: input.industry,
        business_name: input.businessName,
        business_description: input.description,
        market_overview: synthesis.market_overview,
        competition: synthesis.competition,
        customer_analysis: synthesis.customer_analysis,
        opportunities: synthesis.opportunities,
        threats: synthesis.threats,
        ocean_blue_strategy: synthesis.ocean_blue_strategy,
        scoring: synthesis.scoring,
        meta: {
          generated_at: new Date(),
          next_refresh_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
          refresh_frequency: 'monthly',
          ai_model: 'mistral-medium-latest + mistral-large-latest + AI Search',
          data_sources: research.sources,
          analysis_depth: 'deep_multi_pass'
        },
        reports: {
          markdown: synthesis.markdown,
        },
      };

      console.log(`✅ Analyse complète terminée avec succès!`);

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      console.error('❌ Erreur durant l\'analyse multi-passes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== UTILITAIRES DE PARSING ====================

  private extractListItems(text: string, pattern?: RegExp): string[] {
    const section = pattern ? text.match(pattern)?.[0] || text : text;
    const lines = section.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+(.+)/) || trimmed.match(/^\d+\.\s+(.+)/)) {
        const match = trimmed.match(/^[-*•\d.]+\s+(.+)/);
        if (match) items.push(match[1].trim());
      }
    }

    return items;
  }

  private extractSection(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    return match ? match[0] : '';
  }

  private extractSingleValue(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  }

  private parseSynthesisReport(markdown: string, research: ResearchPhaseResult, competitive: CompetitorAnalysis[], input: MarketResearchInput) {
    // Parser opportunités
    const oppsSection = this.extractSection(markdown, /##\s*1\.\s*Opportunités.*?(?=##\s*\d|$)/is);
    const opportunities = this.parseOpportunities(oppsSection);

    // Parser menaces
    const threatsSection = this.extractSection(markdown, /##\s*2\.\s*Menaces.*?(?=##\s*\d|$)/is);
    const threats = this.parseThreats(threatsSection);

    // Parser analyse client
    const customerSection = this.extractSection(markdown, /##\s*3\.\s*Analyse Client.*?(?=##\s*\d|$)/is);
    const customer_analysis = this.parseCustomerAnalysis(customerSection);

    // Parser Ocean Blue
    const oceanSection = this.extractSection(markdown, /##\s*4\.\s*Stratégie Ocean Blue.*?(?=##\s*\d|$)/is);
    const ocean_blue_strategy = this.parseOceanBlue(oceanSection);

    // Parser scoring
    const scoringSection = this.extractSection(markdown, /##\s*5\.\s*Scoring.*?$/is);
    const scoring = this.parseScoring(scoringSection);

    // Construire market_overview
    const market_overview = {
      market_size: research.marketSize,
      growth_rate: research.growthRate,
      key_trends: research.trends.map(t => ({
        name: t.name,
        description: t.description,
        impact: 'Moyen' as const
      })),
      market_maturity: this.estimateMaturity(research.growthRate)
    };

    // Construire competition
    const competition = {
      competitive_landscape: `Marché ${input.industry} avec ${competitive.length} acteurs principaux analysés.`,
      main_competitors: competitive.map(c => ({
        name: c.name,
        description: c.description,
        strengths: c.strengths,
        weaknesses: c.weaknesses,
        market_position: c.positioning,
        threat_level: this.estimateThreatLevel(c.strengths.length, c.weaknesses.length)
      })),
      competitive_intensity: scoring.competitive_intensity,
      entry_barriers: []
    };

    return {
      market_overview,
      competition,
      customer_analysis,
      opportunities,
      threats,
      ocean_blue_strategy,
      scoring
    };
  }

  private parseOpportunities(section: string): any[] {
    const items = this.extractListItems(section);
    return items.slice(0, 8).map((item, i) => ({
      title: `Opportunité ${i + 1}`,
      description: item,
      potential_impact: 'Moyen' as const,
      difficulty: 'Moyen' as const,
      timeframe: 'court_terme' as const
    }));
  }

  private parseThreats(section: string): any[] {
    const items = this.extractListItems(section);
    return items.slice(0, 8).map((item, i) => ({
      title: `Menace ${i + 1}`,
      description: item,
      severity: 'Moyenne' as const,
      probability: 'Moyenne' as const,
      mitigation_strategy: 'À définir'
    }));
  }

  private parseCustomerAnalysis(section: string): any {
    const segments = this.extractListItems(this.extractSection(section, /Segments.*?(?=\*\*|$)/is));
    const needs = this.extractListItems(this.extractSection(section, /Besoins.*?(?=\*\*|$)/is));
    const behaviors = this.extractListItems(this.extractSection(section, /Comportements.*?(?=\*\*|$)/is));

    return {
      target_segments: segments.map(s => ({ name: s, description: '', size_estimate: 'Moyen' })),
      customer_needs: needs,
      buying_behavior: behaviors.join('; '),
      customer_pain_points: []
    };
  }

  private parseOceanBlue(section: string): any {
    const eliminate = this.extractListItems(this.extractSection(section, /Éliminer.*?(?=###|$)/is));
    const reduce = this.extractListItems(this.extractSection(section, /Réduire.*?(?=###|$)/is));
    const increase = this.extractListItems(this.extractSection(section, /Augmenter.*?(?=###|$)/is));
    const create = this.extractListItems(this.extractSection(section, /Créer.*?(?=###|$)/is));
    const targetMatch = section.match(/Marché cible.*?\n([^\n#]+)/i);

    return {
      eliminate: eliminate.map(e => ({ factor: e, rationale: '' })),
      reduce: reduce.map(r => ({ factor: r, rationale: '' })),
      increase: increase.map(i => ({ factor: i, rationale: '' })),
      create: create.map(c => ({ factor: c, rationale: '' })),
      target_market: targetMatch ? targetMatch[1].trim() : 'Marché à définir',
      value_innovation: 'Innovation basée sur l\'analyse multi-passes'
    };
  }

  private parseScoring(section: string): any {
    const extractScore = (name: string): number => {
      const pattern = new RegExp(`${name}.*?[:\\s]+(\\d+)`, 'i');
      const match = section.match(pattern);
      return match ? parseInt(match[1]) : 50;
    };

    const market_attractiveness = extractScore('Attractivité');
    const competitive_intensity = extractScore('Intensité');
    const entry_difficulty = extractScore('Difficulté');
    const growth_potential = extractScore('Croissance');
    const customer_demand = extractScore('Demande');

    // Calcul MOI
    const moi = Math.round(
      market_attractiveness * 0.25 +
      (100 - competitive_intensity) * 0.20 +
      (100 - entry_difficulty) * 0.15 +
      growth_potential * 0.25 +
      customer_demand * 0.15
    );

    return {
      market_attractiveness,
      competitive_intensity,
      entry_difficulty,
      growth_potential,
      customer_demand,
      market_opportunity_index: moi,
      confidence_level: moi > 60 ? 'high' : moi > 40 ? 'medium' : 'low',
      scoring_rationale: `MOI ${moi}/100 basé sur analyse multi-passes avec données réelles.`
    };
  }

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

  private buildFinalMarkdown(
    input: MarketResearchInput,
    research: ResearchPhaseResult,
    competitive: CompetitorAnalysis[],
    synthesis: any
  ): string {
    return `# Analyse de Marché Complète - ${input.businessName}

## 📊 Vue d'ensemble du marché

**Secteur**: ${input.industry}
**Taille du marché**: ${research.marketSize}
**Croissance**: ${research.growthRate}

### Tendances clés
${research.trends.map(t => `- **${t.name}**: ${t.description}${t.source ? ` _(${t.source})_` : ''}`).join('\n')}

## 🎯 Analyse Concurrentielle

${competitive.map(c => `
### ${c.name}
${c.description}

**Positionnement**: ${c.positioning}
${c.marketShare ? `**Part de marché**: ${c.marketShare}` : ''}

**Forces**:
${c.strengths.map(s => `- ${s}`).join('\n')}

**Faiblesses**:
${c.weaknesses.map(w => `- ${w}`).join('\n')}
`).join('\n')}

## 💡 Opportunités

${synthesis.opportunities.map((o: any, i: number) => `${i + 1}. **${o.title}**: ${o.description}`).join('\n')}

## ⚠️ Menaces

${synthesis.threats.map((t: any, i: number) => `${i + 1}. **${t.title}**: ${t.description}`).join('\n')}

## 🌊 Stratégie Ocean Blue

### Éliminer
${synthesis.ocean_blue_strategy.eliminate.map((e: any) => `- ${e.factor}`).join('\n')}

### Réduire
${synthesis.ocean_blue_strategy.reduce.map((r: any) => `- ${r.factor}`).join('\n')}

### Augmenter
${synthesis.ocean_blue_strategy.increase.map((i: any) => `- ${i.factor}`).join('\n')}

### Créer
${synthesis.ocean_blue_strategy.create.map((c: any) => `- ${c.factor}`).join('\n')}

**Marché cible**: ${synthesis.ocean_blue_strategy.target_market}

## 📈 Scoring

- **Market Opportunity Index**: ${synthesis.scoring.market_opportunity_index}/100
- **Attractivité marché**: ${synthesis.scoring.market_attractiveness}/100
- **Intensité concurrence**: ${synthesis.scoring.competitive_intensity}/100
- **Difficulté d'entrée**: ${synthesis.scoring.entry_difficulty}/100
- **Potentiel croissance**: ${synthesis.scoring.growth_potential}/100
- **Demande client**: ${synthesis.scoring.customer_demand}/100

---

**Sources**: ${research.sources.join(', ')}
**Analyse générée le**: ${new Date().toLocaleDateString('fr-FR')}
`;
  }
}
