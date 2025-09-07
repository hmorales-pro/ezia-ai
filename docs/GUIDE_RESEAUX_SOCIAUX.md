# Guide d'utilisation des Réseaux Sociaux dans Ezia vBeta

## Comment activer les réseaux sociaux

### 1. Accéder à la section Réseaux Sociaux

1. Connectez-vous à votre compte Ezia
2. Allez dans la section **Business** 
3. Sélectionnez le business pour lequel vous voulez connecter des réseaux sociaux
4. Cliquez sur l'onglet **Réseaux sociaux**

### 2. Connecter vos comptes

Pour chaque réseau social que vous souhaitez connecter :

1. Cliquez sur le bouton **Connecter** à côté du réseau souhaité
2. Vous serez redirigé vers la page d'autorisation du réseau social
3. Connectez-vous avec vos identifiants du réseau social
4. Autorisez Ezia à publier en votre nom
5. Vous serez automatiquement redirigé vers Ezia

**Réseaux supportés :**
- Twitter (X)
- LinkedIn
- Facebook
- Instagram

### 3. Publier du contenu

Une fois vos comptes connectés :

1. Dans la section **Publier du contenu**
2. Rédigez votre message dans le champ de texte
3. Sélectionnez les plateformes sur lesquelles publier
4. Cliquez sur **Publier**

**Fonctionnalités de publication :**
- Publication simultanée sur plusieurs réseaux
- Formatage automatique selon les limites de chaque plateforme
- Prévisualisation avant publication
- Compteur de caractères en temps réel

### 4. Gérer vos connexions

Pour chaque compte connecté, vous pouvez :
- Voir le nom d'utilisateur connecté
- Déconnecter le compte à tout moment
- Voir la date de dernière publication
- Consulter les statistiques (à venir)

### 5. Sécurité et confidentialité

**Vos données sont protégées :**
- Connexion sécurisée via OAuth 2.0
- Aucun mot de passe n'est stocké par Ezia
- Tokens d'accès chiffrés avec AES-256-GCM
- Vous pouvez révoquer l'accès à tout moment

**Permissions demandées :**
- Publication de contenu
- Lecture des informations de profil
- Accès aux statistiques de base

## Configuration pour les développeurs

Si vous êtes développeur et souhaitez activer les fonctionnalités complètes :

### 1. Variables d'environnement nécessaires

Ajoutez ces variables dans votre fichier `.env` :

```env
# Twitter API
TWITTER_CONSUMER_KEY=votre_cle
TWITTER_CONSUMER_SECRET=votre_secret

# LinkedIn API  
LINKEDIN_CLIENT_ID=votre_id
LINKEDIN_CLIENT_SECRET=votre_secret

# Facebook API
FACEBOOK_APP_ID=votre_id
FACEBOOK_APP_SECRET=votre_secret
```

### 2. Obtenir les clés API

- **Twitter** : https://developer.twitter.com
- **LinkedIn** : https://www.linkedin.com/developers
- **Facebook** : https://developers.facebook.com

### 3. Démarrer le serveur MCP

```bash
# Installer les dépendances
cd mcp-servers/social-media
npm install

# Construire le serveur
npm run build

# Le serveur MCP démarre automatiquement avec l'app
```

## Mode Démo

Si les clés API ne sont pas configurées, l'application fonctionne en mode démo :
- Les connexions sont simulées
- Les publications ne sont pas réellement envoyées
- Parfait pour tester l'interface

## Support

Pour toute question ou problème :
- Consultez la documentation technique dans `/docs/MCP_SOCIAL_SETUP.md`
- Contactez le support via le chat Ezia