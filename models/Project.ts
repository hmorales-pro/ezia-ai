import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  project_id: string;
  business_id: string;
  user_id: string;
  name: string;
  type: 'site-vitrine' | 'landing-page' | 'blog' | 'saas';
  description: string;
  status: 'active' | 'archived' | 'draft';
  code: string;
  agents_contributions: {
    kiko?: string;
    milo?: string;
    yuna?: string;
    vera?: string;
  };
  preview_url: string;
  deploy_url?: string;
  custom_domain?: string;
  deployments: Array<{
    provider: 'netlify' | 'vercel' | 'cloudflare';
    url: string;
    deployed_at: Date;
    status: 'success' | 'failed' | 'pending';
  }>;
  analytics: {
    views: number;
    last_viewed: Date;
  };
  created_at: Date;
  updated_at: Date;
}

const ProjectSchema = new Schema<IProject>({
  project_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  business_id: { 
    type: String, 
    required: true,
    index: true 
  },
  user_id: { 
    type: String, 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['site-vitrine', 'landing-page', 'blog', 'saas'],
    required: true 
  },
  description: { 
    type: String,
    default: ""
  },
  status: { 
    type: String, 
    enum: ['active', 'archived', 'draft'],
    default: 'active' 
  },
  code: { 
    type: String, 
    required: true 
  },
  agents_contributions: {
    kiko: String,
    milo: String,
    yuna: String,
    vera: String
  },
  preview_url: { 
    type: String, 
    required: true 
  },
  deploy_url: String,
  custom_domain: String,
  deployments: [{
    provider: {
      type: String,
      enum: ['netlify', 'vercel', 'cloudflare']
    },
    url: String,
    deployed_at: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    }
  }],
  analytics: {
    views: { type: Number, default: 0 },
    last_viewed: { type: Date, default: Date.now }
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes for performance
ProjectSchema.index({ user_id: 1, created_at: -1 });
ProjectSchema.index({ business_id: 1, status: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
