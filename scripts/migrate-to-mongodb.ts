#!/usr/bin/env tsx

/**
 * Script de migration des données de fichiers JSON vers MongoDB
 * Usage: npx tsx scripts/migrate-to-mongodb.ts
 */

import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import UserProject from '../models/UserProject';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Please add MONGODB_URI to your .env.local file');
  process.exit(1);
}

const STORAGE_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json');

async function loadProjectsFromFile(): Promise<Record<string, any[]> | null> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('ℹ️  No projects file found, skipping migration');
    return null;
  }
}

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function migrateProjects() {
  console.log('🚀 Starting migration to MongoDB...');
  
  // Charger les projets depuis les fichiers
  const fileProjects = await loadProjectsFromFile();
  
  if (!fileProjects) {
    console.log('✅ No projects to migrate');
    return;
  }

  let totalMigrated = 0;
  let totalSkipped = 0;
  
  for (const [userId, projects] of Object.entries(fileProjects)) {
    console.log(`📂 Migrating ${projects.length} projects for user ${userId}...`);
    
    for (const project of projects) {
      try {
        // Vérifier si le projet existe déjà
        const existingProject = await UserProject.findOne({ 
          projectId: project.id 
        });
        
        if (existingProject) {
          console.log(`⏭️  Skipping ${project.name} (already exists)`);
          totalSkipped++;
          continue;
        }
        
        // Créer le nouveau projet MongoDB
        const mongoProject = new UserProject({
          projectId: project.id,
          userId: project.userId,
          businessId: project.businessId,
          businessName: project.businessName,
          name: project.name,
          description: project.description,
          html: project.html,
          css: project.css || '',
          js: project.js || '',
          prompt: project.prompt,
          version: project.version || 1,
          versions: project.versions || [],
          status: project.status || 'draft',
          metadata: project.metadata || {
            generatedBy: 'ezia-ai'
          },
          previewUrl: `/preview/${project.id}`,
          analytics: {
            views: 0,
            deployments: 0
          },
          createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
          updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date()
        });
        
        await mongoProject.save();
        console.log(`✅ Migrated: ${project.name}`);
        totalMigrated++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate project ${project.name}:`, error);
      }
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Migrated: ${totalMigrated} projects`);
  console.log(`⏭️  Skipped: ${totalSkipped} projects (already existed)`);
  
  if (totalMigrated > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('Your projects are now stored in MongoDB and will persist across restarts.');
  }
}

async function main() {
  await connectToMongoDB();
  await migrateProjects();
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}

export { migrateProjects };