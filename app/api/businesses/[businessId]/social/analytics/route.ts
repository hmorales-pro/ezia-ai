import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Business } from '@/models/Business';
import SocialConnection from '@/models/SocialConnection';
import { withMCPClient } from '@/lib/mcp/social-media-client';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    // Authenticate user
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    let userId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Connect to database
    await dbConnect();

    // Find business and verify ownership
    const business = await Business.findById(params.businessId);
    
    if (!business) {
      return NextResponse.json({ error: 'Business non trouvé' }, { status: 404 });
    }

    if (business.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get connected platforms
    const connections = await SocialConnection.find({
      businessId: params.businessId,
      isActive: true,
    });

    if (connections.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: [],
        message: 'Aucune plateforme connectée',
      });
    }

    const platformsToAnalyze = platform 
      ? [platform]
      : connections.map(c => c.platform);

    // Get analytics from MCP
    const analyticsPromises = platformsToAnalyze.map(async (plat) => {
      try {
        const analytics = await withMCPClient(async (client) => {
          return await client.getAnalytics(plat, params.businessId, startDate, endDate);
        });

        // Update stored metrics
        const totalMetrics = analytics.metrics;
        if (totalMetrics) {
          await SocialConnection.findOneAndUpdate(
            { businessId: params.businessId, platform: plat },
            {
              'metrics.totalImpressions': totalMetrics.impressions || 0,
              'metrics.totalEngagements': totalMetrics.engagements || 0,
              'metrics.avgEngagementRate': parseFloat(totalMetrics.engagementRate || '0'),
            }
          );
        }

        return {
          platform: plat,
          success: true,
          data: analytics,
        };
      } catch (error) {
        console.error(`Analytics error for ${plat}:`, error);
        return {
          platform: plat,
          success: false,
          error: error.message,
        };
      }
    });

    const analyticsResults = await Promise.all(analyticsPromises);

    // Calculate aggregate metrics
    const aggregateMetrics = analyticsResults.reduce((acc, result) => {
      if (result.success && result.data?.metrics) {
        const metrics = result.data.metrics;
        acc.totalPosts += metrics.posts || 0;
        acc.totalImpressions += metrics.impressions || 0;
        acc.totalEngagements += metrics.engagements || 0;
        acc.totalLikes += metrics.likes || 0;
        acc.totalShares += metrics.shares || metrics.retweets || 0;
        acc.totalComments += metrics.comments || metrics.replies || 0;
      }
      return acc;
    }, {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
    });

    // Calculate overall engagement rate
    if (aggregateMetrics.totalImpressions > 0) {
      aggregateMetrics.engagementRate = 
        ((aggregateMetrics.totalEngagements / aggregateMetrics.totalImpressions) * 100).toFixed(2) + '%';
    } else {
      aggregateMetrics.engagementRate = '0%';
    }

    return NextResponse.json({
      success: true,
      period: {
        start: startDate || 'all time',
        end: endDate || 'now',
      },
      platforms: analyticsResults,
      aggregateMetrics,
      connections: connections.map(c => ({
        platform: c.platform,
        username: c.username,
        isActive: c.isActive,
        lastPostAt: c.lastPostAt,
        totalPosts: c.totalPosts,
      })),
    });

  } catch (error) {
    console.error('[API] Erreur analytics sociales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    );
  }
}