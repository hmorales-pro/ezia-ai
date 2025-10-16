import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ContentCalendar } from '@/models/ContentCalendar';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * GET /api/content/calendar/[calendarId]
 * Récupère un calendrier éditorial spécifique
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ calendarId: string }> }
) {
  try {
    const params = await context.params;
    const { calendarId } = params;

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

    // 2. Connexion à MongoDB
    await connectDB();

    // 3. Récupérer le calendrier
    const calendar = await ContentCalendar.findOne({
      calendar_id: calendarId,
      user_id: userId
    });

    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // 4. Calculer des statistiques
    const today = new Date().toISOString().split('T')[0];
    const upcomingDays = calendar.calendar.filter(
      (day: any) => day.date >= today
    );
    const pillarDistribution = calendar.calendar.reduce((acc: any, day: any) => {
      acc[day.pillar] = (acc[day.pillar] || 0) + 1;
      return acc;
    }, {});

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        calendar_id: calendar.calendar_id,
        business_id: calendar.business_id,
        version: calendar.version,
        locale: calendar.locale,
        timeframe: calendar.timeframe,
        cadence: calendar.cadence,
        pillars: calendar.pillars,
        campaigns: calendar.campaigns,
        editorial_line: calendar.editorial_line,
        calendar: calendar.calendar,
        platforms: calendar.platforms,
        status: calendar.status,
        stats: {
          total_days: calendar.calendar.length,
          upcoming_days: upcomingDays.length,
          pillar_distribution: pillarDistribution,
          is_active: (calendar as any).isActive()
        },
        created_at: calendar._createdAt,
        updated_at: calendar._updatedAt
      }
    });
  } catch (error: any) {
    console.error('[API] Error fetching calendar:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/content/calendar/[calendarId]
 * Met à jour le statut ou des éléments d'un calendrier
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ calendarId: string }> }
) {
  try {
    const params = await context.params;
    const { calendarId } = params;

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

    // 2. Parser les mises à jour
    const updates = await request.json();

    // 3. Connexion à MongoDB
    await connectDB();

    // 4. Mettre à jour le calendrier
    const calendar = await ContentCalendar.findOneAndUpdate(
      {
        calendar_id: calendarId,
        user_id: userId
      },
      { $set: updates },
      { new: true }
    );

    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        calendar_id: calendar.calendar_id,
        status: calendar.status,
        updated_at: calendar._updatedAt
      },
      message: 'Calendar updated successfully'
    });
  } catch (error: any) {
    console.error('[API] Error updating calendar:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/calendar/[calendarId]
 * Archive un calendrier (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ calendarId: string }> }
) {
  try {
    const params = await context.params;
    const { calendarId } = params;

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

    // 2. Connexion à MongoDB
    await connectDB();

    // 3. Archiver le calendrier (soft delete)
    const calendar = await ContentCalendar.findOneAndUpdate(
      {
        calendar_id: calendarId,
        user_id: userId
      },
      { $set: { status: 'archived' } },
      { new: true }
    );

    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      message: 'Calendar archived successfully',
      data: {
        calendar_id: calendar.calendar_id,
        status: calendar.status
      }
    });
  } catch (error: any) {
    console.error('[API] Error archiving calendar:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
