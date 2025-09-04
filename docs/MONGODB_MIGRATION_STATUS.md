# État de la migration MongoDB

## ✅ Fichiers migrés (8/11)

1. ✅ `/app/api/me/business/route.ts` - GET/POST pour lister/créer des businesses
2. ✅ `/app/api/ezia/chat/route.ts` - Chat avec l'IA Ezia
3. ✅ `/app/api/me/business/[businessId]/route.ts` - GET/PUT/DELETE pour un business
4. ✅ `/app/api/me/business/[businessId]/goals/route.ts` - GET/POST pour les objectifs (PATCH simplifié)
5. ✅ `/app/api/me/subscription/route.ts` - Gestion des abonnements
6. ✅ `/app/api/ezia/analyze/route.ts` - Analyse business par l'IA
7. ✅ `/app/api/me/business/[businessId]/interactions/route.ts` - GET/POST interactions Ezia

## ❌ À migrer (3 fichiers)

8. `/app/api/ezia/create-website/route.ts`
9. `/app/api/me/business/[businessId]/projects/route.ts`
10. `/app/api/user-projects/create/route.ts`

## Pattern de migration

### Avant
```typescript
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

if (isUsingMemoryDB()) {
  const memoryDB = getMemoryDB();
  // opérations mémoire
} else {
  await dbConnect();
  // opérations MongoDB
}
```

### Après
```typescript
import { getDB } from "@/lib/database";

const db = getDB();
// Utiliser directement les méthodes du db
const business = await db.findBusinessById(businessId);
```

## Méthodes disponibles dans Database

- `findBusinesses(userId)` - Lister les businesses
- `createBusiness(data)` - Créer un business
- `findBusinessById(businessId)` - Trouver par ID
- `updateBusiness(businessId, updates)` - Mettre à jour
- `countBusinesses(userId)` - Compter

- `createProject(data)` - Créer un projet
- `findProjectById(projectId)` - Trouver projet
- `findProjectsByBusiness(businessId)` - Projets d'un business
- `updateProject(projectId, updates)` - Mettre à jour projet

- `getSubscription(userId)` - Récupérer abonnement
- `createSubscription(data)` - Créer abonnement
- `updateSubscription(userId, updates)` - Mettre à jour
- `incrementUsage(userId, type, increment)` - Incrémenter usage

## Notes

- Toujours vérifier que `user_id` correspond avant les opérations
- Le système gère automatiquement MongoDB vs mémoire
- Plus besoin de `global.businesses` ou autres hacks