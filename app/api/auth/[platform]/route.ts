import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";

// Configuration OAuth pour chaque plateforme
const OAUTH_CONFIGS = {
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights"],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    scopes: ["w_member_social", "r_liteprofile", "r_emailaddress"],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly"
    ],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
  }
};

// GET - Initier le flux OAuth
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const platform = params.platform as keyof typeof OAUTH_CONFIGS;
    const config = OAUTH_CONFIGS[platform];

    if (!config) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Vérifier si les credentials sont configurés
    if (!config.clientId || !config.clientSecret) {
      console.warn(`OAuth credentials not configured for ${platform}`);
      // En développement, retourner une URL de simulation
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback?simulated=true&code=simulated_code`
      );
    }

    // Générer un state unique pour la sécurité CSRF
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      platform,
      timestamp: Date.now()
    })).toString('base64');

    // Construire l'URL d'autorisation
    const authParams = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state
    });

    // Paramètres spécifiques par plateforme
    if (platform === 'facebook') {
      authParams.append('auth_type', 'rerequest');
    } else if (platform === 'youtube') {
      authParams.append('access_type', 'offline');
      authParams.append('prompt', 'consent');
    }

    const authUrl = `${config.authUrl}?${authParams.toString()}`;
    
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error(`Error initiating OAuth for ${params.platform}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}