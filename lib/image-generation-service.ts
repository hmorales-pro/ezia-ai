/**
 * Service de génération d'images via Stable Diffusion (Hugging Face)
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
  cost?: number; // Coût estimé en crédits
}

/**
 * Optimise le prompt pour de meilleures images
 */
function optimizePrompt(prompt: string, contentType?: string): string {
  // Ajouter des mots-clés de qualité
  const qualityKeywords = "high quality, professional, detailed, 4k";

  // Adapter selon le type de contenu
  let context = "";
  switch (contentType) {
    case "article":
      context = "editorial style, magazine quality";
      break;
    case "social_post":
      context = "social media style, engaging, vibrant";
      break;
    case "video":
      context = "cinematic, dynamic composition";
      break;
    default:
      context = "professional marketing";
  }

  return `${prompt}, ${context}, ${qualityKeywords}`;
}

/**
 * Génère une image via Stable Diffusion
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const token = process.env.HF_TOKEN || process.env.DEFAULT_HF_TOKEN;

  if (!token) {
    return {
      success: false,
      error: "Token Hugging Face non configuré",
    };
  }

  try {
    const optimizedPrompt = optimizePrompt(options.prompt);

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: optimizedPrompt,
        parameters: {
          negative_prompt: options.negativePrompt || "low quality, blurry, distorted, watermark, text, signature",
          width: options.width || 1024,
          height: options.height || 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          seed: options.seed,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Image Generation] API Error:", errorText);

      // Si le modèle est en cours de chargement
      if (response.status === 503) {
        return {
          success: false,
          error: "Le modèle est en cours de chargement. Réessayez dans quelques secondes.",
        };
      }

      return {
        success: false,
        error: `Erreur API: ${response.status}`,
      };
    }

    // Récupérer l'image en tant que blob
    const imageBlob = await response.blob();

    // Convertir en base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageBase64 = `data:image/png;base64,${base64}`;

    return {
      success: true,
      imageBase64,
      cost: 1, // 1 crédit par image
    };
  } catch (error: any) {
    console.error("[Image Generation] Error:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la génération de l'image",
    };
  }
}

/**
 * Génère un prompt optimisé pour une image basée sur le contenu
 */
export function generateImagePromptFromContent(
  contentTitle: string,
  contentDescription?: string,
  contentType?: string
): string {
  // Construire un prompt basé sur le titre et la description
  let prompt = contentTitle;

  if (contentDescription) {
    // Extraire les mots-clés importants de la description (premiers 100 caractères)
    const descriptionSnippet = contentDescription.substring(0, 100);
    prompt = `${contentTitle}, ${descriptionSnippet}`;
  }

  // Nettoyer le prompt (enlever ponctuation excessive)
  prompt = prompt
    .replace(/[!?.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return prompt;
}

/**
 * Vérifie si l'utilisateur peut générer une image (quota disponible)
 */
export function canGenerateImage(user: any): { can: boolean; reason?: string } {
  // Compte de test : accès Creator gratuit pour les tests (plusieurs variantes possibles)
  const isTestAccount =
    user.email === 'test@eziom.fr' ||
    user.email === 'test@ezia.ai' ||
    user.username === 'test' ||
    user.username === 'testuser';
  if (isTestAccount) {
    const quota = 50; // Même quota que Creator
    const used = user.usage?.imagesGenerated || 0;

    if (used >= quota) {
      return {
        can: false,
        reason: `Quota mensuel atteint (${quota} images/mois). Votre quota se réinitialisera le mois prochain.`,
      };
    }

    return { can: true };
  }

  // Plan gratuit : 0 images
  if (user.subscription?.plan === 'free') {
    return {
      can: false,
      reason: "La génération d'images nécessite un abonnement Creator (29€/mois). Vous aurez droit à 50 images/mois.",
    };
  }

  // Plan Creator : 50 images/mois
  if (user.subscription?.plan === 'creator') {
    const quota = user.usage?.imagesQuota || 50;
    const used = user.usage?.imagesGenerated || 0;

    if (used >= quota) {
      return {
        can: false,
        reason: `Quota mensuel atteint (${quota} images/mois). Votre quota se réinitialisera le mois prochain.`,
      };
    }

    return { can: true };
  }

  // Plans Pro/Enterprise : illimité (ou quota très élevé)
  return { can: true };
}

/**
 * Incrémente le compteur d'images générées pour l'utilisateur
 */
export async function incrementImageUsage(userId: string) {
  const mongoose = await import('mongoose');
  const { User } = await import('../models/User');

  try {
    await User.findByIdAndUpdate(userId, {
      $inc: { 'usage.imagesGenerated': 1 },
    });
  } catch (e) {
    // Si ce n'est pas un ObjectId valide, chercher par username
    await User.findOneAndUpdate(
      { username: userId },
      { $inc: { 'usage.imagesGenerated': 1 } }
    );
  }
}

/**
 * Reset mensuel des quotas (à appeler via un cron job)
 */
export async function resetMonthlyImageQuotas() {
  const mongoose = await import('mongoose');
  const User = mongoose.models.User || (await import('../models/User')).default;

  const now = new Date();

  // Reset pour tous les utilisateurs Creator
  await User.updateMany(
    { 'subscription.plan': 'creator' },
    {
      $set: {
        'usage.imagesGenerated': 0,
        'usage.imagesQuota': 50,
        'usage.lastImageReset': now,
      },
    }
  );

  console.log('[Image Service] Monthly quotas reset successfully');
}
