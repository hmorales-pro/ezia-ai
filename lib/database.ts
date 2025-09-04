/**
 * Unified database access layer
 * Automatically handles MongoDB connection with fallback to memory DB
 */

import mongoose from "mongoose";
import dbConnect from "./mongodb";
import { getMemoryDB } from "./memory-db";

// Connection state cache
let isConnected: boolean | null = null;
let lastAttempt = 0;
const RETRY_INTERVAL = 30000; // 30 seconds

// Type guards
export function isMongooseDocument(doc: any): doc is mongoose.Document {
  return doc && doc._id && typeof doc.save === 'function';
}

// Check if MongoDB is available
async function checkMongoDB(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (isConnected !== null && now - lastAttempt < RETRY_INTERVAL) {
    return isConnected;
  }
  
  if (!process.env.MONGODB_URI) {
    console.log("❌ No MongoDB URI configured");
    console.log("💡 Using memory database as fallback (data will not persist)");
    isConnected = false;
    return false;
  }
  
  try {
    await dbConnect();
    console.log("✅ MongoDB connected successfully");
    isConnected = true;
    lastAttempt = now;
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.log("💡 Using memory database as fallback (data will not persist)");
    console.log("📝 To fix: Configure MONGODB_URI with a valid MongoDB connection string");
    isConnected = false;
    lastAttempt = now;
    return false;
  }
}

// Database operations wrapper
export class Database {
  private useMemory: boolean = false;
  private memoryDB = getMemoryDB();
  
  async initialize(): Promise<void> {
    this.useMemory = !(await checkMongoDB());
    if (this.useMemory) {
      console.log("⚠️ Using in-memory database (data will be lost on restart)");
    }
  }
  
  isUsingMemory(): boolean {
    return this.useMemory;
  }
  
  // Business operations
  async findBusinesses(userId: string): Promise<any[]> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.find({
        user_id: userId,
        is_active: true
      });
    }
    
    const { Business } = await import("@/models/Business");
    return Business.find({
      user_id: userId,
      is_active: true
    })
      .sort({ _createdAt: -1 })
      .limit(50)
      .select('-__v')
      .lean();
  }
  
  async createBusiness(data: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.create(data);
    }
    
    const { Business } = await import("@/models/Business");
    const business = new Business(data);
    await business.save();
    return business.toObject();
  }
  
  async findBusinessById(businessId: string): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.findOne({ business_id: businessId });
    }
    
    const { Business } = await import("@/models/Business");
    return Business.findOne({ business_id: businessId }).lean();
  }
  
  async updateBusiness(businessId: string, updates: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.update({ business_id: businessId }, updates);
    }
    
    const { Business } = await import("@/models/Business");
    return Business.findOneAndUpdate(
      { business_id: businessId },
      updates,
      { new: true }
    ).lean();
  }
  
  async countBusinesses(userId: string): Promise<number> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.countDocuments({
        user_id: userId,
        is_active: true
      });
    }
    
    const { Business } = await import("@/models/Business");
    return Business.countDocuments({
      user_id: userId,
      is_active: true
    });
  }
  
  // Project operations
  async createProject(data: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.createProject(data);
    }
    
    const { EziaProject } = await import("@/models/EziaProject");
    const project = new EziaProject(data);
    await project.save();
    return project.toObject();
  }
  
  async findProjectById(projectId: string): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.findProjectById(projectId);
    }
    
    const { EziaProject } = await import("@/models/EziaProject");
    return EziaProject.findOne({ project_id: projectId }).lean();
  }
  
  async findProjectsByBusiness(businessId: string): Promise<any[]> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.findProjectsByBusiness(businessId);
    }
    
    const { EziaProject } = await import("@/models/EziaProject");
    return EziaProject.find({ 
      business_id: businessId,
      status: 'active'
    })
      .sort({ created_at: -1 })
      .lean();
  }
  
  async updateProject(projectId: string, updates: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.updateProject(projectId, updates);
    }
    
    const { EziaProject } = await import("@/models/EziaProject");
    return EziaProject.findOneAndUpdate(
      { project_id: projectId },
      updates,
      { new: true }
    ).lean();
  }
  
  // Subscription operations
  async getSubscription(userId: string): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.getSubscription(userId);
    }
    
    const { Subscription } = await import("@/models/Subscription");
    return Subscription.findOne({ user_id: userId }).lean();
  }
  
  async createSubscription(data: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.createSubscription(data);
    }
    
    const { Subscription } = await import("@/models/Subscription");
    const subscription = new Subscription(data);
    await subscription.save();
    return subscription.toObject();
  }
  
  async updateSubscription(userId: string, updates: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.updateSubscription(userId, updates);
    }
    
    const { Subscription } = await import("@/models/Subscription");
    return Subscription.findOneAndUpdate(
      { user_id: userId },
      updates,
      { new: true }
    ).lean();
  }
  
  // Goal operations
  async updateBusinessGoals(businessId: string, goalId: string, updates: any): Promise<any> {
    await this.initialize();
    
    const business = await this.findBusinessById(businessId);
    if (!business || !business.goals) return null;
    
    const goalIndex = business.goals.findIndex((g: any) => g.goal_id === goalId);
    if (goalIndex === -1) return null;
    
    // Apply updates to the specific goal
    Object.assign(business.goals[goalIndex], updates);
    
    // Save the updated business
    return this.updateBusiness(businessId, { goals: business.goals });
  }
  
  // Usage tracking
  async incrementUsage(userId: string, usageType: string, increment: number = 1): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.incrementUsage(userId, usageType, increment);
    }
    
    const { Subscription } = await import("@/models/Subscription");
    const field = `usage.${usageType}`;
    return Subscription.findOneAndUpdate(
      { user_id: userId },
      { 
        $inc: { [field]: increment },
        $set: { updated_at: new Date() }
      },
      { new: true }
    ).lean();
  }
  
  // UserProject operations
  async findUserProjectByBusinessId(userId: string, businessId: string): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.findUserProjectByBusinessId(userId, businessId);
    }
    
    const UserProject = (await import("@/models/UserProject")).default;
    return UserProject.findOne({
      userId: userId,
      businessId: businessId,
      status: { $ne: 'archived' }
    }).lean();
  }
  
  async createUserProject(data: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      const project = {
        _id: data.projectId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.memoryDB.createUserProject(project);
      return project;
    }
    
    const UserProject = (await import("@/models/UserProject")).default;
    const project = new UserProject(data);
    await project.save();
    return project.toObject();
  }
  
  async updateUserProject(projectId: string, updates: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.updateUserProject(projectId, updates);
    }
    
    const UserProject = (await import("@/models/UserProject")).default;
    return UserProject.findByIdAndUpdate(
      projectId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  }
  
  async updateBusinessWebsite(businessId: string, websiteData: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.update(
        { business_id: businessId },
        { 
          website_url: websiteData.website_url,
          space_id: websiteData.space_id,
          websiteGeneratedAt: websiteData.websiteGeneratedAt?.toISOString() || new Date().toISOString()
        }
      );
    }
    
    const { Business } = await import("@/models/Business");
    return Business.findOneAndUpdate(
      { business_id: businessId },
      websiteData,
      { new: true }
    ).lean();
  }
  
  async findUserProjectsByUserId(userId: string): Promise<any[]> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.findUserProjectsByUserId(userId);
    }
    
    const UserProject = (await import("@/models/UserProject")).default;
    return UserProject.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }
  
  async deleteUserProject(projectId: string, userId: string): Promise<boolean> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.deleteUserProject(projectId, userId);
    }
    
    const UserProject = (await import("@/models/UserProject")).default;
    const result = await UserProject.deleteOne({
      _id: projectId,
      userId: userId
    });
    
    return result.deletedCount > 0;
  }
  
  async addBusinessInteraction(businessId: string, interaction: any): Promise<any> {
    await this.initialize();
    
    if (this.useMemory) {
      return this.memoryDB.addBusinessInteraction(businessId, interaction);
    }
    
    const { Business } = await import("@/models/Business");
    return Business.findOneAndUpdate(
      { business_id: businessId },
      { 
        $push: { ezia_interactions: interaction },
        $set: { updated_at: new Date() }
      },
      { new: true }
    ).lean();
  }
}

// Singleton instance
let database: Database | null = null;

export function getDB(): Database {
  if (!database) {
    database = new Database();
  }
  return database;
}

// Helper to reset connection (useful for tests)
export function resetDatabase(): void {
  isConnected = null;
  lastAttempt = 0;
  database = null;
}