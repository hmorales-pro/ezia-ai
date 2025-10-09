# Architecture Web - Refonte Complète

## 📊 Analyse de l'Architecture Actuelle

### Flux Utilisateur Actuel (PROBLÉMATIQUE)

#### 1. **Création de Business**
```
/dashboard → /business/new → /business/{businessId}
```
- ✅ Flux clair et cohérent
- ✅ Agents IA bien intégrés (market analysis, marketing strategy)
- ✅ Interface organisée avec onglets

#### 2. **Création de Site Web** (PROBLÈME MAJEUR)
```
Méthode 1: /dashboard → "Projets Web" → /workspace → /sites/new → UnifiedEditor
Méthode 2: /business/{businessId} → WebsiteSection → /sites/new
Méthode 3: /workspace/new → focus=website → /sites/new
```

**Problèmes identifiés** :
- ❌ **3 points d'entrée différents** → Confusion utilisateur
- ❌ **Navigation fragmentée** : `/sites/` vs `/workspace/` vs `/business/`
- ❌ **Boutons cachés** : "Gérer le blog" difficile à trouver
- ❌ **Pas de cohérence** avec le reste de l'app (business, agents)
- ❌ **Fonctionnalités isolées** : Blog, boutique, copywriting séparés

#### 3. **Gestion du Blog** (ACTUEL - CONFUS)
```
Site public: /{projectId} → Bouton "Gérer le blog" → /sites/{projectId}/edit → Onglet "Blog"
```

**Problèmes** :
- ❌ Bouton flottant peu intuitif
- ❌ Pas d'accès depuis /dashboard
- ❌ Pas de lien avec le business parent
- ❌ Éditeur et blog dans la même interface = surcharge

---

## 🎯 Architecture Proposée - Vision Cohérente

### Principe Directeur

> **Un business = un hub central avec tous ses actifs digitaux**

Chaque business devient un **workspace unifié** où l'utilisateur peut :
1. Gérer son **site web** (pages, design, SEO)
2. Gérer son **blog** (articles, catégories, calendrier)
3. Gérer sa **boutique** (produits, prix, paiements Stripe)
4. Améliorer son **copywriting** et **branding** (charte graphique, logos)
5. Consulter ses **analytics** et **métriques**
6. Interagir avec les **agents IA spécialisés**

---

## 🏗️ Nouvelle Structure de Routing

### 1. Point d'Entrée Unique : `/business/{businessId}/web`

```
/business/{businessId}
├── /web                          ← NOUVEAU HUB WEB
│   ├── /overview                 → Vue d'ensemble (analytics, quick actions)
│   ├── /site                     → Gestion du site (pages, design, SEO)
│   │   ├── /pages                → Liste et édition des pages
│   │   ├── /pages/new            → Créer nouvelle page
│   │   ├── /pages/{pageId}/edit  → Éditeur de page avec AI
│   │   ├── /design               → Charte graphique, couleurs, typos
│   │   ├── /branding             → Logos, images, assets
│   │   └── /seo                  → Optimisation SEO
│   ├── /blog                     → Gestion du blog
│   │   ├── /posts                → Liste des articles
│   │   ├── /posts/new            → Nouvel article avec AI
│   │   ├── /posts/{slug}/edit    → Éditer article
│   │   ├── /categories           → Gérer catégories
│   │   ├── /calendar             → Calendrier de publication
│   │   └── /settings             → Config blog (layout, RSS, etc)
│   ├── /shop                     → Boutique en ligne (NOUVEAU)
│   │   ├── /products             → Liste produits
│   │   ├── /products/new         → Nouveau produit avec AI
│   │   ├── /products/{id}/edit   → Éditer produit
│   │   ├── /categories           → Catégories produits
│   │   ├── /orders               → Commandes
│   │   ├── /stripe               → Configuration Stripe
│   │   └── /settings             → Config boutique
│   ├── /copywriting              → Amélioration textes avec AI
│   │   ├── /pages                → Revoir copywriting pages
│   │   ├── /products             → Revoir descriptions produits
│   │   └── /blog                 → Revoir articles blog
│   └── /settings                 → Paramètres généraux web
│       ├── /domain               → Nom de domaine
│       ├── /analytics            → Google Analytics, etc.
│       └── /integrations         → APIs tierces
```

### 2. Navigation Dashboard Simplifiée

```typescript
// Dans /dashboard
<Button onClick={() => router.push(`/business/${businessId}/web`)}>
  <Globe className="w-5 h-5 mr-2" />
  Gérer ma présence web
</Button>
```

### 3. Site Public Inchangé

```
/{projectId}                      → Site public (HTML statique + JS dynamique)
/{projectId}/blog                 → Liste articles
/{projectId}/blog/{slug}          → Article détail
/{projectId}/shop                 → Boutique (NOUVEAU)
/{projectId}/shop/{productId}     → Fiche produit
```

---

## 🎨 Interface Utilisateur - Hub Web

### Layout Principal : `/business/{businessId}/web`

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                          │
│ Business: RestFree | Présence Web                              │
│ [Overview] [Site] [Blog] [Shop] [Copywriting] [Settings]      │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐ │
│  │ Navigation Latérale │  │ Contenu Principal               │ │
│  │                     │  │                                 │ │
│  │ SITE                │  │ Vue spécifique à l'onglet       │ │
│  │ • Pages             │  │                                 │ │
│  │ • Design            │  │ Avec assistants IA intégrés     │ │
│  │ • Branding          │  │                                 │ │
│  │ • SEO               │  │                                 │ │
│  │                     │  │                                 │ │
│  │ BLOG                │  │                                 │ │
│  │ • Articles          │  │                                 │ │
│  │ • Catégories        │  │                                 │ │
│  │ • Calendrier        │  │                                 │ │
│  │                     │  │                                 │ │
│  │ BOUTIQUE            │  │                                 │ │
│  │ • Produits          │  │                                 │ │
│  │ • Commandes         │  │                                 │ │
│  │ • Paiements         │  │                                 │ │
│  └─────────────────────┘  └─────────────────────────────────┘ │
│                                                                 │
│  [Bouton Flottant: 💬 Parler à Ezia]                          │
└─────────────────────────────────────────────────────────────────┘
```

### Exemple : Vue "Blog > Articles"

```
┌─────────────────────────────────────────────────────────────────┐
│ Blog > Articles                                                 │
│ [+ Nouvel Article] [📅 Calendrier] [⚙️ Paramètres]            │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📝 Article 1: "Les secrets de notre cuisine"              ││
│  │ 📅 Publié le 15/01/2025 | 👁️ 245 vues | ✏️ Éditer        ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ 📝 Article 2: "La cuisine Kaiseki"                        ││
│  │ 📅 Brouillon | 💡 Généré par Ezia AI | ✏️ Éditer         ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ 📝 Article 3: "Notre sélection de vins"                   ││
│  │ 📅 Programmé pour le 20/01/2025 | ✏️ Éditer              ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  💡 Assistant Ezia suggère:                                    │
│  "Créer un article sur les tendances culinaires 2025?"        │
│  [Générer avec l'IA] [Ignorer]                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Intégration des Agents IA

### Agents Spécialisés par Fonctionnalité

#### 1. **Site Web**
- **SiteArchitectAgent** : Structure et navigation
- **DesignAgent** : Charte graphique, couleurs, typos
- **CopywriterAgent** : Optimisation des textes
- **SEOAgent** : Optimisation référencement

#### 2. **Blog**
- **BlogStrategyAgent** : Stratégie éditoriale, topics
- **BlogWriterAgent** : Génération d'articles (DeepSeek/Mistral)
- **SEOBlogAgent** : Optimisation SEO articles

#### 3. **Boutique** (NOUVEAU)
- **ProductCreatorAgent** : Création fiches produits
- **PricingAgent** : Stratégie de prix
- **InventoryAgent** : Gestion stock
- **StripeIntegrationAgent** : Configuration paiements

#### 4. **Copywriting**
- **CopyReviewAgent** : Analyse et amélioration textes
- **BrandVoiceAgent** : Cohérence ton et style

### Interaction Utilisateur ↔ Agent

**Exemple : Créer un article de blog**

```typescript
// Sur /business/{businessId}/web/blog/posts/new

1. User clique "Nouvel Article"
   ↓
2. Modal s'ouvre avec choix:
   - ✍️ Écrire manuellement
   - 🤖 Générer avec l'IA
   ↓
3. Si "Générer avec l'IA":
   - Input: Sujet, mots-clés, ton
   - BlogStrategyAgent: Analyse pertinence sujet
   - BlogWriterAgent: Génère contenu complet
   - SEOBlogAgent: Optimise SEO
   ↓
4. Prévisualisation + Édition possible
   ↓
5. Publication ou programmation
```

---

## 📦 Modèles de Données

### 1. Nouveau modèle : `WebProject`

```typescript
interface WebProject {
  _id: string;
  projectId: string;  // URL-friendly ID
  businessId: string;  // Lien avec Business parent
  userId: string;

  // Métadonnées
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  domain?: string;
  subdomain?: string;

  // Features activées
  features: {
    website: boolean;
    blog: boolean;
    shop: boolean;
    newsletter: boolean;
  };

  // Pages du site
  pages: WebPage[];

  // Configuration design
  design: DesignSystem;

  // Configuration blog (si activé)
  blogConfig?: BlogConfig;

  // Configuration shop (si activé)
  shopConfig?: ShopConfig;

  // Analytics
  analytics: {
    views: number;
    uniqueVisitors: number;
    conversionRate: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface WebPage {
  pageId: string;
  slug: string;  // '/' pour homepage, '/about', etc.
  title: string;
  html: string;
  css: string;
  js?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  isPublished: boolean;
  createdBy: 'user' | 'ai';
  aiGenerated?: {
    agent: string;
    prompt: string;
    timestamp: Date;
  };
}

interface DesignSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'sharp' | 'soft' | 'rounded';
  logo?: string;
  favicon?: string;
}

interface BlogConfig {
  postsPerPage: number;
  layout: 'grid' | 'list' | 'magazine';
  showCategories: boolean;
  showTags: boolean;
  enableComments: boolean;
  rssEnabled: boolean;
}

interface ShopConfig {
  currency: 'EUR' | 'USD' | 'GBP';
  stripeAccountId?: string;
  stripePublicKey?: string;
  taxRate: number;
  shippingEnabled: boolean;
  shippingRates: ShippingRate[];
  inventoryManagement: 'manual' | 'automatic';
}
```

### 2. Modèle : `Product` (NOUVEAU)

```typescript
interface Product {
  _id: string;
  productId: string;
  projectId: string;  // Lien avec WebProject
  businessId: string;

  // Informations produit
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;  // Prix barré
  sku: string;

  // Inventory
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;

  // Organisation
  category: string;
  tags: string[];

  // Media
  images: string[];

  // SEO
  seo: {
    title: string;
    description: string;
    slug: string;
  };

  // Variantes (ex: tailles, couleurs)
  variants?: ProductVariant[];

  // Stripe
  stripePriceId?: string;
  stripeProductId?: string;

  // AI
  aiGenerated: boolean;
  aiAgent?: string;

  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
  variantId: string;
  name: string;  // "Taille: M, Couleur: Bleu"
  price: number;
  sku: string;
  stockQuantity: number;
  stripePriceId?: string;
}
```

### 3. Modèle : `Order` (NOUVEAU)

```typescript
interface Order {
  _id: string;
  orderId: string;
  projectId: string;
  businessId: string;

  // Client
  customer: {
    email: string;
    name: string;
    phone?: string;
    shippingAddress: Address;
    billingAddress?: Address;
  };

  // Commande
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;

  // Paiement
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'stripe';
  stripePaymentIntentId?: string;

  // Livraison
  shippingStatus: 'pending' | 'shipped' | 'delivered';
  trackingNumber?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}
```

### 4. Mise à jour : `BlogPost` (EXISTANT - Améliorer)

```typescript
interface BlogPost {
  // ... existing fields ...

  // Ajouts:
  projectId: string;  // Lien avec WebProject
  category: string;   // Catégorie article
  relatedPosts?: string[];  // IDs articles liés
  comments?: Comment[];  // Si enableComments = true

  // SEO amélioré
  seo: {
    title: string;
    description: string;
    slug: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
}
```

---

## 🔄 Migration des Données Existantes

### Stratégie de Migration

```typescript
// Script de migration: /scripts/migrate-sites-to-webprojects.ts

1. Pour chaque UserProject existant:
   - Créer un WebProject
   - Migrer HTML → WebPage (homepage)
   - Créer DesignSystem à partir des couleurs détectées
   - Si hasBlog = true → Activer features.blog

2. Pour chaque BlogPost existant:
   - Associer au WebProject via projectId
   - Détecter catégorie depuis tags

3. Mettre à jour les références:
   - Business.website_url → WebProject.projectId
   - Redirections: /sites/{id}/edit → /business/{businessId}/web
```

---

## 🛠️ Implémentation Progressive (Phases)

### Phase 1 : Refonte Structure (1-2 semaines)
**Objectif** : Nouvelle architecture de routing sans casser l'existant

✅ **Tasks** :
1. Créer `/business/{businessId}/web` avec layout et navigation
2. Créer modèle `WebProject` + APIs CRUD
3. Créer vues de base:
   - `/web/overview` : Dashboard avec stats
   - `/web/site/pages` : Liste pages
   - `/web/blog/posts` : Liste articles (migrer BlogManager)
4. Ajouter bouton "Gérer ma présence web" dans `/business/{businessId}`
5. Garder anciens endpoints en parallèle (rétrocompatibilité)

### Phase 2 : Blog Unifié (1 semaine)
**Objectif** : Intégrer la gestion du blog dans le nouveau hub

✅ **Tasks** :
1. Migrer `BlogManager` → `/web/blog/posts`
2. Migrer `BlogEditor` → `/web/blog/posts/{slug}/edit`
3. Migrer `ContentCalendar` → `/web/blog/calendar`
4. Ajouter gestion catégories : `/web/blog/categories`
5. Améliorer BlogPost model (category, relatedPosts)

### Phase 3 : Boutique E-commerce (2-3 semaines)
**Objectif** : Ajouter fonctionnalité boutique en ligne

✅ **Tasks** :
1. Créer modèles `Product`, `Order`, `ShopConfig`
2. Créer interfaces:
   - `/web/shop/products` : Liste produits
   - `/web/shop/products/new` : Créer produit avec AI
   - `/web/shop/orders` : Gestion commandes
   - `/web/shop/stripe` : Config Stripe
3. Créer `ProductCreatorAgent` pour génération fiches produits
4. Intégrer Stripe:
   - Checkout session
   - Webhooks (payment.success, etc.)
5. Créer pages publiques:
   - `/{projectId}/shop` : Catalogue
   - `/{projectId}/shop/{productId}` : Fiche produit
   - `/{projectId}/checkout` : Panier + paiement

### Phase 4 : Copywriting & Branding (1 semaine)
**Objectif** : Outils d'amélioration du contenu

✅ **Tasks** :
1. Créer `/web/copywriting` avec onglets (pages, products, blog)
2. Créer `/web/site/design` : Éditeur charte graphique
3. Créer `/web/site/branding` : Upload logos, assets
4. Créer `CopyReviewAgent` : Analyse et suggestions
5. Créer `BrandVoiceAgent` : Cohérence ton

### Phase 5 : SEO & Analytics (1 semaine)
**Objectif** : Optimisation et métriques

✅ **Tasks** :
1. Créer `/web/site/seo` : Optimisation SEO global
2. Intégrer Google Analytics, Search Console
3. Créer `SEOAgent` : Audits et recommandations
4. Dashboard analytics dans `/web/overview`

### Phase 6 : Cleanup & Migration Finale (1 semaine)
**Objectif** : Retirer ancien code, finaliser migration

✅ **Tasks** :
1. Script de migration automatique UserProject → WebProject
2. Redirections permanentes ancien → nouveau routing
3. Supprimer ancien code (`/sites/{id}/edit`, etc.)
4. Documentation utilisateur
5. Tests end-to-end

---

## 🎯 Avantages de cette Architecture

### 1. **Cohérence Totale**
- ✅ Même structure que `/business/{businessId}` (onglets, agents)
- ✅ Navigation logique : Business → Présence Web → Site/Blog/Shop
- ✅ Design system unifié

### 2. **Scalabilité**
- ✅ Facile d'ajouter de nouvelles features (Newsletter, Analytics avancées, etc.)
- ✅ Agents IA modulaires et réutilisables
- ✅ Modèles de données extensibles

### 3. **UX Optimale**
- ✅ Tout accessible depuis un seul hub
- ✅ Pas de navigation entre 10 URLs différentes
- ✅ Assistants IA contextuels et pertinents
- ✅ Actions rapides depuis l'overview

### 4. **SEO & Performance**
- ✅ Sites publics restent en HTML statique + JS (rapide)
- ✅ SSR pour les pages critiques
- ✅ Lazy loading des composants lourds

### 5. **Monétisation Future**
- ✅ Shop intégré = commission sur ventes
- ✅ Stripe Connect = frais de transaction
- ✅ Premium features (SEO avancé, analytics, etc.)

---

## 📝 Recommandations Finales

### À Faire Immédiatement
1. ✅ **Valider cette architecture** avec l'équipe
2. ✅ **Créer les wireframes** de `/business/{businessId}/web`
3. ✅ **Commencer Phase 1** (refonte structure)

### À Éviter
- ❌ Ne pas créer de nouveaux endpoints dans `/sites/` ou `/workspace/`
- ❌ Ne pas disperser la logique web sur 10 fichiers différents
- ❌ Ne pas créer de modals/composants isolés sans hub central

### Best Practices
- ✅ Utiliser le **UnifiedEditor** existant pour l'édition de pages
- ✅ Créer des **agents spécialisés** pour chaque fonctionnalité
- ✅ Maintenir **rétrocompatibilité** pendant migration
- ✅ Tester **chaque phase** avant de passer à la suivante

---

## 🎬 Conclusion

Cette refonte transforme Ezia d'un outil de création de sites en une **plateforme complète de gestion de présence digitale**.

**Avant** : "Je veux créer un site web"
**Après** : "Je veux développer ma présence en ligne (site + blog + boutique + branding)"

L'utilisateur n'a plus à se demander "où dois-je cliquer ?" - tout est centralisé dans `/business/{businessId}/web` avec une navigation claire et cohérente.

**Impact Business** :
- 📈 Meilleure rétention utilisateurs (tout au même endroit)
- 💰 Nouvelles sources de revenus (shop, commissions)
- 🚀 Scalabilité pour futures features
- 🤖 Agents IA mieux exploités et visibles
