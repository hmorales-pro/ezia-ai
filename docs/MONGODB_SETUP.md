# Configuration MongoDB pour Ezia

## Option 1: MongoDB Atlas (Recommandé pour Production)

1. **Créer un compte MongoDB Atlas**
   - Aller sur https://www.mongodb.com/cloud/atlas
   - Créer un compte gratuit

2. **Créer un Cluster**
   - Choisir "Build a Database"
   - Sélectionner "Shared" (gratuit)
   - Choisir votre région (ex: Paris)
   - Nommer votre cluster

3. **Configurer l'accès**
   - Créer un utilisateur avec un mot de passe fort
   - Ajouter votre IP à la whitelist (ou 0.0.0.0/0 pour tout autoriser)

4. **Obtenir l'URL de connexion**
   - Cliquer sur "Connect"
   - Choisir "Connect your application"
   - Copier l'URL de connexion
   - Remplacer `<password>` par votre mot de passe
   - Remplacer `myFirstDatabase` par `ezia`

5. **Configurer dans HuggingFace Spaces**
   - Aller dans Settings > Variables and secrets
   - Ajouter `MONGODB_URI` avec votre URL

## Option 2: Railway (Alternative)

1. **Créer un compte Railway**
   - Aller sur https://railway.app/
   - Se connecter avec GitHub

2. **Créer une base MongoDB**
   - Nouveau projet
   - Add service > Database > MongoDB
   - Railway génère automatiquement l'URL

3. **Récupérer l'URL**
   - Cliquer sur votre service MongoDB
   - Variables > MONGO_URL
   - Copier cette URL

4. **Configurer dans HuggingFace Spaces**
   - Aller dans Settings > Variables and secrets
   - Ajouter `MONGODB_URI` avec l'URL de Railway

## Test en Local

Pour tester sans MongoDB:
- L'application utilisera automatiquement une base de données en mémoire
- Les données seront perdues au redémarrage
- Parfait pour le développement et les tests

Pour utiliser MongoDB en local:
1. Installer MongoDB Community Edition
2. Démarrer MongoDB: `mongod`
3. L'URL sera: `mongodb://localhost:27017/ezia`

## Variables d'environnement requises

```env
# Production (HuggingFace Spaces)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia

# Local avec MongoDB
MONGODB_URI=mongodb://localhost:27017/ezia

# Local sans MongoDB (automatique si MONGODB_URI n'est pas défini)
# Utilise la base de données en mémoire
```