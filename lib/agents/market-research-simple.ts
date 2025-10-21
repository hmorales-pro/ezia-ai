import { generateWithMistralAPI } from '../mistral-ai-service';
import type { IMarketAnalysis, IDataSource } from '@/models/MarketAnalysis';

export interface MarketResearchInput {
  businessId: string;
  userId: string;
  businessName: string;
  industry: string;
  description: string;
  targetMarket?: string;
}

export interface MarketResearchResult {
  analysis: Omit<IMarketAnalysis, '_id' | 'createdAt' | 'updatedAt'>;
  success: boolean;
  error?: string;
}

export class MarketResearchSimple {
  async generateMarketAnalysis(input: MarketResearchInput): Promise<MarketResearchResult> {
    try {
      console.log(`🔍 [MarketResearchSimple] Analyse pour ${input.businessName} (${input.industry})`);

      // Prompt Markdown simple et clair
      const prompt = `Analyse de marché pour ${input.businessName} dans le secteur ${input.industry}.

Description: ${input.description}

Fournis une analyse détaillée en Markdown avec:

## Marché
- Taille: [valeur]
- Croissance: [pourcentage]
- Tendances:
  - Tendance 1
  - Tendance 2
  - Tendance 3

## Concurrence
- Paysage: [description]
- Concurrents:
  - Concurrent 1: [forces/faiblesses]
  - Concurrent 2: [forces/faiblesses]
- Barrières: liste des barrières
- Avantages possibles: liste

## Clients
- Besoins: liste
- Critères d'achat: liste

## Opportunités
1. Opportunité 1 (impact élevé/moyen/faible)
2. Opportunité 2
3. Opportunité 3

## Menaces
1. Menace 1 (sévérité élevée/moyenne/faible)
2. Menace 2

## Stratégie Ocean Blue
- Éliminer: liste
- Réduire: liste
- Augmenter: liste
- Créer: liste
- Proposition: [valeur unique]

Sois factuel avec données réelles du secteur ${input.industry}.`;

      const response = await generateWithMistralAPI(prompt, "Expert en analyse de marché.");

      if (!response.success || !response.content) {
        throw new Error(response.error || 'Pas de réponse IA');
      }

      const markdown = response.content;
      console.log(`✅ Markdown reçu (${markdown.length} car)`);

      // Parser simple et robuste
      const data = this.simpleExtract(markdown);

      // MOI basique
      const moi = Math.round((60 + data.opportunities.length * 5 + data.trends.length * 3) * 0.7);

      const analysis: Omit<IMarketAnalysis, '_id' | 'createdAt' | 'updatedAt'> = {
        businessId: input.businessId,
        userId: input.userId,
        industry: input.industry,
        business_name: input.businessName,
        business_description: input.description,
        market_overview: {
          market_size: data.marketSize || `Marché ${input.industry}`,
          growth_rate: data.growthRate || "+5-10%",
          trends: data.trends.length > 0 ? data.trends : ["Digitalisation", "Innovation"],
          key_drivers: data.drivers.length > 0 ? data.drivers : ["Demande croissante"],
          segments: [],
        },
        competition: {
          main_competitors: data.competitors,
          competitive_landscape: data.landscape || `Marché ${input.industry} compétitif`,
          entry_barriers: data.barriers.length > 0 ? data.barriers : ["Capital initial"],
          competitive_advantages: data.advantages.length > 0 ? data.advantages : ["Innovation"],
        },
        customer_analysis: {
          personas: [],
          customer_needs: data.needs.length > 0 ? data.needs : ["Qualité", "Prix"],
          buying_criteria: data.criteria.length > 0 ? data.criteria : ["Prix", "Qualité"],
          decision_makers: ["Direction", "Managers"],
        },
        opportunities: data.opportunities,
        threats: data.threats,
        ocean_blue_strategy: {
          eliminate: data.eliminate,
          reduce: data.reduce,
          increase: data.increase,
          create: data.create,
          value_proposition: data.valueProposition || `Innovation ${input.industry}`,
          target_market: input.targetMarket || `Marché ${input.industry} français`,
        },
        scoring: {
          market_attractiveness: Math.min(60 + data.trends.length * 5, 100),
          competitive_intensity: 50,
          entry_difficulty: 55,
          growth_potential: Math.min(65 + data.opportunities.length * 5, 100),
          customer_demand: 70,
          market_opportunity_index: Math.min(moi, 100),
          confidence_level: 'medium',
          scoring_rationale: `MOI ${moi}/100 basé sur ${data.opportunities.length} opportunités et ${data.trends.length} tendances.`,
        },
        meta: {
          analysis_version: '3.0-simple',
          generated_at: new Date(),
          last_updated: new Date(),
          next_refresh_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          refresh_frequency: 'monthly',
          data_sources: [{
            name: 'MistralAI',
            type: 'api',
            collected_at: new Date(),
            reliability: 'high',
          }],
          llm_model: 'mistral-medium-latest',
          analyst_notes: `Analyse ${input.businessName}`,
        },
        reports: { markdown },
      };

      console.log(`🎯 MOI: ${moi}/100`);
      return { success: true, analysis };

    } catch (error) {
      console.error('❌ Erreur:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur',
        analysis: {} as any,
      };
    }
  }

  private simpleExtract(md: string): any {
    const data: any = {
      trends: [],
      drivers: [],
      competitors: [],
      opportunities: [],
      threats: [],
      needs: [],
      criteria: [],
      barriers: [],
      advantages: [],
      eliminate: [],
      reduce: [],
      increase: [],
      create: [],
    };

    // Nettoyer
    const clean = md.replace(/\*\*/g, '').replace(/\*/g, '');
    const lines = clean.split('\n').map(l => l.trim());

    // Extraction par sections
    let section = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Détecter sections
      if (line.match(/^##\s*Marché/i)) section = 'marche';
      else if (line.match(/^##\s*Concur/i)) section = 'concurrence';
      else if (line.match(/^##\s*Client/i)) section = 'clients';
      else if (line.match(/^##\s*Opportun/i)) section = 'opportunites';
      else if (line.match(/^##\s*Menace/i)) section = 'menaces';
      else if (line.match(/^##\s*.*Ocean/i)) section = 'ocean';

      // Extraire données
      if (line.match(/^-\s*Taille.*?:/i)) {
        data.marketSize = line.split(':')[1]?.trim() || '';
      }
      else if (line.match(/^-\s*Croissance.*?:/i)) {
        data.growthRate = line.split(':')[1]?.trim() || '';
      }
      else if (section === 'marche' && line.match(/^-\s+\w/)) {
        const text = line.replace(/^-\s+/, '');
        if (!text.match(/Taille|Croissance|Tendances|Drivers/i)) {
          data.trends.push(text);
        }
      }
      else if (section === 'concurrence') {
        if (line.match(/^-\s*Paysage.*?:/i)) {
          data.landscape = line.split(':')[1]?.trim() || '';
        }
        else if (line.match(/^-\s*\w+:/)) {
          const parts = line.split(':');
          data.competitors.push({
            name: parts[0].replace(/^-\s*/, '').trim(),
            position: 'Concurrent',
            strengths: [],
            weaknesses: [],
          });
        }
        else if (line.match(/^-\s+\w/) && line.length > 10) {
          const text = line.replace(/^-\s+/, '');
          if (text.match(/barrière|obstacle/i)) {
            data.barriers.push(text);
          } else if (text.match(/avantage|différenc/i)) {
            data.advantages.push(text);
          }
        }
      }
      else if (section === 'clients' && line.match(/^-\s+\w/)) {
        const text = line.replace(/^-\s+/, '');
        if (text.match(/besoin/i)) {
          data.needs.push(text);
        } else {
          data.criteria.push(text);
        }
      }
      else if (section === 'opportunites' && line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, '');
        const impact = text.match(/élevé|fort/i) ? 'high' : text.match(/faible/i) ? 'low' : 'medium';
        data.opportunities.push({
          title: text.substring(0, 100),
          description: text,
          potential_impact: impact,
          timeframe: 'Moyen terme',
        });
      }
      else if (section === 'menaces' && line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, '');
        const severity = text.match(/élevé|critique/i) ? 'high' : text.match(/faible/i) ? 'low' : 'medium';
        data.threats.push({
          title: text.substring(0, 100),
          description: text,
          severity,
          probability: 'medium',
          mitigation: [],
        });
      }
      else if (section === 'ocean') {
        if (line.match(/^-\s*Éliminer.*?:/i)) {
          const rest = lines.slice(i + 1);
          for (const l of rest) {
            if (l.match(/^-\s*(Réduire|Augmenter|Créer|Proposition)/i)) break;
            if (l.match(/^\s+-\s+\w/)) data.eliminate.push(l.replace(/^\s+-\s+/, ''));
          }
        }
        else if (line.match(/^-\s*Réduire.*?:/i)) {
          const rest = lines.slice(i + 1);
          for (const l of rest) {
            if (l.match(/^-\s*(Augmenter|Créer|Proposition)/i)) break;
            if (l.match(/^\s+-\s+\w/)) data.reduce.push(l.replace(/^\s+-\s+/, ''));
          }
        }
        else if (line.match(/^-\s*Augmenter.*?:/i)) {
          const rest = lines.slice(i + 1);
          for (const l of rest) {
            if (l.match(/^-\s*(Créer|Proposition)/i)) break;
            if (l.match(/^\s+-\s+\w/)) data.increase.push(l.replace(/^\s+-\s+/, ''));
          }
        }
        else if (line.match(/^-\s*Créer.*?:/i)) {
          const rest = lines.slice(i + 1);
          for (const l of rest) {
            if (l.match(/^-\s*Proposition/i)) break;
            if (l.match(/^\s+-\s+\w/)) data.create.push(l.replace(/^\s+-\s+/, ''));
          }
        }
        else if (line.match(/^-\s*Proposition.*?:/i)) {
          data.valueProposition = line.split(':')[1]?.trim() || '';
        }
      }
    }

    // Fallbacks
    if (data.eliminate.length === 0) data.eliminate = ['Complexité inutile'];
    if (data.reduce.length === 0) data.reduce = ['Coûts'];
    if (data.increase.length === 0) data.increase = ['Qualité'];
    if (data.create.length === 0) data.create = ['Innovation'];

    return data;
  }
}
