import mongoose from 'mongoose';

const ProjectVersionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  js: {
    type: String,
    default: ''
  },
  prompt: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

const UserProjectSchema = new mongoose.Schema({
  // ID unique du projet
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  businessId: {
    type: String
  },
  businessName: String,
  name: {
    type: String,
    required: true
  },
  description: String,
  html: {
    type: String,
    required: true
  },
  css: String,
  js: String,
  prompt: String,
  version: {
    type: Number,
    default: 1
  },
  versions: [ProjectVersionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  metadata: {
    generatedBy: {
      type: String,
      default: 'ezia-ai'
    },
    industry: String,
    targetAudience: String,
    features: [String],
    tags: [String]
  },
  
  // URLs
  previewUrl: String,
  deployUrl: String,
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    deployments: {
      type: Number,
      default: 0
    },
    lastDeployed: Date
  }
}, {
  timestamps: true,
  collection: 'user_projects'
});

// Index pour améliorer les performances
UserProjectSchema.index({ userId: 1, createdAt: -1 });
UserProjectSchema.index({ businessId: 1 });
UserProjectSchema.index({ status: 1, userId: 1 });
// projectId a déjà unique: true dans le schéma, pas besoin d'un autre index

// Méthode pour ajouter une nouvelle version
UserProjectSchema.methods.addVersion = function(versionData: any) {
  const newVersion = {
    version: this.version + 1,
    html: versionData.html || this.html,
    css: versionData.css || this.css,
    js: versionData.js || this.js,
    prompt: versionData.prompt || this.prompt,
    createdAt: new Date(),
    createdBy: versionData.createdBy || 'User'
  };
  
  this.versions.push(newVersion);
  this.version = newVersion.version;
  this.html = newVersion.html;
  this.css = newVersion.css;
  this.js = newVersion.js;
  this.prompt = newVersion.prompt;
  
  return this.save();
};

export default mongoose.models.UserProject || mongoose.model('UserProject', UserProjectSchema);