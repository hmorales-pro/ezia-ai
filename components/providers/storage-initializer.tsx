'use client';

import { useEffect } from 'react';

export default function StorageInitializer() {
  useEffect(() => {
    // Initialiser le stockage au chargement de l'application
    fetch('/api/init').catch(console.error);
  }, []);
  
  return null;
}