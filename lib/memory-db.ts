// Temporary in-memory database for testing without MongoDB
interface MemoryBusiness {
  _id: string;
  user_id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  is_active: boolean;
  _createdAt: Date;
  _updatedAt?: Date;
  completion_score?: number;
  website_url?: string;
  space_id?: string;
  social_media?: Record<string, unknown>;
  market_analysis?: {
    opportunities?: Array<unknown>;
    [key: string]: unknown;
  };
  marketing_strategy?: {
    content_calendar?: Array<unknown>;
    [key: string]: unknown;
  };
  ezia_interactions?: Array<Record<string, unknown>>;
  metrics?: Record<string, unknown>;
  goals?: Array<unknown>;
}

interface MemoryProject {
  _id: string;
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

interface MemorySubscription {
  _id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at: Date;
  updated_at: Date;
  usage: {
    analyses: number;
    websites: number;
    interactions: number;
    generations: number;
  };
  next_billing_date?: Date;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

class MemoryDB {
  private businesses: Map<string, MemoryBusiness> = new Map();
  private projects: Map<string, MemoryProject> = new Map();
  private subscriptions: Map<string, MemorySubscription> = new Map();
  private idCounter = 1;
  private projectIdCounter = 1;

  async create(data: Omit<MemoryBusiness, '_id' | '_createdAt'>): Promise<MemoryBusiness> {
    const business: MemoryBusiness = {
      ...data,
      _id: `memory_${this.idCounter++}`,
      _createdAt: new Date()
    };
    this.businesses.set(business._id, business);
    return business;
  }

  async find(query: { user_id: string; is_active: boolean }): Promise<MemoryBusiness[]> {
    const results: MemoryBusiness[] = [];
    for (const business of this.businesses.values()) {
      if (business.user_id === query.user_id && business.is_active === query.is_active) {
        results.push(business);
      }
    }
    return results.sort((a, b) => b._createdAt.getTime() - a._createdAt.getTime());
  }

  async findById(id: string): Promise<MemoryBusiness | null> {
    return this.businesses.get(id) || null;
  }

  async countDocuments(query: { user_id: string; is_active: boolean }): Promise<number> {
    let count = 0;
    for (const business of this.businesses.values()) {
      if (business.user_id === query.user_id && business.is_active === query.is_active) {
        count++;
      }
    }
    return count;
  }

  async updateOne(id: string, update: Partial<MemoryBusiness>): Promise<boolean> {
    const business = this.businesses.get(id);
    if (!business) return false;
    
    Object.assign(business, update);
    return true;
  }

  async findOne(query: Record<string, unknown>): Promise<MemoryBusiness | null> {
    for (const business of this.businesses.values()) {
      let matches = true;
      for (const [key, value] of Object.entries(query)) {
        if ((business as unknown as Record<string, unknown>)[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) return business;
    }
    return null;
  }

  async update(query: Record<string, unknown>, updates: Partial<MemoryBusiness>): Promise<MemoryBusiness | null> {
    const business = await this.findOne(query);
    if (!business) return null;
    
    Object.assign(business, updates);
    return business;
  }

  async updateBusinessInteraction(businessId: string, interaction: unknown): Promise<void> {
    for (const business of this.businesses.values()) {
      if (business.business_id === businessId) {
        if (!business.ezia_interactions) {
          business.ezia_interactions = [];
        }
        business.ezia_interactions.push(interaction as Record<string, unknown>);
        business._updatedAt = new Date();
        break;
      }
    }
  }

  async updateBusiness(businessId: string, updates: Partial<MemoryBusiness>): Promise<void> {
    for (const business of this.businesses.values()) {
      if (business.business_id === businessId) {
        Object.assign(business, updates, { _updatedAt: new Date() });
        break;
      }
    }
  }

  // Méthodes pour les abonnements
  async getSubscription(userId: string): Promise<MemorySubscription | null> {
    return this.subscriptions.get(userId) || null;
  }

  async createSubscription(subscription: MemorySubscription): Promise<MemorySubscription> {
    this.subscriptions.set(subscription.user_id, subscription);
    return subscription;
  }

  async updateSubscription(userId: string, updates: Partial<MemorySubscription>): Promise<MemorySubscription | null> {
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      Object.assign(subscription, updates);
      subscription.updated_at = new Date();
      return subscription;
    }
    return null;
  }

  async incrementUsage(userId: string, usageType: string, increment: number): Promise<MemorySubscription | null> {
    const subscription = this.subscriptions.get(userId);
    if (subscription && subscription.usage) {
      const key = usageType as keyof typeof subscription.usage;
      if (key in subscription.usage) {
        subscription.usage[key] += increment;
        subscription.updated_at = new Date();
      }
    }
    return subscription || null;
  }

  // Project methods
  async createProject(data: Omit<MemoryProject, '_id' | 'created_at' | 'updated_at'>): Promise<MemoryProject> {
    const project: MemoryProject = {
      ...data,
      _id: `memory_project_${this.projectIdCounter++}`,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.projects.set(project.project_id, project);
    return project;
  }

  async findProjectById(projectId: string): Promise<MemoryProject | null> {
    return this.projects.get(projectId) || null;
  }

  async findProjectsByBusiness(businessId: string): Promise<MemoryProject[]> {
    const results: MemoryProject[] = [];
    for (const project of this.projects.values()) {
      if (project.business_id === businessId && project.status === 'active') {
        results.push(project);
      }
    }
    return results.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async findProjectsByUser(userId: string): Promise<MemoryProject[]> {
    const results: MemoryProject[] = [];
    for (const project of this.projects.values()) {
      if (project.user_id === userId) {
        results.push(project);
      }
    }
    return results.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateProject(projectId: string, updates: Partial<MemoryProject>): Promise<MemoryProject | null> {
    const project = this.projects.get(projectId);
    if (project) {
      Object.assign(project, updates, { updated_at: new Date() });
      return project;
    }
    return null;
  }

  async incrementProjectViews(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (project) {
      project.analytics.views += 1;
      project.analytics.last_viewed = new Date();
      project.updated_at = new Date();
    }
  }
}

// Singleton instance
let memoryDB: MemoryDB | null = null;

export function getMemoryDB(): MemoryDB {
  if (!memoryDB) {
    memoryDB = new MemoryDB();
  }
  return memoryDB;
}

export const isUsingMemoryDB = () => !process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '';