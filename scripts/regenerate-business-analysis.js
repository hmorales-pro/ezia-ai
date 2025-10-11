/**
 * Script pour régénérer les analyses d'un business avec les nouvelles transformations
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  try {
    console.log('\n=== Régénération des analyses business ===\n');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI non configuré');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    const Business = mongoose.model('Business', new mongoose.Schema({}, { strict: false }));

    // Récupérer Rest'Free2
    const business = await Business.findOne({ name: "Rest'Free2" });

    if (!business) {
      console.error('❌ Business Rest\'Free2 non trouvé');
      process.exit(1);
    }

    console.log(`📊 Business trouvé: ${business.name} (${business._id})\n`);
    console.log('🔄 Réinitialisation des statuts...\n');

    // Réinitialiser les statuts
    await Business.updateOne(
      { _id: business._id },
      {
        $set: {
          'agents_status.market_analysis': 'pending',
          'agents_status.marketing_strategy': 'pending',
          'agents_status.competitor_analysis': 'pending',
          'agents_status.website_prompt': 'pending'
        }
      }
    );

    console.log('✅ Statuts réinitialisés à "pending"\n');
    console.log('ℹ️  Les analyses seront régénérées automatiquement par le système\n');
    console.log('📝 Surveillez les logs du serveur pour voir la progression\n');
    console.log(`🔗 Accédez au business à: http://localhost:3000/business/${business.business_id}\n`);

    // Optionnel: déclencher immédiatement la régénération via API
    console.log('💡 Pour déclencher immédiatement la régénération, utilisez le bouton\n');
    console.log('   "Régénérer" dans l\'interface web ou appelez l\'API:\n');
    console.log(`   curl -X POST http://localhost:3000/api/me/business/${business.business_id}/rerun-analysis \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"analysisType": "all"}'\n`);

    await mongoose.disconnect();
    console.log('✅ Terminé\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
