export interface BusinessMetrics {
  completion_score: number;
  tasks_completed: number;
  total_tasks: number;
  recommendations: string[];
}

export function calculateBusinessCompletion(business: any): BusinessMetrics {
  const tasks = [
    {
      name: "Informations de base",
      completed: !!(business.name && business.description && business.industry && business.stage),
      weight: 10
    },
    {
      name: "Site web créé",
      completed: !!business.website_url,
      weight: 25
    },
    {
      name: "Analyse de marché",
      completed: !!(business.market_analysis?.target_audience && business.market_analysis?.value_proposition),
      weight: 20
    },
    {
      name: "Stratégie marketing",
      completed: !!(business.marketing_strategy?.positioning && business.marketing_strategy?.channels?.length > 0),
      weight: 15
    },
    {
      name: "Analyse concurrentielle",
      completed: business.ezia_interactions?.some((i: any) => i.interaction_type === "competitor_analysis"),
      weight: 10
    },
    {
      name: "Calendrier de contenu",
      completed: business.ezia_interactions?.some((i: any) => i.interaction_type === "content_calendar"),
      weight: 10
    },
    {
      name: "Identité de marque",
      completed: business.ezia_interactions?.some((i: any) => i.interaction_type === "branding"),
      weight: 5
    },
    {
      name: "Stratégie réseaux sociaux",
      completed: business.ezia_interactions?.some((i: any) => i.interaction_type === "social_media"),
      weight: 5
    }
  ];

  const completedTasks = tasks.filter(t => t.completed);
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
  const completedWeight = completedTasks.reduce((sum, t) => sum + t.weight, 0);
  const completion_score = Math.round((completedWeight / totalWeight) * 100);

  // Générer des recommandations
  const recommendations: string[] = [];
  
  if (!tasks[1].completed) {
    recommendations.push("Créez votre site web pour établir votre présence en ligne");
  }
  if (!tasks[2].completed) {
    recommendations.push("Réalisez une analyse de marché pour mieux comprendre votre audience");
  }
  if (!tasks[3].completed) {
    recommendations.push("Développez votre stratégie marketing pour accélérer votre croissance");
  }
  if (completion_score < 50) {
    recommendations.push("Complétez les tâches essentielles pour atteindre 50% de progression");
  }

  return {
    completion_score,
    tasks_completed: completedTasks.length,
    total_tasks: tasks.length,
    recommendations: recommendations.slice(0, 3) // Limiter à 3 recommandations
  };
}