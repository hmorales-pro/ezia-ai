# Ezia AI - Votre Chef de Projet IA

<div align="center">
  <img src="public/logo.png" alt="Ezia AI Logo" width="120"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
</div>

## 🚀 À propos d'Ezia

Ezia est votre chef de projet IA qui coordonne une équipe d'agents spécialisés pour créer vos projets web. Discutez naturellement avec Ezia et son équipe pour créer des sites web professionnels sans écrire une ligne de code.

### 🤖 L'équipe Ezia

- **Ezia** - Chef de projet IA, coordonne l'équipe
- **Kiko** - Expert en développement technique
- **Milo** - Spécialiste branding et naming
- **Yuna** - Experte UX et recherche utilisateur
- **Vera** - Spécialiste contenu et SEO

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, MongoDB, API Routes
- **IA**: Mistral AI, HuggingFace Inference API
- **Infrastructure**: Docker, VPS-ready, Dokploy compatible

## 📋 Prérequis

- Node.js 20+
- MongoDB (local ou Atlas)
- Docker & Docker Compose (pour déploiement)
- Compte HuggingFace (pour DeepSite et GPU)
- Clé API Mistral AI

## 🔧 Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/hmorales-pro/ezia-ai.git
cd ezia-ai
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env.local
# Éditer .env.local avec vos clés API
```

4. **Lancer en développement**
```bash
npm run dev
```

## 🚀 Déploiement sur VPS avec Dokploy

### Configuration rapide

1. **Préparer la configuration**
```bash
cp .env.production.example .env.production
# Configurer toutes les variables
```

2. **Déployer avec Docker Compose**
```bash
docker-compose up -d
```

3. **Ou utiliser le script de déploiement**
```bash
./scripts/deploy-vps.sh
```

### Configuration Nginx

```bash
# Copier la configuration Nginx
sudo cp nginx/ezia.conf /etc/nginx/sites-available/ezia
sudo ln -s /etc/nginx/sites-available/ezia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 🔑 Variables d'Environnement Essentielles

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ezia

# HuggingFace (pour DeepSite et GPU)
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Mistral AI (pour Ezia)
MISTRAL_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

Voir `.env.production.example` pour la liste complète.

## 🏗️ Architecture Hybride VPS + HuggingFace

```
┌─────────────────┐         ┌──────────────────┐
│   Votre VPS     │ ──API──▶│  HuggingFace     │
│                 │         │                  │
│ • Ezia UI       │         │ • DeepSite       │
│ • Dashboard     │         │ • GPU Models     │
│ • User Auth     │         │ • Inference API  │
│ • MongoDB       │         │                  │
└─────────────────┘         └──────────────────┘
```

### Avantages

- **Performance**: Interface rapide depuis votre VPS
- **Coûts**: GPU HuggingFace uniquement à la demande
- **Contrôle**: Données sensibles sur votre infrastructure
- **Scalabilité**: Utilisation optimale des ressources

## 📡 API Endpoints Principaux

### Ezia Core
- `POST /api/ezia/chat` - Chat avec Ezia
- `POST /api/ezia/analyze` - Analyse de business
- `POST /api/ezia/create-website` - Génération de site

### Intégration HuggingFace
- DeepSite via `lib/deepsite-api-client.ts`
- GPU Inference via `lib/hf-gpu-client.ts`

## 🐳 Docker

### Build
```bash
docker build -t ezia-ai .
```

### Run
```bash
docker run -p 3000:3000 --env-file .env.production ezia-ai
```

## 📂 Structure du Projet

```
ezia-ai/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── (auth)/         # Pages authentification
│   └── business/       # Dashboard business
├── components/          # Composants React
│   ├── ui/             # Composants UI (shadcn)
│   └── business/       # Composants métier
├── lib/                 # Utilitaires
│   ├── deepsite-api-client.ts
│   ├── hf-gpu-client.ts
│   └── ai-service.ts
├── models/              # Modèles MongoDB
├── public/              # Assets statiques
├── scripts/             # Scripts déploiement
├── nginx/               # Config Nginx
├── docker-compose.yml
└── Dockerfile
```

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir [LICENSE](LICENSE)

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/hmorales-pro/ezia-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hmorales-pro/ezia-ai/discussions)

## 🙏 Remerciements

- [HuggingFace](https://huggingface.co) pour l'infrastructure GPU
- [Mistral AI](https://mistral.ai) pour les modèles de langage
- [Vercel](https://vercel.com) pour Next.js
- La communauté open source

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe Eziom</p>
  <p>
    <a href="https://ezia.ai">Site Web</a> •
    <a href="https://twitter.com/ezia_ai">Twitter</a> •
    <a href="https://linkedin.com/company/eziom">LinkedIn</a>
  </p>
</div>