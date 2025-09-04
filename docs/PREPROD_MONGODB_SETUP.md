# Configuration MongoDB pour Preprod

## Problème actuel
Les données disparaissent à chaque redéploiement sur preprod car MongoDB n'est pas configuré. Le système utilise le fallback mémoire qui ne persiste pas les données.

## Solutions

### Option 1 : MongoDB Atlas (Recommandé)
1. Créer un compte gratuit sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créer un cluster gratuit (M0 Sandbox)
3. Configurer l'accès réseau : Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)
4. Créer un utilisateur database
5. Obtenir la connection string
6. Dans Dokploy, ajouter la variable d'environnement :
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia-preprod?retryWrites=true&w=majority
   ```

### Option 2 : MongoDB dans Docker (Local)
1. Utiliser `docker-compose.mongodb.yml` au lieu de `docker-compose.yml`
2. Dans Dokploy, configurer :
   ```
   MONGODB_URI=mongodb://mongodb:27017/ezia
   ```

## Variables d'environnement requises dans Dokploy

```bash
# MongoDB (Option 1 : Atlas)
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ezia-preprod?retryWrites=true&w=majority

# MongoDB (Option 2 : Docker local)
# MONGODB_URI=mongodb://mongodb:27017/ezia

# Tokens
HF_TOKEN=your-hf-token
DEFAULT_HF_TOKEN=your-default-hf-token
MISTRAL_API_KEY=your-mistral-key

# Security (générer des valeurs sécurisées)
JWT_SECRET=your-secure-jwt-secret
NEXTAUTH_SECRET=your-secure-nextauth-secret

# URLs
NEXT_PUBLIC_APP_URL=https://preprod.ezia.ai
NEXT_APP_API_URL=https://preprod.ezia.ai
```

## Vérification
Après configuration, vérifiez dans les logs :
- "✅ MongoDB connected successfully" = Connexion réussie
- "❌ MongoDB connection failed" = Vérifier la configuration
- "Using memory database as fallback" = MongoDB non disponible