# Guide de Migration MongoDB

## Vue d'ensemble

Nous avons créé un nouveau système unifié de base de données qui gère automatiquement la connexion MongoDB avec un fallback en mémoire si nécessaire.

## Nouveau système

### 1. Fichier principal : `/lib/database.ts`

Ce fichier fournit une classe `Database` qui :
- ✅ Tente automatiquement de se connecter à MongoDB
- ✅ Bascule sur la base de données en mémoire si MongoDB n'est pas disponible
- ✅ Cache l'état de connexion pour éviter les tentatives répétées
- ✅ Fournit des méthodes unifiées pour toutes les opérations

### 2. Utilisation

```typescript
import { getDB } from "@/lib/database";

// Dans votre route API
const db = getDB();

// Toutes les opérations utilisent la même interface
const businesses = await db.findBusinesses(userId);
const business = await db.createBusiness(data);
const updated = await db.updateBusiness(businessId, updates);
```

## Migration des fichiers existants

### Avant (ancien système)

```typescript
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

// Code complexe avec conditions
if (isUsingMemoryDB()) {
  const memoryDB = getMemoryDB();
  business = await memoryDB.findOne({...});
} else {
  await dbConnect();
  business = await Business.findOne({...});
}
```

### Après (nouveau système)

```typescript
import { getDB } from "@/lib/database";

// Code simplifié
const db = getDB();
const business = await db.findBusinessById(businessId);
```

## Méthodes disponibles

### Business
- `findBusinesses(userId)` - Liste tous les business d'un utilisateur
- `createBusiness(data)` - Crée un nouveau business
- `findBusinessById(businessId)` - Trouve un business par ID
- `updateBusiness(businessId, updates)` - Met à jour un business
- `countBusinesses(userId)` - Compte les business d'un utilisateur

### Projects
- `createProject(data)` - Crée un nouveau projet
- `findProjectById(projectId)` - Trouve un projet par ID
- `findProjectsByBusiness(businessId)` - Liste les projets d'un business
- `updateProject(projectId, updates)` - Met à jour un projet

### Subscriptions
- `getSubscription(userId)` - Récupère l'abonnement d'un utilisateur
- `createSubscription(data)` - Crée un nouvel abonnement
- `updateSubscription(userId, updates)` - Met à jour un abonnement
- `incrementUsage(userId, usageType, increment)` - Incrémente l'usage

## Fichiers à migrer

### Priorité haute
- [x] `/app/api/me/business/route.ts` - ✅ Migré
- [x] `/app/api/ezia/chat/route.ts` - ✅ Partiellement migré
- [ ] `/app/api/ezia/analyze/route.ts`
- [ ] `/app/api/ezia/create-website/route.ts`
- [ ] `/app/api/me/business/[businessId]/route.ts`
- [ ] `/app/api/me/business/[businessId]/goals/route.ts`
- [ ] `/app/api/me/subscription/route.ts`

### Priorité moyenne
- [ ] `/app/api/user-projects/create/route.ts`
- [ ] `/app/api/me/business/[businessId]/projects/route.ts`
- [ ] `/app/api/me/business/[businessId]/interactions/route.ts`

## Étapes de migration

1. **Remplacer les imports**
   ```typescript
   // Supprimer
   import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
   import dbConnect from "@/lib/mongodb";
   import { Business } from "@/models/Business";
   
   // Ajouter
   import { getDB } from "@/lib/database";
   ```

2. **Simplifier le code**
   - Supprimer tous les `if (isUsingMemoryDB())`
   - Remplacer par des appels directs à `db.methodName()`

3. **Tester**
   - Vérifier que les opérations fonctionnent avec MongoDB
   - Tester le fallback en supprimant temporairement MONGODB_URI

## Configuration environnement

### Production (`.env.local`)
```env
MONGODB_URI=mongodb+srv://dbEzia:...@cluster0.mongodb.net/ezia
```

### Preprod (`.env.preprod`)
```env
MONGODB_URI=mongodb+srv://hugomoralespro_db_user:...@cluster0.mongodb.net/ezia-preprod
```

## Avantages du nouveau système

1. ✅ **Code plus simple** - Plus de conditions if/else partout
2. ✅ **Maintenance facile** - Logique centralisée dans un seul fichier
3. ✅ **Type-safe** - Interfaces TypeScript cohérentes
4. ✅ **Resilient** - Bascule automatique si MongoDB tombe
5. ✅ **Performance** - Cache de connexion pour éviter les tentatives répétées

## Monitoring

Le système log automatiquement :
- ✅ Connexion MongoDB réussie
- ❌ Échec de connexion avec détails
- ⚠️ Utilisation du fallback mémoire

## Tests

Utilisez le script de test :
```bash
npx tsx scripts/test-mongodb.ts
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de connexion
2. Testez avec le script de test MongoDB
3. Vérifiez les variables d'environnement
4. Consultez `/lib/database.ts` pour les détails d'implémentation