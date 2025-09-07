import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { WebAnalyzer } from "@/lib/web-analyzer";
import { getDB } from "@/lib/database";

export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const { url, businessId } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL requise" },
        { status: 400 }
      );
    }

    // Si un businessId est fourni, vérifier l'accès
    if (businessId) {
      const db = getDB();
      const business = await db.findBusinessById(businessId);
      
      if (!business || business.user_id !== user.id || !business.is_active) {
        return NextResponse.json({ error: "Business non trouvé" }, { status: 404 });
      }
    }

    // Analyser l'URL
    console.log('[API] Analyse URL:', url);
    const analysis = await WebAnalyzer.analyzeUrl(url);

    if (!analysis.success) {
      return NextResponse.json(
        { error: analysis.error || "Échec de l'analyse" },
        { status: 400 }
      );
    }

    // Si businessId fourni, sauvegarder l'interaction
    if (businessId) {
      const interaction = {
        timestamp: new Date(),
        agent: "Ezia",
        interaction_type: "url_analysis",
        summary: `Analyse du site ${analysis.url}`,
        content: JSON.stringify(analysis, null, 2),
        metadata: {
          analyzed_url: analysis.url,
          business_type: analysis.businessType,
          services_count: analysis.mainServices?.length || 0
        }
      };

      const db = getDB();
      await db.updateBusinessInteraction(businessId, interaction);
    }

    return NextResponse.json({
      success: true,
      analysis,
      message: "Analyse terminée avec succès"
    });

  } catch (error) {
    console.error("[API] Erreur analyse URL:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse" },
      { status: 500 }
    );
  }
}