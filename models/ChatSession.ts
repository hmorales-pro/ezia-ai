import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'],
    required: true 
  },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  metadata: {
    agent: { type: String },
    actionType: { type: String },
    status: { type: String }
  }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  context: { type: String },
  mode: { 
    type: String,
    enum: ['general', 'analysis', 'content', 'strategy', 'website', 'onboarding'],
    default: 'general'
  },
  metadata: {
    lastActivity: { type: Date, default: Date.now },
    messagesCount: { type: Number, default: 0 },
    userMessagesCount: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
chatSessionSchema.index({ businessId: 1, userId: 1, updatedAt: -1 });
chatSessionSchema.index({ sessionId: 1 });

// Méthode pour mettre à jour les métadonnées
chatSessionSchema.methods.updateMetadata = function() {
  this.metadata.messagesCount = this.messages.length;
  this.metadata.userMessagesCount = this.messages.filter(m => m.role === 'user').length;
  this.metadata.lastActivity = new Date();
};

export default mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);