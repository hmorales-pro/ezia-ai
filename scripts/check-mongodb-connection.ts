#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.preprod' });

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ No MONGODB_URI found in environment variables');
    process.exit(1);
  }
  
  console.log('📋 MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    console.log('🔌 Attempting to connect...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database info
    const db = mongoose.connection.db;
    const dbName = db?.databaseName;
    console.log(`📊 Database name: ${dbName}`);
    
    // List collections
    const collections = await db?.listCollections().toArray();
    console.log(`📦 Collections found: ${collections?.length || 0}`);
    if (collections && collections.length > 0) {
      collections.forEach((col) => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Test creating a document
    console.log('\n🧪 Testing write operation...');
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      message: String,
      timestamp: Date
    }));
    
    const testDoc = await TestModel.create({
      message: 'MongoDB preprod connection test',
      timestamp: new Date()
    });
    
    console.log('✅ Write test successful:', testDoc._id);
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the test
testConnection().catch(console.error);