# Guide de dépannage Dokploy

## Si le build reste bloqué sur "Creating an optimized production build..."

### Solution 1 : Utiliser le Dockerfile ultra-minimal (RECOMMANDÉ)

**Cette solution contourne complètement les optimisations Next.js qui causent les timeouts.**

Dans Dokploy, changez le fichier docker-compose :
- De : `docker-compose.yml`
- À : `docker-compose.ultra-minimal.yml`

Ou utilisez directement le fichier `.dokploy.yml` qui est déjà configuré.

### Solution 2 : Utiliser le Dockerfile minimal (alternative)

Si la solution 1 ne fonctionne pas :
- Utilisez : `docker-compose.minimal.yml`

### Solution 3 : Augmenter les ressources

Dans les paramètres Dokploy de votre projet :
1. **Memory** : Augmentez à 2GB minimum
2. **Build Timeout** : Mettez 900 secondes (15 minutes)
3. **CPU** : 1 vCPU minimum

### Solution 4 : Variables d'environnement de build

Ajoutez ces variables dans Dokploy :
```
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=1
```

### Solution 5 : Build manuel sur le serveur

Si rien ne fonctionne, connectez-vous en SSH et :

```bash
# 1. Cloner le repo
cd /tmp
git clone https://github.com/hmorales-pro/ezia-ai.git
cd ezia-ai

# 2. Build manuel avec timeout
docker build -f Dockerfile.ultra-minimal -t ezia-manual . --no-cache

# 3. Vérifier si l'image existe
docker images | grep ezia-manual

# 4. Si OK, taguer pour Dokploy
docker tag ezia-manual ezia-ezia-18zenw-ezia:latest
```

## Symptômes et solutions

### Symptôme : Build timeout après X minutes
**Solution** : Utiliser `docker-compose.ultra-minimal.yml` qui évite complètement les optimisations Next.js

### Symptôme : "JavaScript heap out of memory"
**Solution** : Ajouter `NODE_OPTIONS=--max-old-space-size=512` dans les variables

### Symptôme : Build réussit mais container crash
**Solution** : Vérifier que toutes les variables d'environnement sont définies

## Configuration recommandée pour VPS

Si votre VPS a peu de mémoire (< 2GB) :
1. Utilisez `docker-compose.ultra-minimal.yml` (recommandé)
2. Ou utilisez le fichier `.dokploy.yml` fourni
2. Activez le swap sur le serveur :
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Test en local avant déploiement

```bash
# Tester le build ultra-minimal
./scripts/test-docker-build.sh
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