import { useCallback, useContext } from 'react';
import { api } from '@/lib/api';
import { UserContext } from '@/components/contexts/user-context';
import { toast } from 'sonner';

export function useApi() {
  const userContext = useContext(UserContext);
  const token = userContext?.token;

  const makeRequest = useCallback(async (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config?: any
  ) => {
    try {
      const headers = {
        ...config?.headers,
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await api({
        method,
        url,
        data,
        ...config,
        headers,
      });

      return response;
    } catch (error: any) {
      // Handle common errors
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        // Optionally redirect to login
      } else if (error.response?.status === 403) {
        toast.error('Accès non autorisé');
      } else if (error.response?.status === 404) {
        toast.error('Ressource non trouvée');
      } else if (error.response?.status === 500) {
        toast.error('Erreur serveur. Veuillez réessayer.');
      }

      throw error;
    }
  }, [token]);

  return {
    get: (url: string, config?: any) => makeRequest('get', url, undefined, config),
    post: (url: string, data?: any, config?: any) => makeRequest('post', url, data, config),
    put: (url: string, data?: any, config?: any) => makeRequest('put', url, data, config),
    patch: (url: string, data?: any, config?: any) => makeRequest('patch', url, data, config),
    delete: (url: string, config?: any) => makeRequest('delete', url, undefined, config),
  };
}