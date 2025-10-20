# Configuration Stripe pour Ezia

## 📋 Résumé

Ezia utilise Stripe pour gérer les abonnements au plan Creator (29€/mois ou 290€/an).

## 🔧 Installation

### 1. Installer les packages Stripe

```bash
npm install stripe @stripe/stripe-js
```

### 2. Créer un compte Stripe

1. Aller sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créer un compte
3. Compléter les informations de votre entreprise

## 📦 Configuration des produits dans Stripe

### 1. Créer le produit "Creator"

1. Aller dans **Produits** → **Ajouter un produit**
2. Nom : `Creator`
3. Description : `Plan Creator - Pour les entrepreneurs qui veulent développer leur présence`
4. Cliquer sur **Enregistrer le produit**

### 2. Créer les prix

#### Prix mensuel (29€)
1. Dans le produit Creator, cliquer sur **Ajouter un prix**
2. Prix : `29,00 EUR`
3. Type : `Récurrent`
4. Période de facturation : `Mensuel`
5. Cliquer sur **Enregistrer le prix**
6. **Copier l'ID du prix** (commence par `price_...`)

#### Prix annuel (290€)
1. Dans le produit Creator, cliquer sur **Ajouter un prix**
2. Prix : `290,00 EUR`
3. Type : `Récurrent`
4. Période de facturation : `Annuel`
5. Cliquer sur **Enregistrer le prix**
6. **Copier l'ID du prix** (commence par `price_...`)

## 🔑 Configuration des clés API

### 1. Récupérer les clés Stripe

1. Aller dans **Développeurs** → **Clés API**
2. Copier :
   - **Clé publique de test** (commence par `pk_test_...`)
   - **Clé secrète de test** (commence par `sk_test_...`)

### 2. Configurer les webhooks

1. Aller dans **Développeurs** → **Webhooks**
2. Cliquer sur **Ajouter un endpoint**
3. URL du endpoint : `https://votredomaine.com/api/stripe/webhook`
4. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Cliquer sur **Ajouter un endpoint**
6. **Copier la clé de signature** (commence par `whsec_...`)

## 🌍 Variables d'environnement

Ajouter ces variables dans votre `.env.local` (développement) et `.env.production` (production) :

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY=price_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY=price_xxxxxxxxxxxx
```

**Remplacer les valeurs :**
- `STRIPE_SECRET_KEY` : Votre clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` : Votre clé de signature webhook
- `NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY` : ID du prix mensuel (29€)
- `NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY` : ID du prix annuel (290€)

## 🧪 Test en local

### 1. Installer Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
```

Ou télécharger depuis [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### 2. Se connecter à Stripe

```bash
stripe login
```

### 3. Écouter les webhooks en local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier la clé de signature affichée et la mettre dans `STRIPE_WEBHOOK_SECRET`

### 4. Tester un paiement

1. Lancer le serveur : `npm run dev`
2. Aller sur [http://localhost:3000/pricing](http://localhost:3000/pricing)
3. Cliquer sur "Choisir Creator"
4. Utiliser les cartes de test Stripe :
   - **Carte valide** : `4242 4242 4242 4242`
   - **Date d'expiration** : N'importe quelle date future (ex: 12/34)
   - **CVC** : N'importe quel 3 chiffres (ex: 123)
   - **Code postal** : N'importe quel code postal

## 🚀 Passage en production

### 1. Activer votre compte Stripe

1. Aller dans **Paramètres** → **Informations sur l'entreprise**
2. Compléter toutes les informations requises
3. Activer les paiements en production

### 2. Obtenir les clés de production

1. Aller dans **Développeurs** → **Clés API**
2. Activer le mode "Production"
3. Copier les clés de production (commencent par `pk_live_` et `sk_live_`)

### 3. Configurer le webhook de production

1. Créer un nouveau webhook avec l'URL de production
2. Copier la nouvelle clé de signature

### 4. Mettre à jour les variables d'environnement

Remplacer les clés de test par les clés de production dans `.env.production`

## 📊 Modèle de données utilisateur

Le webhook Stripe met à jour automatiquement le modèle User avec ces champs :

```typescript
subscription: {
  plan: 'free' | 'creator',
  status: 'active' | 'canceled' | 'past_due',
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: Date,
  updatedAt: Date
}
```

## 🔄 Flux d'abonnement

1. **Utilisateur clique sur "Choisir Creator"**
   - Appel à `/api/stripe/create-checkout-session`
   - Création d'une session Stripe Checkout
   - Redirection vers Stripe

2. **Paiement sur Stripe**
   - Utilisateur entre ses informations de paiement
   - Stripe traite le paiement

3. **Webhook `checkout.session.completed`**
   - Stripe envoie un webhook à `/api/stripe/webhook`
   - Le plan de l'utilisateur est mis à jour vers "creator"
   - L'abonnement est enregistré dans MongoDB

4. **Redirection vers le dashboard**
   - Message de succès affiché
   - Utilisateur a accès aux fonctionnalités Creator

## 🛠️ Fichiers créés

- `lib/stripe.ts` - Configuration Stripe
- `app/api/stripe/create-checkout-session/route.ts` - Création de session
- `app/api/stripe/webhook/route.ts` - Gestion des webhooks
- `app/pricing/page.tsx` - Page de tarifs avec intégration Stripe

## 📝 Notes importantes

- Les prix Stripe sont en **centimes** (2900 = 29€)
- Toujours tester en mode test avant la production
- Les webhooks doivent être configurés pour **test et production séparément**
- Stripe gère automatiquement les renouvellements d'abonnement
- En cas d'échec de paiement, Stripe envoie un email automatique
