import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Business } from '@/models/Business';
import SocialConnection from '@/models/SocialConnection';
import { withMCPClient } from '@/lib/mcp/social-media-client';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(
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

    const { content, platforms, mediaUrls, scheduledTime } = await request.json();

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Contenu et plateformes requis' },
        { status: 400 }
      );
    }

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

    // Check if platforms are connected
    const connections = await SocialConnection.find({
      businessId: params.businessId,
      platform: { $in: platforms },
      isActive: true,
    });

    const connectedPlatforms = connections.map(c => c.platform);
    const missingPlatforms = platforms.filter((p: string) => !connectedPlatforms.includes(p));

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        { 
          error: 'Certaines plateformes ne sont pas connectées',
          missingPlatforms 
        },
        { status: 400 }
      );
    }

    // Post using MCP
    const results = await withMCPClient(async (client) => {
      return await client.post(content, platforms, params.businessId, mediaUrls);
    });

    // Update post count and last post date for successful posts
    for (const result of results) {
      if (result.success) {
        await SocialConnection.findOneAndUpdate(
          { businessId: params.businessId, platform: result.platform },
          { 
            $inc: { totalPosts: 1 },
            lastPostAt: new Date()
          }
        );
      }
    }

    // Save post record to business
    if (!business.socialPosts) {
      business.socialPosts = [];
    }

    business.socialPosts.push({
      content,
      platforms: results.map(r => ({
        platform: r.platform,
        postId: r.id,
        url: r.url,
        success: r.success,
        error: r.error,
      })),
      mediaUrls,
      scheduledTime,
      postedAt: new Date(),
      metrics: {
        impressions: 0,
        engagements: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      },
    });

    await business.save();

    return NextResponse.json({
      success: true,
      results,
      summary: {
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

  } catch (error) {
    console.error('[API] Erreur publication sociale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la publication' },
      { status: 500 }
    );
  }
}