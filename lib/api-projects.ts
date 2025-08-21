import { api } from './api';

// Helper pour gérer la transition entre l'ancienne et la nouvelle API
export const projectsApi = {
  async getProjects() {
    try {
      // Essayer d'abord la nouvelle API MongoDB
      const response = await api.get('/api/user-projects-db');
      return response.data;
    } catch (error) {
      console.warn('Nouvelle API non disponible, utilisation de l\'ancienne API');
      // Fallback vers l'ancienne API si nécessaire
      try {
        const response = await api.get('/api/user-projects');
        return response.data;
      } catch (fallbackError) {
        console.error('Erreur lors de la récupération des projets:', fallbackError);
        throw fallbackError;
      }
    }
  },

  async createProject(projectData: any) {
    try {
      // Essayer d'abord la nouvelle API MongoDB
      const response = await api.post('/api/user-projects-db', projectData);
      return response.data;
    } catch (error) {
      console.warn('Nouvelle API non disponible, utilisation de l\'ancienne API');
      // Fallback vers l'ancienne API si nécessaire
      const response = await api.post('/api/user-projects', projectData);
      return response.data;
    }
  },

  async deleteProject(projectId: string) {
    try {
      // Essayer d'abord la nouvelle API MongoDB
      const response = await api.delete(`/api/user-projects-db/${projectId}`);
      return response.data;
    } catch (error) {
      console.warn('Nouvelle API non disponible, utilisation de l\'ancienne API');
      // Fallback vers l'ancienne API si nécessaire
      const response = await api.delete(`/api/user-projects/${projectId}`);
      return response.data;
    }
  },

  async updateProject(projectId: string, projectData: any) {
    try {
      // Essayer d'abord la nouvelle API MongoDB
      const response = await api.put(`/api/user-projects-db/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.warn('Nouvelle API non disponible, utilisation de l\'ancienne API');
      // Fallback vers l'ancienne API si nécessaire
      const response = await api.put(`/api/user-projects/${projectId}`, projectData);
      return response.data;
    }
  }
};