# Guide de Test Complet - Ezia AI

## 🧪 Tests en Local

### 1. Test Automatique Rapide

```bash
# Lance tous les tests automatiquement
./scripts/test-local.sh
```

Ce script vérifie :
- ✅ Installation Node.js
- ✅ Dépendances NPM
- ✅ Configuration .env.local
- ✅ Build Next.js
- ✅ Connexion MongoDB
- ✅ APIs externes (HuggingFace, Mistral)
- ✅ Démarrage du serveur

### 2. Test Manuel Complet

#### Étape 1 : Démarrer l'application
```bash
npm run dev
```

#### Étape 2 : Tests Fonctionnels

##### A. Page d'accueil (http://localhost:3000)
- [ ] La page se charge correctement
- [ ] Le logo et les images s'affichent
- [ ] Les boutons "Commencer" fonctionnent
- [ ] La navigation est fluide

##### B. Authentification
1. **Créer un compte** :
   - [ ] Aller sur `/auth/register`
   - [ ] Remplir le formulaire
   - [ ] Compte créé avec succès
   
2. **Connexion** :
   - [ ] Aller sur `/auth/login`
   - [ ] Se connecter avec email/password
   - [ ] Redirection vers dashboard

##### C. Fonctionnalités Business
1. **Créer un business** :
   - [ ] Cliquer sur "Créer un business"
   - [ ] Remplir le formulaire (nom, description, industrie)
   - [ ] Business créé avec succès

2. **Chat avec Ezia** :
   - [ ] Ouvrir le chat dans un business
   - [ ] Envoyer "Bonjour Ezia"
   - [ ] Recevoir une réponse
   - [ ] Tester "Analyse mon business"

3. **Génération de site web** :
   - [ ] Demander à Ezia de créer un site
   - [ ] Vérifier la génération
   - [ ] Preview du site généré

##### D. Fonctionnalités RGPD (Nouveau !)
1. **Export de données** :
   - [ ] Aller dans Paramètres → RGPD
   - [ ] Cliquer "Télécharger mes données"
   - [ ] Fichier JSON téléchargé
   - [ ] Vérifier le contenu du fichier

2. **Gestion du compte** :
   - [ ] Vérifier la procédure de suppression
   - [ ] Email de contact affiché

##### E. MongoDB vs Mode Mémoire
1. **Avec MongoDB** :
   - [ ] Créer un business
   - [ ] Redémarrer l'app (`Ctrl+C` puis `npm run dev`)
   - [ ] Le business est toujours là

2. **Sans MongoDB** (pour tester le fallback) :
   - [ ] Modifier MONGODB_URI dans .env.local (mettre une valeur invalide)
   - [ ] Redémarrer l'app
   - [ ] Créer un business
   - [ ] Voir le message "Mode mémoire"
   - [ ] Redémarrer → données perdues

### 3. Test de Performance

```bash
# Build de production
npm run build

# Lancer en mode production
npm start

# Ouvrir http://localhost:3000
```

Vérifier :
- [ ] Temps de chargement < 3s
- [ ] Navigation fluide
- [ ] Pas d'erreurs console

## 🐳 Tests Docker

### 1. Build Docker Local

```bash
# Build l'image
docker build -t ezia-test .

# Lancer avec les variables d'environnement
docker run -p 3000:3000 --env-file .env.local ezia-test
```

### 2. Test Docker Compose (Dokploy)

```bash
# Lancer avec docker-compose
docker-compose up

# Vérifier sur http://localhost:3001
```

## 🤗 Test HuggingFace Spaces (Simulation)

### 1. Préparation

```bash
# Vérifier les fichiers HF Spaces
ls -la README-HUGGINGFACE.md Dockerfile.huggingface next.config.huggingface.ts
```

### 2. Test de Build HF

```bash
# Copier la config HF
cp next.config.huggingface.ts next.config.ts

# Build avec la config HF
npm run build

# Si succès → prêt pour HF Spaces
```

### 3. Simulation Complète

```bash
# Créer un dossier temporaire
mkdir -p /tmp/ezia-hf-test
cp -r . /tmp/ezia-hf-test
cd /tmp/ezia-hf-test

# Appliquer les configs HF
cp Dockerfile.huggingface Dockerfile
cp next.config.huggingface.ts next.config.ts
cp README-HUGGINGFACE.md README.md

# Build Docker
docker build -t ezia-hf-test .

# Lancer (simule HF Spaces)
docker run -p 3000:3000 \
  -e MONGODB_URI="$MONGODB_URI" \
  -e HF_TOKEN="$HF_TOKEN" \
  -e MISTRAL_API_KEY="$MISTRAL_API_KEY" \
  -e JWT_SECRET="test-secret" \
  -e NEXTAUTH_SECRET="test-secret" \
  ezia-hf-test
```

## 📋 Checklist de Déploiement

### Avant de déployer sur HuggingFace Spaces :

- [ ] Tests locaux passent tous
- [ ] MongoDB Atlas configuré et accessible
- [ ] Clés API valides (HF, Mistral)
- [ ] Build Docker réussi
- [ ] Pas d'erreurs TypeScript critiques
- [ ] Images et assets accessibles
- [ ] RGPD fonctionnel

### Déploiement :

```bash
# Si tous les tests passent
./scripts/deploy-huggingface.sh [username] [space-name]
```

## 🐛 Troubleshooting

### Problèmes Courants

1. **"MongoDB connection failed"**
   - Vérifier MONGODB_URI
   - Vérifier IP whitelist (0.0.0.0/0)
   - L'app utilisera la mémoire automatiquement

2. **"Build failed"**
   ```bash
   # Voir les erreurs détaillées
   npm run build 2>&1 | tee build-errors.log
   ```

3. **"Cannot find module"**
   ```bash
   # Réinstaller les dépendances
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Images non affichées**
   - Vérifier que les images sont dans `/public`
   - En Docker, vérifier les logs

5. **RGPD Export ne fonctionne pas**
   - Vérifier l'authentification
   - Vérifier la console pour les erreurs

### Logs Utiles

```bash
# Logs de développement
npm run dev

# Logs Docker
docker logs <container-id>

# Logs MongoDB
# Vérifier dans MongoDB Atlas → Clusters → Logs
```

## ✅ Validation Finale

Si tous ces tests passent :
- 🎉 L'application est prête pour la production
- 🚀 Déployable sur HuggingFace Spaces
- 💾 MongoDB persistence fonctionnelle
- 🔒 RGPD compliant
- 🤖 IA fonctionnelle

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Consulter la documentation dans `/docs`
3. Contacter support@ezia.ai