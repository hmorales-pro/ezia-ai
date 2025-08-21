import { syncMemoryWithFile } from '../file-storage';

// Synchroniser le stockage au démarrage
export async function initializeStorage() {
  try {
    console.log('🔄 Synchronisation du stockage persistant...');
    await syncMemoryWithFile();
    console.log('✅ Stockage synchronisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation du stockage:', error);
  }
}