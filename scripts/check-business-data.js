/**
 * Script pour vérifier les données des business dans MongoDB
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  try {
    console.log('\n=== Vérification des données business ===\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI non configuré');
      process.exit(1);
    }

    console.log('📝 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les business
    const Business = mongoose.model('Business', new mongoose.Schema({}, { strict: false }));
    const businesses = await Business.find({}).limit(5).sort({ _createdAt: -1 });

    console.log(`📊 Trouvé ${businesses.length} business (5 plus récents):\n`);

    for (const business of businesses) {
      console.log('═══════════════════════════════════');
      console.log(`Business: ${business.name}`);
      console.log(`ID: ${business._id || business.business_id}`);
      console.log(`Industrie: ${business.industry}`);
      console.log(`Créé: ${business._createdAt}`);
      console.log('');

      // Vérifier les statuts des agents
      const statuses = business.agents_status || {};
      console.log('Statuts des agents:');
      console.log(`  - market_analysis: ${statuses.market_analysis || 'N/A'}`);
      console.log(`  - marketing_strategy: ${statuses.marketing_strategy || 'N/A'}`);
      console.log(`  - competitor_analysis: ${statuses.competitor_analysis || 'N/A'}`);
      console.log(`  - website_prompt: ${statuses.website_prompt || 'N/A'}`);
      console.log('');

      // Vérifier les données d'analyse
      console.log('Donnees d\'analyse:');
      const maKeys = business.market_analysis ? Object.keys(business.market_analysis).length : 0;
      const msKeys = business.marketing_strategy ? Object.keys(business.marketing_strategy).length : 0;
      const caKeys = business.competitor_analysis ? Object.keys(business.competitor_analysis).length : 0;
      console.log(`  - market_analysis: ${business.market_analysis ? `Présent (${maKeys} clés)` : 'ABSENT'}`);
      console.log(`  - marketing_strategy: ${business.marketing_strategy ? `Présent (${msKeys} clés)` : 'ABSENT'}`);
      console.log(`  - competitor_analysis: ${business.competitor_analysis ? `Présent (${caKeys} clés)` : 'ABSENT'}`);
      console.log(`  - website_prompt: ${business.website_prompt ? 'Présent' : 'ABSENT'}`);
      console.log('');

      // Si market_analysis existe, afficher plus de détails
      if (business.market_analysis) {
        const ma = business.market_analysis;
        console.log('Market Analysis - Structure:');
        console.log(`  - executive_summary: ${ma.executive_summary ? '✓' : '✗'}`);
        console.log(`  - target_audience: ${ma.target_audience ? '✓' : '✗'}`);
        console.log(`  - market_overview: ${ma.market_overview ? '✓' : '✗'}`);
        console.log(`  - pestel_analysis: ${ma.pestel_analysis ? '✓' : '✗'}`);
        console.log(`  - swot_analysis: ${ma.swot_analysis ? '✓' : '✗'}`);

        if (ma.market_overview) {
          console.log('');
          console.log('Market Overview:');
          console.log(`  - market_size: ${ma.market_overview.market_size || 'N/A'}`);
          console.log(`  - growth_rate: ${ma.market_overview.growth_rate || 'N/A'}`);
          console.log(`  - market_maturity: ${ma.market_overview.market_maturity || 'N/A'}`);
          console.log(`  - key_players: ${ma.market_overview.key_players?.length || 0} concurrents`);
          if (ma.market_overview.key_players?.length > 0) {
            console.log(`    Exemples: ${ma.market_overview.key_players.slice(0, 3).join(', ')}`);
          }
        }
      }

      // Si marketing_strategy existe, afficher plus de détails
      if (business.marketing_strategy) {
        const ms = business.marketing_strategy;
        console.log('');
        console.log('Marketing Strategy - Structure:');
        console.log(`  - executive_summary: ${ms.executive_summary ? '✓' : '✗'}`);
        console.log(`  - brand_positioning: ${ms.brand_positioning ? '✓' : '✗'}`);
        console.log(`  - target_segments: ${ms.target_segments ? '✓' : '✗'}`);
        console.log(`  - marketing_channels: ${ms.marketing_channels?.length || 0} canaux`);
        console.log(`  - budget_allocation: ${ms.budget_allocation ? '✓' : '✗'}`);
        if (ms.budget_allocation) {
          console.log(`    Budget total: ${ms.budget_allocation.total_budget || 'N/A'}`);
        }
      }

      console.log('');
    }

    console.log('═══════════════════════════════════\n');

    // Statistiques globales
    const totalBusinesses = await Business.countDocuments();
    const withMarketAnalysis = await Business.countDocuments({ market_analysis: { $exists: true, $ne: null } });
    const withMarketingStrategy = await Business.countDocuments({ marketing_strategy: { $exists: true, $ne: null } });

    console.log('📊 Statistiques globales:');
    console.log(`  - Total business: ${totalBusinesses}`);
    console.log(`  - Avec market_analysis: ${withMarketAnalysis} (${Math.round(withMarketAnalysis / totalBusinesses * 100)}%)`);
    console.log(`  - Avec marketing_strategy: ${withMarketingStrategy} (${Math.round(withMarketingStrategy / totalBusinesses * 100)}%)`);
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
