// Corriger le problème d'authentification
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixAuthMismatch() {
  console.log('🔧 Correction du problème d\'authentification\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    const businessesCollection = mongoose.connection.db.collection('businesses');
    const userProjectsCollection = mongoose.connection.db.collection('user_projects');
    
    console.log('⚠️  ATTENTION: Ce script va transférer les données\n');
    console.log('De: 6895f0dc9e0ed4cba1feb385 (test@ezia.ai)');
    console.log('Vers: test_user_ezia_001 (Simple Auth)\n');
    
    console.log('Cela permettra de voir vos sites dans l\'interface.');
    console.log('\nVoulez-vous continuer? (oui/non): ');
    
    const answer = await new Promise(resolve => {
      readline.question('', resolve);
    });
    
    if (answer.toLowerCase() !== 'oui') {
      console.log('\nOpération annulée.');
      readline.close();
      await mongoose.connection.close();
      return;
    }
    
    readline.close();
    console.log('\n🔄 Transfert en cours...\n');
    
    // 1. Transférer les businesses
    const businessResult = await businessesCollection.updateMany(
      { 
        $or: [
          { user_id: '6895f0dc9e0ed4cba1feb385' },
          { userId: '6895f0dc9e0ed4cba1feb385' }
        ]
      },
      { 
        $set: { 
          user_id: 'test_user_ezia_001',
          userId: 'test_user_ezia_001',
          updated_at: new Date()
        }
      }
    );
    
    console.log(`✅ ${businessResult.modifiedCount} businesses transférés`);
    
    // 2. Transférer les sites web
    const sitesResult = await userProjectsCollection.updateMany(
      { userId: '6895f0dc9e0ed4cba1feb385' },
      { 
        $set: { 
          userId: 'test_user_ezia_001',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ ${sitesResult.modifiedCount} sites web transférés`);
    
    // 3. Vérification
    console.log('\n📋 Vérification après transfert:\n');
    
    const newBusinessCount = await businessesCollection.countDocuments({
      $or: [
        { user_id: 'test_user_ezia_001' },
        { userId: 'test_user_ezia_001' }
      ]
    });
    
    const newSiteCount = await userProjectsCollection.countDocuments({
      userId: 'test_user_ezia_001'
    });
    
    console.log(`Compte test_user_ezia_001 possède maintenant:`);
    console.log(`- ${newBusinessCount} businesses`);
    console.log(`- ${newSiteCount} sites web`);
    
    console.log('\n✨ Transfert terminé!');
    console.log('\n📌 Actions à faire:');
    console.log('1. Rechargez votre page');
    console.log('2. Allez sur http://localhost:3000/workspace');
    console.log('3. Vos sites devraient maintenant apparaître!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

// Exécuter la correction
fixAuthMismatch();