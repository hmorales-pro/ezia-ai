# Web Hub - Progression Complète

## 📋 Vue d'Ensemble

Refonte complète de la gestion de présence web dans Ezia, centralisant site web, blog, et (futur) boutique dans un hub unifié.

**Statut Global**: Phases 1, 1.5 et 2 complètes ✅

---

## ✅ Phase 1: Architecture et UI Core (Complète)

### Objectif
Créer la structure de navigation unifiée et les pages principales du hub web.

### Réalisations

#### 1. Hub Layout
**Fichier**: `app/business/[businessId]/web/layout.tsx`

- Navigation à onglets (Overview, Site, Blog, Shop, Copywriting, Settings)
- Sidebar contextuelle avec sous-navigation
- Header avec nom du business
- Bouton "Parler à Ezia" accessible partout

#### 2. Page Overview
**Fichier**: `app/business/[businessId]/web/overview/page.tsx`

- Dashboard central avec statistiques
- État vide avec CTA création projet
- Quick actions (créer page, article, produit)
- Suggestions AI contextuelles

#### 3. Gestion Pages
**Fichier**: `app/business/[businessId]/web/site/pages/page.tsx`

- Liste des pages du site
- Templates suggérés (Home, About, Contact)
- Actions Edit/Preview/Delete
- Badges (Published, Draft, AI-generated)

#### 4. Intégration Blog
**Fichier**: `app/business/[businessId]/web/blog/posts/page.tsx`

- Réutilise BlogManager existant
- Détection automatique du projectId
- BlogEditor en overlay

#### 5. Entry Point
**Modification**: `app/business/[businessId]/page.tsx`

- Nouveau card "Gérer ma Présence Web"
- Redirige vers `/web/overview`

### Résultat
- **11 fichiers créés**
- Navigation unifiée fonctionnelle
- UX cohérente avec le reste d'Ezia

---

## ✅ Phase 1.5: Backend et Connectivité (Complète)

### Objectif
Créer le modèle de données unifié et connecter les vues aux APIs.

### Réalisations

#### 1. Modèle WebProject
**Fichier**: `models/WebProject.ts`

Modèle unifié regroupant:
- **Pages**: Array embedded de IWebPage
- **Design**: IDesignSystem (couleurs, typo, spacing)
- **Features**: flags pour website/blog/shop/newsletter
- **Configs**: BlogConfig, ShopConfig conditionnels
- **Analytics**: views, uniqueVisitors, conversionRate

**Méthodes**:
```typescript
addPage(pageData) → IWebPage
updatePage(pageId, data) → IWebPage
deletePage(pageId) → boolean
getPageBySlug(slug) → IWebPage
incrementViews() → Promise
```

#### 2. APIs CRUD
**Fichiers**:
- `app/api/web-projects/[businessId]/route.ts` - CRUD projet
- `app/api/web-projects/[businessId]/pages/route.ts` - Liste/Créer pages
- `app/api/web-projects/[businessId]/pages/[pageId]/route.ts` - Page CRUD

**Endpoints**:
```
GET    /api/web-projects/{businessId}          → Projet + stats
POST   /api/web-projects/{businessId}          → Créer projet
PUT    /api/web-projects/{businessId}          → Modifier projet
DELETE /api/web-projects/{businessId}          → Archiver projet

GET    /api/web-projects/{businessId}/pages    → Liste pages
POST   /api/web-projects/{businessId}/pages    → Créer page

GET    /api/web-projects/{businessId}/pages/{pageId}    → Récup page
PUT    /api/web-projects/{businessId}/pages/{pageId}    → Modifier page
DELETE /api/web-projects/{businessId}/pages/{pageId}    → Supprimer page
```

#### 3. Connectivité Frontend

**Overview**:
```typescript
const response = await api.get(`/api/web-projects/${businessId}`);
setWebProject(response.data.webProject);
setStats(response.data.stats);
```

**Pages List**:
```typescript
const response = await api.get(`/api/web-projects/${businessId}/pages`);
setPages(response.data.pages);
```

### Résultat
- **4 fichiers créés**
- **2 fichiers modifiés**
- Données réelles au lieu de simulations
- Système entièrement fonctionnel

---

## ✅ Phase 2: Blog Unifié avec Catégories (Complète)

### Objectif
Ajouter la gestion des catégories de blog et améliorer le calendrier de contenu.

### Réalisations

#### 1. Modèle BlogCategory
**Fichier**: `models/BlogCategory.ts`

```typescript
interface BlogCategory {
  projectId: string;
  businessId: string;
  name: string;
  slug: string;  // Auto-généré
  description: string;
  color: string;  // Hex color
  order: number;
  metadata: {
    postCount: number;
    lastPostAt: Date;
  };
}
```

Features:
- Auto-génération slug (normalize, lowercase, sanitize)
- Index unique (projectId, slug)
- 10 couleurs prédéfinies pour l'UI

#### 2. Mise à Jour BlogPost
**Fichier**: `models/BlogPost.ts`

Ajout:
```typescript
category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' }
```

Index:
```typescript
blogPostSchema.index({ category: 1, status: 1 });
```

#### 3. APIs Catégories

**Routes**:
```
GET    /api/projects/{projectId}/blog/categories           → Liste + counts
POST   /api/projects/{projectId}/blog/categories           → Créer
GET    /api/projects/{projectId}/blog/categories/{id}      → Récup
PUT    /api/projects/{projectId}/blog/categories/{id}      → Modifier
DELETE /api/projects/{projectId}/blog/categories/{id}      → Supprimer
```

**Features spéciales**:
- Validation unicité des slugs
- Comptage des articles par catégorie
- Suppression intelligente (retire la ref des articles au lieu de bloquer)

#### 4. Page Gestion Catégories
**Fichier**: `app/business/[businessId]/web/blog/categories/page.tsx`

**Interface**:
- État vide avec suggestions (Actualités, Tutoriels, Études de cas)
- Grille de cards avec:
  - Icône colorée (Hash)
  - Nom, description, slug
  - Compteur d'articles
  - Actions (Edit, Delete)
- Dialog création/édition avec:
  - Nom (requis)
  - Description (optionnel)
  - Sélecteur de couleur visuel

#### 5. Page Calendrier
**Fichier**: `app/business/[businessId]/web/blog/calendar/page.tsx`

Wrapper simple réutilisant `ContentCalendar`:
```typescript
<ContentCalendar
  projectId={projectId}
  onArticleCreated={handleArticleCreated}
/>
```

### Résultat
- **5 fichiers créés**
- **1 fichier modifié**
- Blog organisé par catégories
- Calendrier intégré dans le hub

---

## 📊 Architecture Finale

### Structure Routes
```
/business/{businessId}/
  web/
    ├─ overview/              → Dashboard + stats
    ├─ site/
    │   ├─ pages/             → Gestion pages ✅
    │   ├─ design/            → (Placeholder)
    │   ├─ branding/          → (Placeholder)
    │   └─ seo/               → (Placeholder)
    ├─ blog/
    │   ├─ posts/             → BlogManager ✅
    │   ├─ categories/        → Gestion catégories ✅
    │   └─ calendar/          → Calendrier contenu ✅
    ├─ shop/                  → (À venir Phase 3)
    ├─ copywriting/           → (À venir Phase 4)
    └─ settings/              → (Placeholder)
```

### Modèles de Données
```
WebProject
  ├─ projectId (unique)
  ├─ businessId (relation Business)
  ├─ userId (owner)
  ├─ features: { website, blog, shop, newsletter }
  ├─ pages: IWebPage[] (embedded)
  ├─ design: IDesignSystem (embedded)
  ├─ blogConfig: IBlogConfig (embedded)
  ├─ shopConfig: IShopConfig (embedded)
  └─ analytics: { views, uniqueVisitors, conversionRate }

BlogCategory
  ├─ projectId (relation WebProject)
  ├─ businessId
  ├─ name, slug, description, color
  └─ metadata: { postCount, lastPostAt }

BlogPost (existant, modifié)
  ├─ projectId
  ├─ category (ref BlogCategory) ← NOUVEAU
  ├─ title, content, slug
  └─ status, publishedAt, scheduledAt
```

### APIs Disponibles
```
Web Projects
  GET/POST/PUT/DELETE  /api/web-projects/{businessId}
  GET/POST             /api/web-projects/{businessId}/pages
  GET/PUT/DELETE       /api/web-projects/{businessId}/pages/{pageId}

Blog Categories
  GET/POST             /api/projects/{projectId}/blog/categories
  GET/PUT/DELETE       /api/projects/{projectId}/blog/categories/{id}

Blog Posts (existant)
  GET/POST             /api/projects/{projectId}/blog
  GET/PUT/DELETE       /api/projects/{projectId}/blog/{id}
```

---

## 🧪 Tests Manuels Recommandés

### Parcours Complet

1. **Entry Point**
   - Dashboard → Card "Gérer ma Présence Web"
   - Vérifie redirection vers `/web/overview`

2. **Création Projet Web**
   - Overview → "Créer mon Projet Web"
   - Vérifie création dans MongoDB
   - Vérifie affichage des stats

3. **Gestion Pages**
   - Site → Pages
   - Vérifie templates suggérés
   - Créer une page via API
   - Vérifie affichage

4. **Gestion Catégories**
   - Blog → Catégories
   - Créer "Actualités", "Tutoriels", "Guides"
   - Modifier couleur d'une catégorie
   - Vérifier compteur d'articles

5. **Calendrier Blog**
   - Blog → Calendrier
   - Sélectionner une date
   - Planifier un article
   - Vérifier dans Posts

6. **Navigation Cohérence**
   - Tester tous les onglets
   - Vérifier sidebar contextuelle
   - Vérifier bouton "Parler à Ezia"

---

## 📈 Métriques

### Code Produit
- **Fichiers créés**: 20
- **Fichiers modifiés**: 4
- **Lignes de code**: ~3,500
- **Modèles**: 2 nouveaux (WebProject, BlogCategory)
- **APIs**: 10 endpoints
- **Pages UI**: 5 pages principales

### Fonctionnalités
- ✅ Hub web unifié
- ✅ Gestion pages site
- ✅ Gestion articles blog (existant)
- ✅ Gestion catégories blog (nouveau)
- ✅ Calendrier contenu (intégré)
- ⏳ Gestion boutique (Phase 3)
- ⏳ Copywriting/Branding (Phase 4)
- ⏳ SEO & Analytics (Phase 5)

---

## 🚀 Prochaines Étapes Suggérées

### Option A: Phase 3 - E-commerce Shop (Priorité Haute)
Fonctionnalité demandée dans le brief initial:

**Modèles**:
- Product (name, description, price, images, inventory)
- Order (customer, items, total, status, stripe)
- ShopConfig (currency, stripe keys, taxRate)

**Pages**:
- `/web/shop/products` - Liste produits
- `/web/shop/orders` - Gestion commandes
- `/web/shop/settings` - Config Stripe

**APIs**:
- CRUD produits
- CRUD commandes
- Intégration Stripe Checkout
- Gestion inventaire

### Option B: Améliorations Blog (Priorité Moyenne)
Renforcer l'existant:

**Features**:
- Filtre par catégorie dans BlogManager
- Affichage catégories dans articles publics
- Analytics par catégorie
- Export RSS par catégorie
- Related posts by category

### Option C: Phase 4 - Copywriting & Branding (Priorité Moyenne)
Fonctionnalité demandée dans le brief initial:

**Features**:
- Revue automatique des textes par AI
- Suggestions titres/headlines
- Analyse de ton (professional, casual, etc.)
- Gestion logos et images
- Guidelines branding

### Option D: Tests & Refinement (Priorité Variable)
Consolider l'existant:

**Tâches**:
- Tests manuels complets
- Corrections UX/UI
- Optimisations performance
- Documentation utilisateur
- Fix async params warnings dans routes legacy

---

## 📝 Notes Techniques

### Next.js 15 Compliance
Tous les nouveaux routes utilisent:
```typescript
{ params }: { params: Promise<{ businessId: string }> }
const { businessId } = await params;
```

### Soft Deletes
Pattern utilisé:
```typescript
status: 'draft' | 'published' | 'archived'
// DELETE = status = 'archived'
```

### Embedded vs Referenced
- **Pages**: Embedded dans WebProject (performance)
- **Categories**: Collection séparée (réutilisabilité)
- **Posts**: Collection séparée (volume)

### Backward Compatibility
- Routes `/sites/new` et `/sites/{id}/edit` toujours fonctionnelles
- UserProject model toujours utilisé
- Migration progressive possible

---

**Status**: ✅ Phases 1, 1.5, 2 Complètes
**Date**: 2025-10-08
**Auteur**: Claude Code Session Continue
**Next**: Awaiting user direction (Phase 3 Shop recommandée)
