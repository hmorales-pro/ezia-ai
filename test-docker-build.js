#!/usr/bin/env node

/**
 * Script pour tester les problèmes potentiels du build Docker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Test de préparation pour Docker build\n');

// 1. Vérifier package-lock.json
console.log('1️⃣ Vérification de package-lock.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  
  console.log('✅ package-lock.json existe');
  
  // Vérifier la synchronisation
  if (packageLock.name !== packageJson.name || packageLock.version !== packageJson.version) {
    console.log('⚠️  package-lock.json n\'est pas synchronisé avec package.json');
    console.log('   Solution: rm package-lock.json && npm install');
  } else {
    console.log('✅ package-lock.json est synchronisé');
  }
} catch (error) {
  console.log('❌ Erreur avec package-lock.json:', error.message);
}

// 2. Vérifier les variables d'environnement requises
console.log('\n2️⃣ Variables d\'environnement requises pour le build...');
const requiredEnvVars = [
  'MONGODB_URI',
  'HF_TOKEN',
  'DEFAULT_HF_TOKEN'
];

const missingEnvVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingEnvVars.push(varName);
    console.log(`❌ ${varName} n'est pas défini`);
  } else {
    console.log(`✅ ${varName} est défini`);
  }
});

// 3. Vérifier la configuration Next.js
console.log('\n3️⃣ Vérification de la configuration Next.js...');
try {
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  if (nextConfig.includes("output: 'standalone'")) {
    console.log('✅ output: standalone est configuré');
  } else {
    console.log('❌ output: standalone n\'est pas configuré');
  }
} catch (error) {
  console.log('❌ Erreur lors de la lecture de next.config.ts');
}

// 4. Vérifier .dockerignore
console.log('\n4️⃣ Vérification de .dockerignore...');
if (fs.existsSync('.dockerignore')) {
  console.log('✅ .dockerignore existe');
  const dockerignore = fs.readFileSync('.dockerignore', 'utf8');
  const importantIgnores = ['node_modules', '.git', '.next', '.env'];
  importantIgnores.forEach(ignore => {
    if (dockerignore.includes(ignore)) {
      console.log(`  ✅ ${ignore} est ignoré`);
    } else {
      console.log(`  ⚠️  ${ignore} n'est pas ignoré`);
    }
  });
} else {
  console.log('❌ .dockerignore n\'existe pas');
}

// 5. Test de build Next.js
console.log('\n5️⃣ Test du build Next.js...');
console.log('⏳ Ceci peut prendre quelques minutes...');

// Créer un fichier .env temporaire si nécessaire
let tempEnvCreated = false;
if (!fs.existsSync('.env.local') && !fs.existsSync('.env')) {
  console.log('📝 Création d\'un .env temporaire pour le test...');
  fs.writeFileSync('.env', `
MONGODB_URI=mongodb://localhost:27017/test
HF_TOKEN=test-token
DEFAULT_HF_TOKEN=test-token
JWT_SECRET=test-secret
NEXTAUTH_SECRET=test-secret
`);
  tempEnvCreated = true;
}

try {
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
    }
  });
  console.log('\n✅ Build Next.js réussi !');
} catch (error) {
  console.log('\n❌ Erreur lors du build Next.js');
  console.log('Vérifiez les erreurs ci-dessus');
}

// Nettoyer le fichier temporaire
if (tempEnvCreated) {
  fs.unlinkSync('.env');
}

// 6. Vérifier la taille du projet
console.log('\n6️⃣ Taille du projet...');
try {
  const totalSize = execSync('du -sh .', { encoding: 'utf8' }).trim();
  console.log(`📦 Taille totale: ${totalSize}`);
  
  if (fs.existsSync('.next')) {
    const nextSize = execSync('du -sh .next', { encoding: 'utf8' }).trim();
    console.log(`📦 Taille .next: ${nextSize}`);
  }
} catch (error) {
  console.log('⚠️  Impossible de calculer la taille');
}

// Résumé
console.log('\n📋 RÉSUMÉ DES ACTIONS RECOMMANDÉES:');
console.log('====================================');

if (missingEnvVars.length > 0) {
  console.log('\n1. Définir les variables d\'environnement manquantes dans Dokploy:');
  missingEnvVars.forEach(v => console.log(`   - ${v}`));
}

console.log('\n2. Pour tester le build Docker localement:');
console.log('   docker build -t ezia-test .');

console.log('\n3. Pour tester avec docker-compose:');
console.log('   docker-compose build');

console.log('\n✅ Script de test terminé');