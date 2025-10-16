# 🐳 Guide de Test Docker - Ezia Content Generation

## Démarrage rapide (5 minutes)

### 1. Prérequis

- Docker Desktop installé et démarré
- Une clé API Mistral ([obtenir ici](https://console.mistral.ai/))

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp .env.docker.example .env.docker

# Éditer .env.docker et ajouter votre clé Mistral
# Remplacer : MISTRAL_API_KEY=your_mistral_api_key_here
nano .env.docker  # ou vim, code, etc.
```

### 3. Démarrage

```bash
# Démarrer tous les services (MongoDB + Ezia + Mongo Express)
docker-compose -f docker-compose.dev.yml --env-file .env.docker up -d

# Voir les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f ezia-app

# Attendre que le serveur soit prêt (environ 30-60 secondes)
# Vous verrez : "✓ Ready in XXXms"
```

### 4. Tester l'API

```bash
# Rendre le script exécutable
chmod +x scripts/docker-test.sh

# Lancer les tests automatiques
./scripts/docker-test.sh
```

**Le script va :**
1. ✅ Créer un calendrier éditorial
2. ✅ Récupérer le calendrier
3. ✅ Générer du contenu quotidien avec variantes A/B
4. ✅ Vérifier MongoDB

---

## 🎯 Accès aux services

### Application Ezia
- **URL**: http://localhost:3000
- **Health check**: http://localhost:3000/api/health

### Mongo Express (Interface MongoDB)
- **URL**: http://localhost:8081
- **Username**: `admin`
- **Password**: `admin123`

Vous pouvez visualiser :
- Collection `businesses` → Business de test
- Collection `contentcalendars` → Calendriers générés
- Collection `generatedcontents` → Contenu quotidien

### MongoDB Direct
```bash
# Se connecter à MongoDB
docker exec -it ezia-mongodb mongosh \
  --username ezia \
  --password eziadev123 \
  --authenticationDatabase admin \
  ezia

# Commandes utiles
> db.businesses.find().pretty()
> db.contentcalendars.find().pretty()
> db.generatedcontents.find().pretty()
```

---

## 🧪 Tests manuels avec cURL

### Générer un token JWT

```bash
docker exec -it ezia-app node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 'test-user-123', email: 'test@ezia.ai' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
console.log('Token:', token);
"
```

### Créer un calendrier

```bash
TOKEN="votre_token_ici"

curl -X POST http://localhost:3000/api/content/calendar/create \
  -H "Content-Type: application/json" \
  -H "Cookie: ezia-auth-token=$TOKEN" \
  -d '{
    "business_id": "TEST-DOCKER-001",
    "request": {
      "request_type": "content_calendar_create",
      "timeframe": {
        "start_date": "2025-11-01",
        "end_date": "2025-11-30"
      },
      "cadence": {"days_per_week": 5},
      "pillars": [
        {"name": "Éducation", "ratio": 0.5},
        {"name": "Autorité", "ratio": 0.5}
      ]
    }
  }' | jq '.'
```

### Générer du contenu

```bash
CALENDAR_ID="CAL-2025-11-TESTDOCK"  # ID récupéré ci-dessus

curl -X POST http://localhost:3000/api/content/daily/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: ezia-auth-token=$TOKEN" \
  -d '{
    "request": {
      "request_type": "daily_content_generate",
      "calendar_id": "'"$CALENDAR_ID"'",
      "date": "2025-11-03",
      "platforms": ["LinkedIn"],
      "variants": 2
    }
  }' | jq '.'
```

---

## 🔧 Commandes Docker utiles

### Gestion des services

```bash
# Démarrer les services
docker-compose -f docker-compose.dev.yml up -d

# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Redémarrer un service
docker-compose -f docker-compose.dev.yml restart ezia-app

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs -f ezia-app
docker-compose -f docker-compose.dev.yml logs -f mongodb

# Voir le status
docker-compose -f docker-compose.dev.yml ps
```

### Rebuild après modifications

```bash
# Rebuild l'image Docker
docker-compose -f docker-compose.dev.yml build --no-cache ezia-app

# Rebuild et redémarrer
docker-compose -f docker-compose.dev.yml up -d --build ezia-app
```

### Nettoyage

```bash
# Arrêter et supprimer les containers
docker-compose -f docker-compose.dev.yml down

# Supprimer aussi les volumes (⚠️ supprime les données MongoDB)
docker-compose -f docker-compose.dev.yml down -v

# Nettoyer les images inutilisées
docker image prune -a
```

---

## 🐛 Troubleshooting

### Problème 1: "Unauthorized"

**Symptôme**: `{"error": "Unauthorized: No token provided"}`

**Solution**:
```bash
# Vérifier que le token est généré correctement
docker exec -it ezia-app node -e "console.log(process.env.JWT_SECRET)"

# Regénérer un token avec le bon secret
```

### Problème 2: "Failed to generate from Mistral API"

**Symptôme**: Le contenu généré est générique (fallback)

**Solution**:
```bash
# Vérifier que la clé Mistral est bien configurée
docker exec -it ezia-app node -e "console.log('MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY?.substring(0, 10) + '...')"

# Si vide, ajouter dans .env.docker et redémarrer
docker-compose -f docker-compose.dev.yml restart ezia-app
```

### Problème 3: "MongoDB connection failed"

**Symptôme**: Erreurs de connexion MongoDB dans les logs

**Solution**:
```bash
# Vérifier que MongoDB est démarré
docker-compose -f docker-compose.dev.yml ps mongodb

# Voir les logs MongoDB
docker-compose -f docker-compose.dev.yml logs mongodb

# Redémarrer MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb

# Attendre 10 secondes que MongoDB soit prêt
```

### Problème 4: Port 3000 déjà utilisé

**Symptôme**: `Error: bind: address already in use`

**Solution**:
```bash
# Option 1: Arrêter le processus sur le port 3000
lsof -ti:3000 | xargs kill

# Option 2: Changer le port dans docker-compose.dev.yml
# Ligne 9 : "3001:3000" au lieu de "3000:3000"
```

### Problème 5: Le serveur ne démarre pas

**Symptôme**: Container `ezia-app` en état "Restarting"

**Solution**:
```bash
# Voir les logs détaillés
docker logs ezia-app

# Vérifier les variables d'environnement
docker exec -it ezia-app env | grep -E "MONGODB|MISTRAL|JWT"

# Rebuild complet
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Problème 6: Business de test non créé

**Symptôme**: `{"error": "Business not found"}`

**Solution**:
```bash
# Vérifier que MongoDB a exécuté le script d'init
docker logs ezia-mongodb | grep "mongo-init.js"

# Si non exécuté, le refaire manuellement
docker exec -it ezia-mongodb mongosh \
  --username ezia \
  --password eziadev123 \
  --authenticationDatabase admin \
  ezia \
  /docker-entrypoint-initdb.d/mongo-init.js
```

---

## 📊 Monitoring

### Health checks

```bash
# Vérifier la santé de l'application
curl http://localhost:3000/api/health

# Vérifier MongoDB
docker exec ezia-mongodb mongosh \
  --quiet \
  --username ezia \
  --password eziadev123 \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```

### Métriques Docker

```bash
# Utilisation des ressources
docker stats ezia-app ezia-mongodb

# Espace disque des volumes
docker volume ls
docker volume inspect ezia36_mongodb_data
```

---

## 🔄 Workflow de développement

### Modifier le code et tester

```bash
# 1. Modifier le code localement
# 2. Rebuild l'image
docker-compose -f docker-compose.dev.yml build ezia-app

# 3. Redémarrer le container
docker-compose -f docker-compose.dev.yml up -d ezia-app

# 4. Voir les logs
docker-compose -f docker-compose.dev.yml logs -f ezia-app

# 5. Tester
./scripts/docker-test.sh
```

### Réinitialiser les données

```bash
# Supprimer toutes les données MongoDB
docker-compose -f docker-compose.dev.yml down -v

# Redémarrer (MongoDB sera réinitialisé)
docker-compose -f docker-compose.dev.yml up -d

# Attendre que le business de test soit créé
docker logs ezia-mongodb | grep "Business de test créé"
```

---

## 📦 Structure Docker

```
ezia36/
├── Dockerfile                    # Image production Next.js
├── docker-compose.dev.yml        # Orchestration dev (MongoDB + App)
├── .env.docker.example           # Template variables d'env
├── .env.docker                   # Vos vraies variables (gitignored)
├── .dockerignore                 # Fichiers exclus du build
└── scripts/
    ├── mongo-init.js             # Script d'init MongoDB
    └── docker-test.sh            # Tests automatiques
```

---

## ✅ Checklist de test complet

- [ ] Docker Desktop démarré
- [ ] `.env.docker` créé avec clé Mistral valide
- [ ] `docker-compose up -d` exécuté
- [ ] Services démarrés (3/3 running)
- [ ] Application accessible sur http://localhost:3000
- [ ] Mongo Express accessible sur http://localhost:8081
- [ ] Business de test présent dans MongoDB
- [ ] Script `docker-test.sh` réussi
- [ ] Calendrier créé et visible dans Mongo Express
- [ ] Contenu généré avec variantes A/B
- [ ] Métriques de qualité présentes

---

## 🚀 Next steps

Une fois les tests Docker réussis :

1. **Interface UI** : Accéder à http://localhost:3000 et tester l'interface
2. **API complète** : Tester tous les endpoints (voir [CONTENT_GENERATION_API.md](CONTENT_GENERATION_API.md))
3. **Production** : Déployer sur VPS/Cloud (voir [DEPLOYMENT.md](DEPLOYMENT.md))

---

Besoin d'aide ? Vérifiez les logs avec `docker-compose logs -f` 🔍
