# 🔍 Audit MongoDB Persistence - Rapport Complet

**Date** : 23 Octobre 2025
**Objectif** : Vérifier que toutes les données utilisateur sont persistées dans MongoDB et non en mémoire

---

## 📊 Résumé Exécutif

| Catégorie | Nombre | Status |
|-----------|--------|--------|
| **APIs utilisant MemoryDB** | 11 fichiers | 🚨 CRITIQUE |
| **Fichiers avec stockage temporaire** | 34 fichiers | ⚠️ À VÉRIFIER |
| **APIs sauvegardant dans MongoDB** | 54 fichiers | ✅ BON |

### 🎯 Verdict Global

**⚠️ PROBLÈME MAJEUR DÉTECTÉ** : 11 APIs critiques utilisent encore `isUsingMemoryDB()` et peuvent perdre des données en production si `MONGODB_URI` n'est pas configuré.

---

## 🚨 CRITIQUE - APIs Utilisant MemoryDB (11)

Ces APIs **doivent être corrigées immédiatement** car elles perdent les données au redémarrage du serveur :

### 1. **Business Management** (Déjà corrigé partiellement)
- ✅ `/app/api/me/business/route.ts` - 11x MemoryDB
  - **Status** : Logs ajoutés + protection MongoDB
  - **Action** : Vérifier en production que `MONGODB_URI` est configuré

### 2. **Goals & Objectives** 🔴 URGENT
- ❌ `/app/api/me/business/[businessId]/goals/route.ts` - 12x MemoryDB
  - **Impact** : Perte des objectifs business à chaque redéploiement
  - **Action** : Créer modèle MongoDB `Goal` et remplacer MemoryDB

### 3. **Projects** 🔴 URGENT
- ❌ `/app/api/me/business/[businessId]/projects/route.ts` - 9x MemoryDB
  - **Impact** : Perte des projets/sites générés
  - **Action** : Utiliser modèle MongoDB existant ou créer nouveau

### 4. **Subscriptions & Quotas** 🔴 URGENT
- ❌ `/app/api/me/subscription/route.ts` - 10x MemoryDB
  - **Impact** : Perte des abonnements et quotas utilisateurs
  - **Action** : Créer modèle MongoDB `Subscription`

### 5. **Ezia Chat & Analysis** 🔴 URGENT
- ❌ `/app/api/ezia/analyze/route.ts` - 7x MemoryDB
- ❌ `/app/api/ezia/chat/route.ts` - 23x MemoryDB
- ❌ `/app/api/ezia/create-website/route.ts` - 6x MemoryDB
  - **Impact** : Perte des conversations Ezia et analyses
  - **Action** : Sauvegarder dans MongoDB `Business.ezia_interactions`

### 6. **Interactions** 🔴
- ❌ `/app/api/me/business/[businessId]/interactions/route.ts` - 4x MemoryDB
  - **Impact** : Perte de l'historique des interactions
  - **Action** : Sauvegarder dans `Business.ezia_interactions`

### 7. **User Projects** 🔴
- ❌ `/app/api/user-projects/create/route.ts` - 9x MemoryDB
  - **Impact** : Perte des projets utilisateurs
  - **Action** : Créer/utiliser modèle `Project` MongoDB

### 8. **Main Business Route** 🔴
- ❌ `/app/api/me/business/[businessId]/route.ts` - 3x MemoryDB
  - **Impact** : Modifications business non persistées
  - **Action** : Forcer MongoDB uniquement

### 9. **Memory DB Library** ⚠️
- ⚠️ `/lib/memory-db.ts` - 1x MemoryDB
  - **Status** : Protection ajoutée (throw error en production)
  - **Action** : RAS - utilisé uniquement si `MONGODB_URI` manque

---

## ✅ BON - APIs Sauvegardant dans MongoDB (54)

Ces APIs fonctionnent correctement :

### Authentification
- ✅ `/app/api/auth/login/route.ts`
- ✅ `/app/api/auth/register/route.ts`
- ✅ `/app/api/admin/beta-testers/route.ts`

### Business Core
- ✅ `/app/api/me/business/[businessId]/calendar/route.ts` - Calendrier de contenu
- ✅ `/app/api/me/business/[businessId]/market-analysis/route.ts` - Analyses de marché
- ✅ `/app/api/me/business/[businessId]/marketing-strategy/route.ts` - Stratégies marketing
- ✅ `/app/api/me/business/[businessId]/update/route.ts` - Mise à jour business
- ✅ `/app/api/me/business/[businessId]/sessions/route.ts` - Sessions Ezia

### Autres Features
- ✅ `/app/api/images/generate/route.ts` - Génération d'images
- ✅ `/app/api/ecosystem/[projectId]/features/route.ts` - Features ecosystem

**Total** : 54 fichiers sauvegardent correctement dans MongoDB

---

## ⚠️ À VÉRIFIER - Stockage Temporaire (34)

Ces fichiers utilisent `global`, `localStorage`, `sessionStorage`, `Map` ou `Set`. La plupart sont **acceptables** car ils servent de **cache temporaire** :

### Acceptables (Cache Client)
- ✅ `/components/cookie-consent.tsx` - localStorage pour consentement cookies
- ✅ `/components/google-analytics.tsx` - localStorage pour analytics
- ✅ `/hooks/use-cookie-consent.ts` - localStorage pour préférences
- ✅ `/components/business/unified-content-calendar.tsx` - `global` comme cache + MongoDB

### À Vérifier
- ⚠️ `/app/api/ask-ai/route.ts` - Map pour rate limiting (OK)
- ⚠️ `/lib/mongodb.ts` - Cache connexion MongoDB (OK)
- ⚠️ `/lib/hf-gpu-client.ts` - Cache clients HuggingFace (OK)

### Nécessitent Attention
- 🔍 `/app/api/me/business-simple/route.ts` - 19x stockage
- 🔍 `/app/api/me/business/[businessId]/route.ts` - 14x stockage
- 🔍 `/app/api/me/business/[businessId]/simple/route.ts` - 11x stockage

**Recommandation** : Vérifier manuellement que les données importantes sont bien sauvegardées en MongoDB

---

## 🛠️ Plan d'Action Prioritaire

### Phase 1 : CRITIQUE (Urgent - Aujourd'hui)

1. **Vérifier Production Dokploy**
   - [ ] Confirmer que `MONGODB_URI` est dans Environment Variables
   - [ ] Vérifier logs : doit montrer "MongoDB (persistent)"
   - [ ] Tester création business → doit persister après redéploiement

2. **Corriger Goals API**
   ```bash
   # Créer modèle Goal
   # Remplacer isUsingMemoryDB par MongoDB
   # Ajouter logs de confirmation
   ```

3. **Corriger Subscriptions API**
   ```bash
   # Créer modèle Subscription
   # Implémenter CRUD MongoDB
   # Migrer données existantes si nécessaire
   ```

### Phase 2 : HAUTE PRIORITÉ (Cette semaine)

4. **Corriger Projects API**
   - Utiliser modèle `Project` MongoDB existant
   - Supprimer toute référence à MemoryDB

5. **Corriger Ezia APIs**
   - Sauvegarder conversations dans `Business.ezia_interactions`
   - Sauvegarder analyses dans `Business.market_analysis`

6. **Corriger Interactions API**
   - Persister dans `Business.ezia_interactions`

### Phase 3 : VALIDATION (Après corrections)

7. **Tests de Persistance**
   - [ ] Créer données de test
   - [ ] Redémarrer serveur
   - [ ] Vérifier que données existent toujours
   - [ ] Tester sur tous les endpoints corrigés

8. **Documentation**
   - [ ] Mettre à jour guide déploiement
   - [ ] Documenter structure MongoDB
   - [ ] Créer checklist pre-déploiement

---

## 📋 Checklist Déploiement Production

Avant chaque déploiement, vérifier :

- [ ] `MONGODB_URI` configuré dans Dokploy Environment Variables
- [ ] `NODE_ENV=production` défini
- [ ] Aucun fichier `.env.local` n'est déployé (doit être `.gitignore`)
- [ ] Logs montrent "MongoDB (persistent)" et non "MEMORY"
- [ ] Test post-déploiement : créer un business → redéployer → business toujours présent

---

## 🎯 Métriques de Succès

| Objectif | État Actuel | État Cible |
|----------|-------------|------------|
| APIs utilisant MemoryDB | 11 | 0 |
| Taux de perte de données | Élevé | 0% |
| Couverture MongoDB | 83% | 100% |

---

## 📝 Notes Techniques

### Models MongoDB Existants
- ✅ `Business` - Business complets avec toutes les données
- ✅ `User` - Utilisateurs et authentification
- ✅ `Calendar` - Calendriers de contenu
- ✅ `BetaTester` - Beta testers et invitations

### Models MongoDB À Créer
- ❌ `Goal` - Objectifs business
- ❌ `Subscription` - Abonnements et quotas
- ❌ `Project` (à vérifier s'il existe)

### Protection Actuelle
```typescript
// lib/memory-db.ts
export const isUsingMemoryDB = () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '') {
    return false; // ✅ Force MongoDB si configuré
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI required in production'); // ✅ Bloque production sans MongoDB
  }

  return true; // ⚠️ Autorise mémoire uniquement en dev
};
```

---

## 🔗 Fichiers de Référence

- `/FIX_PRODUCTION_MONGODB.md` - Guide configuration Dokploy
- `/lib/memory-db.ts` - Code MemoryDB avec protection
- `/app/api/me/business/route.ts` - Exemple API avec logs MongoDB
- `/ app/api/me/business/[businessId]/calendar/route.ts` - Exemple API MongoDB correcte

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Dokploy pour "MongoDB (persistent)"
2. Tester connexion MongoDB depuis VPS : `mongosh "<MONGODB_URI>"`
3. Vérifier IP whitelist MongoDB Atlas
4. Consulter `/FIX_PRODUCTION_MONGODB.md`

---

**Rapport généré le** : 23 Octobre 2025
**Prochaine révision** : Après corrections Phase 1
