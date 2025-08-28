#!/usr/bin/env node

/**
 * Script pour corriger la génération de sites web
 * Remplace les fichiers problématiques par des versions corrigées
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DE LA GÉNÉRATION DE SITES WEB\n');
console.log('='.repeat(60) + '\n');

// 1. Sauvegarder l'original
console.log('1. Sauvegarde du fichier original...');
const originalFile = './app/api/business/[businessId]/generate-website/route.ts';
const backupFile = './app/api/business/[businessId]/generate-website/route.backup.ts';
const fixedFile = './app/api/business/[businessId]/generate-website/route-fixed.ts';

if (fs.existsSync(originalFile)) {
  fs.copyFileSync(originalFile, backupFile);
  console.log('✅ Backup créé:', backupFile);
} else {
  console.log('❌ Fichier original non trouvé');
  process.exit(1);
}

// 2. Appliquer le fix
console.log('\n2. Application du fix...');
if (fs.existsSync(fixedFile)) {
  fs.copyFileSync(fixedFile, originalFile);
  console.log('✅ Fix appliqué:', originalFile);
} else {
  console.log('❌ Fichier de fix non trouvé');
  process.exit(1);
}

// 3. Vérifier la route ask-ai
console.log('\n3. Vérification de la route ask-ai...');
const askAiRoute = './app/api/ask-ai/route.ts';
if (fs.existsSync(askAiRoute)) {
  const content = fs.readFileSync(askAiRoute, 'utf8');
  
  // Vérifier si le streaming peut être désactivé
  if (content.includes('stream: false')) {
    console.log('✅ La route ask-ai supporte déjà stream: false');
  } else {
    console.log('⚠️  La route ask-ai pourrait nécessiter des ajustements pour stream: false');
  }
  
  // Vérifier si businessId est géré
  if (content.includes('businessId')) {
    console.log('✅ La route ask-ai gère déjà businessId');
  }
}

// 4. Résumé des changements
console.log('\n4. RÉSUMÉ DES CHANGEMENTS APPLIQUÉS:\n');
console.log('📝 Dans generate-website/route.ts:');
console.log('   - Prompt amélioré pour demander explicitement du JSON');
console.log('   - Désactivation du streaming pour une réponse complète');
console.log('   - Meilleure gestion du parsing de la réponse');
console.log('   - Logs détaillés pour le debugging');
console.log('   - Gestion d\'erreur améliorée');
console.log('   - Suppression du || undefined pour html et css');

console.log('\n✅ CORRECTION APPLIQUÉE AVEC SUCCÈS !');
console.log('\nPour tester:');
console.log('1. Redémarrer le serveur de développement');
console.log('2. Créer un nouveau business ou utiliser un existant');
console.log('3. Cliquer sur "Générer le site maintenant"');
console.log('4. Vérifier les logs du serveur pour voir la réponse de l\'IA');

console.log('\nPour revenir en arrière:');
console.log(`cp ${backupFile} ${originalFile}`);

console.log('\n' + '='.repeat(60));