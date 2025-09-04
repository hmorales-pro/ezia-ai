#!/usr/bin/env node
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function initializePreprodDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ No MONGODB_URI found');
    process.exit(1);
  }

  console.log('🚀 Initializing preprod database...\n');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get the database (this will create it if it doesn't exist when we write to it)
    const db = client.db('ezia-preprod');
    console.log('📂 Using database:', db.databaseName);
    
    // Create initial collections with a document to ensure they exist
    const collections = [
      { name: 'businesses', doc: { _id: 'init', type: 'initialization', created: new Date() } },
      { name: 'users', doc: { _id: 'init', type: 'initialization', created: new Date() } },
      { name: 'waitlists', doc: { _id: 'init', type: 'initialization', created: new Date() } },
      { name: 'subscriptions', doc: { _id: 'init', type: 'initialization', created: new Date() } },
      { name: 'eziaprojects', doc: { _id: 'init', type: 'initialization', created: new Date() } }
    ];
    
    for (const { name, doc } of collections) {
      try {
        const collection = db.collection(name);
        await collection.insertOne(doc);
        console.log(`✅ Created collection: ${name}`);
        
        // Remove the init document
        await collection.deleteOne({ _id: 'init' });
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`ℹ️  Collection ${name} already exists`);
        } else {
          console.error(`❌ Error creating ${name}:`, error.message);
        }
      }
    }
    
    // List all collections to verify
    console.log('\n📦 Final collections in database:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    console.log('\n✅ Database initialization complete!');
    console.log('🎉 You can now use MongoDB preprod in your application');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 8000) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Username and password are correct');
      console.log('2. User has dbAdmin or readWrite permissions');
      console.log('3. Try creating a new user with full permissions');
    }
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the initialization
initializePreprodDB().catch(console.error);