const fs = require('fs');
const path = require('path');

console.log('Nettoyage manuel des dossiers [siteId]...');

const dirsToDelete = [
  '/Users/hugomorales/ezia36/app/sites/[siteId]',
  '/Users/hugomorales/ezia36/app/sites/public/[siteId]',
  '/Users/hugomorales/ezia36/app/api/sites/public/[siteId]'
];

dirsToDelete.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✓ Supprimé: ${dir}`);
    } else {
      console.log(`⚠ N'existe pas: ${dir}`);
    }
  } catch (error) {
    console.error(`✗ Erreur lors de la suppression de ${dir}:`, error.message);
  }
});

console.log('Nettoyage terminé!');