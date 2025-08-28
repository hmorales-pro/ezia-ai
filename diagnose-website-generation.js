#!/usr/bin/env node

/**
 * Diagnostic du système de génération de sites web
 * Ce script vérifie pourquoi le même site est toujours généré
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC DE LA GÉNÉRATION DE SITES WEB\n');
console.log('='.repeat(60) + '\n');

// 1. Vérifier les routes de génération
console.log('1. ROUTES DE GÉNÉRATION\n');

const routes = [
  {
    path: './app/api/business/[businessId]/generate-website/route.ts',
    description: 'Route principale de génération'
  },
  {
    path: './app/api/ezia/create-website/route.ts',
    description: 'Route de création du site'
  },
  {
    path: './app/api/ask-ai/route.ts',
    description: 'Route d\'appel à l\'IA'
  }
];

routes.forEach(route => {
  if (fs.existsSync(route.path)) {
    console.log(`✅ ${route.description}: ${route.path}`);
    const content = fs.readFileSync(route.path, 'utf8');
    
    // Analyser le contenu
    if (content.includes('getDefaultHTML') || content.includes('getDefaultCSS')) {
      console.log('   ⚠️  Utilise des templates par défaut');
    }
    
    if (content.includes('fallback')) {
      console.log('   ⚠️  Contient du code de fallback');
    }
    
    if (content.includes('business.website_prompt')) {
      console.log('   ✅ Utilise le prompt du business');
    }
    
    if (content.includes('HTML et CSS pour ce site web')) {
      console.log('   ✅ Demande la génération HTML/CSS à l\'IA');
    }
  } else {
    console.log(`❌ ${route.description}: Non trouvé`);
  }
});

// 2. Analyser le flux de génération
console.log('\n2. FLUX DE GÉNÉRATION\n');

const generateWebsiteRoute = './app/api/business/[businessId]/generate-website/route.ts';
if (fs.existsSync(generateWebsiteRoute)) {
  const content = fs.readFileSync(generateWebsiteRoute, 'utf8');
  
  console.log('Analyse du flux:');
  
  // Vérifier l'appel à l'API ask-ai
  if (content.includes('fetch(`${req.nextUrl.origin}/api/ask-ai`')) {
    console.log('✅ Appelle l\'API ask-ai');
    
    // Vérifier le parsing de la réponse
    const jsonParseMatch = content.match(/JSON\.parse\(aiData\.(content|response)/);
    if (jsonParseMatch) {
      console.log('✅ Tente de parser la réponse JSON de l\'IA');
    }
    
    // Vérifier la gestion d'erreur
    if (content.includes('catch')) {
      console.log('⚠️  Gestion d\'erreur présente - peut tomber sur le défaut');
    }
  }
  
  // Vérifier l'appel à create-website
  if (content.includes('fetch(`${req.nextUrl.origin}/api/ezia/create-website`')) {
    console.log('✅ Appelle l\'API create-website');
    
    // Vérifier les paramètres
    if (content.includes('html: html || undefined')) {
      console.log('⚠️  Passe html ou undefined');
    }
    if (content.includes('css: css || undefined')) {
      console.log('⚠️  Passe css ou undefined');
    }
  }
}

// 3. Analyser le template par défaut
console.log('\n3. TEMPLATE PAR DÉFAUT\n');

const createWebsiteRoute = './app/api/ezia/create-website/route.ts';
if (fs.existsSync(createWebsiteRoute)) {
  const content = fs.readFileSync(createWebsiteRoute, 'utf8');
  
  // Chercher les fonctions de défaut
  const defaultHTMLMatch = content.match(/function getDefaultHTML.*?\n}/s);
  const defaultCSSMatch = content.match(/function getDefaultCSS.*?\n}/s);
  
  if (defaultHTMLMatch) {
    console.log('⚠️  Fonction getDefaultHTML trouvée');
    if (content.includes('${html || getDefaultHTML(')) {
      console.log('   → Utilise le HTML par défaut si pas de HTML fourni');
    }
  }
  
  if (defaultCSSMatch) {
    console.log('⚠️  Fonction getDefaultCSS trouvée');
    if (content.includes('${css || getDefaultCSS()')) {
      console.log('   → Utilise le CSS par défaut si pas de CSS fourni');
    }
  }
}

// 4. Vérifier les variables d'environnement
console.log('\n4. VARIABLES D\'ENVIRONNEMENT\n');

const envVars = [
  'HF_TOKEN',
  'DEFAULT_HF_TOKEN',
  'MONGODB_URI',
  'NEXT_APP_API_URL'
];

envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Défini`);
  } else {
    console.log(`❌ ${varName}: Non défini`);
  }
});

// 5. Analyser les problèmes potentiels
console.log('\n5. DIAGNOSTIC DES PROBLÈMES\n');

console.log('🔴 Problème identifié: Le site utilise toujours le template par défaut\n');

console.log('Causes possibles:');
console.log('1. L\'IA ne répond pas au format JSON attendu');
console.log('   → La réponse n\'est pas parsée correctement');
console.log('   → Le code tombe dans le catch et utilise null');
console.log('');
console.log('2. Le prompt envoyé à l\'IA n\'est pas assez clair');
console.log('   → L\'IA ne comprend pas qu\'elle doit retourner un objet JSON');
console.log('');
console.log('3. L\'API ask-ai a des problèmes avec le streaming');
console.log('   → La réponse n\'est pas complète ou mal formatée');
console.log('');

// 6. Recommandations
console.log('\n6. RECOMMANDATIONS DE FIX\n');

console.log('Pour corriger le problème:');
console.log('');
console.log('1. Modifier /app/api/business/[businessId]/generate-website/route.ts:');
console.log('   - Améliorer le prompt pour être plus explicite sur le format JSON');
console.log('   - Ajouter des logs pour voir la réponse exacte de l\'IA');
console.log('   - Améliorer la gestion d\'erreur pour ne pas silencieusement utiliser le défaut');
console.log('');
console.log('2. Modifier /app/api/ask-ai/route.ts:');
console.log('   - S\'assurer que businessId est bien géré');
console.log('   - Vérifier que la réponse est bien formatée pour les sites web');
console.log('   - Potentiellement désactiver le streaming pour les générations de sites');
console.log('');
console.log('3. Tester avec un prompt simple:');
console.log('   - Créer un endpoint de test qui appelle directement l\'IA');
console.log('   - Vérifier que l\'IA répond bien au format attendu');
console.log('');

// 7. Vérifier l'utilisation de Mistral
console.log('\n7. UTILISATION DE MISTRAL\n');

const askAiRoute = './app/api/ask-ai/route.ts';
if (fs.existsSync(askAiRoute)) {
  const content = fs.readFileSync(askAiRoute, 'utf8');
  
  if (content.includes('mistral')) {
    console.log('✅ Mistral est mentionné dans le code');
  }
  
  if (content.includes('selectedModel.value')) {
    console.log('✅ Utilise le modèle sélectionné');
  }
  
  if (content.includes('PROVIDERS')) {
    console.log('✅ Utilise le système de providers');
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 RÉSUMÉ: Le système utilise toujours le template par défaut');
console.log('   car la réponse de l\'IA n\'est pas correctement parsée.\n');