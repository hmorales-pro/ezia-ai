/**
 * Script pour inspecter les détails complets d'un business
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  try {
    console.log('\n=== Inspection détaillée du business ===\n');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI non configuré');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    const Business = mongoose.model('Business', new mongoose.Schema({}, { strict: false }));
    const business = await Business.findOne({ name: "Rest'Free2" });

    if (!business) {
      console.error('❌ Business Rest\'Free2 non trouvé');
      process.exit(1);
    }

    console.log('═════════════════════════════════════════════\n');
    console.log('📊 MARKET ANALYSIS - Structure complète:\n');
    console.log(JSON.stringify(business.market_analysis, null, 2));
    console.log('\n═════════════════════════════════════════════\n');
    console.log('📊 MARKETING STRATEGY - Structure complète:\n');
    console.log(JSON.stringify(business.marketing_strategy, null, 2));
    console.log('\n═════════════════════════════════════════════\n');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
