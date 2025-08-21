import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/images/generations";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    try {
      jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { prompt, model = "mistral-image-v1", size = "1024x1024", n = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Vérifier si l'API key Mistral est configurée
    if (!MISTRAL_API_KEY) {
      console.warn("Mistral API key not configured, returning placeholder");
      // En développement, retourner une image placeholder
      return NextResponse.json({
        success: true,
        data: {
          images: [
            {
              url: `https://placehold.co/1024x1024/6D3FC8/ffffff?text=${encodeURIComponent(prompt.slice(0, 30))}...`,
              revised_prompt: prompt
            }
          ]
        }
      });
    }

    // Appeler l'API Mistral pour générer l'image
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model,
        prompt,
        n,
        size,
        response_format: "url"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mistral API error:", error);
      return NextResponse.json(
        { error: "Failed to generate image", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Formater la réponse
    return NextResponse.json({
      success: true,
      data: {
        images: data.data.map((img: any) => ({
          url: img.url,
          revised_prompt: img.revised_prompt || prompt
        }))
      }
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint pour obtenir le statut de génération d'une image (si nécessaire)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier le JWT
    try {
      jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Pour l'instant, retourner un statut simulé
    return NextResponse.json({
      success: true,
      status: "completed",
      progress: 100
    });

  } catch (error) {
    console.error("Error checking image status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}