// Diagnostic complet du système
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function diagnoseCompleteSystem() {
  console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME\n');
  console.log('=' .repeat(60) + '\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    const businessesCollection = mongoose.connection.db.collection('businesses');
    const userProjectsCollection = mongoose.connection.db.collection('user_projects');
    const usersCollection = mongoose.connection.db.collection('users');
    
    // 1. IDENTIFIER TOUS LES USER IDs
    console.log('👥 ANALYSE DES UTILISATEURS:\n');
    
    // User IDs possibles
    const userIds = [
      { id: 'test_user_ezia_001', source: 'Simple Auth' },
      { id: '6895f0dc9e0ed4cba1feb385', source: 'test@ezia.ai MongoDB' }
    ];
    
    for (const user of userIds) {
      console.log(`\n📌 User ID: ${user.id} (${user.source})`);
      console.log('-'.repeat(50));
      
      // Compter les businesses
      const businessCount = await businessesCollection.countDocuments({
        $or: [
          { user_id: user.id },
          { userId: user.id }
        ]
      });
      
      // Compter les sites
      const siteCount = await userProjectsCollection.countDocuments({
        userId: user.id
      });
      
      console.log(`Businesses: ${businessCount}`);
      console.log(`Sites web: ${siteCount}`);
      
      if (businessCount > 0) {
        console.log('\nBusinesses:');
        const businesses = await businessesCollection.find({
          $or: [
            { user_id: user.id },
            { userId: user.id }
          ]
        }).toArray();
        
        for (const biz of businesses) {
          console.log(`  - ${biz.name} (${biz.business_id || biz._id})`);
          console.log(`    Website URL: ${biz.website_url || 'AUCUNE'}`);
        }
      }
      
      if (siteCount > 0) {
        console.log('\nSites web:');
        const sites = await userProjectsCollection.find({
          userId: user.id
        }).limit(5).toArray();
        
        for (const site of sites) {
          console.log(`  - ${site.name} (${site.projectId})`);
          console.log(`    Business: ${site.businessId}`);
          console.log(`    Status: ${site.status}`);
        }
      }
    }
    
    // 2. ANALYSER LE BUSINESS bus_1755845674151
    console.log('\n\n🏢 ANALYSE DU BUSINESS Rest\'Free (bus_1755845674151):\n');
    console.log('-'.repeat(50));
    
    const restFreeBusiness = await businessesCollection.findOne({
      business_id: 'bus_1755845674151'
    });
    
    if (restFreeBusiness) {
      console.log('Business trouvé:');
      console.log(`  - Nom: ${restFreeBusiness.name}`);
      console.log(`  - User ID: ${restFreeBusiness.user_id || restFreeBusiness.userId}`);
      console.log(`  - Website URL: ${restFreeBusiness.website_url || 'AUCUNE'}`);
      console.log(`  - Créé: ${restFreeBusiness.created_at || restFreeBusiness._createdAt}`);
      
      // Chercher ses sites
      const restFreeSites = await userProjectsCollection.find({
        businessId: 'bus_1755845674151'
      }).toArray();
      
      console.log(`\nSites de ce business: ${restFreeSites.length}`);
      if (restFreeSites.length > 0) {
        restFreeSites.forEach((site, idx) => {
          console.log(`\n${idx + 1}. ${site.name}`);
          console.log(`   - Project ID: ${site.projectId}`);
          console.log(`   - User ID du site: ${site.userId}`);
          console.log(`   - Status: ${site.status}`);
          console.log(`   - HTML: ${site.html ? site.html.length + ' caractères' : 'VIDE'}`);
        });
      }
    }
    
    // 3. PROBLÈME D'ASSOCIATION
    console.log('\n\n⚠️  ANALYSE DU PROBLÈME:\n');
    console.log('-'.repeat(50));
    
    // Vérifier les incohérences
    const sitesWithDifferentUserIds = await userProjectsCollection.aggregate([
      {
        $lookup: {
          from: 'businesses',
          let: { bizId: '$businessId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$business_id', '$$bizId'] },
                    { $eq: [{ $toString: '$_id' }, '$$bizId'] }
                  ]
                }
              }
            }
          ],
          as: 'business'
        }
      },
      {
        $project: {
          name: 1,
          projectId: 1,
          userId: 1,
          businessId: 1,
          businessUserId: { $arrayElemAt: ['$business.user_id', 0] },
          businessUserId2: { $arrayElemAt: ['$business.userId', 0] }
        }
      }
    ]).toArray();
    
    let mismatchCount = 0;
    sitesWithDifferentUserIds.forEach(site => {
      const bizUserId = site.businessUserId || site.businessUserId2;
      if (bizUserId && site.userId !== bizUserId) {
        mismatchCount++;
        console.log(`\n❌ Incohérence détectée:`);
        console.log(`   Site: ${site.name}`);
        console.log(`   User ID du site: ${site.userId}`);
        console.log(`   User ID du business: ${bizUserId}`);
      }
    });
    
    if (mismatchCount === 0) {
      console.log('✅ Pas d\'incohérence dans les user IDs');
    }
    
    // 4. SOLUTION PROPOSÉE
    console.log('\n\n💡 SOLUTION PROPOSÉE:\n');
    console.log('-'.repeat(50));
    
    console.log('Le problème principal est que vous avez 2 systèmes d\'authentification:');
    console.log('\n1. Simple Auth (test_user_ezia_001):');
    console.log('   - Utilisé quand vous accédez via /api/auth/login-simple');
    console.log('   - Stockage hybride (mémoire + MongoDB)');
    console.log('   - Pas de sites visibles car ils sont sous un autre ID');
    
    console.log('\n2. Auth normale (6895f0dc9e0ed4cba1feb385):');
    console.log('   - Utilisé quand vous accédez via /api/auth/login');
    console.log('   - Tous les sites sont ici');
    console.log('   - Mais vous n\'êtes pas connecté avec cet ID');
    
    console.log('\n📌 Actions à faire:');
    console.log('1. Vérifiez avec quelle méthode vous vous connectez');
    console.log('2. Si vous utilisez login-simple, les sites ne s\'afficheront pas');
    console.log('3. Utilisez /api/auth/login avec test@ezia.ai pour voir vos sites');
    
    // 5. URLs directes
    console.log('\n\n🔗 URLs DIRECTES DE VOS SITES:\n');
    console.log('-'.repeat(50));
    
    const allSites = await userProjectsCollection.find({
      businessId: 'bus_1755845674151'
    }).limit(3).toArray();
    
    if (allSites.length > 0) {
      console.log('Accédez directement à ces URLs:');
      allSites.forEach(site => {
        console.log(`\n${site.name}:`);
        console.log(`Preview: http://localhost:3000/preview/${site.projectId}`);
        console.log(`Public: http://localhost:3000/sites/public/${site.projectId}`);
        console.log(`Edit: http://localhost:3000/sites/${site._id}/edit`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n\n🔌 Connexion fermée');
  }
}

// Exécuter le diagnostic
diagnoseCompleteSystem();