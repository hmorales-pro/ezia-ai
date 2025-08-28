import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth-simple';

interface EcosystemAnalysis {
  suggestions: string[];
  reasoning: string;
  priority: Record<string, number>;
}

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
    const { businessInfo, currentFeatures, siteType } = body;

    // Analyser le type d'entreprise et suggérer des fonctionnalités
    const analysis = analyzeBusinessEcosystem(businessInfo, currentFeatures || [], siteType);

    return NextResponse.json({
      ok: true,
      suggestions: analysis.suggestions,
      reasoning: analysis.reasoning,
      priority: analysis.priority
    });

  } catch (error) {
    console.error('Error analyzing ecosystem:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors de l\'analyse' 
    }, { status: 500 });
  }
}

function analyzeBusinessEcosystem(
  businessInfo: any, 
  currentFeatures: string[], 
  siteType: string
): EcosystemAnalysis {
  const suggestions: string[] = [];
  const priority: Record<string, number> = {};
  let reasoning = '';

  const { name, description, industry, targetAudience } = businessInfo;
  const businessText = `${description || ''} ${industry || ''} ${targetAudience || ''}`.toLowerCase();

  // Analyse basée sur l'industrie
  if (industry) {
    const industryNorm = industry.toLowerCase();
    
    if (industryNorm.includes('restaurant') || industryNorm.includes('food')) {
      if (!currentFeatures.includes('booking')) {
        suggestions.push('booking');
        priority['booking'] = 9;
        reasoning += 'Un système de réservation est essentiel pour un restaurant. ';
      }
      if (!currentFeatures.includes('social')) {
        suggestions.push('social');
        priority['social'] = 7;
        reasoning += 'Les réseaux sociaux aident à partager vos plats et événements. ';
      }
    }

    if (industryNorm.includes('commerce') || industryNorm.includes('boutique') || industryNorm.includes('shop')) {
      if (!currentFeatures.includes('shop')) {
        suggestions.push('shop');
        priority['shop'] = 10;
        reasoning += 'Une boutique en ligne augmentera vos ventes. ';
      }
      if (!currentFeatures.includes('analytics')) {
        suggestions.push('analytics');
        priority['analytics'] = 8;
        reasoning += 'Les analytics vous aideront à comprendre vos clients. ';
      }
    }

    if (industryNorm.includes('service') || industryNorm.includes('consultant')) {
      if (!currentFeatures.includes('booking')) {
        suggestions.push('booking');
        priority['booking'] = 8;
        reasoning += 'Permettez à vos clients de prendre rendez-vous en ligne. ';
      }
      if (!currentFeatures.includes('portfolio')) {
        suggestions.push('portfolio');
        priority['portfolio'] = 7;
        reasoning += 'Montrez vos réalisations pour convaincre de nouveaux clients. ';
      }
    }
  }

  // Analyse basée sur le contenu
  if (businessText.includes('blog') || businessText.includes('article') || businessText.includes('contenu')) {
    if (!currentFeatures.includes('blog')) {
      suggestions.push('blog');
      priority['blog'] = 8;
      reasoning += 'Un blog améliorera votre référencement et votre expertise. ';
    }
  }

  if (businessText.includes('membre') || businessText.includes('client') || businessText.includes('privé')) {
    if (!currentFeatures.includes('members')) {
      suggestions.push('members');
      priority['members'] = 6;
      reasoning += 'Un espace membres fidélisera votre clientèle. ';
    }
  }

  // Suggestions générales basées sur le type de site
  if (siteType === 'simple' && suggestions.length === 0) {
    // Suggestions par défaut pour sites simples
    if (!currentFeatures.includes('blog')) {
      suggestions.push('blog');
      priority['blog'] = 7;
    }
    if (!currentFeatures.includes('social')) {
      suggestions.push('social');
      priority['social'] = 6;
    }
    reasoning = 'Je recommande de commencer par un blog pour le SEO et l\'intégration des réseaux sociaux pour la visibilité.';
  }

  // Limiter à 3-4 suggestions max
  const topSuggestions = suggestions
    .sort((a, b) => (priority[b] || 0) - (priority[a] || 0))
    .slice(0, 4);

  return {
    suggestions: topSuggestions,
    reasoning: reasoning || 'Voici mes recommandations basées sur votre activité.',
    priority
  };
}