import { Business } from '@/models/Business';
import { UserProject } from '@/models/UserProject';
import { promises as fs } from 'fs';
import path from 'path';
import { connectDB } from '@/lib/mongodb';

export interface StorageInterface {
  // Business methods
  getAllBusinesses(userId: string): Promise<Business[]>;
  getBusinessById(businessId: string, userId: string): Promise<Business | null>;
  createBusiness(business: Partial<Business>): Promise<Business>;
  updateBusiness(businessId: string, updates: Partial<Business>): Promise<Business | null>;
  deleteBusiness(businessId: string, userId: string): Promise<boolean>;
  
  // Project methods
  getAllProjects(userId: string): Promise<UserProject[]>;
  getProjectById(projectId: string, userId: string): Promise<UserProject | null>;
  createProject(project: Partial<UserProject>): Promise<UserProject>;
  updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject | null>;
  deleteProject(projectId: string, userId: string): Promise<boolean>;
  
  // Utility methods
  syncToFile(): Promise<void>;
  loadFromFile(): Promise<void>;
}

class UnifiedStorage implements StorageInterface {
  private businesses: Map<string, Business> = new Map();
  private projects: Map<string, UserProject> = new Map();
  private dataDir = path.join(process.cwd(), '.data');
  private businessFile = path.join(this.dataDir, 'businesses.json');
  private projectFile = path.join(this.dataDir, 'projects.json');
  private lastSync = Date.now();
  private syncInterval = 30000; // 30 seconds
  private isMongoAvailable = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Ensure data directory exists
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // Check MongoDB availability
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        this.isMongoAvailable = true;
        console.log('✅ MongoDB connected - using database storage');
      } catch (error) {
        console.log('⚠️ MongoDB unavailable - using file storage');
        this.isMongoAvailable = false;
      }
    }
    
    // Load initial data from files if MongoDB is not available
    if (!this.isMongoAvailable) {
      await this.loadFromFile();
      // Set up auto-sync
      setInterval(() => this.autoSync(), this.syncInterval);
    }
  }

  private async autoSync() {
    if (!this.isMongoAvailable && Date.now() - this.lastSync > this.syncInterval) {
      await this.syncToFile();
      this.lastSync = Date.now();
    }
  }

  // Business methods
  async getAllBusinesses(userId: string): Promise<Business[]> {
    if (this.isMongoAvailable) {
      const BusinessModel = (await import('@/models/Business')).default;
      return await BusinessModel.find({ userId }).lean();
    }
    
    return Array.from(this.businesses.values()).filter(b => b.userId === userId);
  }

  async getBusinessById(businessId: string, userId: string): Promise<Business | null> {
    if (this.isMongoAvailable) {
      const BusinessModel = (await import('@/models/Business')).default;
      return await BusinessModel.findOne({ 
        $or: [
          { _id: businessId, userId },
          { business_id: businessId, userId }
        ]
      }).lean();
    }
    
    const business = this.businesses.get(businessId);
    return business && business.userId === userId ? business : null;
  }

  async createBusiness(business: Partial<Business>): Promise<Business> {
    const businessId = business.business_id || `bus_${Date.now()}`;
    const newBusiness = {
      ...business,
      business_id: businessId,
      _id: businessId,
      _createdAt: new Date().toISOString(),
      completion_score: business.completion_score || 0,
      ezia_interactions: business.ezia_interactions || [],
      metrics: business.metrics || {
        website_visitors: 0,
        conversion_rate: 0,
        monthly_growth: 0,
        task_completion: 0
      }
    } as Business;

    if (this.isMongoAvailable) {
      const BusinessModel = (await import('@/models/Business')).default;
      const doc = await BusinessModel.create(newBusiness);
      return doc.toObject();
    }
    
    this.businesses.set(businessId, newBusiness);
    await this.syncToFile();
    return newBusiness;
  }

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<Business | null> {
    if (this.isMongoAvailable) {
      const BusinessModel = (await import('@/models/Business')).default;
      return await BusinessModel.findOneAndUpdate(
        { 
          $or: [
            { _id: businessId },
            { business_id: businessId }
          ]
        },
        updates,
        { new: true }
      ).lean();
    }
    
    const business = this.businesses.get(businessId);
    if (!business) return null;
    
    const updated = { ...business, ...updates };
    this.businesses.set(businessId, updated);
    await this.syncToFile();
    return updated;
  }

  async deleteBusiness(businessId: string, userId: string): Promise<boolean> {
    if (this.isMongoAvailable) {
      const BusinessModel = (await import('@/models/Business')).default;
      const result = await BusinessModel.deleteOne({ 
        $or: [
          { _id: businessId, userId },
          { business_id: businessId, userId }
        ]
      });
      return result.deletedCount > 0;
    }
    
    const business = this.businesses.get(businessId);
    if (business && business.userId === userId) {
      this.businesses.delete(businessId);
      await this.syncToFile();
      return true;
    }
    return false;
  }

  // Project methods
  async getAllProjects(userId: string): Promise<UserProject[]> {
    if (this.isMongoAvailable) {
      const UserProjectModel = (await import('@/models/UserProject')).default;
      return await UserProjectModel.find({ userId }).lean();
    }
    
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async getProjectById(projectId: string, userId: string): Promise<UserProject | null> {
    if (this.isMongoAvailable) {
      const UserProjectModel = (await import('@/models/UserProject')).default;
      return await UserProjectModel.findOne({ projectId, userId }).lean();
    }
    
    const project = this.projects.get(projectId);
    return project && project.userId === userId ? project : null;
  }

  async createProject(project: Partial<UserProject>): Promise<UserProject> {
    const projectId = project.projectId || `proj_${Date.now()}`;
    const newProject = {
      ...project,
      projectId,
      createdAt: project.createdAt || new Date(),
      updatedAt: new Date(),
      versions: project.versions || []
    } as UserProject;

    if (this.isMongoAvailable) {
      const UserProjectModel = (await import('@/models/UserProject')).default;
      const doc = await UserProjectModel.create(newProject);
      return doc.toObject();
    }
    
    this.projects.set(projectId, newProject);
    await this.syncToFile();
    return newProject;
  }

  async updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject | null> {
    if (this.isMongoAvailable) {
      const UserProjectModel = (await import('@/models/UserProject')).default;
      return await UserProjectModel.findOneAndUpdate(
        { projectId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean();
    }
    
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(projectId, updated);
    await this.syncToFile();
    return updated;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    if (this.isMongoAvailable) {
      const UserProjectModel = (await import('@/models/UserProject')).default;
      const result = await UserProjectModel.deleteOne({ projectId, userId });
      return result.deletedCount > 0;
    }
    
    const project = this.projects.get(projectId);
    if (project && project.userId === userId) {
      this.projects.delete(projectId);
      await this.syncToFile();
      return true;
    }
    return false;
  }

  // File sync methods
  async syncToFile(): Promise<void> {
    if (this.isMongoAvailable) return; // No need to sync if using MongoDB
    
    try {
      // Save businesses
      const businessesArray = Array.from(this.businesses.values());
      await fs.writeFile(
        this.businessFile,
        JSON.stringify(businessesArray, null, 2),
        'utf-8'
      );
      
      // Save projects in userId-keyed format to match existing structure
      const projectsByUser: Record<string, UserProject[]> = {};
      Array.from(this.projects.values()).forEach(project => {
        if (!projectsByUser[project.userId]) {
          projectsByUser[project.userId] = [];
        }
        projectsByUser[project.userId].push(project);
      });
      
      await fs.writeFile(
        this.projectFile,
        JSON.stringify(projectsByUser, null, 2),
        'utf-8'
      );
      
      console.log(`✅ Synced to files: ${businessesArray.length} businesses, ${projectsArray.length} projects`);
    } catch (error) {
      console.error('❌ Error syncing to files:', error);
    }
  }

  async loadFromFile(): Promise<void> {
    try {
      // Load businesses
      try {
        const businessData = await fs.readFile(this.businessFile, 'utf-8');
        const businesses: Business[] = JSON.parse(businessData);
        this.businesses.clear();
        businesses.forEach(b => {
          const id = b.business_id || b._id;
          if (id) this.businesses.set(id, b);
        });
        console.log(`✅ Loaded ${businesses.length} businesses from file`);
      } catch (error) {
        console.log('⚠️ No businesses file found, starting fresh');
      }
      
      // Load projects
      try {
        const projectData = await fs.readFile(this.projectFile, 'utf-8');
        const parsedData = JSON.parse(projectData);
        this.projects.clear();
        
        // Check if data is in userId-keyed format or flat array
        if (Array.isArray(parsedData)) {
          // Flat array format
          parsedData.forEach(p => {
            if (p.projectId || p.id) {
              const id = p.projectId || p.id;
              this.projects.set(id, { ...p, projectId: id });
            }
          });
          console.log(`✅ Loaded ${parsedData.length} projects from file (array format)`);
        } else if (typeof parsedData === 'object') {
          // userId-keyed format
          let totalProjects = 0;
          Object.entries(parsedData).forEach(([userId, userProjects]) => {
            if (Array.isArray(userProjects)) {
              userProjects.forEach((p: any) => {
                if (p.projectId || p.id) {
                  const id = p.projectId || p.id;
                  this.projects.set(id, { ...p, projectId: id, userId });
                  totalProjects++;
                }
              });
            }
          });
          console.log(`✅ Loaded ${totalProjects} projects from file (userId-keyed format)`);
        }
      } catch (error) {
        console.log('⚠️ No projects file found, starting fresh');
      }
    } catch (error) {
      console.error('❌ Error loading from files:', error);
    }
  }
}

// Singleton instance
let storageInstance: UnifiedStorage | null = null;

export function getStorage(): StorageInterface {
  if (!storageInstance) {
    storageInstance = new UnifiedStorage();
  }
  return storageInstance;
}

// Helper function to check if using memory/file storage
export function isUsingFileStorage(): boolean {
  return !process.env.MONGODB_URI;
}