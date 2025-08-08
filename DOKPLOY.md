# Déploiement avec Dokploy

## Configuration dans Dokploy

### 1. Type d'application
- **Type**: Application (pas Compose)
- **Source**: Git
- **Repository**: `https://github.com/hmorales-pro/ezia-ai`
- **Branch**: `main`

### 2. Build Settings
- **Build Type**: Dockerfile
- **Dockerfile Path**: `./Dockerfile`
- **Build Context**: `.`

### 3. Variables d'environnement

Ajoutez ces variables dans l'interface Dokploy :

```env
# Base
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ezia.ai
PORT=3000

# MongoDB (utilisez MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia?retryWrites=true&w=majority

# Tokens API
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
MISTRAL_API_KEY=xxxx-xxxx-xxxx-xxxx

# Sécurité
JWT_SECRET=bbGRO5M/texnQLRoW/5qgKR/yALrbeRDfTq9zCX+Bb4=
NEXTAUTH_SECRET=/Q5egzPRG0aVAkHxTeKZYPmJVlA0qBXOda3dp7hmUDQ=

# Services HF
DEEPSITE_HF_URL=https://huggingface.co/spaces
DEEPSITE_SPACE_ID=hmorales/deepsite-v2
NEXT_APP_API_URL=https://ezia.ai
```

### 4. Networking
- **Port**: 3000
- **Domain**: ezia.ai
- **SSL**: Activé (Let's Encrypt)

## Alternative : Docker Compose

Si vous préférez utiliser Docker Compose dans Dokploy :

1. **Compose File**: `docker-compose.simple.yml`
2. **Type**: Docker Compose
3. **Build**: Activé

## Commandes manuelles si nécessaire

```bash
# Build
docker build -t ezia-ai .

# Run
docker run -d \
  --name ezia \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ezia-ai
```

## Dépannage

### Erreur "top-level object must be a mapping"
- Utilisez le mode Application au lieu de Compose
- Ou utilisez `docker-compose.simple.yml`

### MongoDB
- Utilisez MongoDB Atlas pour éviter la complexité
- URL format: `mongodb+srv://...`

### Logs
```bash
docker logs ezia
```