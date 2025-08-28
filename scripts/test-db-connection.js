#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Test de connexion MongoDB...\n');
  console.log('URI:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@') || 'NON DÉFINI');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion réussie!');
    
    // Test de lecture
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Collections trouvées: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Test d'écriture
    const testCollection = mongoose.connection.collection('connection_test');
    const testDoc = { test: true, timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('\n✅ Test d\'écriture réussi');
    
    // Nettoyage
    await testCollection.deleteOne({ _id: testDoc._id });
    console.log('✅ Test de suppression réussi');
    
    console.log('\n🎉 Tous les tests sont passés!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('\nVérifiez que :');
    console.error('1. MongoDB est en cours d\'exécution');
    console.error('2. L\'URI de connexion est correcte');
    console.error('3. Les identifiants sont valides');
    console.error('4. Le réseau permet la connexion');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();