const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔄 Test de connexion MongoDB...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI non défini dans .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie !');
    console.log('📊 Base de données :', mongoose.connection.db.databaseName);
    
    // Test d'écriture
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ test: true, date: new Date() });
    console.log('✅ Test d\'écriture réussi');
    
    // Test de lecture
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ Test de lecture réussi');
    
    // Nettoyage
    await testCollection.deleteOne({ test: true });
    
    await mongoose.disconnect();
    console.log('✅ Déconnexion réussie');
    console.log('\n🎉 MongoDB est correctement configuré !');
  } catch (error) {
    console.error('❌ Erreur de connexion :', error.message);
    console.log('\nVérifiez :');
    console.log('1. Votre URI dans .env.local');
    console.log('2. Le mot de passe est correct');
    console.log('3. Votre IP est autorisée dans Network Access');
    process.exit(1);
  }
}

testConnection();