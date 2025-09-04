#!/usr/bin/env node
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables  
dotenv.config({ path: '.env.local' });

async function createPreprodDatabase() {
  // Use the production credentials that we know work
  const PROD_URI = 'mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia?retryWrites=true&w=majority';
  
  console.log('🚀 Creating ezia-preprod database...\n');

  const client = new MongoClient(PROD_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas with prod credentials');
    
    // Switch to the new database
    const db = client.db('ezia-preprod');
    console.log('📂 Creating database: ezia-preprod');
    
    // Create collections with initial documents
    const collections = [
      {
        name: 'businesses',
        indexes: [
          { key: { business_id: 1 }, unique: true },
          { key: { user_id: 1 } }
        ]
      },
      {
        name: 'users',
        indexes: [
          { key: { email: 1 }, unique: true }
        ]
      },
      {
        name: 'waitlists',
        indexes: [
          { key: { email: 1, listType: 1 }, unique: true },
          { key: { position: 1 } }
        ]
      },
      {
        name: 'subscriptions',
        indexes: [
          { key: { user_id: 1 }, unique: true }
        ]
      },
      {
        name: 'eziaprojects',
        indexes: [
          { key: { project_id: 1 }, unique: true },
          { key: { business_id: 1 } }
        ]
      },
      {
        name: 'goals',
        indexes: [
          { key: { business_id: 1 } }
        ]
      },
      {
        name: 'contentposts',
        indexes: [
          { key: { business_id: 1 } },
          { key: { scheduled_date: 1 } }
        ]
      }
    ];
    
    for (const { name, indexes } of collections) {
      try {
        const collection = db.collection(name);
        
        // Insert a dummy document to create the collection
        await collection.insertOne({
          _id: `init_${name}`,
          type: 'initialization',
          created: new Date(),
          message: 'Collection created for preprod environment'
        });
        
        console.log(`✅ Created collection: ${name}`);
        
        // Create indexes
        if (indexes && indexes.length > 0) {
          for (const index of indexes) {
            await collection.createIndex(index.key, index.unique ? { unique: true } : {});
            console.log(`   📍 Created index on ${Object.keys(index.key).join(', ')}`);
          }
        }
        
        // Remove the initialization document
        await collection.deleteOne({ _id: `init_${name}` });
        
      } catch (error: any) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${name} already exists`);
        } else {
          console.error(`❌ Error creating ${name}:`, error.message);
        }
      }
    }
    
    // List all collections to verify
    console.log('\n📦 Collections in ezia-preprod:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Show connection string for preprod
    console.log('\n🔗 Connection strings for ezia-preprod:');
    console.log('For production user (dbEzia):');
    console.log('mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia-preprod?retryWrites=true&w=majority');
    
    console.log('\nFor preprod user (once created with proper permissions):');
    console.log('mongodb+srv://hugomoralespro_db_user:YOUR_PASSWORD@cluster0.qfdtka1.mongodb.net/ezia-preprod?retryWrites=true&w=majority');
    
    console.log('\n✅ Database ezia-preprod created successfully!');
    console.log('📝 Note: You still need to create/fix the preprod user permissions in MongoDB Atlas');
    
  } catch (error: any) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
createPreprodDatabase().catch(console.error);