#!/usr/bin/env node

/**
 * Script de migration des données de la waitlist
 * Ajoute des valeurs par défaut pour les nouveaux champs
 */

const fs = require('fs');
const path = require('path');

const WAITLIST_FILE = path.join(process.cwd(), '.data', 'waitlist.json');

console.log('🔄 MIGRATION DES DONNÉES DE LA WAITLIST\n');

// Charger les données existantes
let waitlistData;
try {
  const content = fs.readFileSync(WAITLIST_FILE, 'utf8');
  waitlistData = JSON.parse(content);
} catch (error) {
  console.error('❌ Erreur lors du chargement du fichier waitlist.json');
  console.error(error.message);
  process.exit(1);
}

console.log(`📊 ${waitlistData.length} entrées trouvées\n`);

// Backup des données originales
const backupFile = WAITLIST_FILE.replace('.json', `-backup-${Date.now()}.json`);
fs.writeFileSync(backupFile, JSON.stringify(waitlistData, null, 2));
console.log(`💾 Backup créé : ${backupFile}\n`);

// Migration des données
let migrated = 0;
waitlistData.forEach((entry, index) => {
  let hasChanges = false;
  
  // Ajouter les nouveaux champs s'ils n'existent pas
  if (!entry.hasOwnProperty('profile')) {
    // Essayer de deviner le profil basé sur l'entreprise
    if (entry.company) {
      if (entry.company.toLowerCase().includes('association')) {
        entry.profile = 'association';
      } else if (entry.name.toLowerCase().includes('étudiant')) {
        entry.profile = 'etudiant';
      } else {
        entry.profile = 'entrepreneur'; // Par défaut pour ceux avec entreprise
      }
    } else {
      entry.profile = 'Non spécifié';
    }
    hasChanges = true;
  }
  
  if (!entry.hasOwnProperty('needs')) {
    entry.needs = 'Non spécifié';
    hasChanges = true;
  }
  
  if (!entry.hasOwnProperty('urgency')) {
    // Par défaut, on considère les anciens inscrits comme "curieux"
    entry.urgency = 'curious';
    hasChanges = true;
  }
  
  if (hasChanges) {
    migrated++;
    console.log(`✅ Migré : ${entry.name} (${entry.email})`);
  }
});

// Sauvegarder les données migrées
fs.writeFileSync(WAITLIST_FILE, JSON.stringify(waitlistData, null, 2));

console.log(`\n✨ Migration terminée !`);
console.log(`   ${migrated} entrées migrées`);
console.log(`   ${waitlistData.length - migrated} entrées déjà à jour`);
console.log(`\n📁 Les données ont été sauvegardées dans : ${WAITLIST_FILE}`);
console.log(`📁 Backup disponible dans : ${backupFile}`);