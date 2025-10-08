import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { runDeepenSectionAgent } from '@/lib/agents/deepen-section-agent';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const STORAGE_DIR = path.join(process.cwd(), 'data', 'businesses');

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
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { section, analysisType } = await request.json();

    if (!section || !analysisType) {
      return NextResponse.json(
        { error: 'Section et type d\'analyse requis' },
        { status: 400 }
      );
    }

    // Lire le business depuis le fichier
    const businessPath = path.join(STORAGE_DIR, userId, `${businessId}.json`);

    if (!fs.existsSync(businessPath)) {
      return NextResponse.json({ error: 'Business non trouvé' }, { status: 404 });
    }

    const business = JSON.parse(fs.readFileSync(businessPath, 'utf-8'));

    console.log(`[API] Approfondissement de ${section} pour ${analysisType} - ${business.name}`);

    // Get existing analysis data based on the new structure
    let existingAnalysis;
    let existingSection;

    switch (analysisType) {
      case 'market':
        existingAnalysis = business.market_analysis || {};
        // Support both nested market_study structure and flat structure
        if (existingAnalysis.market_study) {
          existingSection = existingAnalysis.market_study[section] || existingAnalysis[section];
        } else {
          existingSection = existingAnalysis[section];
        }
        break;
      case 'marketing':
        existingAnalysis = business.marketing_strategy || {};
        existingSection = existingAnalysis[section];
        break;
      case 'competitor':
        existingAnalysis = business.competitor_analysis || {};
        existingSection = existingAnalysis[section];
        break;
      default:
        return NextResponse.json(
          { error: 'Type d\'analyse non valide' },
          { status: 400 }
        );
    }

    console.log(`[API] Existing section data:`, existingSection ? 'Found' : 'Not found');

    // Run deepening agent for the specific section
    const deepenedSection = await runDeepenSectionAgent({
      business: {
        name: business.name,
        industry: business.industry || 'Services professionnels',
        description: business.description || ''
      },
      section,
      analysisType,
      existingAnalysis,
      existingSection
    });

    console.log(`[API] Deepened section generated successfully`);

    // Merge the deepened section with existing analysis
    let updatedAnalysis = { ...existingAnalysis };

    // Handle nested structures like market_study
    if (analysisType === 'market' && (
      section === 'target_audience' ||
      section === 'pestel_analysis' ||
      section === 'porter_analysis' ||
      section === 'swot_analysis' ||
      section === 'strategic_recommendations'
    )) {
      // If there's already a market_study structure, update it
      if (updatedAnalysis.market_study) {
        updatedAnalysis.market_study = {
          ...updatedAnalysis.market_study,
          [section]: deepenedSection
        };
      } else {
        // Otherwise, create the market_study structure
        updatedAnalysis.market_study = {
          [section]: deepenedSection
        };
      }
    } else {
      updatedAnalysis[section] = deepenedSection;
    }

    // Update the business object
    const fieldMap: Record<string, string> = {
      'market': 'market_analysis',
      'marketing': 'marketing_strategy',
      'competitor': 'competitor_analysis'
    };

    const fieldName = fieldMap[analysisType];
    business[fieldName] = updatedAnalysis;

    // Add timestamp for last update
    business._lastModified = new Date().toISOString();

    // Save back to file
    fs.writeFileSync(businessPath, JSON.stringify(business, null, 2), 'utf-8');

    console.log(`[API] Business updated and saved successfully`);

    return NextResponse.json({
      success: true,
      deepenedSection,
      section,
      analysisType,
      message: `Section ${section} approfondie avec succès`
    });

  } catch (error: any) {
    console.error('[API] Erreur approfondissement:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'approfondissement de l\'analyse',
        details: error.message
      },
      { status: 500 }
    );
  }
}
