import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
import SocialConnection from '@/models/SocialConnection';
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

    // Connect to database
    await connectToDatabase();

    // Find business and verify ownership
    const business = await Business.findById(params.businessId);
    
    if (!business) {
      return NextResponse.json({ error: 'Business non trouvé' }, { status: 404 });
    }

    if (business.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get all social connections for this business
    const connections = await SocialConnection.find({ businessId: params.businessId });

    // Add missing platforms as disconnected
    const platforms = ['twitter', 'linkedin', 'facebook', 'instagram'];
    const connectionMap = new Map(connections.map(c => [c.platform, c]));

    const allConnections = platforms.map(platform => {
      const existing = connectionMap.get(platform);
      if (existing) {
        return {
          platform: existing.platform,
          isActive: existing.isActive,
          username: existing.username,
          profileImageUrl: existing.profileImageUrl,
          lastPostAt: existing.lastPostAt,
          totalPosts: existing.totalPosts,
          metrics: existing.metrics,
        };
      }
      return {
        platform,
        isActive: false,
      };
    });

    return NextResponse.json({
      success: true,
      connections: allConnections,
    });

  } catch (error) {
    console.error('[API] Erreur connexions sociales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des connexions' },
      { status: 500 }
    );
  }
}