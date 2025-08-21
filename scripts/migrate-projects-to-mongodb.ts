import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import UserProject from '../models/UserProject';
import Project from '../models/Project';

async function migrateProjects() {
  try {
    console.log('🚀 Démarrage de la migration des projets vers MongoDB...');
    
    // Connexion à MongoDB
    await dbConnect();
    
    // Récupérer tous les projets existants depuis le modèle Project
    const existingProjects = await Project.find({}).lean();
    
    console.log(`📊 ${existingProjects.length} projets trouvés dans la collection Project`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const project of existingProjects) {
      try {
        // Vérifier si le projet existe déjà dans UserProject
        const exists = await UserProject.findOne({
          userId: project.user_id,
          name: project.space_id || 'Projet sans nom'
        });
        
        if (exists) {
          console.log(`⏭️  Projet déjà migré: ${project.space_id}`);
          skipped++;
          continue;
        }
        
        // Créer le nouveau projet
        const newProject = await UserProject.create({
          userId: project.user_id,
          name: project.space_id || 'Projet sans nom',
          description: 'Projet migré depuis l\'ancienne structure',
          html: '<html><body><h1>Projet migré</h1></body></html>', // Placeholder
          css: '',
          js: '',
          prompt: project.prompts?.join('\n') || '',
          version: 1,
          versions: [{
            version: 1,
            html: '<html><body><h1>Projet migré</h1></body></html>',
            css: '',
            js: '',
            prompt: project.prompts?.join('\n') || '',
            createdAt: project._createdAt || new Date(),
            createdBy: 'Migration Script'
          }],
          status: 'draft',
          metadata: {
            generatedBy: 'migration',
            originalSpaceId: project.space_id
          },
          createdAt: project._createdAt,
          updatedAt: project._updatedAt || project._createdAt
        });
        
        console.log(`✅ Projet migré: ${newProject.name}`);
        migrated++;
      } catch (error) {
        console.error(`❌ Erreur lors de la migration du projet ${project.space_id}:`, error);
      }
    }
    
    console.log('\n📈 Résumé de la migration:');
    console.log(`- Projets migrés: ${migrated}`);
    console.log(`- Projets ignorés (déjà existants): ${skipped}`);
    console.log(`- Total traité: ${existingProjects.length}`);
    
    console.log('\n✨ Migration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Exécuter la migration si le script est lancé directement
if (require.main === module) {
  migrateProjects();
}

export default migrateProjects;