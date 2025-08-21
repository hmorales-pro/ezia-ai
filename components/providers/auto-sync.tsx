'use client';

import { useEffect } from 'react';

export default function AutoSync() {
  useEffect(() => {
    // Synchroniser toutes les 30 secondes
    const interval = setInterval(() => {
      fetch('/api/sync-storage')
        .catch(err => console.error('Erreur de synchronisation automatique:', err));
    }, 30000);
    
    // Synchroniser avant de fermer la page
    const handleBeforeUnload = () => {
      // Utiliser sendBeacon pour garantir l'envoi même si la page se ferme
      navigator.sendBeacon('/api/sync-storage');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return null;
}