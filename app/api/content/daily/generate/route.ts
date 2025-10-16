import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ContentCalendar } from '@/models/ContentCalendar';
import { GeneratedContent } from '@/models/GeneratedContent';
import { dailyContentAgent } from '@/lib/agents/daily-content-agent';
import { DailyContentGenerateRequest } from '@/lib/types/content-generation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/content/daily/generate
 * Génère du contenu quotidien pour une date spécifique
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
    const contentRequest: DailyContentGenerateRequest = body.request;

    // 3. Validation
    if (!contentRequest || contentRequest.request_type !== 'daily_content_generate') {
      return NextResponse.json(
        { error: 'Invalid request_type. Expected: daily_content_generate' },
        { status: 400 }
      );
    }

    if (!contentRequest.calendar_id || !contentRequest.date || !contentRequest.platforms) {
      return NextResponse.json(
        { error: 'Missing required fields: calendar_id, date, platforms' },
        { status: 400 }
      );
    }

    // 4. Connexion à MongoDB
    await connectDB();

    // 5. Récupérer le calendrier
    const calendar = await ContentCalendar.findOne({
      calendar_id: contentRequest.calendar_id,
      user_id: userId
    });

    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // 6. Trouver le jour dans le calendrier
    const calendarDay = (calendar as any).getContentForDate(contentRequest.date);

    if (!calendarDay) {
      return NextResponse.json(
        { error: `No content planned for date: ${contentRequest.date}` },
        { status: 404 }
      );
    }

    // 7. Vérifier si du contenu n'existe pas déjà pour cette date
    const existingContent = await GeneratedContent.findOne({
      calendar_id: contentRequest.calendar_id,
      date: contentRequest.date,
      user_id: userId
    });

    if (existingContent) {
      console.log('[API] Content already exists for this date, returning existing');
      return NextResponse.json({
        success: true,
        data: {
          content_id: existingContent.content_id,
          date: existingContent.date,
          items: existingContent.items,
          created_at: existingContent._createdAt
        },
        message: 'Content already generated for this date'
      });
    }

    // 8. Générer le contenu avec l'agent Mistral
    console.log('[API] Generating daily content with Mistral...');
    const contentResponse = await dailyContentAgent.generateDailyContent(
      contentRequest,
      calendarDay,
      calendar.business_profile
    );

    // 9. Sauvegarder le contenu généré dans MongoDB
    const generatedContent = new GeneratedContent({
      content_id: contentResponse.content_id,
      calendar_id: contentRequest.calendar_id,
      user_id: userId,
      business_id: calendar.business_id,
      version: contentResponse.version,
      date: contentRequest.date,
      items: contentResponse.items,
      publication_status: new Map(
        contentRequest.platforms.map(platform => [
          platform,
          {
            variant: 'A',
            status: 'draft',
            scheduled_at: undefined,
            published_at: undefined
          }
        ])
      ),
      performance_metrics: new Map()
    });

    await generatedContent.save();

    console.log('[API] Content saved successfully:', contentResponse.content_id);

    // 10. Calculer des statistiques
    const stats = {
      platforms: contentResponse.items.length,
      total_variants: contentResponse.items.reduce(
        (sum, item) => sum + item.variants.length,
        0
      ),
      average_quality: contentResponse.items.reduce((sum, item) => {
        const itemAvg =
          item.variants.reduce(
            (vSum, v) => vSum + (v.quality_metrics?.tone_match || 0),
            0
          ) / item.variants.length;
        return sum + itemAvg;
      }, 0) / contentResponse.items.length
    };

    // 11. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        content_id: contentResponse.content_id,
        calendar_id: contentResponse.calendar_id,
        date: contentResponse.date,
        items: contentResponse.items,
        stats,
        created_at: contentResponse.created_at
      }
    });
  } catch (error: any) {
    console.error('[API] Error generating daily content:', error);
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
