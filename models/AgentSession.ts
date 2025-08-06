import mongoose, { Document, Schema } from 'mongoose';

// Types d'agents dans le système Ezia
export type AgentType = 'ezia' | 'market_analyst' | 'marketing_chief' | 'social_media_chief' | 'business_dev' | 'specialist';

// Interface pour une session d'agent
export interface IAgentSession {
  // Identifiants
  session_id: string;
  business_id: string;
  user_id: string;
  
  // Agent impliqué
  agent: {
    name: string;           // Nom de l'agent (Ezia, etc.)
    type: AgentType;
    team?: string;          // Équipe si c'est un spécialiste
  };
  
  // Contexte de la session
  context: {
    objective: string;      // Objectif de la session
    initial_request: string; // Demande initiale de l'utilisateur
    business_context: any;  // Snapshot du contexte business
  };
  
  // Conversation
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
      agent_name?: string;
      thinking_process?: string;  // Pour les modèles "thinker"
      tools_used?: string[];
      confidence?: number;
    };
  }>;
  
  // Résultats et actions
  results: {
    summary: string;
    key_findings?: string[];
    recommendations?: string[];
    action_items?: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      assigned_to?: string;
      due_date?: Date;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
    deliverables?: Array<{
      type: string;         // 'report', 'content', 'strategy', etc.
      title: string;
      content: any;         // Contenu flexible selon le type
      format?: string;
    }>;
  };
  
  // État de la session
  status: 'active' | 'completed' | 'paused' | 'failed';
  started_at: Date;
  completed_at?: Date;
  
  // Métriques
  metrics: {
    duration_seconds?: number;
    tokens_used?: number;
    api_calls_count?: number;
    user_satisfaction?: number; // 1-5
  };
  
  // Metadata
  _createdAt: Date;
  _updatedAt: Date;
}

// Schema Mongoose
const AgentSessionSchema = new Schema<IAgentSession>({
  session_id: { type: String, required: true, unique: true },
  business_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true, index: true },
  
  // Agent
  agent: {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['ezia', 'market_analyst', 'marketing_chief', 'social_media_chief', 'business_dev', 'specialist'],
      required: true 
    },
    team: String
  },
  
  // Contexte
  context: {
    objective: { type: String, required: true },
    initial_request: { type: String, required: true },
    business_context: { type: Schema.Types.Mixed }
  },
  
  // Messages
  messages: [{
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system'],
      required: true 
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
      agent_name: String,
      thinking_process: String,
      tools_used: [String],
      confidence: Number
    }
  }],
  
  // Résultats
  results: {
    summary: String,
    key_findings: [String],
    recommendations: [String],
    action_items: [{
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      assigned_to: String,
      due_date: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],
    deliverables: [{
      type: String,
      title: String,
      content: Schema.Types.Mixed,
      format: String
    }]
  },
  
  // État
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'failed'],
    default: 'active'
  },
  started_at: { type: Date, default: Date.now },
  completed_at: Date,
  
  // Métriques
  metrics: {
    duration_seconds: Number,
    tokens_used: Number,
    api_calls_count: Number,
    user_satisfaction: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

// Index pour améliorer les performances
AgentSessionSchema.index({ business_id: 1, status: 1 });
AgentSessionSchema.index({ user_id: 1, started_at: -1 });
AgentSessionSchema.index({ 'agent.type': 1, status: 1 });

// Méthodes
AgentSessionSchema.methods.complete = function() {
  this.status = 'completed';
  this.completed_at = new Date();
  if (this.started_at) {
    this.metrics.duration_seconds = Math.floor((this.completed_at.getTime() - this.started_at.getTime()) / 1000);
  }
};

AgentSessionSchema.methods.addMessage = function(role: string, content: string, metadata?: any) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
};

export interface IAgentSessionDocument extends IAgentSession, Document {
  complete(): void;
  addMessage(role: string, content: string, metadata?: any): void;
}

export const AgentSession = mongoose.models.AgentSession || mongoose.model<IAgentSessionDocument>('AgentSession', AgentSessionSchema);