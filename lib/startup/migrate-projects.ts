import dbConnect from '../mongodb';
import UserProject from '../../models/UserProject';
import Project from '../../models/Project';

// Cette fonction sera appelée au démarrage de l'application
export async function migrateProjectsIfNeeded() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Vérification de la migration des projets...');
    
    try {
      await dbConnect();
      
      // Vérifier si des projets existent déjà dans UserProject
      const userProjectCount = await UserProject.countDocuments();
      
      // Vérifier s'il y a des projets dans l'ancienne collection
      const oldProjectCount = await Project.countDocuments();
      
      if (oldProjectCount > 0 && userProjectCount === 0) {
        console.log('📦 Migration nécessaire - Démarrage de la migration automatique...');
        
        const projects = await Project.find({}).lean();
        let migrated = 0;
        
        for (const project of projects) {
          try {
            await UserProject.create({
              userId: project.user_id,
              name: project.space_id || 'Projet sans nom',
              description: 'Projet migré automatiquement',
              html: '<html><body><h1>Projet migré</h1></body></html>',
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
                createdBy: 'Auto Migration'
              }],
              status: 'draft',
              metadata: {
                generatedBy: 'auto-migration',
                originalSpaceId: project.space_id
              },
              createdAt: project._createdAt,
              updatedAt: project._updatedAt || project._createdAt
            });
            
            migrated++;
          } catch (error) {
            console.error(`Erreur lors de la migration du projet ${project.space_id}:`, error);
          }
        }
        
        console.log(`✅ Migration automatique terminée: ${migrated}/${oldProjectCount} projets migrés`);
      } else {
        console.log('✅ Aucune migration nécessaire');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de migration:', error);
    }
  }
}