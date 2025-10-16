/**
 * Daily Content Agent
 * Agent Mistral spécialisé dans la génération de contenu quotidien avec variantes A/B
 * @version 1.0.0
 */

import { generateWithMistralAPI } from '@/lib/mistral-ai-service';
import {
  DailyContentGenerateRequest,
  DailyContentResponse,
  DailyContentItem,
  ContentVariant,
  BusinessProfile,
  CalendarDay,
  generateContentId,
  generateUTMParams
} from '@/lib/types/content-generation';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export class DailyContentAgent {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || MISTRAL_API_KEY || '';
  }

  /**
   * Génère du contenu quotidien pour une date spécifique
   */
  async generateDailyContent(
    request: DailyContentGenerateRequest,
    calendarDay: CalendarDay,
    businessProfile: BusinessProfile
  ): Promise<DailyContentResponse> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request, calendarDay, businessProfile);

    console.log('[DailyContentAgent] Generating content for:', request.date);
    console.log('[DailyContentAgent] Theme:', calendarDay.theme);
    console.log('[DailyContentAgent] Platforms:', request.platforms);

    try {
      const response = await generateWithMistralAPI(
        userPrompt,
        systemPrompt,
        this.apiKey
      );

      if (!response.success || !response.content) {
        throw new Error('Failed to generate daily content from Mistral API');
      }

      // Parser la réponse JSON de Mistral
      const parsedResponse = this.parseResponse(
        response.content,
        request,
        calendarDay,
        businessProfile
      );

      console.log('[DailyContentAgent] Content generated successfully');
      console.log(`[DailyContentAgent] ${parsedResponse.items.length} platform items created`);

      return parsedResponse;
    } catch (error: any) {
      console.error('[DailyContentAgent] Error:', error.message);

      // Fallback : générer du contenu basique
      console.log('[DailyContentAgent] Using fallback content generation');
      return this.generateFallbackContent(request, calendarDay, businessProfile);
    }
  }

  /**
   * Construit le prompt système pour Mistral
   */
  private buildSystemPrompt(): string {
    return `Tu es un copywriter francophone expert en marketing de contenu et réseaux sociaux.

RÔLE ET EXPERTISE:
- Tu maîtrises l'écriture persuasive et engageante pour chaque plateforme
- Tu comprends les spécificités de LinkedIn, Twitter/X, Facebook, Instagram
- Tu sais créer des hooks puissants et des CTA efficaces
- Tu optimises le contenu pour l'engagement et la conversion

RÈGLES D'ÉCRITURE PAR PLATEFORME:

📊 LINKEDIN (B2B/Professionnel):
- Format: Storytelling avec structure Hook → Insight → Valeur → CTA
- Longueur: 1200-1500 caractères
- Ton: Professionnel mais humain et accessible
- Hashtags: 3-5 pertinents
- Inclure: Statistiques, cas concrets, leçons apprises
- Éviter: Jargon excessif, auto-promotion flagrante

🐦 TWITTER/X (Court et percutant):
- Format: Thread de 2-4 tweets ou tweet standalone
- Longueur: 280 caractères max par tweet
- Ton: Concis, direct, percutant
- Hashtags: 1-2 maximum
- Inclure: Chiffres clés, insights actionnables
- Éviter: Messages trop longs, hashtags excessifs

👥 FACEBOOK (Communautaire):
- Format: Post conversationnel avec question d'engagement
- Longueur: 400-800 caractères
- Ton: Convivial, authentique, chaleureux
- Emojis: 3-5 bien placés
- Inclure: Question ouverte, invitation à commenter
- Éviter: Ton trop corporate, liens excessifs

📸 INSTAGRAM (Visuel et inspirant):
- Format: Caption storytelling avec hooks visuels
- Longueur: 1500-2000 caractères
- Ton: Inspirant, authentique, personnel
- Hashtags: 15-25 (mix populaires + niche)
- Emojis: Utilisation généreuse et pertinente
- Inclure: Appel à sauvegarder/partager
- Éviter: Texte générique, manque de personnalité

QUALITÉ ET SELF-REVIEW:
Après génération, tu DOIS évaluer chaque variante selon:
- tone_match: Le contenu respecte-t-il la voix de la marque? (0-100)
- hallucination_risk: Y a-t-il des informations inventées? (0-100, 0 = aucun risque)
- engagement_potential: Potentiel d'engagement du contenu (0-100)

FORMAT DE RÉPONSE:
Tu DOIS répondre UNIQUEMENT avec un objet JSON valide suivant cette structure exacte:

{
  "items": [
    {
      "platform": "Nom de la plateforme",
      "pillar": "Pilier du contenu",
      "theme": "Thème du jour",
      "variants": [
        {
          "variant_id": "A",
          "text": "Contenu COMPLET prêt à publier",
          "metadata": {
            "cta": "Call-to-action",
            "hashtags": ["#hashtag1", "#hashtag2"],
            "word_count": 150,
            "char_count": 900
          },
          "quality_metrics": {
            "tone_match": 85,
            "hallucination_risk": 5,
            "engagement_potential": 78
          }
        },
        {
          "variant_id": "B",
          "text": "Variante alternative du contenu",
          "metadata": { ... },
          "quality_metrics": { ... }
        }
      ],
      "suggested_assets": {
        "image_prompt": "Description pour génération d'image",
        "b_roll_ideas": ["idée 1", "idée 2"],
        "visual_style": "Style visuel recommandé"
      }
    }
  ]
}

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après
- Le contenu doit être 100% prêt à publier (pas de placeholders)
- Chaque variante doit être DIFFÉRENTE (angle, hook, structure)
- Respecte STRICTEMENT les contraintes de longueur par plateforme
- Les hashtags doivent être PERTINENTS et SPÉCIFIQUES
- Aucune information inventée (hallucination_risk = 0)`;
  }

  /**
   * Construit le prompt utilisateur avec le contexte
   */
  private buildUserPrompt(
    request: DailyContentGenerateRequest,
    calendarDay: CalendarDay,
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

    return `CONTEXTE BUSINESS:
${businessContext}

JOUR DU CALENDRIER:
Date: ${request.date}
Thème: "${calendarDay.theme}"
Pilier: ${calendarDay.pillar}
Plateformes demandées: ${request.platforms.join(', ')}
Plans par plateforme:
${calendarDay.platform_plans.map(p => `- ${p.platform}: objectif = ${p.objective}, CTA = "${p.cta || 'À définir'}"`).join('\n')}

NOMBRE DE VARIANTES:
Génère ${request.variants} variante(s) par plateforme (A, B${request.variants > 2 ? ', C' : ''})

INSTRUCTIONS DÉTAILLÉES:

1. POUR CHAQUE PLATEFORME DEMANDÉE:
   - Crée ${request.variants} variantes DIFFÉRENTES du contenu
   - Respecte les spécificités de la plateforme
   - Adapte le ton selon brand_voice: ${businessProfile.brand_voice.tone.join(', ')}
   - Applique les règles: ${businessProfile.brand_voice.style_rules.join(', ')}

2. DIFFÉRENCIATION DES VARIANTES:
   Variante A: Hook émotionnel / Storytelling
   Variante B: Hook statistique / Data-driven
   ${request.variants > 2 ? 'Variante C: Hook question / Interactif' : ''}

3. STRUCTURE DU CONTENU:
   - Hook puissant (première ligne = décisive)
   - Corps enrichi avec valeur concrète
   - CTA clair et actionnable
   - Hashtags pertinents (pas génériques)

4. ÉLÉMENTS À INCLURE:
   - Référence au thème: "${calendarDay.theme}"
   - Alignement avec le pilier: ${calendarDay.pillar}
   - Mise en avant des USPs: ${businessProfile.unique_value_prop.join(', ')}
   - Adresse les pain points des audiences

5. À ÉVITER ABSOLUMENT:
   ${businessProfile.brand_voice.dont.map(d => `- ${d}`).join('\n   ')}
   - Informations inventées ou non vérifiables
   - Placeholders type [INSÉRER XXX]
   - Contenu générique applicable à n'importe quelle marque

6. SUGGESTED ASSETS (optionnel):
   - Image prompt: Description précise pour génération d'image
   - B-roll ideas: Suggestions de contenu visuel complémentaire
   - Visual style: Ambiance visuelle recommandée

${request.tracking?.enable_utm ? `7. UTM TRACKING:
   Génère des UTM params pour chaque lien (utm_source, utm_medium, utm_campaign, utm_content)` : ''}

GÉNÈRE MAINTENANT le contenu quotidien complet en JSON:`;
  }

  /**
   * Parse la réponse de Mistral et la valide
   */
  private parseResponse(
    content: string,
    request: DailyContentGenerateRequest,
    calendarDay: CalendarDay,
    businessProfile: BusinessProfile
  ): DailyContentResponse {
    try {
      // Nettoyer le contenu
      let cleanContent = content.trim();
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON object found in response');
      }

      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);

      // Parser le JSON
      const parsed = JSON.parse(cleanContent);

      if (!parsed.items || !Array.isArray(parsed.items)) {
        throw new Error('Invalid response structure: missing items array');
      }

      // Enrichir avec UTM params si demandé
      if (request.tracking?.enable_utm) {
        parsed.items.forEach((item: DailyContentItem) => {
          item.variants.forEach((variant: ContentVariant) => {
            if (!variant.metadata.utm_params) {
              const campaign = calendarDay.campaign_id
                ? { name: calendarDay.campaign_id, goal: 'engagement' as const, cta: '' }
                : { name: `${calendarDay.pillar}-${request.date}`, goal: 'engagement' as const, cta: '' };

              variant.metadata.utm_params = generateUTMParams(
                campaign,
                item.platform,
                variant.variant_id
              );
            }
          });
        });
      }

      // Calculer word_count et char_count si manquants
      parsed.items.forEach((item: DailyContentItem) => {
        item.variants.forEach((variant: ContentVariant) => {
          if (!variant.metadata.word_count) {
            variant.metadata.word_count = variant.text.split(/\s+/).length;
          }
          if (!variant.metadata.char_count) {
            variant.metadata.char_count = variant.text.length;
          }
        });
      });

      const contentId = generateContentId(
        request.calendar_id,
        request.date,
        request.platforms[0]
      );

      return {
        response_type: 'daily_content',
        version: '1.0.0',
        content_id: contentId,
        calendar_id: request.calendar_id,
        date: request.date,
        items: parsed.items,
        created_at: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[DailyContentAgent] Parse error:', error.message);
      throw new Error(`Failed to parse Mistral response: ${error.message}`);
    }
  }

  /**
   * Génère du contenu de fallback basique mais fonctionnel
   */
  private generateFallbackContent(
    request: DailyContentGenerateRequest,
    calendarDay: CalendarDay,
    businessProfile: BusinessProfile
  ): DailyContentResponse {
    const items: DailyContentItem[] = request.platforms.map(platform => {
      const variants: ContentVariant[] = [];

      for (let i = 0; i < request.variants; i++) {
        const variantId = String.fromCharCode(65 + i); // A, B, C...
        const text = this.generateFallbackText(
          platform,
          calendarDay,
          businessProfile,
          variantId
        );

        variants.push({
          variant_id: variantId,
          text,
          metadata: {
            cta: `Découvrez ${businessProfile.brand_name}`,
            hashtags: this.generateHashtags(platform, businessProfile),
            word_count: text.split(/\s+/).length,
            char_count: text.length
          },
          quality_metrics: {
            tone_match: 70,
            hallucination_risk: 0,
            engagement_potential: 65
          }
        });
      }

      return {
        platform,
        pillar: calendarDay.pillar,
        theme: calendarDay.theme,
        variants,
        suggested_assets: {
          image_prompt: `Illustration professionnelle pour ${calendarDay.theme} dans le style ${businessProfile.industry}`,
          b_roll_ideas: [
            'Vue d\'ensemble du produit/service',
            'Témoignage client',
            'Équipe au travail'
          ],
          visual_style: 'Moderne, professionnel, épuré'
        }
      };
    });

    const contentId = generateContentId(
      request.calendar_id,
      request.date,
      request.platforms[0]
    );

    return {
      response_type: 'daily_content',
      version: '1.0.0',
      content_id: contentId,
      calendar_id: request.calendar_id,
      date: request.date,
      items,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Génère un texte de fallback adapté à la plateforme
   */
  private generateFallbackText(
    platform: string,
    calendarDay: CalendarDay,
    businessProfile: BusinessProfile,
    variantId: string
  ): string {
    const hooks = {
      A: `📊 ${calendarDay.theme}`,
      B: `💡 Saviez-vous que...`,
      C: `🎯 ${businessProfile.audiences[0]?.name || 'Professionnels'},`
    };

    const hook = hooks[variantId as keyof typeof hooks] || hooks.A;

    if (platform === 'LinkedIn') {
      return `${hook}

${businessProfile.one_liner}

Chez ${businessProfile.brand_name}, nous croyons que ${businessProfile.unique_value_prop[0] || 'l\'innovation'} est la clé du succès.

✅ ${businessProfile.unique_value_prop[0] || 'Solution 1'}
✅ ${businessProfile.unique_value_prop[1] || 'Solution 2'}
✅ ${businessProfile.unique_value_prop[2] || 'Solution 3'}

Qu'en pensez-vous ? Partagez votre expérience en commentaire 👇

#${businessProfile.industry.replace(/\s+/g, '')} #Innovation #${businessProfile.brand_name.replace(/\s+/g, '')}`;
    }

    if (platform === 'Twitter/X') {
      return `${hook}

${calendarDay.theme}

${businessProfile.one_liner}

${businessProfile.unique_value_prop[0] || 'Notre approche unique'} fait la différence.

#${businessProfile.industry.replace(/\s+/g, '')}`;
    }

    if (platform === 'Facebook') {
      return `${hook} 🚀

${calendarDay.theme}

Chez ${businessProfile.brand_name}, on vous aide à ${businessProfile.one_liner.toLowerCase()}

Notre secret ? ${businessProfile.unique_value_prop[0] || 'Une approche centrée sur vous'} 💪

Et vous, quel est votre plus grand défi en ce moment ? 💬`;
    }

    // Instagram par défaut
    return `${hook} ✨

${calendarDay.theme}

${businessProfile.one_liner}

On aide ${businessProfile.audiences[0]?.name || 'nos clients'} à atteindre leurs objectifs grâce à:

⭐ ${businessProfile.unique_value_prop[0] || 'Excellence'}
⭐ ${businessProfile.unique_value_prop[1] || 'Innovation'}
⭐ ${businessProfile.unique_value_prop[2] || 'Expertise'}

Sauvegarde ce post si tu veux en savoir plus ! 💾

.
.
.
#${businessProfile.industry.replace(/\s+/g, '')} #${businessProfile.brand_name.replace(/\s+/g, '')} #Success`;
  }

  /**
   * Génère des hashtags pertinents selon la plateforme
   */
  private generateHashtags(platform: string, businessProfile: BusinessProfile): string[] {
    const baseHashtags = [
      `#${businessProfile.industry.replace(/\s+/g, '')}`,
      `#${businessProfile.brand_name.replace(/\s+/g, '')}`
    ];

    if (platform === 'Instagram') {
      return [
        ...baseHashtags,
        '#Innovation',
        '#Business',
        '#Entrepreneur',
        '#Success',
        '#Motivation'
      ];
    }

    if (platform === 'LinkedIn') {
      return [
        ...baseHashtags,
        '#Leadership',
        '#Innovation'
      ];
    }

    return baseHashtags;
  }
}

// Export d'une instance par défaut
export const dailyContentAgent = new DailyContentAgent();
