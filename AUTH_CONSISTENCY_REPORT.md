# Rapport de Cohérence du Système d'Authentification

## Problèmes identifiés

### 1. Mélange de systèmes d'authentification
L'application utilise actuellement deux systèmes d'authentification différents :

- **JWT avec `ezia-auth-token`** : Utilisé dans certaines routes comme :
  - `/api/me/business/[businessId]/generate-content/route.ts`
  - `/api/me/business/[businessId]/chat/route.ts`
  
- **Simple Auth avec `isAuthenticated`** : Utilisé dans d'autres routes comme :
  - `/api/me/projects/route.ts`
  - `/api/me/business/[businessId]/memory/route.ts`
  - `/api/me/business-simple/route.ts`

### 2. Noms de cookies incohérents
- Certaines routes utilisent `'ezia-auth-token'` directement
- D'autres utilisent `AUTH_COOKIE_NAME` depuis `@/lib/auth-utils`
- Le nom réel du cookie varie selon le contexte

### 3. Routes avec authentification mixte ou manquante
- Certaines routes vérifient JWT sans utiliser les helpers standards
- D'autres routes peuvent avoir une authentification manquante ou incorrecte

## Recommandations

### 1. Standardiser sur un seul système
Migrer toutes les routes vers le système `isAuthenticated` simple auth qui semble être le plus récent et le plus utilisé.

### 2. Utiliser des constantes pour les noms de cookies
Toujours utiliser `AUTH_COOKIE_NAME` depuis `@/lib/auth-utils` au lieu de chaînes codées en dur.

### 3. Créer un middleware d'authentification
Implémenter un middleware Next.js pour gérer l'authentification de manière cohérente sur toutes les routes protégées.

### 4. Routes à corriger en priorité
- `/api/me/business/[businessId]/generate-content/route.ts` - Utilise JWT au lieu de simple auth
- `/api/user-projects/route.ts` - Utilise JWT au lieu de simple auth
- `/api/me/business/[businessId]/chat/route.ts` - Utilise JWT au lieu de simple auth

## État actuel

- **Routes avec Simple Auth (correct)** : ~25 routes
- **Routes avec JWT (à migrer)** : ~20 routes
- **Total** : ~45 routes d'API

## Prochaines étapes

1. Migrer toutes les routes JWT vers simple auth
2. Vérifier que toutes les routes utilisent `AUTH_COOKIE_NAME`
3. Tester l'authentification sur toutes les routes critiques
4. Documenter le système d'authentification dans le README