import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Business } from '@/models/Business';
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

    const { platform, redirectUri } = await request.json();

    if (!platform || !redirectUri) {
      return NextResponse.json(
        { error: 'Plateforme et URL de redirection requises' },
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

    // Get auth URL using MCP
    try {
      const authUrl = await withMCPClient(async (client) => {
        return await client.getAuthUrl(platform, params.businessId, redirectUri);
      });

      return NextResponse.json({
        success: true,
        authUrl,
      });
    } catch (error) {
      console.error('[API] Erreur MCP connexion:', error);
      
      // Fallback pour le développement sans MCP configuré
      const fallbackUrls: Record<string, string> = {
        twitter: 'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=DEMO&redirect_uri=' + encodeURIComponent(redirectUri),
        linkedin: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=DEMO&redirect_uri=' + encodeURIComponent(redirectUri),
        facebook: 'https://www.facebook.com/v12.0/dialog/oauth?client_id=DEMO&redirect_uri=' + encodeURIComponent(redirectUri),
        instagram: 'https://api.instagram.com/oauth/authorize?client_id=DEMO&redirect_uri=' + encodeURIComponent(redirectUri),
      };

      if (fallbackUrls[platform]) {
        return NextResponse.json({
          success: true,
          authUrl: fallbackUrls[platform],
          demo: true,
          message: 'Mode démo - Configurez les clés API pour une connexion réelle',
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('[API] Erreur connexion sociale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation de la connexion' },
      { status: 500 }
    );
  }
}