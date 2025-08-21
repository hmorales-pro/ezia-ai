import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { Business } from '@/models/Business';
import dbConnect from '@/lib/mongodb';

// GET /api/me/business/[businessId]/memory - Récupérer la mémoire d'Ezia
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  console.log("[Memory API] GET request received");
  
  try {
    const params = await context.params;
    const { businessId } = params;
    console.log("[Memory API] BusinessId:", businessId);
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      console.log("[Memory API] Unauthorized");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    console.log("[Memory API] UserId:", userId);

    await dbConnect();
    
    // Récupérer le business avec toutes les données
    const business = await Business.findOne({
      business_id: businessId,
      user_id: userId
    }).lean();
    
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    
    // Compiler la mémoire d'Ezia
    const eziaMemory = {
      business_profile: {
        name: business.name,
        description: business.description,
        industry: business.industry,
        stage: business.stage,
        created_at: business._createdAt,
        last_updated: business._updatedAt
      },
      
      collected_insights: {
        business_model: business.business_model || {},
        offerings: business.offerings || [],
        customer_insights: business.customer_insights || {},
        financial_info: business.financial_info || {},
        resources: business.resources || {}
      },
      
      interaction_history: {
        total_interactions: business.ezia_interactions?.length || 0,
        recent_interactions: business.ezia_interactions?.slice(-10) || [],
        interaction_summary: summarizeInteractions(business.ezia_interactions || [])
      },
      
      analysis_results: {
        market_analysis: business.market_analysis || null,
        competitor_analysis: business.competitor_analysis || null,
        swot_analysis: extractSwotFromAnalyses(business),
        personas: business.customer_insights?.personas || [],
        business_plan_metrics: extractBusinessPlanMetrics(business)
      },
      
      content_calendar: {
        total_posts: business.content_calendar?.posts?.length || 0,
        recent_posts: business.content_calendar?.posts?.slice(-5) || [],
        upcoming_posts: getUpcomingPosts(business.content_calendar?.posts || [])
      },
      
      performance_metrics: {
        completion_score: calculateCompletionScore(business),
        engagement_score: calculateEngagementScore(business),
        content_production_rate: calculateContentRate(business),
        analysis_depth: calculateAnalysisDepth(business)
      },
      
      learning_points: extractLearningPoints(business),
      
      recommendations: {
        immediate_actions: generateImmediateActions(business),
        data_gaps: identifyDataGaps(business),
        growth_opportunities: identifyGrowthOpportunities(business)
      },
      
      conversation_context: {
        last_conversation_summary: getLastConversationSummary(business),
        key_topics_discussed: extractKeyTopics(business),
        unresolved_questions: identifyUnresolvedQuestions(business)
      }
    };
    
    return NextResponse.json({
      success: true,
      memory: eziaMemory,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error retrieving Ezia memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/me/business/[businessId]/memory/search - Rechercher dans la mémoire
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;

    const { query, type = "all" } = await request.json();
    
    await dbConnect();
    
    const business = await Business.findOne({
      business_id: businessId,
      user_id: userId
    }).lean();
    
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    
    // Rechercher dans la mémoire selon le type
    const searchResults = searchMemory(business, query, type);
    
    return NextResponse.json({
      success: true,
      results: searchResults,
      query: query,
      type: type
    });
    
  } catch (error) {
    console.error("Error searching Ezia memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires

function summarizeInteractions(interactions: any[]): any {
  const summary = {
    by_agent: {} as any,
    by_type: {} as any,
    key_decisions: [],
    timeline: []
  };
  
  interactions.forEach(interaction => {
    // Par agent
    if (!summary.by_agent[interaction.agent]) {
      summary.by_agent[interaction.agent] = 0;
    }
    summary.by_agent[interaction.agent]++;
    
    // Par type
    if (!summary.by_type[interaction.interaction_type]) {
      summary.by_type[interaction.interaction_type] = 0;
    }
    summary.by_type[interaction.interaction_type]++;
    
    // Décisions clés
    if (interaction.interaction_type === 'decision' || interaction.summary?.includes('décision')) {
      summary.key_decisions.push({
        date: interaction.timestamp,
        decision: interaction.summary
      });
    }
  });
  
  // Timeline des interactions majeures
  summary.timeline = interactions
    .filter(i => i.interaction_type === 'analysis' || i.interaction_type === 'strategy')
    .map(i => ({
      date: i.timestamp,
      type: i.interaction_type,
      summary: i.summary
    }))
    .slice(-5);
  
  return summary;
}

function extractSwotFromAnalyses(business: any): any {
  if (business.market_analysis?.swot_analysis) {
    return business.market_analysis.swot_analysis;
  }
  
  // Construire un SWOT basique à partir des données disponibles
  return {
    strengths: business.business_model?.unique_selling_points || [],
    weaknesses: identifyWeaknesses(business),
    opportunities: business.market_analysis?.executive_summary?.key_findings || [],
    threats: business.competitor_analysis?.market_threats || []
  };
}

function extractBusinessPlanMetrics(business: any): any {
  return {
    revenue_projection: business.financial_info?.target_monthly_revenue 
      ? `€${business.financial_info.target_monthly_revenue}/mois` 
      : "Non défini",
    offerings_count: business.offerings?.length || 0,
    average_price: calculateAveragePrice(business.offerings),
    margin_analysis: analyzeMargins(business.offerings),
    market_size: business.market_analysis?.market_overview?.market_size || "Non analysé"
  };
}

function getUpcomingPosts(posts: any[]): any[] {
  const now = new Date();
  return posts
    .filter(post => new Date(post.scheduledDate) > now)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 10);
}

function calculateCompletionScore(business: any): number {
  let score = 0;
  const checks = [
    { condition: business.business_model?.type, weight: 10 },
    { condition: business.offerings?.length > 0, weight: 15 },
    { condition: business.customer_insights?.ideal_customer_profile, weight: 15 },
    { condition: business.financial_info?.target_monthly_revenue, weight: 10 },
    { condition: business.market_analysis, weight: 20 },
    { condition: business.competitor_analysis, weight: 15 },
    { condition: business.content_calendar?.posts?.length > 0, weight: 10 },
    { condition: business.customer_insights?.personas?.length > 0, weight: 5 }
  ];
  
  checks.forEach(check => {
    if (check.condition) score += check.weight;
  });
  
  return score;
}

function calculateEngagementScore(business: any): number {
  const interactions = business.ezia_interactions?.length || 0;
  const recentInteractions = business.ezia_interactions?.filter((i: any) => {
    const daysSince = (Date.now() - new Date(i.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length || 0;
  
  const baseScore = Math.min(interactions * 2, 50);
  const recencyBonus = Math.min(recentInteractions * 10, 50);
  
  return baseScore + recencyBonus;
}

function calculateContentRate(business: any): string {
  const posts = business.content_calendar?.posts || [];
  if (posts.length === 0) return "Aucun contenu";
  
  const sortedPosts = posts.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  if (sortedPosts.length < 2) return "Démarrage";
  
  const firstPost = new Date(sortedPosts[sortedPosts.length - 1].createdAt);
  const lastPost = new Date(sortedPosts[0].createdAt);
  const daysDiff = (lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) return `${posts.length} posts/jour`;
  
  const rate = posts.length / daysDiff;
  if (rate > 1) return `${rate.toFixed(1)} posts/jour`;
  if (rate > 0.14) return `${(rate * 7).toFixed(1)} posts/semaine`;
  return `${(rate * 30).toFixed(1)} posts/mois`;
}

function calculateAnalysisDepth(business: any): string {
  let depth = 0;
  
  if (business.market_analysis) depth++;
  if (business.market_analysis?.pestel_analysis) depth++;
  if (business.market_analysis?.porter_five_forces) depth++;
  if (business.competitor_analysis) depth++;
  if (business.customer_insights?.personas?.length > 0) depth++;
  if (business.financial_info?.target_monthly_revenue) depth++;
  
  if (depth >= 5) return "Très approfondie";
  if (depth >= 3) return "Approfondie";
  if (depth >= 1) return "Basique";
  return "Non démarrée";
}

function extractLearningPoints(business: any): string[] {
  const learnings = [];
  
  // Learnings from offerings
  if (business.offerings?.length > 0) {
    const avgPrice = calculateAveragePrice(business.offerings);
    learnings.push(`Prix moyen des offres: €${avgPrice}`);
    
    const margins = business.offerings
      .filter((o: any) => o.margin)
      .map((o: any) => o.margin);
    if (margins.length > 0) {
      const avgMargin = margins.reduce((a: number, b: number) => a + b, 0) / margins.length;
      learnings.push(`Marge moyenne: ${avgMargin.toFixed(1)}%`);
    }
  }
  
  // Learnings from customer insights
  if (business.customer_insights?.customer_pain_points?.length > 0) {
    learnings.push(`${business.customer_insights.customer_pain_points.length} points de douleur identifiés`);
  }
  
  // Learnings from market analysis
  if (business.market_analysis?.market_overview?.growth_rate) {
    learnings.push(`Croissance du marché: ${business.market_analysis.market_overview.growth_rate}`);
  }
  
  // Learnings from interactions
  const conversionRate = calculateConversionInsights(business);
  if (conversionRate) learnings.push(conversionRate);
  
  return learnings;
}

function generateImmediateActions(business: any): string[] {
  const actions = [];
  
  // Actions basées sur les données manquantes
  if (!business.offerings || business.offerings.length === 0) {
    actions.push("Définir et documenter vos offres principales");
  }
  
  if (!business.customer_insights?.ideal_customer_profile) {
    actions.push("Créer le profil de votre client idéal");
  }
  
  if (!business.financial_info?.target_monthly_revenue) {
    actions.push("Fixer des objectifs de revenus mensuels");
  }
  
  if (business.offerings?.some((o: any) => !o.cost_breakdown)) {
    actions.push("Calculer les coûts détaillés pour optimiser les marges");
  }
  
  if (!business.content_calendar?.posts?.length) {
    actions.push("Planifier votre premier contenu marketing");
  }
  
  // Actions basées sur les opportunités
  if (business.market_analysis?.strategic_recommendations?.immediate_actions) {
    const immediateActions = business.market_analysis.strategic_recommendations.immediate_actions;
    actions.push(...immediateActions.slice(0, 2).map((a: any) => a.action));
  }
  
  return actions.slice(0, 5);
}

function identifyDataGaps(business: any): string[] {
  const gaps = [];
  
  const dataPoints = {
    "Modèle économique": business.business_model?.type,
    "Offres détaillées": business.offerings?.length > 0,
    "Profil client": business.customer_insights?.ideal_customer_profile,
    "Points de douleur": business.customer_insights?.customer_pain_points?.length > 0,
    "Objectifs financiers": business.financial_info?.target_monthly_revenue,
    "Analyse de marché": business.market_analysis,
    "Analyse concurrentielle": business.competitor_analysis,
    "Personas détaillés": business.customer_insights?.personas?.length > 0,
    "Stratégie de prix": business.financial_info?.pricing_strategy,
    "Canaux d'acquisition": business.customer_insights?.acquisition_channels?.length > 0
  };
  
  Object.entries(dataPoints).forEach(([key, value]) => {
    if (!value) gaps.push(key);
  });
  
  return gaps;
}

function identifyGrowthOpportunities(business: any): string[] {
  const opportunities = [];
  
  // Opportunités basées sur l'analyse de marché
  if (business.market_analysis?.swot_analysis?.opportunities) {
    opportunities.push(...business.market_analysis.swot_analysis.opportunities.slice(0, 2));
  }
  
  // Opportunités basées sur les marges
  const highMarginProducts = business.offerings?.filter((o: any) => o.margin > 50);
  if (highMarginProducts?.length > 0) {
    opportunities.push("Focus sur les produits à haute marge pour maximiser la rentabilité");
  }
  
  // Opportunités basées sur le stage
  if (business.stage === "growth") {
    opportunities.push("Explorer l'expansion géographique");
    opportunities.push("Développer des partenariats stratégiques");
  }
  
  return opportunities.slice(0, 4);
}

function getLastConversationSummary(business: any): string {
  const lastInteraction = business.ezia_interactions
    ?.filter((i: any) => i.interaction_type === 'deep_conversation')
    ?.slice(-1)[0];
  
  return lastInteraction?.summary || "Aucune conversation récente";
}

function extractKeyTopics(business: any): string[] {
  const topics = new Set<string>();
  
  // Topics from interactions
  business.ezia_interactions?.forEach((interaction: any) => {
    if (interaction.content) {
      // Extraire les mots-clés du contenu
      const content = interaction.content.toLowerCase();
      if (content.includes('prix')) topics.add('Stratégie de prix');
      if (content.includes('client')) topics.add('Profil client');
      if (content.includes('concurrent')) topics.add('Analyse concurrentielle');
      if (content.includes('marketing')) topics.add('Stratégie marketing');
      if (content.includes('vente')) topics.add('Processus de vente');
    }
  });
  
  // Topics from collected data
  if (business.offerings?.length > 0) topics.add('Offres et produits');
  if (business.financial_info?.target_monthly_revenue) topics.add('Objectifs financiers');
  if (business.customer_insights?.personas?.length > 0) topics.add('Personas clients');
  
  return Array.from(topics);
}

function identifyUnresolvedQuestions(business: any): string[] {
  const questions = [];
  
  // Questions basées sur les données incomplètes
  if (business.offerings?.some((o: any) => !o.cost_breakdown)) {
    questions.push("Quels sont les coûts détaillés de vos offres?");
  }
  
  if (!business.customer_insights?.acquisition_channels?.length) {
    questions.push("Comment vos clients vous trouvent-ils actuellement?");
  }
  
  if (!business.resources?.team_size) {
    questions.push("Quelle est la taille et composition de votre équipe?");
  }
  
  if (business.financial_info?.target_monthly_revenue && !business.financial_info?.monthly_revenue) {
    questions.push("Quel est votre revenu mensuel actuel?");
  }
  
  return questions;
}

function searchMemory(business: any, query: string, type: string): any[] {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  // Recherche dans les interactions
  if (type === "all" || type === "interactions") {
    business.ezia_interactions?.forEach((interaction: any) => {
      if (interaction.summary?.toLowerCase().includes(lowerQuery) ||
          interaction.content?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "interaction",
          date: interaction.timestamp,
          agent: interaction.agent,
          summary: interaction.summary,
          relevance: calculateRelevance(interaction.summary + interaction.content, lowerQuery)
        });
      }
    });
  }
  
  // Recherche dans les offres
  if (type === "all" || type === "offerings") {
    business.offerings?.forEach((offering: any) => {
      if (offering.name?.toLowerCase().includes(lowerQuery) ||
          offering.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "offering",
          name: offering.name,
          description: offering.description,
          price: offering.price,
          relevance: calculateRelevance(offering.name + offering.description, lowerQuery)
        });
      }
    });
  }
  
  // Recherche dans le contenu
  if (type === "all" || type === "content") {
    business.content_calendar?.posts?.forEach((post: any) => {
      if (post.content?.toLowerCase().includes(lowerQuery) ||
          post.title?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "content",
          title: post.title || "Sans titre",
          platform: post.platform,
          date: post.scheduledDate,
          relevance: calculateRelevance(post.content + post.title, lowerQuery)
        });
      }
    });
  }
  
  // Trier par pertinence
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 20);
}

function calculateRelevance(text: string, query: string): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (lowerText === lowerQuery) return 100;
  
  // Contains exact query
  if (lowerText.includes(lowerQuery)) return 80;
  
  // Contains all words from query
  const queryWords = lowerQuery.split(' ');
  const containsAllWords = queryWords.every(word => lowerText.includes(word));
  if (containsAllWords) return 60;
  
  // Contains some words
  const matchingWords = queryWords.filter(word => lowerText.includes(word)).length;
  return (matchingWords / queryWords.length) * 40;
}

function identifyWeaknesses(business: any): string[] {
  const weaknesses = [];
  
  if (!business.offerings || business.offerings.length === 0) {
    weaknesses.push("Offres non définies");
  }
  
  if (business.stage === "idea") {
    weaknesses.push("Pas encore de traction marché");
  }
  
  if (!business.customer_insights?.ideal_customer_profile) {
    weaknesses.push("Profil client non défini");
  }
  
  return weaknesses;
}

function calculateAveragePrice(offerings: any[]): number {
  if (!offerings || offerings.length === 0) return 0;
  const prices = offerings.map(o => o.price || 0);
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

function analyzeMargins(offerings: any[]): string {
  if (!offerings || offerings.length === 0) return "Pas de données";
  
  const margins = offerings
    .filter(o => o.margin)
    .map(o => o.margin);
  
  if (margins.length === 0) return "Marges non calculées";
  
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
  const minMargin = Math.min(...margins);
  const maxMargin = Math.max(...margins);
  
  return `Moyenne: ${avgMargin.toFixed(1)}% (Min: ${minMargin}%, Max: ${maxMargin}%)`;
}

function calculateConversionInsights(business: any): string | null {
  // Exemple de calcul basé sur les interactions
  const totalInteractions = business.ezia_interactions?.length || 0;
  const conversions = business.ezia_interactions?.filter((i: any) => 
    i.interaction_type === 'conversion' || i.summary?.includes('client acquis')
  ).length || 0;
  
  if (totalInteractions > 10 && conversions > 0) {
    const rate = (conversions / totalInteractions * 100).toFixed(1);
    return `Taux de conversion estimé: ${rate}%`;
  }
  
  return null;
}