# Documentation - Configuration Waitlist et Analytics

## Vue d'ensemble

Cette documentation récapitule toutes les fonctionnalités mises en place pour les listes d'attente, l'envoi d'emails et le tracking analytics.

## 1. Listes d'attente différenciées

### 1.1 Waitlist Startup (`/waitlist`)
- **Formulaire en 2 étapes** :
  1. Informations personnelles (nom, email, rôle, projet)
  2. Niveau technologique et consentement marketing
- **Questions spécifiques** :
  - Rôle : Fondateur, Freelance, Étudiant, Salarié, Autre
  - Niveau tech : Débutant, Intermédiaire, Avancé
- **Stockage** : MongoDB collection `waitlists` avec `listType: 'startup'`

### 1.2 Waitlist Enterprise (`/waitlist-enterprise`)
- **Formulaire en 5 étapes** :
  1. Informations personnelles et entreprise
  2. Besoins business prioritaires (croissance, efficacité, innovation, etc.)
  3. Outils actuels organisés par catégories (Paiements, E-commerce, Marketing, etc.)
  4. Niveau technologique de l'équipe
  5. Consentement marketing
- **Questions spécifiques** :
  - Taille d'équipe : 1-10, 11-50, 51-200, 200+
  - Secteur d'activité
  - Urgence du projet
  - Priorités business multiples
- **Affichage optimisé** : Outils sur 3 colonnes pour réduire la hauteur
- **Stockage** : MongoDB collection `waitlists` avec `listType: 'enterprise'`

## 2. Système d'emails Brevo

### 2.1 Configuration
```env
BREVO_API_KEY=xkeysib-...
BREVO_LIST_ID_STARTUP=3
BREVO_LIST_ID_ENTERPRISE=4
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=hugo.morales.pro+waitlist@gmail.com
```

### 2.2 Fonctionnalités
- **Email de confirmation** : Envoyé à l'utilisateur après inscription
- **Email admin** : Notification à `hugo.morales.pro+waitlist@gmail.com` pour chaque nouvel inscrit
- **Templates HTML** : Intégrés directement dans le code (pas de templates Brevo)
- **Contenu différencié** : Messages adaptés startup vs enterprise

### 2.3 Structure des emails
- Header avec nom "Ezia"
- Message de bienvenue personnalisé
- Position dans la liste d'attente
- Call-to-action adapté (violet #6D3FC8)
- Footer avec liens légaux

## 3. Google Analytics 4

### 3.1 Configuration
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T9XL833P0F
```

### 3.2 Implémentation
- **Double intégration** :
  1. Scripts directs dans `<head>` pour détection immédiate
  2. Composant `GoogleAnalytics` pour intégration Next.js
- **Consent mode** : Compatible RGPD avec bannière de consentement
- **Page de test** : `/test-ga` pour vérifier l'installation

### 3.3 Tracking
- Page views automatiques
- Events personnalisés possibles
- Respect du consentement utilisateur

## 4. Bannière de consentement RGPD

### 4.1 Options disponibles
1. **Tout accepter** : Active tous les cookies
2. **Essentiels uniquement** : Désactive GA
3. **Personnaliser** : Choix détaillé (à implémenter)

### 4.2 Stockage
- Préférences dans `localStorage`
- Clé : `cookie-consent`
- Valeurs : `all`, `essential`, `custom`

## 5. Améliorations UI/UX

### 5.1 Formulaires
- **Validation par étape** : Impossible de passer à l'étape suivante sans remplir les champs requis
- **Hover states** : Amélioration visuelle sur les selects
- **Responsive** : Adaptation mobile optimisée

### 5.2 Landing pages
- **Chat mobile** (`/home`) : Topics en ligne horizontale au lieu de colonnes
- **Organisation des outils** : Catégories identiques entre landing et waitlist
- **Naming cohérent** : "Ezia Analytics" au lieu de "Ezia Enterprise"

## 6. Structure technique

### 6.1 Fichiers principaux
```
/app/waitlist/waitlist-client-v2.tsx          # Formulaire startup
/app/waitlist-enterprise/waitlist-enterprise-client.tsx  # Formulaire enterprise
/app/api/waitlist/route.ts                   # API endpoint
/lib/brevo.ts                                # Service email
/models/Waitlist.ts                          # Schema MongoDB
/components/google-analytics.tsx             # Composant GA
/components/cookie-consent.tsx               # Bannière RGPD
```

### 6.2 Base de données MongoDB
- **Collection** : `waitlists`
- **Champs principaux** :
  - `email`, `name`, `company`
  - `listType`: 'startup' ou 'enterprise'
  - `profile`, `projectDescription`
  - `teamSize`, `industry`, `urgency`
  - `priorities`, `currentTools`
  - `techLevel`, `marketingConsent`
  - `position` (auto-incrémenté)

### 6.3 Validation
- Emails uniques par liste
- Enum stricts pour les champs de sélection
- Position auto-calculée à l'inscription

## 7. Commandes utiles

### Test local des emails
```bash
# Depuis Postman ou curl
POST http://localhost:3000/api/waitlist
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "listType": "startup",
  "profile": "founder",
  "projectDescription": "Test project",
  "techLevel": "intermediate",
  "marketingConsent": true
}
```

### Vérification Google Analytics
1. Visiter `/test-ga`
2. Ouvrir la console du navigateur
3. Vérifier `window.gtag` et `window.dataLayer`

## 8. Points d'attention

### Sécurité
- Tokens API dans `.env.local` (ne jamais commiter)
- Validation stricte des données
- Protection contre les inscriptions multiples

### Performance
- Scripts GA en `afterInteractive`
- CDN Tailwind pour éviter les problèmes de parsing
- Lazy loading des composants non critiques

### Maintenance
- Logs des erreurs d'envoi email
- Monitoring des inscriptions via emails admin
- Analytics pour suivre les conversions

## 9. Prochaines étapes suggérées

1. **Templates Brevo** : Créer de vrais templates dans Brevo pour plus de flexibilité
2. **Dashboard admin** : Interface pour voir les inscrits sans passer par MongoDB
3. **Export des données** : Fonctionnalité d'export CSV des listes
4. **A/B testing** : Tester différentes versions des formulaires
5. **Intégration CRM** : Connecter avec un CRM pour le suivi commercial

Cette documentation couvre l'ensemble des fonctionnalités mises en place. Toutes les configurations sont opérationnelles et prêtes pour la production.