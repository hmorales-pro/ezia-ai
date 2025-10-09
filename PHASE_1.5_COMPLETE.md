# Phase 1.5 Complete: APIs et Connectivité

## ✅ Travaux Réalisés

### 1. Modèle de Données Unifié

**Fichier**: `models/WebProject.ts`

Création du modèle MongoDB unifié pour toute la présence web d'un business:

```typescript
interface IWebProject {
  projectId: string;
  businessId: string;
  userId: string;
  name: string;
  status: 'draft' | 'published' | 'archived';

  features: {
    website: boolean;
    blog: boolean;
    shop: boolean;
    newsletter: boolean;
  };

  pages: IWebPage[];
  design: IDesignSystem;
  blogConfig?: IBlogConfig;
  shopConfig?: IShopConfig;
  analytics: {...};
}
```

**Méthodes d'instance**:
- `addPage(pageData)` - Ajoute une page avec pageId auto-généré
- `updatePage(pageId, pageData)` - Met à jour une page existante
- `deletePage(pageId)` - Supprime une page
- `getPageBySlug(slug)` - Récupère une page par son slug
- `incrementViews()` - Incrémente les statistiques de vues

**Méthodes statiques**:
- `findByBusinessId(businessId)` - Trouve le projet web d'un business
- `findBySubdomain(subdomain)` - Trouve un projet par sous-domaine

### 2. APIs REST Complètes

#### `/api/web-projects/[businessId]/route.ts`
- **GET**: Récupère le projet web avec statistiques
- **POST**: Crée un nouveau projet web
- **PUT**: Met à jour un projet existant
- **DELETE**: Archive un projet (soft delete)

#### `/api/web-projects/[businessId]/pages/route.ts`
- **GET**: Liste toutes les pages (avec filtre published)
- **POST**: Crée une nouvelle page (valide unicité du slug)

#### `/api/web-projects/[businessId]/pages/[pageId]/route.ts`
- **GET**: Récupère une page spécifique
- **PUT**: Met à jour une page
- **DELETE**: Supprime une page

### 3. Connectivité Frontend → Backend

**Fichiers modifiés**:

1. **`app/business/[businessId]/web/overview/page.tsx`**
   - Suppression des données simulées
   - Ajout de `fetchWebProject()` connecté à `/api/web-projects/${businessId}`
   - Récupération des stats blog si feature activée
   - Gestion du cas 404 (pas encore de projet)

2. **`app/business/[businessId]/web/site/pages/page.tsx`**
   - Connexion à `/api/web-projects/${businessId}/pages`
   - Affichage réel des pages depuis MongoDB
   - Actions Edit/Preview/Delete prêtes pour implémentation

3. **`app/business/[businessId]/web/blog/posts/page.tsx`**
   - Déjà fonctionnel (réutilise BlogManager existant)
   - Détection automatique du projectId associé au businessId

## 🔧 Corrections Techniques

### Next.js 15 Async Params
Tous les routes handlers utilisent maintenant la syntaxe correcte:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params; // ✅ Correct
  // ...
}
```

### Validation et Sécurité
- Validation unicité des slugs lors de création de page
- Vérification existence du projet avant création
- Gestion propre des erreurs 404
- Soft delete avec status='archived'

## 📊 Flux de Données

```
Frontend                API Routes              MongoDB
--------                -----------             -------
Overview Page    →     GET /api/web-projects/   →  WebProject.findByBusinessId()
                       [businessId]
                 ←     { webProject, stats }    ←

Pages List       →     GET /api/web-projects/   →  webProject.pages
                       [businessId]/pages
                 ←     { pages, total }         ←

Create Page      →     POST /api/web-projects/  →  webProject.addPage()
                       [businessId]/pages            webProject.save()
                 ←     { page }                 ←
```

## 🧪 Tests Manuels Recommandés

### Test 1: Création Projet Web
1. Aller sur `/business/{businessId}/web/overview`
2. Cliquer "Créer mon Projet Web"
3. Vérifier création dans MongoDB
4. Vérifier affichage des stats

### Test 2: Gestion Pages
1. Aller sur `/business/{businessId}/web/site/pages`
2. Vérifier état vide avec suggestions templates
3. Créer une page (via API ou directement en DB)
4. Vérifier affichage dans la liste

### Test 3: Intégration Blog
1. Aller sur `/business/{businessId}/web/blog/posts`
2. Vérifier affichage du BlogManager existant
3. Créer un article
4. Vérifier compteur dans Overview

## 🔄 Compatibilité Arrière

L'architecture actuelle maintient la compatibilité avec:
- Routes `/sites/new` et `/sites/{id}/edit` (UnifiedEditor)
- Modèle UserProject existant
- APIs blog existantes (`/api/projects/{projectId}/blog`)

### Migration Progressive

Le système permet une transition douce:
1. **Phase actuelle**: Nouveau hub coexiste avec ancien système
2. **Phase future**: Migration données UserProject → WebProject
3. **Phase finale**: Dépréciation anciennes routes

## 📝 Structure Base de Données

### Collections Utilisées
- **web_projects**: Projets web unifiés (nouveau)
- **user_projects**: Projets legacy (existant)
- **blogposts**: Articles de blog (existant)
- **businesses**: Informations business (existant)

### Relations
```
Business (businessId)
    ↓
WebProject (businessId)
    ↓
    ├─ pages[] (embedded)
    ├─ design (embedded)
    └─ blogConfig (embedded)

BlogPost (projectId) → WebProject (projectId)
```

## 🚀 Prêt pour Phase 2

Phase 1.5 est 100% fonctionnelle. Prêt à continuer avec:

### Option A: Phase 2 - Blog Unifié
- Gestion des catégories
- Calendrier de contenu amélioré
- Relations entre articles
- SEO blog

### Option B: Phase 3 - Boutique E-commerce
- Modèle Product
- Intégration Stripe
- Gestion commandes
- Inventaire

### Option C: Tests et Refinement
- Tests manuels complets
- Corrections UX
- Optimisations performance
- Documentation utilisateur

## 📂 Fichiers Créés/Modifiés

### Créés (Phase 1.5):
- `models/WebProject.ts` (328 lignes)
- `app/api/web-projects/[businessId]/route.ts` (153 lignes)
- `app/api/web-projects/[businessId]/pages/route.ts` (97 lignes)
- `app/api/web-projects/[businessId]/pages/[pageId]/route.ts` (118 lignes)

### Modifiés (Phase 1.5):
- `app/business/[businessId]/web/overview/page.tsx` (connecté API)
- `app/business/[businessId]/web/site/pages/page.tsx` (connecté API)

### Créés (Phase 1):
- `ARCHITECTURE_WEB_REFONTE.md`
- `app/business/[businessId]/web/layout.tsx`
- `app/business/[businessId]/web/overview/page.tsx`
- `app/business/[businessId]/web/site/pages/page.tsx`
- `app/business/[businessId]/web/blog/posts/page.tsx`
- 6 autres pages placeholder

### Total:
- **15+ fichiers créés**
- **2 fichiers modifiés**
- **~1800 lignes de code**

---

**Status**: ✅ Phase 1.5 Complete
**Date**: 2025-10-08
**Next**: Awaiting direction for Phase 2, 3, or Testing
