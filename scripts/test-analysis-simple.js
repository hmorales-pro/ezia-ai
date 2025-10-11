/**
 * Script de test simple du flux complet des analyses business
 */

// Configuration
const AUTH_EMAIL = process.env.TEST_EMAIL || 'hugo@test.com';
const AUTH_PASSWORD = process.env.TEST_PASSWORD || 'password';
const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('\n=== Test du flux complet des analyses ===\n');
  console.log(`Utilisation de l'email: ${AUTH_EMAIL}\n`);

  // 1. Authentification
  console.log('📝 Étape 1: Authentification...');

  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD
    })
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    console.error('❌ Échec de l\'authentification:', error);
    console.log('\n⚠️  Assurez-vous d\'avoir un compte existant');
    console.log(`Email: ${AUTH_EMAIL}, Mot de passe: ${AUTH_PASSWORD}\n`);
    process.exit(1);
  }

  console.log('✅ Authentification réussie');

  // Récupérer le cookie
  const cookies = loginResponse.headers.get('set-cookie');
  const authToken = cookies?.match(/ezia-auth-token=([^;]+)/)?.[1];

  if (!authToken) {
    console.error('❌ Impossible de récupérer le token');
    process.exit(1);
  }

  console.log('✅ Token récupéré\n');

  // 2. Créer un nouveau business
  console.log('📝 Étape 2: Création d\'un business de test...');

  const businessName = `TestBoulangerie_${Date.now()}`;
  const createResponse = await fetch(`${API_BASE}/api/me/business`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ezia-auth-token=${authToken}`
    },
    body: JSON.stringify({
      name: businessName,
      description: 'Une boulangerie artisanale proposant des pains au levain naturel et des pâtisseries françaises traditionnelles',
      industry: 'boulangerie',
      stage: 'startup'
    })
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('❌ Échec de création du business:', error);
    process.exit(1);
  }

  const createResult = await createResponse.json();
  const businessId = createResult.business?._id || createResult.business?.business_id;

  if (!businessId) {
    console.error('❌ Business ID non trouvé:', JSON.stringify(createResult, null, 2));
    process.exit(1);
  }

  console.log(`✅ Business créé: ${businessName}`);
  console.log(`   ID: ${businessId}\n`);

  // 3. Déclencher les analyses
  console.log('📝 Étape 3: Déclenchement de toutes les analyses...');

  const analyzeResponse = await fetch(`${API_BASE}/api/me/business/${businessId}/rerun-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ezia-auth-token=${authToken}`
    },
    body: JSON.stringify({
      analysisType: 'all'
    })
  });

  if (!analyzeResponse.ok) {
    const error = await analyzeResponse.text();
    console.error('❌ Échec du déclenchement des analyses:', error);
    process.exit(1);
  }

  console.log('✅ Analyses déclenchées\n');
  console.log('📊 Surveillance des statuts...\n');

  // 4. Surveiller les analyses
  let attempts = 0;
  const maxAttempts = 60; // 60 secondes
  let allCompleted = false;
  let lastStatus = null;

  while (attempts < maxAttempts && !allCompleted) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    const statusResponse = await fetch(`${API_BASE}/api/me/business/${businessId}/simple`, {
      headers: {
        'Cookie': `ezia-auth-token=${authToken}`
      }
    });

    if (!statusResponse.ok) {
      process.stdout.write(`\r[${attempts}s] ❌ Erreur de récupération`);
      continue;
    }

    const statusData = await statusResponse.json();
    const business = statusData.business;

    if (!business) {
      process.stdout.write(`\r[${attempts}s] ❌ Business non trouvé`);
      continue;
    }

    const statuses = business.agents_status || {};
    const statusStr = JSON.stringify(statuses);

    // Afficher seulement si le statut a changé
    if (statusStr !== lastStatus) {
      process.stdout.write('\n');
      console.log(`[${attempts}s] Statuts:`);
      console.log(`  - Market Analysis: ${statuses.market_analysis || 'N/A'}`);
      console.log(`  - Marketing Strategy: ${statuses.marketing_strategy || 'N/A'}`);
      console.log(`  - Competitor Analysis: ${statuses.competitor_analysis || 'N/A'}`);
      console.log(`  - Website Prompt: ${statuses.website_prompt || 'N/A'}`);
      lastStatus = statusStr;
    } else {
      process.stdout.write(`\r[${attempts}s] En cours...`);
    }

    // Vérifier si toutes les analyses sont terminées
    const allDone =
      statuses.market_analysis === 'completed' &&
      statuses.marketing_strategy === 'completed' &&
      statuses.competitor_analysis === 'completed' &&
      statuses.website_prompt === 'completed';

    if (allDone) {
      allCompleted = true;
      process.stdout.write('\n');
      console.log('\n✅ Toutes les analyses sont terminées!\n');

      // Afficher le résumé
      console.log('═══════════════════════════════════');
      console.log('📊 Résumé des données générées');
      console.log('═══════════════════════════════════\n');

      const market = business.market_analysis;
      const strategy = business.marketing_strategy;
      const competitor = business.competitor_analysis;
      const websitePrompt = business.website_prompt;

      if (market) {
        console.log('✅ Market Analysis:');
        console.log(`   - Executive Summary: ${market.executive_summary ? '✓' : '✗'}`);
        console.log(`   - Target Audience: ${market.target_audience ? '✓' : '✗'}`);
        console.log(`   - Market Overview: ${market.market_overview ? '✓' : '✗'}`);
        console.log(`   - PESTEL: ${market.pestel_analysis ? '✓' : '✗'}`);
        console.log(`   - SWOT: ${market.swot_analysis ? '✓' : '✗'}`);

        if (market.market_overview) {
          console.log(`   - Taille: ${market.market_overview.market_size || 'N/A'}`);
          console.log(`   - Croissance: ${market.market_overview.growth_rate || 'N/A'}`);
          console.log(`   - Concurrents: ${market.market_overview.key_players?.length || 0}`);
        }
      } else {
        console.log('❌ Market Analysis: MANQUANTE');
      }

      console.log('');

      if (strategy) {
        console.log('✅ Marketing Strategy:');
        console.log(`   - Executive Summary: ${strategy.executive_summary ? '✓' : '✗'}`);
        console.log(`   - Brand Positioning: ${strategy.brand_positioning ? '✓' : '✗'}`);
        console.log(`   - Target Segments: ${strategy.target_segments ? '✓' : '✗'}`);
        console.log(`   - Canaux: ${strategy.marketing_channels?.length || 0}`);
        console.log(`   - Budget: ${strategy.budget_allocation?.total_budget || 'N/A'}`);
      } else {
        console.log('❌ Marketing Strategy: MANQUANTE');
      }

      console.log('');

      if (competitor) {
        console.log('✅ Competitor Analysis:');
        console.log(`   - Concurrents: ${competitor.main_competitors?.length || 0}`);
        console.log(`   - Avantages: ${competitor.competitive_advantages?.length || 0}`);
      } else {
        console.log('❌ Competitor Analysis: MANQUANTE');
      }

      console.log('');

      if (websitePrompt) {
        console.log('✅ Website Prompt:');
        console.log(`   - Longueur: ${websitePrompt.prompt?.length || 0} caractères`);
        console.log(`   - Features: ${websitePrompt.key_features?.length || 0}`);
      } else {
        console.log('❌ Website Prompt: MANQUANT');
      }

      console.log('\n═══════════════════════════════════\n');
      console.log(`🔗 Voir le business: ${API_BASE}/business/${businessId}`);
      console.log('\n');
    }

    // Vérifier les échecs
    const hasFailed = Object.values(statuses).some(s => s === 'failed');
    if (hasFailed) {
      process.stdout.write('\n');
      console.log('\n❌ Certaines analyses ont échoué');
      console.log('Statuts finaux:', statuses);
      break;
    }
  }

  if (!allCompleted && attempts >= maxAttempts) {
    console.log('\n\n⏱️  Timeout: les analyses prennent trop de temps');
    console.log(`Vérifier manuellement: ${API_BASE}/business/${businessId}`);
  }

  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Erreur:', error);
  process.exit(1);
});
