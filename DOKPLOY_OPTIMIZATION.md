# Guide d'optimisation Dokploy pour Ezia

## Problèmes de timeout résolus

### 1. Dockerfile optimisé
- **Multi-stage build** : Réduit la taille de l'image finale
- **Cache Docker** : Utilise `--mount=type=cache` pour accélérer les builds
- **Standalone output** : Next.js génère un bundle minimal
- **.dockerignore** : Évite de copier les fichiers inutiles

### 2. Configuration Next.js
- `output: 'standalone'` : Génère une version minimaliste
- Désactivation de la télémétrie pour accélérer le build
- Optimisations d'images configurées

### 3. Variables d'environnement recommandées pour Dokploy

```env
# Essentielles
MONGODB_URI=mongodb://mongo:27017/ezia
HF_TOKEN=votre-token-huggingface
DEFAULT_HF_TOKEN=votre-default-token

# Optionnelles mais recommandées
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

### 4. Configuration Dokploy recommandée

#### Build Settings
- **Build Command** : Laissez vide (utilise le Dockerfile)
- **Build Args** : Aucun nécessaire

#### Resources
- **Memory** : Minimum 1GB, recommandé 2GB
- **CPU** : 1 vCPU minimum

#### Health Check
- **Path** : `/api/health`
- **Interval** : 30 secondes
- **Timeout** : 10 secondes

### 5. Temps de build estimés
- **Premier build** : 3-5 minutes
- **Builds suivants** : 1-2 minutes (grâce au cache)
- **Taille de l'image** : ~200MB (au lieu de 1GB+)

### 6. Dépannage

Si le build timeout encore :
1. Augmentez le timeout dans Dokploy (paramètres du projet)
2. Vérifiez la mémoire disponible sur le VPS
3. Utilisez `docker system prune` pour libérer de l'espace

### 7. Commande de test local
```bash
# Pour tester le build en local
docker build -t ezia-optimized .

# Pour voir la taille
docker images ezia-optimized
```