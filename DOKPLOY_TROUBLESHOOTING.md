# Guide de dépannage Dokploy

## Si le build reste bloqué sur "Creating an optimized production build..."

### Solution 1 : Utiliser le Dockerfile minimal

Dans Dokploy, changez le fichier docker-compose :
- De : `docker-compose.yml`
- À : `docker-compose.minimal.yml`

### Solution 2 : Augmenter les ressources

Dans les paramètres Dokploy de votre projet :
1. **Memory** : Augmentez à 2GB minimum
2. **Build Timeout** : Mettez 900 secondes (15 minutes)
3. **CPU** : 1 vCPU minimum

### Solution 3 : Variables d'environnement de build

Ajoutez ces variables dans Dokploy :
```
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=1
```

### Solution 4 : Build manuel sur le serveur

Si rien ne fonctionne, connectez-vous en SSH et :

```bash
# 1. Cloner le repo
cd /tmp
git clone https://github.com/hmorales-pro/ezia-ai.git
cd ezia-ai

# 2. Build manuel avec timeout
docker build -f Dockerfile.minimal -t ezia-manual . --no-cache

# 3. Vérifier si l'image existe
docker images | grep ezia-manual

# 4. Si OK, taguer pour Dokploy
docker tag ezia-manual ezia-ezia-18zenw-ezia:latest
```

## Symptômes et solutions

### Symptôme : Build timeout après X minutes
**Solution** : Utiliser `docker-compose.minimal.yml`

### Symptôme : "JavaScript heap out of memory"
**Solution** : Ajouter `NODE_OPTIONS=--max-old-space-size=512` dans les variables

### Symptôme : Build réussit mais container crash
**Solution** : Vérifier que toutes les variables d'environnement sont définies

## Configuration recommandée pour VPS

Si votre VPS a peu de mémoire (< 2GB) :
1. Utilisez `docker-compose.minimal.yml`
2. Activez le swap sur le serveur :
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Vérification du déploiement

```bash
# Voir les logs
docker logs ezia-ezia-18zenw-ezia-1

# Vérifier la mémoire
docker stats ezia-ezia-18zenw-ezia-1

# Tester l'API
curl http://localhost:3001/api/health
```