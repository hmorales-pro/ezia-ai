import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth-utils';
import {
  generateImage,
  generateImagePromptFromContent,
  canGenerateImage,
  incrementImageUsage,
  type ImageGenerationOptions,
} from '@/lib/image-generation-service';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('ezia-auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Connexion à la base de données
    await dbConnect();

    // Récupérer l'utilisateur (gérer à la fois les ObjectId et les user_id textuels)
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (e) {
      // Si ce n'est pas un ObjectId valide, chercher par username/email
      user = await User.findOne({
        $or: [
          { username: decoded.userId },
          { username: decoded.username },
          { email: decoded.email }
        ]
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le quota
    const quotaCheck = canGenerateImage(user);
    if (!quotaCheck.can) {
      return NextResponse.json(
        { error: quotaCheck.reason },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de la requête
    const body = await request.json();
    const {
      prompt,
      contentTitle,
      contentDescription,
      contentType,
      width,
      height,
      negativePrompt,
    } = body;

    // Construire le prompt
    let finalPrompt = prompt;
    if (!finalPrompt && contentTitle) {
      finalPrompt = generateImagePromptFromContent(
        contentTitle,
        contentDescription,
        contentType
      );
    }

    if (!finalPrompt) {
      return NextResponse.json(
        { error: 'Un prompt ou un titre de contenu est requis' },
        { status: 400 }
      );
    }

    console.log('[Image Generation] Generating image with prompt:', finalPrompt);

    // Générer l'image
    const options: ImageGenerationOptions = {
      prompt: finalPrompt,
      negativePrompt,
      width: width || 1024,
      height: height || 1024,
    };

    const result = await generateImage(options);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Incrémenter le compteur d'utilisation
    await incrementImageUsage(decoded.userId);

    // Calculer le quota restant
    const updatedUser = await User.findById(decoded.userId);
    const remaining = (updatedUser.usage?.imagesQuota || 50) - (updatedUser.usage?.imagesGenerated || 0);

    return NextResponse.json({
      success: true,
      image: result.imageBase64,
      usage: {
        used: updatedUser.usage?.imagesGenerated || 0,
        quota: updatedUser.usage?.imagesQuota || 50,
        remaining,
      },
    });
  } catch (error: any) {
    console.error('[Image Generation API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}

// GET - Récupérer l'usage actuel de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('ezia-auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Récupérer l'utilisateur (gérer à la fois les ObjectId et les user_id textuels)
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (e) {
      // Si ce n'est pas un ObjectId valide, chercher par username/email
      user = await User.findOne({
        $or: [
          { username: decoded.userId },
          { username: decoded.username },
          { email: decoded.email }
        ]
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const used = user.usage?.imagesGenerated || 0;

    // Compte de test : accès Creator gratuit pour les tests (plusieurs variantes possibles)
    const isTestAccount =
      user.email === 'test@eziom.fr' ||
      user.email === 'test@ezia.ai' ||
      user.username === 'test' ||
      user.username === 'testuser';
    const quota = isTestAccount
      ? 50
      : (user.usage?.imagesQuota || (user.subscription?.plan === 'creator' ? 50 : 0));

    const remaining = Math.max(0, quota - used);

    return NextResponse.json({
      plan: isTestAccount ? 'creator' : (user.subscription?.plan || 'free'),
      usage: {
        used,
        quota,
        remaining,
      },
      lastReset: user.usage?.lastImageReset,
    });
  } catch (error: any) {
    console.error('[Image Usage API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
