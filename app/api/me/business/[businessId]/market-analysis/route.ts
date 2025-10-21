import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { MarketAnalysis } from '@/models/MarketAnalysis';
import { MarketResearchDeepSeek } from '@/lib/agents/market-research-deepseek';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utiliser le même stockage en mémoire que business-simple
declare global {
  var businesses: any[];
}

if (!global.businesses) {
  global.businesses = [];
}

/**
 * GET - Récupérer l'analyse de marché existante
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;

    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier le JWT
    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Récupérer l'analyse de marché depuis MongoDB
    const analysis = await MarketAnalysis.findOne({ businessId, userId });

    if (!analysis) {
      return NextResponse.json({
        success: true,
        analysis: null,
        message: 'Aucune analyse de marché trouvée',
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis._id,
        businessId: analysis.businessId,
        industry: analysis.industry,
        business_name: analysis.business_name,
        market_overview: analysis.market_overview,
        competition: analysis.competition,
        customer_analysis: analysis.customer_analysis,
        opportunities: analysis.opportunities,
        threats: analysis.threats,
        ocean_blue_strategy: analysis.ocean_blue_strategy,
        scoring: analysis.scoring,
        meta: analysis.meta,
        reports: analysis.reports,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching market analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Générer une nouvelle analyse de marché
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;

    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier le JWT
    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Récupérer le business depuis le stockage en mémoire
    console.log(`🔍 Recherche business: businessId=${businessId}, userId=${userId}`);
    const business = global.businesses.find(
      b => b.business_id === businessId && b.userId === userId
    );
    console.log(`📊 Business trouvé:`, business ? `${business.name} (${business.business_id})` : 'AUCUN');

    if (!business) {
      return NextResponse.json(
        { error: 'Business non trouvé', debug: { businessId, userId } },
        { status: 404 }
      );
    }

    console.log(`🔍 Génération analyse de marché pour ${business.name} (${business.industry})`);

    // Récupérer les paramètres optionnels du body
    const body = await request.json().catch(() => ({}));
    const { forceRefresh = false, existingData = {} } = body;

    // Vérifier si une analyse existe déjà
    const existingAnalysis = await MarketAnalysis.findOne({ businessId, userId });

    if (existingAnalysis && !forceRefresh) {
      // Vérifier si refresh nécessaire
      const needsRefresh = new Date() > existingAnalysis.meta.next_refresh_date;

      if (!needsRefresh) {
        console.log(`✅ Analyse existante valide jusqu'au ${existingAnalysis.meta.next_refresh_date}`);
        return NextResponse.json({
          success: true,
          analysis: existingAnalysis,
          message: 'Analyse existante retournée (pas de refresh nécessaire)',
        });
      }

      console.log(`🔄 Refresh nécessaire (date dépassée: ${existingAnalysis.meta.next_refresh_date})`);
    }

    // Générer l'analyse avec MarketResearchDeepSeek (DeepSeek V3 via HuggingFace)
    const agent = new MarketResearchDeepSeek();
    const result = await agent.generateMarketAnalysis({
      businessId,
      userId,
      businessName: business.name,
      industry: business.industry,
      description: business.description || `Entreprise dans le secteur ${business.industry}`,
      targetMarket: business.targetAudience,
    });

    if (!result.success) {
      console.error('❌ Échec génération analyse:', result.error);
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la génération de l\'analyse' },
        { status: 500 }
      );
    }

    console.log(`✅ Analyse générée avec MOI: ${result.analysis.scoring.market_opportunity_index}/100`);

    // Sauvegarder ou mettre à jour dans MongoDB
    await dbConnect();
    const savedAnalysis = await MarketAnalysis.findOneAndUpdate(
      { businessId, userId },
      result.analysis,
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
      message: 'Analyse de marché générée avec succès',
      moi: result.analysis.scoring.market_opportunity_index,
    });
  } catch (error) {
    console.error('❌ Error generating market analysis:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer l'analyse de marché
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;

    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier le JWT
    let userId: string;
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Supprimer l'analyse
    await MarketAnalysis.findOneAndDelete({ businessId, userId });

    return NextResponse.json({
      success: true,
      message: 'Analyse de marché supprimée avec succès',
    });
  } catch (error) {
    console.error('❌ Error deleting market analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
