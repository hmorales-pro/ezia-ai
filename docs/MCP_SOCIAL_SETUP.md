# Configuration MCP Social Media pour Ezia vBeta

## État actuel

Le serveur MCP pour les réseaux sociaux est maintenant fonctionnel et prêt à être utilisé. Voici ce qui a été fait :

1. ✅ Installation du SDK MCP (`@modelcontextprotocol/sdk`) 
2. ✅ Construction du serveur MCP dans `/mcp-servers/social-media/`
3. ✅ Correction des erreurs TypeScript
4. ✅ Test du serveur - il démarre correctement et expose les outils

## Prochaines étapes pour activer les fonctionnalités

### 1. Configuration des clés API

Créez ou mettez à jour votre fichier `.env` à la racine du projet avec les clés suivantes :

```env
# Twitter (X) API Keys
TWITTER_CONSUMER_KEY=votre_consumer_key
TWITTER_CONSUMER_SECRET=votre_consumer_secret

# LinkedIn API Keys  
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Facebook/Instagram API Keys
FACEBOOK_APP_ID=votre_app_id
FACEBOOK_APP_SECRET=votre_app_secret
```

### 2. Obtenir les clés API

#### Twitter (X)
1. Allez sur https://developer.twitter.com/en/portal/dashboard
2. Créez une nouvelle app
3. Activez OAuth 1.0a
4. Copiez les Consumer Keys

#### LinkedIn
1. Allez sur https://www.linkedin.com/developers/
2. Créez une nouvelle app
3. Ajoutez les produits "Sign In with LinkedIn" et "Share on LinkedIn"
4. Configurez l'URL de redirection
5. Copiez Client ID et Secret

#### Facebook/Instagram
1. Allez sur https://developers.facebook.com/
2. Créez une nouvelle app
3. Ajoutez les produits Facebook Login et Instagram Basic Display
4. Configurez les URLs de redirection
5. Copiez App ID et Secret

### 3. Routes OAuth à implémenter

Les routes suivantes doivent être créées pour gérer les callbacks OAuth :

- `/api/auth/twitter/callback`
- `/api/auth/linkedin/callback`
- `/api/auth/facebook/callback`
- `/api/auth/instagram/callback`

### 4. Utilisation dans l'application

Une fois configuré, les fonctionnalités suivantes seront disponibles :

- **Publication multi-plateforme** : Publier du contenu sur plusieurs réseaux simultanément
- **Formatage automatique** : Le contenu est adapté aux limites de chaque plateforme
- **Analytics** : Récupération des statistiques de performance
- **Gestion des connexions** : Interface pour connecter/déconnecter les comptes

### 5. Test local

Pour tester localement :

```bash
# 1. Assurez-vous que les variables d'environnement sont définies
# 2. Démarrez le serveur de développement
npm run dev

# 3. Le serveur MCP sera automatiquement lancé lors de l'utilisation
```

### Architecture MCP

Le système utilise Model Context Protocol pour :
- Isolation des credentials sensibles
- Communication sécurisée entre Next.js et les APIs sociales  
- Gestion centralisée des tokens avec chiffrement AES-256-GCM
- Support de multiples comptes business

### Sécurité

- Les tokens sont chiffrés avant stockage en base
- Les clés de chiffrement sont générées par business
- Les communications MCP utilisent stdio (processus local)
- Aucun token n'est exposé côté client