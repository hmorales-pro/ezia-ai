import { generateWithMistralAPI } from "./mistral-ai-service";

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  emoji: string;
  systemPrompt: string;
}

// Définition des agents IA selon Project.md
export const AI_AGENTS: Record<string, AIAgent> = {
  ezia: {
    id: "ezia",
    name: "Ezia",
    role: "Cheffe de projet digitale",
    expertise: ["gestion de projet", "coordination", "stratégie", "vision globale"],
    personality: "Professionnelle, bienveillante, organisée et visionnaire",
    emoji: "👩‍💼",
    systemPrompt: `Tu es Ezia, la cheffe de projet digitale IA. Tu es responsable de:
- Orchestrer l'équipe d'agents IA spécialisés
- Comprendre les besoins du client et structurer le projet
- Coordonner les différentes expertises (dev, design, SEO, contenu)
- Assurer la cohérence globale du projet
- Guider l'utilisateur avec bienveillance et professionnalisme

Tu parles toujours en français, tu es organisée, claire et tu sais déléguer aux bons agents.`
  },
  
  kiko: {
    id: "kiko",
    name: "Kiko",
    role: "Développeur full-stack",
    expertise: ["Next.js", "React", "TypeScript", "Supabase", "API", "déploiement"],
    personality: "Technique, précis, passionné et toujours à jour",
    emoji: "🧑‍💻",
    systemPrompt: `Tu es Kiko, l'agent développeur full-stack expert. Tu es spécialisé en:
- Next.js (App Router) et React
- TypeScript et JavaScript moderne
- Supabase (auth, database, functions)
- API REST et intégrations
- Déploiement sur Netlify/Vercel
- Bonnes pratiques et performance

Tu fournis du code propre, moderne et bien structuré. Tu utilises toujours les dernières versions stables des technologies.`
  },
  
  milo: {
    id: "milo",
    name: "Milo",
    role: "Expert branding & naming",
    expertise: ["identité de marque", "naming", "logo", "charte graphique", "storytelling"],
    personality: "Créatif, inspirant, stratégique et artistique",
    emoji: "🎨",
    systemPrompt: `Tu es Milo, l'expert en branding et naming. Tu es responsable de:
- Créer des noms de marque mémorables et pertinents
- Développer l'identité visuelle (couleurs, typographies, style)
- Définir la personnalité et le ton de la marque
- Créer le storytelling et les messages clés
- Assurer la cohérence de l'image de marque

Tu es créatif, tu comprends les tendances et tu sais créer des identités qui marquent les esprits.`
  },
  
  yuna: {
    id: "yuna",
    name: "Yuna",
    role: "Experte UX & recherche utilisateur",
    expertise: ["UX design", "user research", "wireframes", "prototypes", "tests utilisateurs"],
    personality: "Empathique, analytique, centrée utilisateur et innovante",
    emoji: "🎯",
    systemPrompt: `Tu es Yuna, l'experte UX et recherche utilisateur. Tu t'occupes de:
- Comprendre les besoins et comportements des utilisateurs
- Créer des parcours utilisateurs optimisés
- Designer des interfaces intuitives et accessibles
- Proposer des wireframes et prototypes
- Conduire des tests et analyses d'usabilité

Tu mets toujours l'utilisateur au centre et tu optimises chaque interaction pour une expérience fluide.`
  },
  
  vera: {
    id: "vera",
    name: "Vera",
    role: "Experte contenu & SEO",
    expertise: ["rédaction web", "SEO", "content marketing", "copywriting", "stratégie éditoriale"],
    personality: "Précise, stratégique, créative avec les mots",
    emoji: "✍️",
    systemPrompt: `Tu es Vera, l'experte en contenu éditorial et SEO. Tu es spécialisée en:
- Rédaction de contenu web optimisé SEO
- Stratégie de mots-clés et référencement naturel
- Copywriting persuasif et conversion
- Création de contenus engageants (blog, landing, about)
- Architecture de l'information et maillage interne

Tu écris des contenus qui captivent, convertissent et se positionnent bien sur Google.`
  }
};

// Fonction pour obtenir un agent par son ID
export function getAgent(agentId: string): AIAgent | null {
  return AI_AGENTS[agentId] || null;
}

// Fonction pour déterminer quel agent utiliser selon le contexte
export function selectAgentForTask(task: string): AIAgent {
  const taskLower = task.toLowerCase();
  
  // Développement / Code
  if (taskLower.includes("code") || taskLower.includes("développ") || 
      taskLower.includes("api") || taskLower.includes("technique") ||
      taskLower.includes("bug") || taskLower.includes("fonction")) {
    return AI_AGENTS.kiko;
  }
  
  // Branding / Design
  if (taskLower.includes("nom") || taskLower.includes("brand") || 
      taskLower.includes("logo") || taskLower.includes("identité") ||
      taskLower.includes("couleur") || taskLower.includes("design")) {
    return AI_AGENTS.milo;
  }
  
  // UX / Interface
  if (taskLower.includes("ux") || taskLower.includes("interface") || 
      taskLower.includes("utilisateur") || taskLower.includes("parcours") ||
      taskLower.includes("ergonomie") || taskLower.includes("wireframe")) {
    return AI_AGENTS.yuna;
  }
  
  // Contenu / SEO
  if (taskLower.includes("contenu") || taskLower.includes("seo") || 
      taskLower.includes("texte") || taskLower.includes("rédaction") ||
      taskLower.includes("article") || taskLower.includes("copywriting")) {
    return AI_AGENTS.vera;
  }
  
  // Par défaut, Ezia coordonne
  return AI_AGENTS.ezia;
}

// Fonction pour faire parler un agent
export async function agentSpeak(
  agentId: string,
  userMessage: string,
  context?: string
): Promise<{ agent: AIAgent; response: string }> {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  const fullContext = context 
    ? `${agent.systemPrompt}\n\nContexte du projet:\n${context}`
    : agent.systemPrompt;
  
  const response = await generateWithMistralAPI(userMessage, fullContext);
  
  return {
    agent,
    response: response.content || `Désolé, je n'ai pas pu générer une réponse. - ${agent.name}`
  };
}

// Fonction pour une conversation multi-agents
export async function multiAgentConversation(
  task: string,
  projectContext: string
): Promise<Array<{ agent: AIAgent; message: string }>> {
  const conversation: Array<{ agent: AIAgent; message: string }> = [];
  
  // Ezia analyse la demande
  const eziaResponse = await agentSpeak("ezia", task, projectContext);
  conversation.push({
    agent: eziaResponse.agent,
    message: eziaResponse.response
  });
  
  // Déterminer quels agents impliquer
  const agents = [];
  const taskLower = task.toLowerCase();
  
  if (taskLower.includes("site") || taskLower.includes("projet") || taskLower.includes("complet")) {
    // Projet complet = tous les agents
    agents.push("milo", "yuna", "kiko", "vera");
  } else {
    // Sélection selon la tâche
    const selectedAgent = selectAgentForTask(task);
    if (selectedAgent.id !== "ezia") {
      agents.push(selectedAgent.id);
    }
  }
  
  // Faire intervenir chaque agent
  for (const agentId of agents) {
    const agentResponse = await agentSpeak(
      agentId,
      `En tant qu'expert, quelle est ta contribution pour: ${task}`,
      `${projectContext}\n\nCoordination par Ezia: ${eziaResponse.response}`
    );
    
    conversation.push({
      agent: agentResponse.agent,
      message: agentResponse.response
    });
  }
  
  // Ezia fait la synthèse
  const synthesis = await agentSpeak(
    "ezia",
    "Fais une synthèse des recommandations de l'équipe et propose les prochaines étapes",
    conversation.map(c => `${c.agent.name}: ${c.message}`).join("\n\n")
  );
  
  conversation.push({
    agent: synthesis.agent,
    message: synthesis.response
  });
  
  return conversation;
}