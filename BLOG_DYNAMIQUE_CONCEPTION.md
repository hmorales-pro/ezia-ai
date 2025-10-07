# 🎯 Blog Dynamique & Persistance de Sites - Conception

**Date**: 6 octobre 2025
**Objectif**: Transformer le système statique actuel en système dynamique avec blog gérable

---

## 📊 État Actuel vs Objectif

### ❌ Problème Actuel
```
Génération → HTML statique → Preview iframe
                ↓
           Téléchargement ZIP
```
- Site généré = fichier HTML fixe
- Articles de blog = hardcodés dans le HTML
- Pas de persistance (perte après refresh)
- Pas d'URL publique
- Pas de gestion post-création

### ✅ Objectif Visé
```
Génération → Sauvegarde MongoDB → Site Dynamique
                ↓                       ↓
           URL Publique          Blog gérable
                                      ↓
                               Ajout articles depuis Ezia
```

---

## 🏗️ Architecture Proposée

### 1. **Modèles Existants** (Déjà OK ✅)

#### `BlogPost` (models/BlogPost.ts)
```typescript
{
  businessId: String,    // Lien vers Business
  projectId: String,     // ← AJOUTER: Lien vers UserProject
  title: String,
  content: String,
  slug: String,
  status: 'draft' | 'published' | 'scheduled' | 'archived',
  publishedAt: Date,
  seoTitle, seoDescription, tags, keywords...
}
```

#### `UserProject` (models/UserProject.ts)
```typescript
{
  projectId: String,      // ID unique du site
  userId: String,
  businessId: String,
  subdomain: String,      // → URL: projectId.ezia.app
  html: String,           // Code HTML du site
  status: 'draft' | 'published' | 'archived',
  deployUrl: String,
  hasBlog: Boolean,       // ← AJOUTER
  blogConfig: {           // ← AJOUTER
    enabled: Boolean,
    layout: 'grid' | 'list',
    postsPerPage: Number
  }
}
```

### 2. **Nouvelle Architecture de Génération**

#### A. Génération initiale du site
```
User clique "Créer site"
    ↓
Multi-Agent génère le HTML/CSS/JS
    ↓
SAUVEGARDE dans UserProject (MongoDB)
    ↓
Création de l'URL publique: {projectId}.ezia.app
    ↓
Affichage dans l'éditeur Ezia
```

#### B. Génération avec Blog
```
User coche "Inclure un blog"
    ↓
Multi-Agent génère:
  - Site principal (HTML)
  - Template de listing blog
  - Template d'article individuel
    ↓
SAUVEGARDE dans UserProject avec hasBlog: true
    ↓
Génération de 3 articles initiaux (BlogPost MongoDB)
    ↓
Site accessible avec blog dynamique
```

---

## 🔄 Flux d'Utilisation

### Scénario 1: Création d'un Site avec Blog

```
┌─────────────────────────────────────────────┐
│ 1. User crée "RestFree" (restaurant)        │
│    ✓ Inclure blog = true                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Multi-Agent génère:                      │
│    - HTML site principal                    │
│    - Template blog intégré                  │
│    - Design system cohérent                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Sauvegarde MongoDB:                      │
│    UserProject {                            │
│      projectId: "proj_xxx",                 │
│      subdomain: "restfree",                 │
│      html: "<!DOCTYPE html>...",            │
│      hasBlog: true,                         │
│      status: "published"                    │
│    }                                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Génération 3 articles initiaux:          │
│    BlogPost[0]: "Notre Histoire"            │
│    BlogPost[1]: "Guide Gastronomie"         │
│    BlogPost[2]: "Tendances 2025"            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 5. Site accessible:                         │
│    https://restfree.ezia.app                │
│    https://restfree.ezia.app/blog           │
│    https://restfree.ezia.app/blog/notre-... │
└─────────────────────────────────────────────┘
```

### Scénario 2: Ajout d'Article depuis Ezia

```
User ouvre "RestFree" dans Ezia
    ↓
Clique "Gérer le Blog" → Section blog apparaît
    ↓
Clique "Nouvel Article"
    ↓
Formulaire:
  - Titre (ou AI génère)
  - Sujet/Mots-clés
  - Ton (professionnel/casual...)
  - Longueur (court/moyen/long)
    ↓
AI génère l'article (BlogWriterMistral)
    ↓
Sauvegarde BlogPost MongoDB:
  {
    projectId: "proj_xxx",
    businessId: "bus_xxx",
    title: "Nouveau plat japonais",
    slug: "nouveau-plat-japonais",
    content: "...",
    status: "draft"
  }
    ↓
User peut:
  - Prévisualiser
  - Modifier
  - Publier maintenant
  - Scheduler publication
```

---

## 🛠️ Modifications Techniques Requises

### 1. **Modèle BlogPost** (AJOUTER)
```typescript
// models/BlogPost.ts
projectId: { type: String, required: true }, // ← Lien vers site
```

### 2. **Modèle UserProject** (AJOUTER)
```typescript
// models/UserProject.ts
hasBlog: { type: Boolean, default: false },
blogConfig: {
  enabled: { type: Boolean, default: false },
  layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
  postsPerPage: { type: Number, default: 9 }
}
```

### 3. **API Endpoints à Créer**

#### `/api/projects/[projectId]/route.ts`
```typescript
GET    → Récupérer un site
POST   → Créer un nouveau site
PUT    → Mettre à jour un site
DELETE → Supprimer un site
```

#### `/api/projects/[projectId]/blog/route.ts`
```typescript
GET  → Liste des articles du site
POST → Créer nouvel article
```

#### `/api/projects/[projectId]/blog/[slug]/route.ts`
```typescript
GET    → Récupérer un article
PUT    → Modifier un article
DELETE → Supprimer un article
```

#### `/api/projects/[projectId]/publish/route.ts`
```typescript
POST → Publier le site (status: draft → published)
```

### 4. **Route Publique Dynamique**

#### `/app/[projectId]/page.tsx` (Nouveau)
```typescript
// Affiche le site publié dynamiquement
export default async function PublicSitePage({
  params
}: {
  params: { projectId: string }
}) {
  const project = await UserProject.findOne({
    projectId: params.projectId,
    status: 'published'
  });

  if (!project) return notFound();

  return <DynamicSiteRenderer html={project.html} />;
}
```

#### `/app/[projectId]/blog/page.tsx` (Nouveau)
```typescript
// Liste des articles du blog
export default async function BlogListingPage({
  params
}: {
  params: { projectId: string }
}) {
  const posts = await BlogPost.find({
    projectId: params.projectId,
    status: 'published'
  }).sort({ publishedAt: -1 });

  return <BlogListingRenderer posts={posts} />;
}
```

#### `/app/[projectId]/blog/[slug]/page.tsx` (Nouveau)
```typescript
// Article individuel
export default async function BlogArticlePage({
  params
}: {
  params: { projectId: string; slug: string }
}) {
  const post = await BlogPost.findOne({
    projectId: params.projectId,
    slug: params.slug,
    status: 'published'
  });

  if (!post) return notFound();

  return <BlogArticleRenderer post={post} />;
}
```

### 5. **Composants UI à Créer**

#### `components/blog/blog-manager.tsx`
```typescript
// Interface de gestion du blog dans Ezia
- Liste des articles
- Bouton "Nouvel Article"
- Filtres (brouillons, publiés, programmés)
- Actions (modifier, publier, supprimer)
```

#### `components/blog/blog-editor.tsx`
```typescript
// Éditeur d'article
- Formulaire titre/sujet/ton
- Bouton "Générer avec AI"
- Éditeur de contenu (markdown)
- Preview en temps réel
- Options publication (maintenant/programmer)
```

#### `components/site/dynamic-site-renderer.tsx`
```typescript
// Rendu du site avec injection des articles blog
function DynamicSiteRenderer({ html, blogPosts }) {
  // Parse le HTML
  // Injecte les articles dans la section blog
  // Retourne le HTML final avec hydratation
}
```

---

## 📝 Plan d'Implémentation

### Phase 1: Persistance Basique (1-2h)
1. ✅ Modifier BlogPost: ajouter `projectId`
2. ✅ Modifier UserProject: ajouter `hasBlog`, `blogConfig`
3. ✅ Créer API `/api/projects/[projectId]/route.ts`
4. ✅ Modifier génération pour sauvegarder dans MongoDB
5. ✅ Créer route publique `/[projectId]/page.tsx`

### Phase 2: Blog Dynamique (2-3h)
1. ✅ Créer API `/api/projects/[projectId]/blog/`
2. ✅ Créer routes publiques blog
3. ✅ Créer `DynamicSiteRenderer` avec injection articles
4. ✅ Tester affichage blog dynamique

### Phase 3: Interface Gestion Blog (2-3h)
1. ✅ Créer `BlogManager` component
2. ✅ Créer `BlogEditor` component
3. ✅ Intégrer dans UnifiedEditor
4. ✅ Ajouter bouton "Gérer Blog" dans l'éditeur
5. ✅ Formulaire génération AI d'articles

### Phase 4: Publication & Déploiement (1-2h)
1. ✅ Système de preview (draft)
2. ✅ Bouton "Publier le site"
3. ✅ Génération URL publique (subdomain)
4. ✅ Partage URL avec utilisateur

---

## 🎨 Exemple de Flux Complet

```typescript
// 1. User génère site "RestFree" avec blog
POST /api/sites/generate-multi-agent-stream
{
  name: "RestFree",
  industry: "Restauration",
  includeBlog: true  // ← Nouveau paramètre
}

// 2. Multi-Agent génère le site
// 3. Sauvegarde automatique:
POST /api/projects
{
  projectId: "proj_1234",
  subdomain: "restfree",
  html: "<!DOCTYPE html>...",
  hasBlog: true,
  status: "draft"
}

// 4. Génération articles initiaux:
POST /api/projects/proj_1234/blog (x3)
{
  title: "Notre Histoire",
  content: "...",
  status: "published"
}

// 5. Site accessible:
https://restfree.ezia.app          → Affiche le site
https://restfree.ezia.app/blog     → Liste 3 articles
https://restfree.ezia.app/blog/notre-histoire → Article

// 6. User ajoute article depuis Ezia:
POST /api/projects/proj_1234/blog
{
  subject: "Nouvelle carte printemps",
  tone: "enthusiastic",
  length: "medium",
  aiGenerate: true
}

// 7. Article visible immédiatement sur le site public
```

---

## ✅ Avantages de cette Approche

| Aspect | Avant | Après |
|--------|-------|-------|
| **Persistance** | ❌ Perdu au refresh | ✅ Sauvegardé MongoDB |
| **URL Publique** | ❌ Aucune | ✅ {projectId}.ezia.app |
| **Blog** | ❌ Statique, hardcodé | ✅ Dynamique, gérable |
| **Ajout articles** | ❌ Impossible | ✅ Depuis interface Ezia |
| **Déploiement** | ❌ ZIP manuel | ✅ Automatique |
| **Gestion post-création** | ❌ Aucune | ✅ Éditeur complet |
| **SEO** | ❌ Inexistant | ✅ URLs propres + sitemap |
| **Évolutivité** | ❌ Limitée | ✅ Extensible |

---

## 🚀 Prochaines Étapes Recommandées

1. **Confirmer l'approche** : Valider cette architecture
2. **Choisir la phase** : Commencer par quelle phase ? (Je recommande Phase 1)
3. **Implémenter progressivement** : Tester chaque phase avant de passer à la suivante

Voulez-vous que je commence l'implémentation de la Phase 1 ?
