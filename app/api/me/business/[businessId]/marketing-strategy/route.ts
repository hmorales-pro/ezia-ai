import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { MarketingStrategy } from '@/models/MarketingStrategy';
import { MarketAnalysis } from '@/models/MarketAnalysis';
import { Business } from '@/models/Business';
import { MarketingStrategyDeepSeek } from '@/lib/agents/marketing-strategy-deepseek';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * GET - Récupérer la stratégie marketing existante
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

    // Récupérer la stratégie marketing depuis MongoDB
    const strategy = await MarketingStrategy.findOne({ businessId, userId });

    if (!strategy) {
      return NextResponse.json({
        success: true,
        strategy: null,
        message: 'Aucune stratégie marketing trouvée',
      });
    }

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error) {
    console.error('❌ Error fetching marketing strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Générer une nouvelle stratégie marketing
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

    // Vérifier MongoDB disponible
    if (!MONGODB_URI) {
      console.error('[Marketing Strategy] ❌ MONGODB_URI non configuré');
      return NextResponse.json(
        { error: 'Configuration MongoDB manquante' },
        { status: 500 }
      );
    }

    await dbConnect();

    // Récupérer le business depuis MongoDB
    console.log(`🔍 [MongoDB] Recherche business: businessId=${businessId}, userId=${userId}`);
    const business = await Business.findOne({ business_id: businessId, userId });

    console.log(`📊 Business trouvé:`, business ? `${business.name} (${business.business_id})` : 'AUCUN');

    if (!business) {
      return NextResponse.json(
        { error: 'Business non trouvé', debug: { businessId, userId } },
        { status: 404 }
      );
    }

    console.log(`🔍 Génération stratégie marketing pour ${business.name} (${business.industry})`);

    // Récupérer les paramètres optionnels du body
    const body = await request.json().catch(() => ({}));
    const { forceRefresh = false } = body;

    // Vérifier si une stratégie existe déjà
    const existingStrategy = await MarketingStrategy.findOne({ businessId, userId });

    if (existingStrategy && !forceRefresh) {
      // Vérifier si refresh nécessaire
      const needsRefresh = new Date() > existingStrategy.meta.next_refresh_date;

      if (!needsRefresh) {
        console.log(`✅ Stratégie existante valide jusqu'au ${existingStrategy.meta.next_refresh_date}`);
        return NextResponse.json({
          success: true,
          strategy: existingStrategy,
          message: 'Stratégie existante retournée (pas de refresh nécessaire)',
        });
      }
    }

    // Récupérer l'analyse de marché si disponible
    const marketAnalysis = await MarketAnalysis.findOne({ businessId, userId });

    // Générer la stratégie marketing avec DeepSeek
    const agent = new MarketingStrategyDeepSeek();
    const result = await agent.generateMarketingStrategy({
      businessId,
      userId,
      businessName: business.name,
      industry: business.industry,
      description: business.description,
      targetMarket: business.target_market,
      marketAnalysis: marketAnalysis || undefined,
    });

    if (!result.success || !result.strategy) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération', details: result.error },
        { status: 500 }
      );
    }

    // Sauvegarder ou mettre à jour dans MongoDB
    let savedStrategy;
    if (existingStrategy) {
      // Mise à jour
      Object.assign(existingStrategy, result.strategy);
      savedStrategy = await existingStrategy.save();
      console.log(`✅ Stratégie mise à jour pour ${business.name}`);
    } else {
      // Création
      savedStrategy = await MarketingStrategy.create(result.strategy);
      console.log(`✅ Nouvelle stratégie créée pour ${business.name}`);
    }

    return NextResponse.json({
      success: true,
      strategy: savedStrategy,
      message: 'Stratégie marketing générée avec succès',
    });

  } catch (error) {
    console.error('❌ Error generating marketing strategy:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
