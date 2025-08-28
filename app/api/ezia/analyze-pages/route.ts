import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';
import { EziaPageAnalyzer } from '@/lib/ezia-page-analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { businessInfo } = body;

    if (!businessInfo || !businessInfo.name) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Informations d\'entreprise requises' 
      }, { status: 400 });
    }

    // Analyser les besoins de l'entreprise
    const suggestions = await EziaPageAnalyzer.analyzeBusiness(businessInfo);
    
    // Générer le message d'Ezia
    const eziaMessage = EziaPageAnalyzer.generateEziaPrompt(suggestions, businessInfo);

    return NextResponse.json({
      ok: true,
      suggestions,
      eziaMessage,
      recommendedStructure: {
        essential: suggestions.filter(s => s.priority === 'essential'),
        recommended: suggestions.filter(s => s.priority === 'recommended'),
        optional: suggestions.filter(s => s.priority === 'optional')
      }
    });

  } catch (error) {
    console.error('Error analyzing pages:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de l\'analyse' 
    }, { status: 500 });
  }
}