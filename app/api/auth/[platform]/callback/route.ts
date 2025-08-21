import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";

// Réutiliser la configuration OAuth
const OAUTH_CONFIGS = {
  facebook: {
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`
  },
  instagram: {
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`
  },
  linkedin: {
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  },
  twitter: {
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`
  },
  youtube: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const simulated = searchParams.get("simulated");
    const error = searchParams.get("error");

    // Gérer les erreurs OAuth
    if (error) {
      console.error(`OAuth error for ${params.platform}:`, error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=no_code`
      );
    }

    // En mode simulation (développement)
    if (simulated === "true") {
      // Simuler la sauvegarde de la connexion
      const user = await isAuthenticated();
      if (session) {
        // Ici vous pourriez sauvegarder la connexion simulée en base de données
        console.log(`Simulated OAuth connection for ${params.platform}`);
      }
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_success=${params.platform}`
      );
    }

    // Vérifier et décoder le state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state || "", 'base64').toString());
    } catch (e) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=invalid_state`
      );
    }

    const platform = params.platform as keyof typeof OAUTH_CONFIGS;
    const config = OAUTH_CONFIGS[platform];

    if (!config) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=invalid_platform`
      );
    }

    // Échanger le code contre un access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId!,
      client_secret: config.clientSecret!
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error(`Token exchange error for ${platform}:`, error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    // Sauvegarder les tokens en base de données
    await dbConnect();
    
    // Ici, vous devriez créer un modèle SocialConnection ou similaire
    // Pour l'instant, on simule la sauvegarde
    console.log(`OAuth tokens received for ${platform}:`, {
      access_token: tokenData.access_token ? "***" : undefined,
      refresh_token: tokenData.refresh_token ? "***" : undefined,
      expires_in: tokenData.expires_in
    });

    // Récupérer les informations du profil selon la plateforme
    let profileInfo = {};
    
    if (platform === 'facebook') {
      // Récupérer les pages Facebook
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
      );
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        profileInfo = { pages: pagesData.data };
      }
    } else if (platform === 'linkedin') {
      // Récupérer le profil LinkedIn
      const profileResponse = await fetch(
        'https://api.linkedin.com/v2/me',
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        }
      );
      if (profileResponse.ok) {
        profileInfo = await profileResponse.json();
      }
    }
    // Ajouter d'autres plateformes selon les besoins

    // Rediriger vers la page business avec succès
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_success=${platform}&connected=true`
    );

  } catch (error) {
    console.error(`Error in OAuth callback for ${params.platform}:`, error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/business?oauth_error=callback_error`
    );
  }
}