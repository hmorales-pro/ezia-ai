# Guide de Déploiement HuggingFace Spaces

## Vue d'ensemble

Ce guide détaille le processus de déploiement d'Ezia AI sur HuggingFace Spaces en utilisant le SDK Docker.

## Prérequis

1. **Compte HuggingFace** avec un token d'accès ayant les permissions `write`
2. **MongoDB** hébergé (MongoDB Atlas recommandé)
3. **Clé API Mistral** pour les fonctionnalités IA d'Ezia
4. **Git** installé localement

## Architecture de Déploiement

```
┌─────────────────────────────┐
│    HuggingFace Spaces       │
│                             │
│  ┌────────────────────┐     │
│  │   Docker Container │     │     ┌──────────────┐
│  │                    │     │     │ MongoDB      │
│  │  • Next.js App     │◄────┼─────┤ Atlas        │
│  │  • API Routes      │     │     │ (Cloud)      │
│  │  • React Frontend  │     │     └──────────────┘
│  │                    │     │
│  └────────────────────┘     │     ┌──────────────┐
│                             │     │ Mistral AI   │
│  Constraints:               │◄────┤ API          │
│  • 7GB RAM                  │     └──────────────┘
│  • No persistent storage    │
│  • Public by default        │
└─────────────────────────────┘
```

## Étapes de Déploiement

### 1. Préparation de MongoDB

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster M0 (gratuit)
3. Dans **Network Access**, ajoutez `0.0.0.0/0` pour permettre l'accès depuis HuggingFace
4. Créez un utilisateur avec les permissions read/write
5. Récupérez l'URI de connexion

### 2. Création du Space HuggingFace

1. Connectez-vous à [HuggingFace](https://huggingface.co)
2. Cliquez sur **New Space**
3. Configuration :
   - Space name: `ezia`
   - SDK: `Docker`
   - Hardware: `CPU Basic` (gratuit)
   - Visibility: `Public` ou `Private`

### 3. Déploiement avec le Script

```bash
# Depuis la racine du projet
./scripts/deploy-huggingface.sh [votre-username] [nom-du-space]

# Exemple
./scripts/deploy-huggingface.sh hmorales ezia
```

### 4. Configuration des Secrets

Après le déploiement, allez dans **Settings** → **Repository secrets** et ajoutez :

#### Secrets Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/ezia?retryWrites=true&w=majority` |
| `HF_TOKEN` | Token HuggingFace avec permissions read | `hf_xxxxxxxxxxxxxxxxxxxxx` |
| `DEFAULT_HF_TOKEN` | Token de fallback pour utilisateurs anonymes | `hf_xxxxxxxxxxxxxxxxxxxxx` |
| `MISTRAL_API_KEY` | Clé API Mistral | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `JWT_SECRET` | Secret pour JWT (générez une chaîne aléatoire) | `your-super-secret-jwt-key-change-this` |
| `NEXTAUTH_SECRET` | Secret pour NextAuth (générez une chaîne aléatoire) | `your-super-secret-nextauth-key-change-this` |

#### Secrets Optionnels

| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Pour l'envoi d'emails |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |
| `DISABLE_ECOSYSTEM_FEATURE` | Désactive certaines fonctionnalités |

### 5. Vérification

1. Le Space devrait automatiquement rebuilder après l'ajout des secrets
2. Vérifiez les logs dans l'onglet **Logs** du Space
3. Une fois le build réussi, accédez à votre application

## Limitations sur HuggingFace Spaces

### Ressources
- **RAM**: 7GB maximum
- **CPU**: Partagé
- **Stockage**: Non persistant (reset à chaque rebuild)
- **Timeout**: 30 minutes d'inactivité

### Implications
1. **Base de données**: Doit être hébergée en externe (MongoDB Atlas)
2. **Fichiers uploadés**: Seront perdus au prochain rebuild
3. **Sessions**: Utilisent des cookies HTTP-only
4. **Performance**: Peut être plus lente qu'un VPS dédié

## Troubleshooting

### Build Failed
```
Error: Cannot find module 'X'
```
**Solution**: Vérifiez que toutes les dépendances sont dans package.json

### MongoDB Connection Error
```
MongoNetworkError: connection timed out
```
**Solution**: 
1. Vérifiez l'IP whitelist dans MongoDB Atlas
2. Vérifiez l'URI de connexion
3. Assurez-vous que le cluster est actif

### Memory Error
```
JavaScript heap out of memory
```
**Solution**: Le build nécessite trop de RAM. Optimisez le build ou utilisez un hardware plus puissant.

### Port Error
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Le port est défini dans le Dockerfile et le README. Assurez-vous qu'ils correspondent.

## Migration depuis un VPS

Si vous migrez depuis un VPS :

1. **Exportez vos données** MongoDB si nécessaire
2. **Mettez à jour** les URLs dans votre configuration
3. **Testez** toutes les fonctionnalités après migration
4. **Surveillez** les performances et ajustez si nécessaire

## Alternatives

Si HuggingFace Spaces ne convient pas :

1. **VPS avec Dokploy** : Plus de contrôle, meilleures performances
2. **Vercel** : Excellent pour Next.js, limitations sur les API routes
3. **Railway/Render** : Solutions PaaS avec support Docker

## Support

- Documentation : `/docs`
- Issues : GitHub Issues
- Email : support@ezia.ai