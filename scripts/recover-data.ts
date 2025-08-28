#!/usr/bin/env ts-node
import connectDB from '../lib/mongodb';
import { Business } from '../models/Business';
import UserProject from '../models/UserProject';
import { promises as fs } from 'fs';
import path from 'path';

async function recoverData() {
  console.log('🔄 Starting data recovery...\n');
  
  const dataDir = path.join(process.cwd(), '.data');
  const businessFile = path.join(dataDir, 'businesses.json');
  const projectFile = path.join(dataDir, 'projects.json');
  
  try {
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      console.log('❌ No MONGODB_URI found. Cannot recover data from database.');
      console.log('💡 Creating empty files...');
      
      await fs.writeFile(businessFile, '[]', 'utf-8');
      await fs.writeFile(projectFile, '[]', 'utf-8');
      
      console.log('✅ Created empty data files');
      return;
    }
    
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    
    // Recover businesses
    console.log('\n📊 Recovering businesses...');
    const businesses = await Business.find({}).lean();
    console.log(`Found ${businesses.length} businesses in MongoDB`);
    
    if (businesses.length > 0) {
      await fs.writeFile(
        businessFile,
        JSON.stringify(businesses, null, 2),
        'utf-8'
      );
      console.log(`✅ Saved ${businesses.length} businesses to ${businessFile}`);
    }
    
    // Recover projects
    console.log('\n🌐 Recovering projects...');
    const projects = await UserProject.find({}).lean();
    console.log(`Found ${projects.length} projects in MongoDB`);
    
    if (projects.length > 0) {
      await fs.writeFile(
        projectFile,
        JSON.stringify(projects, null, 2),
        'utf-8'
      );
      console.log(`✅ Saved ${projects.length} projects to ${projectFile}`);
    }
    
    console.log('\n✨ Data recovery complete!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`- Businesses recovered: ${businesses.length}`);
    console.log(`- Projects recovered: ${projects.length}`);
    
    // Sample data for verification
    if (businesses.length > 0) {
      console.log('\n🔍 Sample business:');
      const sample = businesses[0];
      console.log(`- Name: ${sample.name}`);
      console.log(`- ID: ${sample.business_id || sample._id}`);
      console.log(`- User: ${sample.userId || sample.user_id}`);
    }
    
  } catch (error) {
    console.error('❌ Error during recovery:', error);
    
    // Create empty files as fallback
    console.log('\n💡 Creating empty files as fallback...');
    await fs.writeFile(businessFile, '[]', 'utf-8');
    await fs.writeFile(projectFile, '[]', 'utf-8');
    console.log('✅ Created empty data files');
  }
  
  process.exit(0);
}

// Run the recovery
recoverData();