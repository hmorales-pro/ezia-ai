# Configuration Google Analytics et Brevo

## Google Analytics

### 1. Créer un compte Google Analytics

1. Allez sur [analytics.google.com](https://analytics.google.com)
2. Créez une nouvelle propriété pour "ezia.ai"
3. Choisissez "Web" comme plateforme
4. Configurez le flux de données avec l'URL : https://ezia.ai
5. Copiez l'ID de mesure (format : G-XXXXXXXXXX)

### 2. Configurer dans l'application

Ajoutez dans votre fichier `.env.local` :
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Événements trackés automatiquement

- **Vues de pages** : Toutes les navigations
- **Inscriptions waitlist** : `waitlist_signup` avec source et profil
- **Clics sur boutons** : `button_click` avec nom et emplacement
- **Profils utilisateurs** : `waitlist_profile` avec type d'utilisateur

### 4. Utiliser le tracking personnalisé

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

const { trackEvent, trackButtonClick } = useAnalytics();

// Tracker un événement personnalisé
trackEvent('video_play', 'engagement', 'homepage_hero');

// Tracker un clic de bouton
trackButtonClick('start_free', 'navbar');
```

## Brevo (Email)

### 1. Créer un compte Brevo

1. Allez sur [brevo.com](https://www.brevo.com)
2. Créez un compte gratuit (300 emails/jour)
3. Confirmez votre email et complétez votre profil

### 2. Obtenir la clé API

1. Allez dans Settings > SMTP & API
2. Créez une nouvelle clé API
3. Copiez la clé (elle ne sera plus visible après)

### 3. Créer une liste de contacts

1. Allez dans Contacts > Lists
2. Créez une liste "Waitlist Ezia"
3. Notez l'ID de la liste (visible dans l'URL)

### 4. Créer les templates d'email

#### Template 1 : Waitlist Startup
1. Allez dans Campaigns > Email Templates
2. Créez un nouveau template transactionnel
3. Nom : "Waitlist Confirmation - Startup"
4. Variables disponibles :
   - `{{ params.name }}` : Nom du contact
   - `{{ params.position }}` : Position dans la liste
   - `{{ params.waitlist_type }}` : Type de waitlist

Exemple de contenu :
```html
Bonjour {{ params.name }},

Merci de votre intérêt pour Ezia ! 🎉

Vous êtes inscrit(e) en position #{{ params.position }} sur notre liste d'attente.

En tant qu'early adopter, vous bénéficierez de :
✅ Accès prioritaire à la plateforme
✅ Support personnalisé
✅ Tarif préférentiel à vie

Nous vous contacterons dès que votre accès sera disponible.

À très bientôt,
L'équipe Ezia
```

#### Template 2 : Waitlist Enterprise
Créez un template similaire mais adapté aux entreprises.

### 5. Configurer dans l'application

Ajoutez dans votre fichier `.env.local` :
```
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxx
BREVO_LIST_ID=2
BREVO_TEMPLATE_WAITLIST_STARTUP=1
BREVO_TEMPLATE_WAITLIST_ENTERPRISE=2
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=hugo.morales.pro+waitlist@gmail.com
```

### 6. Fonctionnalités automatiques

- **Ajout automatique à la liste** : Tous les inscrits sont ajoutés à Brevo
- **Email de confirmation** : Envoyé automatiquement après inscription
- **Notification admin** : Email envoyé à l'admin pour chaque nouvelle inscription
- **Segmentation** : Les contacts sont tagués avec leur profil et source
- **Double opt-in** : Géré automatiquement par Brevo si activé

### 7. Email de notification admin

À chaque nouvelle inscription, un email est envoyé à l'adresse configurée dans `ADMIN_NOTIFICATION_EMAIL` avec :
- Type de waitlist (Startup/Enterprise)
- Position dans la liste
- Nom et email du contact
- Entreprise (si fournie)
- Profil et urgence
- Source d'inscription

L'email est envoyé depuis l'adresse configurée dans `BREVO_SENDER_EMAIL`.

## Vérification

### Google Analytics
1. Installez l'extension Chrome "Google Analytics Debugger"
2. Ouvrez votre site en local
3. Vérifiez dans la console que les événements sont envoyés

### Brevo
1. Inscrivez-vous sur la waitlist en local
2. Vérifiez dans Brevo > Logs > Transactional que l'email est parti
3. Vérifiez dans Contacts que le contact a été ajouté

## Bonnes pratiques

1. **RGPD** : Mentionnez l'utilisation de cookies dans votre politique
2. **Performance** : GA est chargé en `afterInteractive` pour ne pas bloquer
3. **Fallback** : L'inscription fonctionne même si l'email échoue
4. **Sécurité** : Les clés API ne sont jamais exposées côté client