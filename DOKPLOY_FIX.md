# Fix pour les erreurs de déploiement Dokploy

## MISE À JOUR : Erreur npm ci

Si vous avez l'erreur `npm ci can only install packages when your package.json and package-lock.json are in sync`, utilisez une de ces solutions :

### Solution 1 : Utiliser le Dockerfile corrigé (recommandé)
Le Dockerfile principal a été mis à jour pour utiliser `npm install` au lieu de `npm ci`.

### Solution 2 : Utiliser le Dockerfile simple
Si le build échoue encore, changez dans docker-compose.yml :
```yaml
dockerfile: Dockerfile.simple-optimized
```

### Solution 3 : Régénérer le package-lock.json
En local, exécutez :
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push
```

## Problèmes identifiés et corrigés

### 1. Mauvais Dockerfile utilisé
- **Problème** : `docker-compose.yml` utilisait `Dockerfile.fast` au lieu du `Dockerfile` optimisé
- **Solution** : Mise à jour pour utiliser le bon Dockerfile

### 2. Variables d'environnement manquantes
- **Problème** : MONGODB_URI non définie pendant le build causant une erreur
- **Solution** : 
  - Ajout d'une valeur temporaire dans le Dockerfile pour le build
  - Ajout de toutes les variables dans docker-compose.yml

### 3. Configuration Dokploy requise

Dans les paramètres de votre projet Dokploy, assurez-vous d'avoir ces variables d'environnement :

```env
# OBLIGATOIRES
MONGODB_URI=mongodb://votre-mongodb-uri
HF_TOKEN=votre-huggingface-token
DEFAULT_HF_TOKEN=votre-default-token

# RECOMMANDÉES
JWT_SECRET=une-longue-chaine-aleatoire
NEXTAUTH_SECRET=une-autre-longue-chaine
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_APP_API_URL=https://votre-domaine.com
MISTRAL_API_KEY=votre-cle-mistral (optionnel)
```

### 4. Si le build timeout encore

1. **Augmentez le timeout** dans Dokploy :
   - Allez dans les paramètres du projet
   - Cherchez "Build Timeout" ou "Deploy Timeout"
   - Mettez au moins 600 secondes (10 minutes)

2. **Vérifiez la mémoire** :
   ```bash
   docker system df
   docker system prune -a
   ```

3. **Build manuel** (si nécessaire) :
   ```bash
   docker build -t ezia-manual .
   ```

### 5. Vérification du déploiement

Une fois déployé, vérifiez :
- `/api/health` devrait répondre 200 OK
- La page d'accueil devrait se charger
- Les logs : `docker logs <container-name>`