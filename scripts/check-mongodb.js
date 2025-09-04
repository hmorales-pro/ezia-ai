#!/usr/bin/env node

/**
 * Script pour vérifier la connexion MongoDB
 * Usage: node scripts/check-mongodb.js
 */

const mongoose = require('mongoose');

async function checkConnection() {
  console.log('🔍 Vérification de la connexion MongoDB...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI non défini dans les variables d\'environnement');
    console.log('\nPour configurer MongoDB :');
    console.log('1. Créez un cluster gratuit sur https://cloud.mongodb.com');
    console.log('2. Obtenez votre connection string');
    console.log('3. Définissez MONGODB_URI=mongodb+srv://...');
    process.exit(1);
  }
  
  console.log('📍 URI détectée :', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    console.log('\n⏳ Tentative de connexion...');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('\n✅ Connexion MongoDB réussie !');
    
    // Tester la création d'un document
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Test d\'écriture réussi');
    
    await testCollection.deleteOne({ _id: testDoc._id });
    console.log('✅ Test de suppression réussi');
    
    // Afficher les informations de connexion
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    console.log('\n📊 Informations du serveur :');
    console.log(`- Version : ${serverStatus.version}`);
    console.log(`- Hôte : ${serverStatus.host}`);
    console.log(`- Stockage : ${(serverStatus.storageEngine?.name || 'N/A')}`);
    
    // Lister les collections existantes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📚 Collections existantes (${collections.length}) :`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion MongoDB :');
    console.error(error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Vérifiez que l\'URL MongoDB est correcte');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Vérifiez vos identifiants MongoDB');
    } else if (error.message.includes('Network')) {
      console.log('\n💡 Vérifiez votre connexion réseau et les règles firewall MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n👋 Déconnexion réussie');
    }
  }
}

// Exécuter le test
checkConnection().catch(console.error);