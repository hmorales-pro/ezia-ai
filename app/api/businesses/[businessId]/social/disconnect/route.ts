import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
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

    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: 'Plateforme requise' },
        { status: 400 }
      );
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

    // Disconnect using MCP
    try {
      await withMCPClient(async (client) => {
        await client.disconnect(platform, params.businessId);
      });
    } catch (error) {
      console.error('[API] Erreur MCP déconnexion:', error);
      // Continue even if MCP fails
    }

    // Remove from database
    await SocialConnection.deleteOne({
      businessId: params.businessId,
      platform,
    });

    return NextResponse.json({
      success: true,
      message: `Déconnecté de ${platform}`,
    });

  } catch (error) {
    console.error('[API] Erreur déconnexion sociale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}