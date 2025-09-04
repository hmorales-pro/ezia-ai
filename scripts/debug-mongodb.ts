#!/usr/bin/env node
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ No MONGODB_URI found');
  process.exit(1);
}

// Parse and display connection info
console.log('🔍 MongoDB URI Analysis:\n');

// Hide password in output
const uriParts = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);

if (uriParts) {
  console.log('👤 Username:', uriParts[1]);
  console.log('🔑 Password length:', uriParts[2].length, 'characters');
  console.log('🌐 Cluster:', uriParts[3]);
  console.log('📂 Database + params:', uriParts[4]);
  console.log('\n✅ URI format looks correct');
  
  // Check for common issues
  if (uriParts[2].includes(' ')) {
    console.log('\n⚠️  WARNING: Password contains spaces');
  }
  if (uriParts[1].includes(' ')) {
    console.log('\n⚠️  WARNING: Username contains spaces');
  }
} else {
  console.log('❌ URI format not recognized');
}

console.log('\n📋 Full URI (password hidden):');
console.log(MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

// Try a simple connection with the MongoDB driver directly
console.log('\n🔌 Attempting direct MongoDB connection...\n');

import { MongoClient } from 'mongodb';

async function testDirectConnection() {
  const client = new MongoClient(MONGODB_URI!);
  
  try {
    await client.connect();
    console.log('✅ Direct connection successful!');
    
    const db = client.db();
    console.log('📂 Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (error: any) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 8000) {
      console.log('\n💡 This is an authentication error. Please check:');
      console.log('1. Username and password are correct');
      console.log('2. User has access to the database');
      console.log('3. IP address is whitelisted in MongoDB Atlas');
    }
  }
}

testDirectConnection().catch(console.error);