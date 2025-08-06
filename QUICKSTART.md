# Guide de Démarrage Rapide - Ezia vBeta

## Prérequis

- Node.js 20 ou supérieur
- npm ou yarn
- MongoDB (local ou cloud)
- Compte Hugging Face (pour l'authentification OAuth)

## Installation

1. **Cloner le projet** (si pas déjà fait)
```bash
git clone <repository-url>
cd ezia36
```

2. **Installer les dépendances**
```bash
npm install
```

## Configuration

1. **Créer le fichier `.env.local`** à la racine du projet
```bash
touch .env.local
```

2. **Ajouter les variables d'environnement** dans `.env.local`:
```env
# MongoDB - OBLIGATOIRE
# Pour une base locale : mongodb://localhost:27017/ezia
# Pour MongoDB Atlas : mongodb+srv://username:password@cluster.mongodb.net/ezia
MONGODB_URI=mongodb://localhost:27017/ezia

# API Configuration - OBLIGATOIRE
# URL de l'API externe (probablement une API Hugging Face)
NEXT_APP_API_URL=https://api-inference.huggingface.co

# Hugging Face OAuth - OBLIGATOIRE pour l'authentification
# Obtenir ces clés depuis : https://huggingface.co/settings/applications
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Tokens Hugging Face - Au moins un est OBLIGATOIRE
# Pour développement local (optionnel mais recommandé)
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# Pour les utilisateurs non authentifiés (OBLIGATOIRE)
# Créer un token sur : https://huggingface.co/settings/tokens
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

## Obtenir les Credentials

### 1. Créer une Application OAuth Hugging Face
1. Aller sur https://huggingface.co/settings/applications
2. Cliquer sur "New Application"
3. Remplir :
   - Application name: "Ezia vBeta Dev"
   - Homepage URL: `http://localhost:3000`
   - Redirect URI: `http://localhost:3000/api/auth/callback`
4. Copier le Client ID et Client Secret dans `.env.local`

### 2. Créer un Token Hugging Face
1. Aller sur https://huggingface.co/settings/tokens
2. Cliquer sur "New token"
3. Nom : "Ezia Default Token"
4. Permissions : "Make calls to the serverless Inference API"
5. Copier le token dans `DEFAULT_HF_TOKEN`

### 3. MongoDB
- **Option A - MongoDB Local** :
  ```bash
  # Installer MongoDB localement
  brew install mongodb-community  # macOS
  # ou suivre : https://www.mongodb.com/docs/manual/installation/
  
  # Démarrer MongoDB
  brew services start mongodb-community
  ```

- **Option B - MongoDB Atlas (Cloud)** :
  1. Créer un compte sur https://www.mongodb.com/atlas
  2. Créer un cluster gratuit
  3. Ajouter votre IP dans Network Access
  4. Créer un utilisateur database
  5. Copier la connection string dans `MONGODB_URI`

## Lancer le Projet

1. **Mode développement**
```bash
npm run dev
```

Le projet sera accessible sur : http://localhost:3000

2. **Vérifier que tout fonctionne**
- Aller sur http://localhost:3000
- Vous devriez être redirigé vers `/projects/new`
- Tester la création d'un projet avec l'IA

## Problèmes Courants

### Erreur MongoDB
- Vérifier que MongoDB est bien démarré
- Vérifier l'URL de connexion dans `.env.local`

### Erreur d'authentification
- Vérifier les OAuth credentials
- S'assurer que les URLs de callback correspondent

### Erreur API AI
- Vérifier que `DEFAULT_HF_TOKEN` est valide
- Tester le token sur https://huggingface.co/docs/api-inference

## Architecture des Fichiers Clés

```
ezia36/
├── app/                    # Pages et API Next.js
│   ├── api/               # Endpoints API
│   │   ├── ask-ai/       # Génération IA
│   │   └── auth/         # Authentification
│   └── projects/          # Pages des projets
├── components/            # Composants React
│   └── editor/           # Éditeur principal
├── lib/                   # Utilitaires
│   ├── api.ts            # Client API
│   └── mongodb.ts        # Connection DB
└── .env.local            # Variables d'environnement
```

## Commandes Utiles

```bash
npm run dev      # Développement avec hot-reload
npm run build    # Build de production
npm run start    # Lancer la production
npm run lint     # Vérifier le code
```