# Ezia vBeta - Guide de Déploiement

## 🚀 Options de Déploiement

### Option 1: Vercel (Recommandé - Gratuit)

Le plus simple pour Next.js 15 :

```bash
# Installation
npm i -g vercel

# Login
vercel login

# Déploiement
vercel --prod
```

**Configuration Vercel :**
1. Allez dans Settings → Environment Variables
2. Ajoutez toutes les variables de `.env.production.example`
3. Redéployez

**Avantages :**
- ✅ Zero-config Next.js
- ✅ Auto-scaling gratuit
- ✅ Preview deployments (PR)
- ✅ Edge Functions
- ✅ 100GB bandwidth gratuit

---

### Option 2: Docker Local/VPS

```bash
# 1. Build l'image
docker build -t ezia-vbeta .

# 2. Créer .env.production avec vos variables

# 3. Lancer le container
docker run -p 3000:3000 --env-file .env.production ezia-vbeta
```

Ou avec docker-compose :

```bash
docker-compose up -d
```

**Configuration requise :**
- Docker 20.10+
- 2GB RAM minimum
- MongoDB Atlas ou local

---

### Option 3: Railway ($5/mois)

```bash
# Installation
npm i -g @railway/cli

# Login & Deploy
railway login
railway init
railway up
```

**Avantages :**
- ✅ MongoDB intégré gratuit
- ✅ Auto-deploy depuis Git
- ✅ $5 de crédit gratuit

---

### Option 4: Render (Gratuit avec limitations)

1. Connectez votre repo GitHub
2. New → Web Service
3. Build: `npm run build`
4. Start: `npm run start`
5. Ajoutez les variables d'environnement

---

## 🔧 Configuration Requise

### Variables d'Environnement Essentielles

Copiez `.env.production.example` vers `.env.production` :

```bash
# MongoDB (REQUIS)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ezia

# AI Tokens (REQUIS)
HF_TOKEN=hf_xxxxx
MISTRAL_API_KEY=xxxxx

# Auth (REQUIS - générez des strings aléatoires)
JWT_SECRET=min_32_caractères_aléatoires
NEXTAUTH_SECRET=min_32_caractères_aléatoires

# URLs (REQUIS)
NEXT_PUBLIC_APP_URL=https://votredomaine.com
```

### Générer des Secrets Sécurisés

```bash
# JWT_SECRET
openssl rand -base64 32

# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -base64 24
```

---

## 📊 MongoDB Atlas Setup (Gratuit)

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Database Access → Add New User
4. Network Access → Add IP (0.0.0.0/0 pour tous)
5. Connect → Connect your application
6. Copiez la connection string

---

## 🔐 Configuration des Tokens AI

### HuggingFace Token

1. [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. New Token → Read access
3. Copiez le token `hf_xxxxx`

### Mistral AI Token

1. [Mistral Console](https://console.mistral.ai/)
2. API Keys → Create new key
3. Copiez la clé

---

## 🏗️ Build & Déploiement Docker

### Build Local

```bash
# Build
docker build -t ezia-vbeta .

# Test local
docker run -p 3000:3000 --env-file .env.local ezia-vbeta

# Vérifier
curl http://localhost:3000/api/health
```

### Docker Compose

```bash
# Lancer
docker-compose up -d

# Logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

### Push vers Registry

```bash
# Docker Hub
docker tag ezia-vbeta:latest yourusername/ezia-vbeta:latest
docker push yourusername/ezia-vbeta:latest

# GitHub Container Registry
docker tag ezia-vbeta:latest ghcr.io/yourusername/ezia-vbeta:latest
docker push ghcr.io/yourusername/ezia-vbeta:latest
```

---

## 📅 Configuration Cron Jobs (Blog Scheduling)

### Vercel Cron

Créer `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/blogs/publish-scheduled",
      "schedule": "0 10 * * *"
    }
  ]
}
```

### Railway/Render

Utilisez un service externe comme [cron-job.org](https://cron-job.org) :
- URL: `https://votredomaine.com/api/blogs/publish-scheduled`
- Schedule: `0 10 * * *` (tous les jours à 10h)
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 🔍 Health Checks

```bash
# API Health
curl https://votredomaine.com/api/health

# Database Health
curl https://votredomaine.com/api/test-db
```

---

## 🐛 Troubleshooting

### Build Failed

```bash
# Nettoyer le cache
docker builder prune -a

# Build sans cache
docker build --no-cache -t ezia-vbeta .
```

### MongoDB Connection Failed

- Vérifiez l'IP whitelist (0.0.0.0/0)
- Vérifiez username/password
- Testez la connection string

### AI Tokens Invalid

```bash
# Test HuggingFace
curl https://huggingface.co/api/whoami \
  -H "Authorization: Bearer $HF_TOKEN"

# Test Mistral
curl https://api.mistral.ai/v1/models \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```

---

## 📈 Monitoring & Logs

### Docker Logs

```bash
# Derniers logs
docker logs ezia-vbeta --tail 100

# Suivre en temps réel
docker logs -f ezia-vbeta
```

### Vercel Logs

```bash
vercel logs
```

---

## 🔒 Sécurité

### Production Checklist

- [ ] Variables d'environnement configurées
- [ ] Secrets générés aléatoirement (32+ chars)
- [ ] MongoDB IP whitelist configurée
- [ ] HTTPS activé (automatique sur Vercel/Railway)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé (TODO)
- [ ] Backups MongoDB configurés

---

## 📚 Ressources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub
