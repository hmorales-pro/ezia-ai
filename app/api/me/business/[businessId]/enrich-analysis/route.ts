import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { generateWithMistralAPI } from '@/lib/mistral-ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { newData } = await request.json();
    
    console.log(`[Enrich Analysis] Starting enriched analysis for business ${businessId}`);
    
    // Générer des insights approfondis basés sur les nouvelles données
    if (MISTRAL_API_KEY) {
      try {
        // 1. Analyse de pricing et rentabilité
        const pricingInsights = await analyzePricingStrategy(newData, MISTRAL_API_KEY);
        
        // 2. Recommandations business personnalisées
        const businessRecommendations = await generateBusinessRecommendations(newData, MISTRAL_API_KEY);
        
        // 3. Stratégie de contenu ultra-ciblée
        const contentStrategy = await generateTargetedContentStrategy(newData, MISTRAL_API_KEY);
        
        // 4. Plan d'action concret
        const actionPlan = await generateActionPlan(newData, MISTRAL_API_KEY);
        
        return NextResponse.json({
          success: true,
          insights: {
            pricing: pricingInsights,
            recommendations: businessRecommendations,
            contentStrategy: contentStrategy,
            actionPlan: actionPlan
          }
        });
        
      } catch (error) {
        console.error("[Enrich Analysis] AI analysis failed:", error);
      }
    }
    
    // Fallback : insights basiques
    return NextResponse.json({
      success: true,
      insights: generateBasicInsights(newData)
    });
    
  } catch (error) {
    console.error("Error in enriched analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function analyzePricingStrategy(data: any, apiKey: string) {
  const { offerings, financial_info, business_model } = data;
  
  if (!offerings || offerings.length === 0) return null;
  
  const prompt = `En tant qu'expert en stratégie de prix, analyse ces données business:

Offres:
${offerings.map((o: any) => `- ${o.name}: ${o.price}€ (coût: ${o.cost_breakdown ? Object.values(o.cost_breakdown).reduce((a: number, b: any) => a + b, 0) : 'N/A'}€, marge: ${o.margin || 'N/A'}%)`).join('\n')}

Objectif CA mensuel: ${financial_info?.target_monthly_revenue || 'Non défini'}€
CA actuel: ${financial_info?.monthly_revenue || 'Non défini'}€

Fournis:
1. Analyse de la stratégie de prix actuelle
2. Recommandations pour optimiser les marges
3. Suggestions de nouveaux modèles de pricing
4. Calcul du nombre de ventes nécessaires pour atteindre les objectifs

Format: JSON structuré`;

  const systemContext = "Tu es un expert en pricing et rentabilité business. Réponds uniquement en JSON valide.";
  
  const response = await generateWithMistralAPI(prompt, systemContext, apiKey);
  
  if (response.success) {
    try {
      return JSON.parse(response.content);
    } catch {
      return { analysis: response.content };
    }
  }
  
  return null;
}

async function generateBusinessRecommendations(data: any, apiKey: string) {
  const { business_model, customer_insights, offerings, resources } = data;
  
  const prompt = `Analyse ce business et fournis des recommandations concrètes:

Type: ${business_model?.type}
USPs: ${business_model?.unique_selling_points?.join(', ') || 'À définir'}
Client idéal: ${customer_insights?.ideal_customer_profile || 'Non défini'}
Problèmes résolus: ${customer_insights?.customer_pain_points?.join(', ') || 'À identifier'}
Ressources: Équipe de ${resources?.team_size || '?'} personnes

Génère:
1. 5 actions prioritaires pour les 30 prochains jours
2. 3 opportunités de croissance rapide
3. 3 risques à surveiller
4. Stratégie de différenciation

Format: JSON structuré avec actions concrètes`;

  const systemContext = "Tu es un consultant senior en stratégie business. Sois concret et actionnable.";
  
  const response = await generateWithMistralAPI(prompt, systemContext, apiKey);
  
  if (response.success) {
    try {
      return JSON.parse(response.content);
    } catch {
      return { recommendations: response.content };
    }
  }
  
  return null;
}

async function generateTargetedContentStrategy(data: any, apiKey: string) {
  const { business_model, customer_insights, offerings } = data;
  
  const prompt = `Crée une stratégie de contenu ultra-personnalisée:

Business: ${business_model?.type === 'product' ? 'Vente de produits' : 'Services'}
Offres principales: ${offerings?.map((o: any) => o.name).join(', ') || 'À définir'}
Client cible: ${customer_insights?.ideal_customer_profile || 'À définir'}
Points de douleur: ${customer_insights?.customer_pain_points?.join(', ') || 'À identifier'}
Canaux d'acquisition: ${customer_insights?.acquisition_channels?.join(', ') || 'Tous'}

Génère:
1. 10 idées de contenu spécifiques (pas de placeholders)
2. Calendrier éditorial sur 4 semaines
3. Templates de messages par canal
4. Mots-clés et hashtags pertinents
5. Métriques à suivre

Format: JSON avec contenu prêt à publier`;

  const systemContext = "Tu es un expert en content marketing. Crée du contenu spécifique et publiable.";
  
  const response = await generateWithMistralAPI(prompt, systemContext, apiKey);
  
  if (response.success) {
    try {
      return JSON.parse(response.content);
    } catch {
      return { strategy: response.content };
    }
  }
  
  return null;
}

async function generateActionPlan(data: any, apiKey: string) {
  const { financial_info, business_model, offerings } = data;
  
  const revenueGap = (financial_info?.target_monthly_revenue || 0) - (financial_info?.monthly_revenue || 0);
  
  const prompt = `Crée un plan d'action concret pour ce business:

Écart de CA à combler: ${revenueGap}€/mois
Type de business: ${business_model?.type}
Prix moyen: ${offerings?.[0]?.price || 'N/A'}€

Génère un plan SMART sur 90 jours:
1. Semaines 1-2: Actions immédiates
2. Semaines 3-4: Mise en place des processus
3. Mois 2: Montée en puissance
4. Mois 3: Optimisation et scale

Pour chaque action:
- Quoi exactement
- Comment
- Résultat attendu
- Métrique de succès

Format: JSON structuré par timeline`;

  const systemContext = "Tu es un coach business orienté résultats. Sois ultra-précis et mesurable.";
  
  const response = await generateWithMistralAPI(prompt, systemContext, apiKey);
  
  if (response.success) {
    try {
      return JSON.parse(response.content);
    } catch {
      return { plan: response.content };
    }
  }
  
  return null;
}

function generateBasicInsights(data: any) {
  const { offerings, financial_info, customer_insights } = data;
  
  // Calculs basiques
  const avgPrice = offerings?.reduce((sum: number, o: any) => sum + (o.price || 0), 0) / (offerings?.length || 1);
  const avgMargin = offerings?.reduce((sum: number, o: any) => sum + (o.margin || 0), 0) / (offerings?.length || 1);
  const revenueGap = (financial_info?.target_monthly_revenue || 0) - (financial_info?.monthly_revenue || 0);
  const salesNeeded = revenueGap > 0 && avgPrice > 0 ? Math.ceil(revenueGap / avgPrice) : 0;
  
  return {
    pricing: {
      current_avg_price: avgPrice,
      current_avg_margin: avgMargin,
      recommendation: avgMargin < 30 ? "Augmentez vos prix ou réduisez vos coûts pour améliorer la rentabilité" : "Marges saines, focus sur le volume"
    },
    recommendations: {
      immediate_actions: [
        "Définir clairement votre proposition de valeur unique",
        "Créer du contenu ciblé pour votre client idéal",
        "Mettre en place un système de suivi des métriques"
      ],
      growth_opportunities: [
        "Développer une offre premium avec plus de valeur ajoutée",
        "Explorer les partenariats stratégiques",
        "Automatiser les processus répétitifs"
      ]
    },
    metrics: {
      revenue_gap: revenueGap,
      sales_needed_monthly: salesNeeded,
      suggested_focus: revenueGap > 0 ? "acquisition" : "retention"
    }
  };
}