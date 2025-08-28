import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import UserProject from '@/models/UserProject';

/**
 * Génère un sous-domaine intelligent basé sur le nom du business/projet
 * - Nettoie et formate le nom
 * - Ajoute un suffixe numérique si nécessaire pour garantir l'unicité
 * - Retourne un sous-domaine valide et unique
 */
export async function generateSmartSubdomain(businessName: string): Promise<string> {
  // Nettoyer et formater le nom pour en faire un sous-domaine valide
  let baseSubdomain = businessName
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+|-+$/g, '') // Supprime les tirets au début et à la fin
    .substring(0, 50); // Limite la longueur

  // Si le nom est trop court ou vide après nettoyage
  if (baseSubdomain.length < 3) {
    baseSubdomain = 'site-' + Math.random().toString(36).substring(2, 8);
  }

  // Assurer la connexion à la base de données
  await dbConnect();

  // Vérifier l'unicité et ajouter un suffixe si nécessaire
  let subdomain = baseSubdomain;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    // Vérifier dans les deux collections (projets simples et multipage)
    const existingMultipage = await UserProjectMultipage.findOne({ subdomain });
    const existingSimple = await UserProject.findOne({ subdomain });
    
    if (!existingMultipage && !existingSimple) {
      isUnique = true;
    } else {
      // Ajouter un suffixe numérique
      subdomain = `${baseSubdomain}-${counter}`;
      counter++;
      
      // Sécurité : éviter une boucle infinie
      if (counter > 100) {
        // Fallback : utiliser un identifiant aléatoire
        subdomain = `${baseSubdomain}-${Date.now().toString(36)}`;
        isUnique = true;
      }
    }
  }

  return subdomain;
}

/**
 * Valide si un sous-domaine est conforme aux règles
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Règles :
  // - Entre 3 et 63 caractères
  // - Commence et termine par une lettre ou un chiffre
  // - Contient seulement lettres minuscules, chiffres et tirets
  // - Pas de tirets consécutifs
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return regex.test(subdomain) && !subdomain.includes('--');
}

/**
 * Génère des suggestions de sous-domaines basées sur le nom
 */
export async function generateSubdomainSuggestions(businessName: string, count: number = 3): Promise<string[]> {
  const baseSubdomain = await generateSmartSubdomain(businessName);
  const suggestions: string[] = [baseSubdomain];
  
  // Variantes possibles
  const prefixes = ['pro', 'my', 'the'];
  const suffixes = ['online', 'web', 'site', 'pro'];
  
  // Nettoyer le nom de base
  const cleanName = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  // Générer des suggestions avec préfixes
  for (const prefix of prefixes) {
    if (suggestions.length >= count) break;
    const candidate = `${prefix}-${cleanName}`;
    if (isValidSubdomain(candidate)) {
      const isAvailable = !(await UserProjectMultipage.findOne({ subdomain: candidate }));
      if (isAvailable) {
        suggestions.push(candidate);
      }
    }
  }
  
  // Générer des suggestions avec suffixes
  for (const suffix of suffixes) {
    if (suggestions.length >= count) break;
    const candidate = `${cleanName}-${suffix}`;
    if (isValidSubdomain(candidate)) {
      const isAvailable = !(await UserProjectMultipage.findOne({ subdomain: candidate }));
      if (isAvailable) {
        suggestions.push(candidate);
      }
    }
  }
  
  // Si on n'a pas assez de suggestions, ajouter des variantes avec timestamp
  while (suggestions.length < count) {
    const timestamp = Date.now().toString(36).slice(-4);
    const candidate = `${cleanName}-${timestamp}`;
    if (isValidSubdomain(candidate)) {
      suggestions.push(candidate);
    }
  }
  
  return suggestions.slice(0, count);
}

/**
 * Exemples de transformation :
 * - "Rest'Free" -> "restfree"
 * - "La Boulangerie du Coin" -> "la-boulangerie-du-coin"
 * - "Café & Thé" -> "cafe-the"
 * - "123 Pizza!" -> "123-pizza"
 * - "École Saint-Jean" -> "ecole-saint-jean"
 */