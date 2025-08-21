// Script pour débugger le système de stockage et comprendre pourquoi les projets ne persistent pas

import { promises as fs } from 'fs';
import path from 'path';

async function debugStorage() {
  console.log('🔍 Démarrage du debug du système de stockage...\n');
  
  // Vérifier le dossier .data
  const dataDir = path.join(process.cwd(), '.data');
  const projectsFile = path.join(dataDir, 'projects.json');
  const businessesFile = path.join(dataDir, 'businesses.json');
  
  try {
    // 1. Vérifier l'existence du dossier .data
    console.log('1️⃣ Vérification du dossier .data:');
    const dataDirExists = await fs.access(dataDir).then(() => true).catch(() => false);
    console.log(`   Dossier .data existe: ${dataDirExists ? '✅' : '❌'}`);
    
    if (!dataDirExists) {
      console.log('   ⚠️  Création du dossier .data...');
      await fs.mkdir(dataDir, { recursive: true });
      console.log('   ✅ Dossier créé');
    }
    
    // 2. Vérifier le fichier projects.json
    console.log('\n2️⃣ Vérification du fichier projects.json:');
    const projectsFileExists = await fs.access(projectsFile).then(() => true).catch(() => false);
    console.log(`   Fichier existe: ${projectsFileExists ? '✅' : '❌'}`);
    
    if (projectsFileExists) {
      const stats = await fs.stat(projectsFile);
      console.log(`   Taille: ${stats.size} octets`);
      console.log(`   Dernière modification: ${stats.mtime}`);
      
      try {
        const content = await fs.readFile(projectsFile, 'utf-8');
        const projects = JSON.parse(content);
        console.log(`   Contenu valide: ✅`);
        console.log(`   Nombre d'utilisateurs: ${Object.keys(projects).length}`);
        
        for (const [userId, userProjects] of Object.entries(projects)) {
          console.log(`   - Utilisateur ${userId}: ${(userProjects as any[]).length} projet(s)`);
        }
      } catch (error) {
        console.log(`   Contenu invalide: ❌`);
        console.log(`   Erreur: ${error.message}`);
      }
    }
    
    // 3. Vérifier le fichier businesses.json
    console.log('\n3️⃣ Vérification du fichier businesses.json:');
    const businessesFileExists = await fs.access(businessesFile).then(() => true).catch(() => false);
    console.log(`   Fichier existe: ${businessesFileExists ? '✅' : '❌'}`);
    
    if (businessesFileExists) {
      const stats = await fs.stat(businessesFile);
      console.log(`   Taille: ${stats.size} octets`);
      console.log(`   Dernière modification: ${stats.mtime}`);
    }
    
    // 4. Vérifier les permissions
    console.log('\n4️⃣ Vérification des permissions:');
    try {
      // Test d'écriture
      const testFile = path.join(dataDir, 'test-write.tmp');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      console.log(`   Écriture dans .data: ✅`);
    } catch (error) {
      console.log(`   Écriture dans .data: ❌`);
      console.log(`   Erreur: ${error.message}`);
    }
    
    // 5. Vérifier l'environnement
    console.log('\n5️⃣ Environnement:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Working directory: ${process.cwd()}`);
    console.log(`   Platform: ${process.platform}`);
    
    // 6. Recommandations
    console.log('\n💡 Recommandations:');
    if (!projectsFileExists || stats?.size === 0) {
      console.log('   - Le fichier projects.json est vide ou n\'existe pas');
      console.log('   - Les données peuvent être perdues lors du redémarrage du serveur');
      console.log('   - Considérer l\'utilisation de MongoDB pour la persistance');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du debug:', error);
  }
}

// Exécuter le debug
debugStorage().catch(console.error);