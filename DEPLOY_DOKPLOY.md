# Guide de déploiement sur Dokploy

## Prérequis
- Serveur Dokploy configuré
- MongoDB accessible (local ou Atlas)
- Tokens API (Hugging Face, Mistral)

## Étapes de déploiement

### 1. Sur Dokploy, créer une nouvelle application

1. Allez dans votre dashboard Dokploy
2. Cliquez sur "Create Application"
3. Choisissez "Docker Compose"
4. Nommez votre application "ezia-ai"

### 2. Configuration du repository

Dans les paramètres de l'application :
- Repository URL: `https://github.com/hmorales-pro/ezia-ai.git`
- Branch: `main`
- Docker Compose Path: `docker-compose.dokploy-https.yml` (pour HTTPS)
- Ou `docker-compose.dokploy.yml` (pour HTTP simple)

### 3. Variables d'environnement

Dans l'onglet "Environment" de Dokploy, ajoutez :

```env
MONGODB_URI=mongodb://votre-mongodb:27017/ezia
HF_TOKEN=hf_votre_token_huggingface
DEFAULT_HF_TOKEN=hf_votre_token_default
MISTRAL_API_KEY=votre_cle_mistral
JWT_SECRET=generez-une-cle-secrete-32-chars-minimum
NEXTAUTH_SECRET=generez-une-autre-cle-secrete
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_APP_API_URL=https://api.votre-domaine.com
```

### 4. Configuration des domaines

Dans "Domains" :
- Ajoutez votre domaine principal (ex: ezia.ai)
- Configurez le SSL avec Let's Encrypt

### 5. Déploiement

1. Cliquez sur "Deploy"
2. Attendez que le build se termine (5-10 minutes)
3. Vérifiez les logs pour les erreurs

### 6. Configuration Nginx (si nécessaire)

Si vous utilisez Nginx comme reverse proxy, copiez `nginx.dokploy.conf` dans votre configuration Nginx.

## Résolution des problèmes courants

### Erreur "Cross origin request"
- Utilisez `docker-compose.dokploy-https.yml` 
- Assurez-vous que NEXT_PUBLIC_APP_URL est en HTTPS

### Erreur de mémoire pendant le build
- Augmentez la RAM du serveur (minimum 4GB recommandé)
- Ou utilisez une image pré-construite (voir ci-dessous)

### Erreur MongoDB
- Vérifiez que MongoDB est accessible
- Testez la connexion : `mongosh mongodb://votre-uri`

### Erreur 500 au démarrage
- Vérifiez les logs : `docker logs nom-du-container`
- Assurez-vous que toutes les variables d'env sont définies

## Option : Image pré-construite

Pour éviter les timeouts de build, vous pouvez utiliser une image pré-construite :

1. Construisez l'image localement :
```bash
docker build -f Dockerfile.dokploy -t yourdockerhub/ezia-ai:latest .
docker push yourdockerhub/ezia-ai:latest
```

2. Modifiez `docker-compose.dokploy.yml` :
```yaml
services:
  app:
    image: yourdockerhub/ezia-ai:latest
    # Commentez le bloc build
```

## Maintenance

### Mise à jour
```bash
git pull origin main
# Sur Dokploy : cliquez sur "Redeploy"
```

### Logs
```bash
docker logs -f nom-du-container --tail 100
```

### Redémarrage
```bash
docker-compose -f docker-compose.dokploy.yml restart
```

## Support

En cas de problème :
1. Vérifiez les logs Dokploy
2. Consultez les logs Docker
3. Ouvrez une issue sur GitHub