/**
 * Editorial Strategy Agent
 * Agent Mistral spécialisé dans la création de lignes éditoriales et calendriers de contenu
 * @version 1.0.0
 */

import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import {
  ContentCalendarCreateRequest,
  ContentCalendarResponse,
  BusinessProfile,
  CalendarDay,
  EditorialLine,
  generateCalendarId
} from '@/lib/types/content-generation';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export class EditorialStrategyAgent {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || MISTRAL_API_KEY || '';
  }

  /**
   * Génère une ligne éditoriale et un calendrier de contenu complet
   */
  async generateEditorialCalendar(
    request: ContentCalendarCreateRequest,
    businessProfile: BusinessProfile
  ): Promise<ContentCalendarResponse> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request, businessProfile);

    console.log('[EditorialStrategyAgent] Generating editorial calendar...');
    console.log('[EditorialStrategyAgent] Timeframe:', request.timeframe);
    console.log('[EditorialStrategyAgent] Pillars:', request.pillars);

    try {
      const response = await generateWithMistralAPI(
        userPrompt,
        systemPrompt,
        this.apiKey
      );

      if (!response.success || !response.content) {
        throw new Error('Failed to generate editorial calendar from Mistral API');
      }

      // Parser la réponse JSON de Mistral
      const parsedResponse = this.parseResponse(response.content, request, businessProfile);

      console.log('[EditorialStrategyAgent] Calendar generated successfully');
      console.log(`[EditorialStrategyAgent] ${parsedResponse.calendar.length} days planned`);

      return parsedResponse;
    } catch (error: any) {
      console.error('[EditorialStrategyAgent] Error:', error.message);

      // Fallback : générer un calendrier basique
      console.log('[EditorialStrategyAgent] Using fallback calendar generation');
      return this.generateFallbackCalendar(request, businessProfile);
    }
  }

  /**
   * Construit le prompt système pour Mistral
   */
  private buildSystemPrompt(): string {
    return `Tu es un stratège éditorial B2B/SaaS expert en marketing de contenu et réseaux sociaux.

RÔLE ET EXPERTISE:
- Tu maîtrises la création de lignes éditoriales cohérentes et impactantes
- Tu comprends les différents piliers de contenu (Éducation, Autorité, Produit, Communauté)
- Tu sais adapter le ton et le message selon les plateformes (LinkedIn, Twitter/X, Facebook, Instagram)
- Tu crées des calendriers éditoriaux équilibrés et stratégiques

CONTRAINTES:
- Toujours respecter la voix de la marque définie dans le contexte
- Équilibrer les piliers selon les ratios demandés
- Adapter le contenu aux spécificités de chaque plateforme
- Créer des thèmes concrets, actionnables et engageants
- Éviter les sujets génériques ou creux

FORMAT DE RÉPONSE:
Tu DOIS répondre UNIQUEMENT avec un objet JSON valide suivant cette structure exacte:

{
  "editorial_line": {
    "positioning_statement": "Une phrase claire qui résume le positionnement",
    "voice": ["trait1", "trait2", "trait3"],
    "key_themes": ["thème1", "thème2", "thème3", "thème4", "thème5"]
  },
  "calendar": [
    {
      "date": "YYYY-MM-DD",
      "theme": "Titre précis du thème du jour",
      "pillar": "Nom du pilier",
      "platform_plans": [
        {
          "platform": "Nom de la plateforme",
          "objective": "reach|engagement|conversion|traffic|brand",
          "cta": "Call-to-action spécifique"
        }
      ],
      "campaign_id": "ID de campagne si applicable"
    }
  ]
}

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après
- Assure-toi que le JSON est valide et parsable
- Respecte exactement la structure ci-dessus`;
  }

  /**
   * Construit le prompt utilisateur avec le contexte business
   */
  private buildUserPrompt(
    request: ContentCalendarCreateRequest,
    businessProfile: BusinessProfile
  ): string {
    const businessContext = JSON.stringify({
      brand_name: businessProfile.brand_name,
      one_liner: businessProfile.one_liner,
      industry: businessProfile.industry,
      audiences: businessProfile.audiences,
      unique_value_prop: businessProfile.unique_value_prop,
      brand_voice: businessProfile.brand_voice
    }, null, 2);

    const requestContext = JSON.stringify({
      timeframe: request.timeframe,
      cadence: request.cadence,
      pillars: request.pillars,
      campaigns: request.campaigns || []
    }, null, 2);

    return `CONTEXTE BUSINESS:
${businessContext}

REQUÊTE DE CALENDRIER:
${requestContext}

INSTRUCTIONS DÉTAILLÉES:

1. LIGNE ÉDITORIALE:
   - Analyse le profil business et déduis un positionnement clair
   - La voix doit refléter le brand_voice défini
   - Identifie 5-7 thèmes clés alignés avec l'industrie et les audiences

2. CALENDRIER ÉDITORIAL:
   - Génère un calendrier du ${request.timeframe.start_date} au ${request.timeframe.end_date}
   - Fréquence: ${request.cadence.days_per_week} jours par semaine
   - Répartition des piliers selon les ratios:
${request.pillars.map(p => `     * ${p.name}: ${(p.ratio * 100).toFixed(0)}%`).join('\n')}

3. POUR CHAQUE JOUR:
   - Choisis un thème CONCRET et ACTIONNABLE (pas générique)
   - Assigne un pilier en respectant les ratios globaux
   - Définis 1-2 plateformes pertinentes pour ce thème
   - Propose un objectif et un CTA adapté à chaque plateforme
   ${request.campaigns && request.campaigns.length > 0 ? `- Intègre les campagnes: ${request.campaigns.map(c => c.name).join(', ')}` : ''}

4. QUALITÉ DU CONTENU:
   - Chaque thème doit apporter de la VALEUR à l'audience
   - Varier les formats (tips, cas d'usage, témoignages, stats, behind-the-scenes)
   - Créer une progression logique sur le mois
   - Alterner entre contenu éducatif, inspirant et commercial

EXEMPLES DE BONS THÈMES (à adapter):
- "Les 3 erreurs fatales en [sujet] que 90% des [audience] font"
- "Comment [résultat désirable] sans [obstacle commun]"
- "Ce que [cas concret] m'a appris sur [sujet]"
- "Le système exact que nous utilisons pour [résultat]"
- "[Statistique surprenante] sur [industrie] en 2025"

GÉNÈRE MAINTENANT le calendrier éditorial complet en JSON:`;
  }

  /**
   * Parse la réponse de Mistral et la valide
   */
  private parseResponse(
    content: string,
    request: ContentCalendarCreateRequest,
    businessProfile: BusinessProfile
  ): ContentCalendarResponse {
    try {
      // Nettoyer le contenu : enlever markdown, code blocks, etc.
      let cleanContent = content.trim();

      // Enlever les balises markdown si présentes
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Trouver le premier { et le dernier }
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON object found in response');
      }

      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);

      // Parser le JSON
      const parsed = JSON.parse(cleanContent);

      // Valider la structure
      if (!parsed.editorial_line || !parsed.calendar) {
        throw new Error('Invalid response structure');
      }

      // Créer l'ID du calendrier
      const startDate = new Date(request.timeframe.start_date);
      const calendarId = generateCalendarId(
        businessProfile.brand_name.replace(/\s+/g, '').toUpperCase(),
        startDate.getFullYear(),
        startDate.getMonth() + 1
      );

      return {
        response_type: 'content_calendar',
        version: '1.0.0',
        calendar_id: calendarId,
        editorial_line: parsed.editorial_line,
        calendar: parsed.calendar,
        created_at: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[EditorialStrategyAgent] Parse error:', error.message);
      throw new Error(`Failed to parse Mistral response: ${error.message}`);
    }
  }

  /**
   * Génère un calendrier de fallback basique mais fonctionnel
   */
  private generateFallbackCalendar(
    request: ContentCalendarCreateRequest,
    businessProfile: BusinessProfile
  ): ContentCalendarResponse {
    const startDate = new Date(request.timeframe.start_date);
    const endDate = new Date(request.timeframe.end_date);
    const calendarId = generateCalendarId(
      businessProfile.brand_name.replace(/\s+/g, '').toUpperCase(),
      startDate.getFullYear(),
      startDate.getMonth() + 1
    );

    // Générer les dates selon la cadence
    const calendar: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    let weekDayCount = 0;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Respecter la cadence (jours par semaine)
      if (dayOfWeek === 1) weekDayCount = 0; // Reset au lundi

      if (weekDayCount < request.cadence.days_per_week && dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Sélectionner un pilier basé sur les ratios
        const pillar = this.selectPillar(request.pillars, calendar.length);

        // Générer un thème simple
        const theme = this.generateSimpleTheme(pillar, businessProfile);

        calendar.push({
          date: currentDate.toISOString().split('T')[0],
          theme,
          pillar: pillar.name,
          platform_plans: [
            {
              platform: 'LinkedIn',
              objective: 'engagement',
              cta: `Découvrez ${businessProfile.brand_name}`
            }
          ]
        });

        weekDayCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      response_type: 'content_calendar',
      version: '1.0.0',
      calendar_id: calendarId,
      editorial_line: {
        positioning_statement: `${businessProfile.brand_name} - ${businessProfile.one_liner}`,
        voice: businessProfile.brand_voice.tone,
        key_themes: businessProfile.unique_value_prop
      },
      calendar,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Sélectionne un pilier en respectant les ratios
   */
  private selectPillar(pillars: any[], currentIndex: number): any {
    const totalPosts = 20; // Estimation pour un mois
    const targetCounts = pillars.map(p => Math.round(p.ratio * totalPosts));

    // Distribution simple basée sur l'index
    let accumulated = 0;
    for (let i = 0; i < pillars.length; i++) {
      accumulated += targetCounts[i];
      if (currentIndex < accumulated) {
        return pillars[i];
      }
    }

    return pillars[0]; // Fallback
  }

  /**
   * Génère un thème simple basé sur le pilier
   */
  private generateSimpleTheme(pillar: any, businessProfile: BusinessProfile): string {
    const templates: Record<string, string[]> = {
      'Éducation': [
        `Comment optimiser votre ${businessProfile.industry}`,
        `Les bases de ${businessProfile.unique_value_prop[0] || 'notre solution'}`,
        `Guide pratique : ${businessProfile.one_liner}`
      ],
      'Autorité': [
        `Notre expertise en ${businessProfile.industry}`,
        `Cas client : transformation réussie`,
        `Les tendances 2025 en ${businessProfile.industry}`
      ],
      'Produit': [
        `Découvrez ${businessProfile.brand_name}`,
        `Nouvelle fonctionnalité : ${businessProfile.unique_value_prop[0] || 'innovation'}`,
        `Pourquoi choisir ${businessProfile.brand_name}`
      ],
      'Communauté': [
        `Témoignage client`,
        `Behind the scenes chez ${businessProfile.brand_name}`,
        `Votre avis compte : sondage`
      ]
    };

    const themesForPillar = templates[pillar.name] || templates['Éducation'];
    return themesForPillar[Math.floor(Math.random() * themesForPillar.length)];
  }
}

// Export d'une instance par défaut
export const editorialStrategyAgent = new EditorialStrategyAgent();
