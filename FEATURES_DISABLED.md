# Features Désactivées Temporairement

## Vue d'ensemble

Pour se concentrer sur le système de génération de contenu, certaines features ont été temporairement désactivées.

## ✅ Features ACTIVES

### 1. Analyse de Marché
- **Page** : `/business/[businessId]` - Onglet "Marché"
- **Description** : Analyse complète du marché cible avec Mistral AI
- **Composants** : `MarketAnalysisDisplay`

### 2. Stratégie Marketing
- **Page** : `/business/[businessId]` - Onglet "Marketing"
- **Description** : Génération de stratégie marketing complète
- **Composants** : `MarketingStrategyDisplay`

### 3. Calendrier de Contenu
- **Page** : `/business/[businessId]` - Onglet "Calendrier de contenu"
- **Description** : Génération et gestion du calendrier éditorial
- **Composants** : `DynamicContentCalendar`
- **APIs** :
  - `/api/me/business/[businessId]/calendar`
  - `/api/me/business/[businessId]/regenerate-calendar`
  - `/api/me/business/[businessId]/generate-content`

## 🔇 Features DÉSACTIVÉES

### Dashboard (`/dashboard`)

#### Stats désactivées
- ❌ **Sites web créés** (ligne 232-241)
  - Raison : Feature non utilisée actuellement

#### Quick Actions désactivées
- ❌ **Développer ma présence** (ligne 278-290)
  - Destination : `/workspace/new`
  - Raison : Focus sur contenu uniquement

### Business Page (`/business/[businessId]`)

#### Onglets désactivés
- ❌ **Vue d'ensemble** (ligne 316)
  - Informations générales du business

- ❌ **Réseaux sociaux** (ligne 320)
  - Gestion des profils sociaux
  - Composant : `DynamicSocialMediaSettings`

- ❌ **Objectifs** (ligne 321)
  - Tracking des objectifs business
  - Destination : `/business/[businessId]/goals`

- ❌ **Interactions** (ligne 322)
  - Historique des interactions avec Ezia

- ❌ **Mémoire** (ligne 323-326)
  - Système de mémoire contextuelle Ezia
  - Composant : `EziaMemoryView`
  - Icon : `Brain`

## 📁 Fichiers Modifiés

### 1. `/app/business/[businessId]/page.tsx`
```typescript
// Ligne 119 : Changement de l'onglet par défaut
const [activeTab, setActiveTab] = useState<string>("market"); // était "overview"

// Lignes 316-327 : Désactivation des onglets
<TabsList>
  {/* <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger> */}
  <TabsTrigger value="market">Marché</TabsTrigger>
  <TabsTrigger value="marketing">Marketing</TabsTrigger>
  <TabsTrigger value="calendar">Calendrier de contenu</TabsTrigger>
  {/* ... autres onglets commentés ... */}
</TabsList>
```

### 2. `/app/dashboard/page.tsx`
```typescript
// Lignes 232-241 : StatCard "Sites web créés" commenté
{/* Désactivé temporairement
<StatCard
  title="Sites web créés"
  value={globalStats.activeWebsites}
  ...
/>
*/}

// Ligne 277 : Grid passé de lg:grid-cols-4 à lg:grid-cols-3
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Lignes 278-291 : QuickActionCard "Développer ma présence" commenté
{/* Désactivé temporairement
<QuickActionCard
  title="Développer ma présence"
  description="Site web, réseaux sociaux et plus"
  ...
/>
*/}
```

### 3. `/lib/feature-flags.ts` (NOUVEAU)
Fichier de configuration centralisée des features :
```typescript
export const FEATURE_FLAGS = {
  // Active
  MARKET_ANALYSIS: true,
  MARKETING_STRATEGY: true,
  CONTENT_CALENDAR: true,

  // Désactivée
  WEBSITE_GENERATION: false,
  ECOSYSTEM_MULTIPAGE: false,
  SOCIAL_MEDIA_MANAGEMENT: false,
  GOALS_TRACKING: false,
  INTERACTIONS_HISTORY: false,
  EZIA_MEMORY: false,
  COMPETITOR_ANALYSIS: false,
  BUSINESS_OVERVIEW: false,
};
```

## 🔄 Réactivation

Pour réactiver une feature :

### Option 1 : Manuelle (rapide)
Décommenter les blocs de code correspondants dans les fichiers modifiés.

### Option 2 : Via Feature Flags (propre)
```typescript
// Dans le composant
import { isFeatureEnabled } from '@/lib/feature-flags';

{isFeatureEnabled('GOALS_TRACKING') && (
  <TabsTrigger value="goals">Objectifs</TabsTrigger>
)}
```

## 🎯 Navigation Simplifiée

### Workflow utilisateur après connexion

```
1. Dashboard (/dashboard)
   │
   ├─ Créer un business → /business/new
   │
   └─ Sélectionner un business
      │
      └─ Page Business (/business/[businessId])
         │
         ├─ Onglet Marché (par défaut)
         │  └─ Générer analyse de marché avec Mistral
         │
         ├─ Onglet Marketing
         │  └─ Générer stratégie marketing avec Mistral
         │
         └─ Onglet Calendrier de contenu
            ├─ Générer calendrier éditorial
            └─ Générer contenu quotidien
```

## 📝 Notes de Développement

### Prochaines étapes recommandées

1. **Tester les 3 features actives** :
   - Marché
   - Marketing
   - Calendrier de contenu

2. **Une fois validées, réactiver progressivement** :
   - Objectifs (simple tracking)
   - Réseaux sociaux (gestion des profils)
   - Vue d'ensemble (dashboard business)

3. **À développer** :
   - Améliorer le calendrier de contenu (nouveau système)
   - Intégrer les nouveaux agents (feat/content-calendar)
   - Publication automatique sur réseaux sociaux

### Maintenance

Ce fichier doit être mis à jour à chaque activation/désactivation de feature.

---

📅 Dernière mise à jour : 2025-10-16
✍️ Par : Claude Code
