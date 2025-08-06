#!/usr/bin/env ts-node
// Test complet de toutes les fonctionnalités Ezia

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Test data
const testBusiness = {
  name: "Test Restaurant Gourmet",
  description: "Restaurant gastronomique français avec une cuisine innovante",
  industry: "Restauration",
  stage: "growth"
};

// Helper pour faire des requêtes API
async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`\n📡 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`✅ Status: ${response.status}`);
    if (!response.ok) {
      console.error('❌ Error:', data);
    }
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('❌ Request failed:', error);
    return { ok: false, status: 0, data: null, error };
  }
}

// Test la création d'un business
async function testCreateBusiness() {
  console.log('\n🧪 Test 1: Création d\'un nouveau business');
  
  const result = await apiRequest('/api/me/business', {
    method: 'POST',
    body: JSON.stringify(testBusiness)
  });
  
  if (result.ok) {
    console.log('✅ Business créé:', result.data.business.business_id);
    return result.data.business;
  }
  return null;
}

// Test le chat Ezia pour créer un site web
async function testWebsiteCreation(businessId: string) {
  console.log('\n🧪 Test 2: Création de site web via Ezia');
  
  const messages = [
    {
      role: "user",
      content: "Je veux créer un site web moderne pour mon restaurant avec les sections: accueil, menu, réservations, contact"
    }
  ];
  
  const result = await apiRequest('/api/ezia/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      businessId,
      businessName: testBusiness.name,
      actionType: 'create_website',
      context: ''
    })
  });
  
  if (result.ok) {
    console.log('✅ Chat stream initié');
    // Note: En production, il faudrait lire le stream SSE
  }
  
  return result;
}

// Test l'analyse de marché
async function testMarketAnalysis(businessId: string) {
  console.log('\n🧪 Test 3: Analyse de marché');
  
  const messages = [
    {
      role: "user",
      content: "Mon restaurant cible une clientèle aisée de 30-50 ans, située dans le 8ème arrondissement de Paris. Mes concurrents principaux sont Le Jules Verne et L'Ambroisie."
    }
  ];
  
  const result = await apiRequest('/api/ezia/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      businessId,
      businessName: testBusiness.name,
      actionType: 'market_analysis',
      context: ''
    })
  });
  
  return result;
}

// Test la stratégie marketing
async function testMarketingStrategy(businessId: string) {
  console.log('\n🧪 Test 4: Stratégie marketing');
  
  const messages = [
    {
      role: "user", 
      content: "Je veux augmenter ma visibilité et attirer plus de clients. Mon budget marketing est de 5000€/mois."
    }
  ];
  
  const result = await apiRequest('/api/ezia/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      businessId,
      businessName: testBusiness.name,
      actionType: 'marketing_strategy',
      context: ''
    })
  });
  
  return result;
}

// Test de récupération d'un business
async function testGetBusiness(businessId: string) {
  console.log('\n🧪 Test: Récupération des détails du business');
  
  const result = await apiRequest(`/api/me/business/${businessId}`);
  
  if (result.ok) {
    console.log('✅ Business récupéré');
    console.log('- Nom:', result.data.business.name);
    console.log('- Interactions:', result.data.business.ezia_interactions?.length || 0);
    console.log('- Website URL:', result.data.business.website_url || 'Aucun');
  }
  
  return result;
}

// Test principal
async function runAllTests() {
  console.log('🚀 Début des tests complets Ezia\n');
  
  try {
    // Test 1: Créer un business
    const business = await testCreateBusiness();
    if (!business) {
      console.error('❌ Impossible de créer le business. Arrêt des tests.');
      return;
    }
    
    const businessId = business.business_id;
    console.log(`\n📝 Business ID pour les tests: ${businessId}`);
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Créer un site web
    await testWebsiteCreation(businessId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Analyse de marché
    await testMarketAnalysis(businessId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Stratégie marketing
    await testMarketingStrategy(businessId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Vérifier l'état final du business
    await testGetBusiness(businessId);
    
    console.log('\n✅ Tests terminés!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
  }
}

// Lancer les tests
runAllTests();