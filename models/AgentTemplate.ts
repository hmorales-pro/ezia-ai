import mongoose, { Document, Schema } from 'mongoose';

// Configuration d'un agent
export interface IAgentTemplate {
  // Identification
  agent_id: string;
  name: string;               // Ex: "Ezia", "Marie", "Jean"
  type: 'chief' | 'specialist';
  team?: string;              // Ex: "marketing", "social_media", "market_analysis"
  
  // Description et rôle
  description: string;
  role: string;
  capabilities: string[];
  
  // Configuration IA
  ai_config: {
    model: string;            // Ex: "deepseek-v3", "deepseek-r1"
    provider: string;         // Ex: "fireworks", "nebius"
    temperature?: number;
    max_tokens?: number;
    system_prompt: string;
    use_thinker_mode?: boolean;
  };
  
  // Prompts spécialisés
  prompts: {
    introduction: string;     // Comment l'agent se présente
    analysis: string;         // Prompt pour analyse
    recommendation: string;   // Prompt pour recommandations
    report_generation: string; // Prompt pour générer des rapports
    custom?: Record<string, string>; // Prompts personnalisés
  };
  
  // Outils disponibles
  tools: Array<{
    name: string;
    description: string;
    parameters?: any;
  }>;
  
  // Relations avec autres agents
  relationships: {
    reports_to?: string;      // ID de l'agent supérieur
    manages?: string[];       // IDs des agents subordonnés
    collaborates_with?: string[]; // IDs des agents pairs
  };
  
  // Permissions et limites
  permissions: {
    can_access_external_apis: boolean;
    can_modify_business_data: boolean;
    can_create_content: boolean;
    can_send_notifications: boolean;
    rate_limits?: {
      requests_per_hour?: number;
      tokens_per_day?: number;
    };
  };
  
  // Métadonnées
  is_active: boolean;
  version: string;
  _createdAt: Date;
  _updatedAt: Date;
}

// Schema Mongoose
const AgentTemplateSchema = new Schema<IAgentTemplate>({
  agent_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['chief', 'specialist'],
    required: true 
  },
  team: String,
  
  // Description
  description: { type: String, required: true },
  role: { type: String, required: true },
  capabilities: [{ type: String, required: true }],
  
  // Configuration IA
  ai_config: {
    model: { type: String, required: true },
    provider: { type: String, required: true },
    temperature: { type: Number, default: 0.7 },
    max_tokens: Number,
    system_prompt: { type: String, required: true },
    use_thinker_mode: { type: Boolean, default: false }
  },
  
  // Prompts
  prompts: {
    introduction: { type: String, required: true },
    analysis: { type: String, required: true },
    recommendation: { type: String, required: true },
    report_generation: { type: String, required: true },
    custom: { type: Map, of: String }
  },
  
  // Outils
  tools: [{
    name: String,
    description: String,
    parameters: Schema.Types.Mixed
  }],
  
  // Relations
  relationships: {
    reports_to: String,
    manages: [String],
    collaborates_with: [String]
  },
  
  // Permissions
  permissions: {
    can_access_external_apis: { type: Boolean, default: false },
    can_modify_business_data: { type: Boolean, default: false },
    can_create_content: { type: Boolean, default: true },
    can_send_notifications: { type: Boolean, default: false },
    rate_limits: {
      requests_per_hour: Number,
      tokens_per_day: Number
    }
  },
  
  // Métadonnées
  is_active: { type: Boolean, default: true },
  version: { type: String, default: '1.0.0' }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index
AgentTemplateSchema.index({ type: 1, team: 1 });
AgentTemplateSchema.index({ 'relationships.reports_to': 1 });

export const AgentTemplate = mongoose.models.AgentTemplate || mongoose.model<IAgentTemplate>('AgentTemplate', AgentTemplateSchema);

// Templates par défaut pour Ezia
export const DEFAULT_AGENT_TEMPLATES: Partial<IAgentTemplate>[] = [
  {
    agent_id: 'ezia-001',
    name: 'Ezia',
    type: 'chief',
    description: 'Directrice d\'Ezia, coordonne toutes les équipes d\'agents',
    role: 'Agency Director & User Interface',
    capabilities: [
      'Coordination des équipes',
      'Analyse des besoins utilisateur',
      'Planification stratégique',
      'Synthèse des recommandations',
      'Gestion des priorités'
    ],
    ai_config: {
      model: 'deepseek-v3',
      provider: 'fireworks',
      temperature: 0.7,
      system_prompt: `Tu es Ezia, la directrice d'Ezia. Tu diriges une agence digitale complète composée d'agents IA spécialisés pour aider les entrepreneurs à développer leur présence en ligne. 

Tu es professionnelle, empathique et orientée résultats. Tu parles en français et tu tutoies l'utilisateur pour créer une relation de proximité.

Ton rôle est de:
1. Comprendre les besoins de l'utilisateur
2. Déléguer aux bonnes équipes
3. Synthétiser les analyses
4. Proposer des plans d'action concrets
5. Suivre la progression des objectifs`
    },
    prompts: {
      introduction: "Bonjour ! Je suis Ezia, directrice d'Ezia. Notre agence digitale est là pour t'accompagner dans le développement de ton business en ligne. Mon équipe d'agents spécialisés et moi allons t'aider à analyser ton marché, développer ta stratégie marketing et optimiser ta présence digitale. Dis-moi, quel est ton projet ?",
      analysis: "D'après ce que tu me dis, voici l'analyse de notre agence : [ANALYSIS]. Je vais mobiliser nos agents spécialisés [TEAMS] pour approfondir ces points.",
      recommendation: "Suite à l'analyse de notre agence, voici nos recommandations : [RECOMMENDATIONS]. Nous pouvons commencer par [FIRST_STEP].",
      report_generation: "Voici le rapport complet de notre analyse : [REPORT]. Les prochaines étapes sont : [NEXT_STEPS]."
    },
    permissions: {
      can_access_external_apis: true,
      can_modify_business_data: true,
      can_create_content: true,
      can_send_notifications: true
    }
  }
];