import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json');
const BUSINESSES_FILE = path.join(STORAGE_DIR, 'businesses.json');
const PROJECTS_BACKUP = path.join(STORAGE_DIR, 'projects.backup.json');
const BUSINESSES_BACKUP = path.join(STORAGE_DIR, 'businesses.backup.json');

// Fonction pour vérifier et restaurer les fichiers si nécessaire
export async function autoRecoverStorage() {
  try {
    // Vérifier le fichier projects.json
    const projectsStats = await fs.stat(PROJECTS_FILE).catch(() => null);
    if (!projectsStats || projectsStats.size < 10) {
      // Le fichier est vide ou n'existe pas, essayer de restaurer depuis la sauvegarde
      console.warn('⚠️  projects.json est vide ou manquant, tentative de récupération...');
      
      try {
        const backupExists = await fs.access(PROJECTS_BACKUP).then(() => true).catch(() => false);
        if (backupExists) {
          const backupContent = await fs.readFile(PROJECTS_BACKUP, 'utf-8');
          await fs.writeFile(PROJECTS_FILE, backupContent);
          console.log('✅ projects.json restauré depuis la sauvegarde');
        } else {
          console.warn('❌ Aucune sauvegarde disponible pour projects.json');
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de projects.json:', error);
      }
    }
    
    // Vérifier le fichier businesses.json
    const businessesStats = await fs.stat(BUSINESSES_FILE).catch(() => null);
    if (!businessesStats || businessesStats.size < 10) {
      // Le fichier est vide ou n'existe pas, essayer de restaurer depuis la sauvegarde
      console.warn('⚠️  businesses.json est vide ou manquant, tentative de récupération...');
      
      try {
        const backupExists = await fs.access(BUSINESSES_BACKUP).then(() => true).catch(() => false);
        if (backupExists) {
          const backupContent = await fs.readFile(BUSINESSES_BACKUP, 'utf-8');
          await fs.writeFile(BUSINESSES_FILE, backupContent);
          console.log('✅ businesses.json restauré depuis la sauvegarde');
        } else {
          console.warn('❌ Aucune sauvegarde disponible pour businesses.json');
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de businesses.json:', error);
      }
    }
    
    // Créer des sauvegardes si elles n'existent pas et que les fichiers principaux sont valides
    if (projectsStats && projectsStats.size > 10) {
      const backupExists = await fs.access(PROJECTS_BACKUP).then(() => true).catch(() => false);
      if (!backupExists) {
        await fs.copyFile(PROJECTS_FILE, PROJECTS_BACKUP);
        console.log('📦 Sauvegarde de projects.json créée');
      }
    }
    
    if (businessesStats && businessesStats.size > 10) {
      const backupExists = await fs.access(BUSINESSES_BACKUP).then(() => true).catch(() => false);
      if (!backupExists) {
        await fs.copyFile(BUSINESSES_FILE, BUSINESSES_BACKUP);
        console.log('📦 Sauvegarde de businesses.json créée');
      }
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération automatique:', error);
  }
}

// Exécuter la récupération automatique au démarrage
if (process.env.NODE_ENV !== 'test') {
  autoRecoverStorage().catch(console.error);
}