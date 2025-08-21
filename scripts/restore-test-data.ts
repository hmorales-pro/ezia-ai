import { promises as fs } from 'fs';
import path from 'path';

const testProject = {
  "test_user_ezia_001": [{
    "id": "project-1755612982560",
    "userId": "test_user_ezia_001",
    "businessId": "bus_1755498341669",
    "businessName": "Business de Démonstration",
    "name": "Site web de Business de Démonstration",
    "description": "Site web généré avec Ezia",
    "html": `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business de Démonstration</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-4xl font-bold mb-4">Business de Démonstration</h1>
        <p class="text-lg text-gray-700">Site web de test restauré</p>
    </div>
</body>
</html>`,
    "css": "",
    "js": "",
    "prompt": "Site web de démonstration",
    "version": 1,
    "versions": [{
      "version": 1,
      "html": `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business de Démonstration</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-4xl font-bold mb-4">Business de Démonstration</h1>
        <p class="text-lg text-gray-700">Site web de test restauré</p>
    </div>
</body>
</html>`,
      "css": "",
      "js": "",
      "prompt": "Site web de démonstration",
      "createdAt": new Date().toISOString(),
      "createdBy": "Ezia AI"
    }],
    "status": "draft",
    "createdAt": new Date().toISOString(),
    "updatedAt": new Date().toISOString(),
    "metadata": {
      "generatedBy": "ezia-ai",
      "industry": "general",
      "targetAudience": "tous publics",
      "features": ["responsive", "modern", "seo-friendly"]
    }
  }]
};

const testBusiness = [{
  "_id": "6605f9f5b8c5e1234567890a",
  "business_id": "bus_1755498341669",
  "name": "Business de Démonstration",
  "description": "Un business créé pour la démonstration",
  "industry": "technology",
  "stage": "startup",
  "target_audience": "Startups et PME technologiques",
  "value_proposition": "Excellence et Innovation",
  "_createdAt": new Date().toISOString(),
  "_updatedAt": new Date().toISOString()
}];

async function restoreTestData() {
  try {
    console.log('🔧 Restauration des données de test...\n');
    
    const dataDir = path.join(process.cwd(), '.data');
    const projectsFile = path.join(dataDir, 'projects.json');
    const businessesFile = path.join(dataDir, 'businesses.json');
    
    // Créer le dossier .data s'il n'existe pas
    await fs.mkdir(dataDir, { recursive: true });
    console.log('✅ Dossier .data vérifié');
    
    // Restaurer projects.json
    await fs.writeFile(projectsFile, JSON.stringify(testProject, null, 2));
    console.log('✅ Fichier projects.json restauré avec les données de test');
    
    // Restaurer businesses.json
    await fs.writeFile(businessesFile, JSON.stringify(testBusiness, null, 2));
    console.log('✅ Fichier businesses.json restauré avec les données de test');
    
    console.log('\n📊 Résumé:');
    console.log('   - 1 projet restauré pour l\'utilisateur test_user_ezia_001');
    console.log('   - 1 business restauré');
    console.log('\n✅ Restauration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  }
}

// Exécuter la restauration
restoreTestData().catch(console.error);