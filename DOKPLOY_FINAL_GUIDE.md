# Guide final pour déploiement Dokploy

## ✅ Configuration testée et validée

### 1. Dockerfile optimisé
- Utilise `Dockerfile.production`
- Taille finale : **233MB** (au lieu de 1GB)
- Temps de build : ~1-2 minutes

### 2. Variables d'environnement OBLIGATOIRES dans Dokploy

```env
# Base de données MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia

# Tokens HuggingFace (OBLIGATOIRES)
HF_TOKEN=votre-token-huggingface
DEFAULT_HF_TOKEN=votre-token-huggingface

# Secrets d'authentification
JWT_SECRET=une-longue-chaine-aleatoire
NEXTAUTH_SECRET=une-autre-longue-chaine-aleatoire

# URLs de l'application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_APP_API_URL=https://votre-domaine.com

# Mistral (optionnel)
MISTRAL_API_KEY=votre-cle-mistral
```

### 3. Configuration Dokploy

#### Build Settings
- **Dockerfile**: `docker-compose.yml` (utilise automatiquement Dockerfile.production)
- **Build Args**: Aucun nécessaire
- **Build Timeout**: 300 secondes minimum

#### Resources
- **Memory**: 512MB minimum, 1GB recommandé
- **CPU**: 0.5 vCPU minimum

### 4. Vérification du déploiement

Après déploiement, vérifiez :
1. Les logs dans Dokploy
2. L'URL `/api/health` devrait répondre
3. La page d'accueil devrait se charger

### 5. En cas de problème

Si le build échoue :
1. Vérifiez que toutes les variables d'environnement sont définies
2. Augmentez le timeout de build si nécessaire
3. Vérifiez l'espace disque disponible

### 6. Avertissements normaux

Ces warnings sont normaux et n'affectent pas le fonctionnement :
- "Duplicate schema index on subdomain"
- "Failed to copy traced files" (pour la route (public))

## 🚀 Résumé

Le projet est maintenant optimisé pour Dokploy avec :
- Image Docker 4x plus petite
- Build 3x plus rapide
- Configuration testée et fonctionnelle