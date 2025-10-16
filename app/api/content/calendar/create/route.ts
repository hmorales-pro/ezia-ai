import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ContentCalendar } from '@/models/ContentCalendar';
import { Business } from '@/models/Business';
import { editorialStrategyAgent } from '@/lib/agents/editorial-strategy-agent';
import {
  ContentCalendarCreateRequest,
  BusinessProfile,
  validatePillars
} from '@/lib/types/content-generation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/content/calendar/create
 * Crée un nouveau calendrier éditorial avec ligne éditoriale
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // 2. Parser la requête
    const body = await request.json();
    const {
      business_id,
      request: calendarRequest,
      advanced_options
    }: {
      business_id: string;
      request: ContentCalendarCreateRequest;
      advanced_options?: any;
    } = body;

    // 3. Validation de base
    if (!business_id || !calendarRequest) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, request' },
        { status: 400 }
      );
    }

    if (calendarRequest.request_type !== 'content_calendar_create') {
      return NextResponse.json(
        { error: 'Invalid request_type. Expected: content_calendar_create' },
        { status: 400 }
      );
    }

    // Valider les piliers
    if (!validatePillars(calendarRequest.pillars)) {
      return NextResponse.json(
        { error: 'Invalid pillars: ratios must sum to 1.0' },
        { status: 400 }
      );
    }

    // 4. Connexion à MongoDB
    await connectDB();

    // 5. Récupérer le business
    const business = await Business.findOne({
      user_id: userId,
      business_id
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // 6. Construire le profil business pour l'agent
    const businessProfile: BusinessProfile = {
      brand_name: business.name,
      one_liner: business.description,
      industry: business.industry,
      audiences: business.market_analysis?.target_audience
        ? [
            {
              name: business.market_analysis.target_audience,
              pain_points: business.customer_insights?.customer_pain_points || [],
              goals: []
            }
          ]
        : [
            {
              name: 'Professionnels',
              pain_points: [],
              goals: []
            }
          ],
      unique_value_prop: business.business_model?.unique_selling_points || [
        business.market_analysis?.value_proposition || 'Innovation et excellence'
      ],
      brand_voice: {
        tone: ['professionnel', 'accessible', 'expert'],
        style_rules: [
          'Phrases courtes et impactantes',
          'Un conseil actionnable par post',
          'Éviter le jargon inutile'
        ],
        do: ['Tutoyer le lecteur', 'Mettre un CTA clair', 'Utiliser des exemples concrets'],
        dont: ['Promesses exagérées', 'Buzzwords creux', 'Contenu trop générique']
      }
    };

    // 7. Générer le calendrier avec l'agent Mistral
    console.log('[API] Generating editorial calendar with Mistral...');
    const calendarResponse = await editorialStrategyAgent.generateEditorialCalendar(
      calendarRequest,
      businessProfile
    );

    // 8. Sauvegarder le calendrier dans MongoDB
    const contentCalendar = new ContentCalendar({
      calendar_id: calendarResponse.calendar_id,
      user_id: userId,
      business_id,
      version: calendarResponse.version,
      locale: 'fr-FR',
      business_profile: businessProfile,
      platforms: body.platforms || [
        { name: 'LinkedIn', post_length_hint: '120-180 mots' },
        { name: 'Twitter/X', post_length_hint: '280-500 caractères' }
      ],
      timeframe: calendarRequest.timeframe,
      cadence: calendarRequest.cadence,
      pillars: calendarRequest.pillars,
      campaigns: calendarRequest.campaigns,
      editorial_line: calendarResponse.editorial_line,
      calendar: calendarResponse.calendar,
      advanced_options: advanced_options || {},
      status: 'active'
    });

    await contentCalendar.save();

    console.log('[API] Calendar saved successfully:', calendarResponse.calendar_id);

    // 9. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        calendar_id: calendarResponse.calendar_id,
        editorial_line: calendarResponse.editorial_line,
        calendar: calendarResponse.calendar,
        stats: {
          total_days: calendarResponse.calendar.length,
          pillar_distribution: calendarResponse.calendar.reduce((acc: any, day) => {
            acc[day.pillar] = (acc[day.pillar] || 0) + 1;
            return acc;
          }, {})
        },
        created_at: calendarResponse.created_at
      }
    });
  } catch (error: any) {
    console.error('[API] Error creating calendar:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
