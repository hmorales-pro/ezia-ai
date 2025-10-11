/**
 * Script de test du flux complet des analyses business
 *
 * Ce script vérifie:
 * 1. La création d'un business
 * 2. Le déclenchement des analyses
 * 3. La récupération des résultats
 * 4. L'affichage des données dans l'interface
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n=== Test du flux complet des analyses ===\n');

  // 1. Demander les credentials
  const email = await question('Email (ou appuyez sur Entrée pour hugo@test.com): ');
  const useEmail = email || 'hugo@test.com';

  const password = await question('Mot de passe (ou appuyez sur Entrée pour password): ');
  const usePassword = password || 'password';

  console.log(`\nUtilisation de l'email: ${useEmail}\n`);

  // 2. Authentification
  console.log('📝 Étape 1: Authentification...');

  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: useEmail,
      password: usePassword
    })
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    console.error('❌ Échec de l\'authentification:', error);
    console.log('\n⚠️  Assurez-vous d\'avoir un compte existant dans la base de données');
    console.log('Vous pouvez créer un compte via l\'interface web à http://localhost:3000\n');
    rl.close();
    return;
  }

  console.log('✅ Authentification réussie');

  // Récupérer le cookie
  const cookies = loginResponse.headers.get('set-cookie');
  const authToken = cookies?.match(/ezia-auth-token=([^;]+)/)?.[1];

  if (!authToken) {
    console.error('❌ Impossible de récupérer le token d\'authentification');
    rl.close();
    return;
  }

  console.log('✅ Token récupéré\n');

  // 3. Créer un nouveau business
  console.log('📝 Étape 2: Création d\'un business de test...');

  const businessName = `TestBusiness_${Date.now()}`;
  const createBusinessResponse = await fetch('http://localhost:3000/api/me/business', {
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

  if (!createBusinessResponse.ok) {
    const error = await createBusinessResponse.text();
    console.error('❌ Échec de création du business:', error);
    rl.close();
    return;
  }

  const createResult = await createBusinessResponse.json();
  const businessId = createResult.business?._id || createResult.business?.business_id;

  if (!businessId) {
    console.error('❌ Business ID non trouvé dans la réponse:', JSON.stringify(createResult, null, 2));
    rl.close();
    return;
  }

  console.log(`✅ Business créé: ${businessName} (ID: ${businessId})\n`);

  // 4. Déclencher les analyses
  console.log('📝 Étape 3: Déclenchement de toutes les analyses...');

  const analyzeResponse = await fetch(`http://localhost:3000/api/me/business/${businessId}/rerun-analysis`, {
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
    rl.close();
    return;
  }

  console.log('✅ Analyses déclenchées, attente de la génération...\n');

  // 5. Attendre et vérifier les résultats
  console.log('📊 Étape 4: Surveillance des statuts des analyses...\n');

  let attempts = 0;
  const maxAttempts = 60; // 60 secondes max
  let allCompleted = false;

  while (attempts < maxAttempts && !allCompleted) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    const statusResponse = await fetch(`http://localhost:3000/api/me/business/${businessId}/simple`, {
      headers: {
        'Cookie': `ezia-auth-token=${authToken}`
      }
    });

    if (!statusResponse.ok) {
      console.error('❌ Erreur lors de la récupération du statut');
      continue;
    }

    const statusData = await statusResponse.json();
    const business = statusData.business;

    if (!business) {
      console.error('❌ Business non trouvé dans la réponse');
      continue;
    }

    const statuses = business.agents_status || {};
    const market = business.market_analysis;
    const strategy = business.marketing_strategy;
    const competitor = business.competitor_analysis;
    const websitePrompt = business.website_prompt;

    // Afficher les statuts
    process.stdout.write(`\r[${attempts}s] Statuts: `);
    process.stdout.write(`Market: ${statuses.market_analysis || 'N/A'} `);
    process.stdout.write(`| Strategy: ${statuses.marketing_strategy || 'N/A'} `);
    process.stdout.write(`| Competitor: ${statuses.competitor_analysis || 'N/A'} `);
    process.stdout.write(`| Website: ${statuses.website_prompt || 'N/A'}`);

    // Vérifier si toutes les analyses sont terminées
    const allDone =
      statuses.market_analysis === 'completed' &&
      statuses.marketing_strategy === 'completed' &&
      statuses.competitor_analysis === 'completed' &&
      statuses.website_prompt === 'completed';

    if (allDone) {
      allCompleted = true;
      console.log('\n\n✅ Toutes les analyses sont terminées!\n');

      // Afficher un résumé
      console.log('📊 Résumé des données générées:');
      console.log('═══════════════════════════════════\n');

      if (market) {
        console.log('✅ Market Analysis:');
        console.log(`   - Executive Summary: ${market.executive_summary ? 'Présent' : 'Absent'}`);
        console.log(`   - Target Audience: ${market.target_audience ? 'Présent' : 'Absent'}`);
        console.log(`   - Market Overview: ${market.market_overview ? 'Présent' : 'Absent'}`);
        console.log(`   - PESTEL: ${market.pestel_analysis ? 'Présent' : 'Absent'}`);
        console.log(`   - SWOT: ${market.swot_analysis ? 'Présent' : 'Absent'}`);

        if (market.market_overview) {
          console.log(`   - Market Size: ${market.market_overview.market_size || 'N/A'}`);
          console.log(`   - Growth Rate: ${market.market_overview.growth_rate || 'N/A'}`);
          console.log(`   - Key Players: ${market.market_overview.key_players?.length || 0} concurrents`);
        }
      } else {
        console.log('❌ Market Analysis: ABSENTE');
      }

      console.log('');

      if (strategy) {
        console.log('✅ Marketing Strategy:');
        console.log(`   - Executive Summary: ${strategy.executive_summary ? 'Présent' : 'Absent'}`);
        console.log(`   - Brand Positioning: ${strategy.brand_positioning ? 'Présent' : 'Absent'}`);
        console.log(`   - Target Segments: ${strategy.target_segments ? 'Présent' : 'Absent'}`);
        console.log(`   - Marketing Channels: ${strategy.marketing_channels?.length || 0} canaux`);
        console.log(`   - Budget: ${strategy.budget_allocation?.total_budget || 'N/A'}`);
      } else {
        console.log('❌ Marketing Strategy: ABSENTE');
      }

      console.log('');

      if (competitor) {
        console.log('✅ Competitor Analysis:');
        console.log(`   - Main Competitors: ${competitor.main_competitors?.length || 0}`);
        console.log(`   - Competitive Advantages: ${competitor.competitive_advantages?.length || 0}`);
      } else {
        console.log('❌ Competitor Analysis: ABSENTE');
      }

      console.log('');

      if (websitePrompt) {
        console.log('✅ Website Prompt:');
        console.log(`   - Prompt Length: ${websitePrompt.prompt?.length || 0} caractères`);
        console.log(`   - Key Features: ${websitePrompt.key_features?.length || 0}`);
      } else {
        console.log('❌ Website Prompt: ABSENT');
      }

      console.log('\n═══════════════════════════════════\n');
      console.log(`🔗 URL pour voir le business: http://localhost:3000/business/${businessId}`);
      console.log('\n');
    }

    // Vérifier les échecs
    const hasFailed = Object.values(statuses).some(s => s === 'failed');
    if (hasFailed) {
      console.log('\n\n❌ Certaines analyses ont échoué');
      console.log('Statuts finaux:', statuses);
      break;
    }
  }

  if (!allCompleted && attempts >= maxAttempts) {
    console.log('\n\n⏱️  Timeout: les analyses prennent trop de temps');
    console.log('Vous pouvez vérifier manuellement à: http://localhost:3000/business/' + businessId);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Erreur:', error);
  rl.close();
  process.exit(1);
});
