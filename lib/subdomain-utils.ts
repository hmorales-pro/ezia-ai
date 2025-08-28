// Utilitaires pour la gestion des sous-domaines

export function generateSubdomain(businessName: string): string {
  // Nettoyer et normaliser le nom
  let subdomain = businessName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9-]/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprimer les tirets au début et à la fin

  // Limiter la longueur
  if (subdomain.length > 30) {
    subdomain = subdomain.substring(0, 30).replace(/-$/, '');
  }

  // S'assurer qu'il commence par une lettre
  if (!/^[a-z]/.test(subdomain)) {
    subdomain = 'site-' + subdomain;
  }

  return subdomain;
}

export function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  // Vérifier la longueur
  if (subdomain.length < 3) {
    return { valid: false, error: 'Le sous-domaine doit contenir au moins 3 caractères' };
  }
  
  if (subdomain.length > 63) {
    return { valid: false, error: 'Le sous-domaine ne peut pas dépasser 63 caractères' };
  }

  // Vérifier le format
  const subdomainRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
  if (!subdomainRegex.test(subdomain)) {
    return { valid: false, error: 'Le sous-domaine doit commencer par une lettre, se terminer par une lettre ou un chiffre, et ne contenir que des lettres minuscules, chiffres et tirets' };
  }

  // Vérifier les tirets consécutifs
  if (subdomain.includes('--')) {
    return { valid: false, error: 'Le sous-domaine ne peut pas contenir de tirets consécutifs' };
  }

  // Vérifier les sous-domaines réservés
  const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop', 'store', 'help', 'support'];
  if (reserved.includes(subdomain)) {
    return { valid: false, error: 'Ce sous-domaine est réservé' };
  }

  return { valid: true };
}

export function getFullUrl(subdomain: string, baseDomain: string = 'ezia.ai'): string {
  return `https://${subdomain}.${baseDomain}`;
}

export function extractSubdomain(hostname: string): string | null {
  // Extraire le sous-domaine d'un hostname
  // Ex: monsite.ezia.ai -> monsite
  const parts = hostname.split('.');
  
  // Pour un domaine comme monsite.ezia.ai
  if (parts.length >= 3) {
    return parts[0];
  }
  
  // Pour localhost ou développement
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // En dev, on peut utiliser des paramètres pour simuler
    return null;
  }
  
  return null;
}

export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  // Cette fonction serait connectée à votre API pour vérifier la disponibilité
  // Pour l'instant, on retourne true pour la démo
  try {
    const response = await fetch('/api/subdomain/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain })
    });
    
    const data = await response.json();
    return data.available;
  } catch {
    return true; // En cas d'erreur, on suppose qu'il est disponible
  }
}