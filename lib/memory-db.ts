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
  social_media?: Record<string, unknown>;
  market_analysis?: Record<string, unknown>;
  marketing_strategy?: Record<string, unknown>;
  ezia_interactions?: Array<Record<string, unknown>>;
  metrics?: Record<string, unknown>;
  goals?: Array<unknown>;
}

class MemoryDB {
  private businesses: Map<string, MemoryBusiness> = new Map();
  private idCounter = 1;

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