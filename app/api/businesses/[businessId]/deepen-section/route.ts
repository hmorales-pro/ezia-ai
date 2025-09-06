import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Business from '@/models/Business';
import { runDeepenSectionAgent } from '@/lib/agents/deepen-section-agent';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    // Get user from token
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

    const { section, analysisType } = await request.json();

    if (!section || !analysisType) {
      return NextResponse.json(
        { error: 'Section et type d\'analyse requis' },
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

    console.log(`[API] Approfondissement de ${section} pour ${analysisType} - ${business.name}`);

    // Get existing analysis data
    let existingAnalysis;
    switch (analysisType) {
      case 'market':
        existingAnalysis = business.analyses?.market || {};
        break;
      case 'competitor':
        existingAnalysis = business.analyses?.competitor || {};
        break;
      case 'marketing':
        existingAnalysis = business.analyses?.marketing || {};
        break;
      default:
        return NextResponse.json(
          { error: 'Type d\'analyse non valide' },
          { status: 400 }
        );
    }

    // Run deepening agent for the specific section
    const deepenedSection = await runDeepenSectionAgent({
      business: {
        name: business.name,
        industry: business.industry,
        description: business.description
      },
      section,
      analysisType,
      existingAnalysis,
      existingSection: existingAnalysis[section] || existingAnalysis.market_study?.[section]
    });

    // Merge the deepened section with existing analysis
    let updatedAnalysis = { ...existingAnalysis };
    
    // Handle nested structures like market_study
    if (existingAnalysis.market_study && (
      section === 'target_audience' || 
      section === 'pestel_analysis' || 
      section === 'porter_analysis' || 
      section === 'swot_analysis' ||
      section === 'strategic_recommendations'
    )) {
      updatedAnalysis.market_study = {
        ...existingAnalysis.market_study,
        [section]: deepenedSection
      };
    } else {
      updatedAnalysis[section] = deepenedSection;
    }

    // Update the business document
    business.analyses = business.analyses || {};
    business.analyses[analysisType] = updatedAnalysis;
    
    // Add to history
    if (!business.analysisHistory) {
      business.analysisHistory = [];
    }
    
    business.analysisHistory.push({
      type: `${analysisType}_deepen_${section}`,
      timestamp: new Date(),
      data: deepenedSection
    });

    await business.save();

    return NextResponse.json({ 
      success: true,
      deepenedSection,
      section,
      analysisType
    });

  } catch (error) {
    console.error('[API] Erreur approfondissement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'approfondissement de l\'analyse' },
      { status: 500 }
    );
  }
}