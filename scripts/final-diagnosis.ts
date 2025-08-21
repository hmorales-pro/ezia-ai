import { promises as fs } from 'fs';
import path from 'path';

// Script de diagnostic final pour identifier le problème de persistance

async function finalDiagnosis() {
  console.log('🔍 DIAGNOSTIC FINAL - Problème de persistance des sites web\n');
  
  const storageDir = path.join(process.cwd(), '.data');
  const projectsFile = path.join(storageDir, 'projects.json');
  const businessesFile = path.join(storageDir, 'businesses.json');
  const backupProjects = path.join(storageDir, 'projects.backup.json');
  const backupBusinesses = path.join(storageDir, 'businesses.backup.json');

  // 1. Vérifier l'état actuel des fichiers
  console.log('1️⃣ État actuel des fichiers:');
  for (const [name, file] of [
    ['projects.json', projectsFile],
    ['businesses.json', businessesFile],
    ['projects.backup.json', backupProjects],
    ['businesses.backup.json', backupBusinesses]
  ]) {
    try {
      const stats = await fs.stat(file);
      console.log(`   ${name}: ${stats.size} octets, modifié le ${stats.mtime}`);
    } catch {
      console.log(`   ${name}: N'EXISTE PAS`);
    }
  }

  // 2. Diagnostiquer les causes potentielles
  console.log('\n2️⃣ Causes potentielles identifiées:');
  console.log('   a) Synchronisation mémoire/fichier défaillante');
  console.log('   b) Processus concurrent vidant les fichiers');
  console.log('   c) Problème de permissions sur les fichiers');
  console.log('   d) Hot-reload de Next.js qui réinitialise le module');

  // 3. Restaurer depuis les sauvegardes si disponibles
  console.log('\n3️⃣ Tentative de restauration:');
  
  // Restaurer projects.json
  const backupProjectsExists = await fs.access(backupProjects).then(() => true).catch(() => false);
  if (backupProjectsExists) {
    const backupContent = await fs.readFile(backupProjects, 'utf-8');
    await fs.writeFile(projectsFile, backupContent);
    console.log('   ✅ projects.json restauré depuis la sauvegarde');
  } else {
    // Créer un projet de test minimal
    const testData = {
      "test_user_ezia_001": [{
        "id": "project-debug-" + Date.now(),
        "userId": "test_user_ezia_001",
        "businessId": "bus_debug",
        "businessName": "Test Debug",
        "name": "Site de test - Debug persistance",
        "description": "Site créé pour tester la persistance",
        "html": "<!DOCTYPE html><html><head><title>Test Debug</title></head><body><h1>Site de test pour debug persistance</h1><p>Ce site a été créé pour tester la persistance des données.</p></body></html>",
        "css": "",
        "js": "",
        "prompt": "Site de test pour debug",
        "version": 1,
        "versions": [{
          "version": 1,
          "html": "<!DOCTYPE html><html><head><title>Test Debug</title></head><body><h1>Site de test pour debug persistance</h1><p>Ce site a été créé pour tester la persistance des données.</p></body></html>",
          "css": "",
          "js": "",
          "prompt": "Site de test pour debug",
          "createdAt": new Date().toISOString(),
          "createdBy": "Debug System"
        }],
        "status": "draft",
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "metadata": {
          "generatedBy": "debug-system",
          "industry": "test",
          "targetAudience": "debug",
          "features": ["debug"]
        }
      }]
    };
    await fs.writeFile(projectsFile, JSON.stringify(testData, null, 2));
    console.log('   ⚠️  Nouveau projet de test créé');
  }

  // Restaurer businesses.json
  const backupBusinessesExists = await fs.access(backupBusinesses).then(() => true).catch(() => false);
  if (backupBusinessesExists) {
    const backupContent = await fs.readFile(backupBusinesses, 'utf-8');
    await fs.writeFile(businessesFile, backupContent);
    console.log('   ✅ businesses.json restauré depuis la sauvegarde');
  } else {
    // Créer un business de test minimal
    const testBusiness = [{
      "_id": "bus_debug",
      "business_id": "bus_debug",
      "userId": "test_user_ezia_001",
      "name": "Test Debug Business",
      "description": "Business créé pour le debug",
      "industry": "technology",
      "stage": "startup",
      "_createdAt": new Date().toISOString(),
      "_updatedAt": new Date().toISOString()
    }];
    await fs.writeFile(businessesFile, JSON.stringify(testBusiness, null, 2));
    console.log('   ⚠️  Nouveau business de test créé');
  }

  // 4. Créer des sauvegardes
  await fs.copyFile(projectsFile, backupProjects);
  await fs.copyFile(businessesFile, backupBusinesses);
  console.log('\n4️⃣ Nouvelles sauvegardes créées');

  // 5. Recommandations
  console.log('\n5️⃣ RECOMMANDATIONS POUR RÉSOUDRE LE PROBLÈME:');
  console.log('   a) Utiliser uniquement MongoDB pour la persistance');
  console.log('   b) Éliminer le système de stockage sur fichier');
  console.log('   c) Implémenter un système de sauvegarde automatique');
  console.log('   d) Ajouter des logs pour tracer les écritures/suppressions');

  console.log('\n✅ Diagnostic terminé. Les données ont été restaurées temporairement.');
}

// Exécuter le diagnostic
finalDiagnosis().catch(console.error);