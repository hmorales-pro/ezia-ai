# Guide de Déploiement Ezia sur Dokploy

Ce guide vous explique comment déployer Ezia sur votre VPS avec Dokploy et configurer les sous-domaines.

## 📋 Prérequis

- VPS avec Dokploy installé
- Nom de domaine pointant vers votre VPS
- MongoDB (peut être déployé via Dokploy)
- Accès SSH à votre VPS

## 🚀 Étapes de Déploiement

### 1. Préparer MongoDB

Si vous n'avez pas encore MongoDB, déployez-le via Dokploy :

```yaml
# mongodb-dokploy.yaml
name: mongodb
type: docker
image: mongo:7
env:
  MONGO_INITDB_ROOT_USERNAME: admin
  MONGO_INITDB_ROOT_PASSWORD: votre-mot-de-passe-fort
  MONGO_INITDB_DATABASE: ezia-prod
volumes:
  - name: mongodb-data
    path: /data/db
    size: 20Gi
ports:
  - 27017:27017
```

### 2. Configurer les Variables d'Environnement

Dans Dokploy, créez un nouveau projet et ajoutez ces variables :

```bash
# MongoDB
MONGODB_URI=mongodb://admin:votre-mot-de-passe@mongodb:27017/ezia-prod?authSource=admin

# Domaines
PRIMARY_DOMAIN=votredomaine.com
NEXTAUTH_URL=https://votredomaine.com
NEXT_PUBLIC_APP_URL=https://votredomaine.com

# Tokens Hugging Face
HF_TOKEN=hf_votre_token_huggingface
DEFAULT_HF_TOKEN=hf_votre_token_par_defaut

# Cookies
AUTH_COOKIE_NAME=ezia-auth-token
AUTH_COOKIE_DOMAIN=.votredomaine.com

# Optionnel
DISABLE_ECOSYSTEM_FEATURE=true
NEXT_PUBLIC_DISABLE_ECOSYSTEM_FEATURE=true
```

### 3. Déployer Ezia

#### Option A : Via l'interface Dokploy

1. **Créer un nouveau projet** dans Dokploy
2. **Type** : Application Docker
3. **Source** : Git repository
4. **URL du repo** : `https://github.com/votre-username/ezia36.git`
5. **Branche** : `main`
6. **Dockerfile** : `./Dockerfile`
7. **Port** : `3000`

#### Option B : Via dokploy.yaml

1. Committez le fichier `dokploy.yaml` dans votre repo
2. Dans Dokploy, importez le projet via le fichier YAML

### 4. Configurer les Domaines et SSL

#### Dans Dokploy :

1. Allez dans **Domains** de votre projet
2. Ajoutez votre domaine principal :
   - Domain: `votredomaine.com`
   - Port: `3000`
   - SSL: `Let's Encrypt`

3. Ajoutez le wildcard pour les sous-domaines :
   - Domain: `*.votredomaine.com`
   - Port: `3000`
   - SSL: `Let's Encrypt Wildcard`

#### Configuration DNS :

Chez votre registrar DNS, ajoutez :

```
A     @     IP-DE-VOTRE-VPS
A     *     IP-DE-VOTRE-VPS
```

### 5. Certificat SSL Wildcard

Pour Let's Encrypt wildcard, vous devez configurer la validation DNS :

```bash
# Sur votre VPS
dokploy ssl:wildcard votredomaine.com

# Suivez les instructions pour ajouter le record TXT
# _acme-challenge.votredomaine.com TXT "valeur-donnee-par-dokploy"
```

### 6. Vérifier le Déploiement

1. **Health check** : https://votredomaine.com/api/health
2. **Page d'accueil** : https://votredomaine.com
3. **Test sous-domaine** : https://restfree.votredomaine.com

## 🔧 Configuration Avancée

### Nginx Personnalisé (si nécessaire)

Si Dokploy ne gère pas automatiquement les wildcards, ajoutez dans Dokploy :

```nginx
# Custom Nginx Config
server {
    server_name ~^(?<subdomain>.+)\.votredomaine\.com$;
    
    location / {
        proxy_pass http://ezia-platform:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Variables d'Environnement Supplémentaires

```bash
# Performance
NEXT_SHARP_PATH=/app/node_modules/sharp

# Logs
LOG_LEVEL=info

# Limites
BODY_SIZE_LIMIT=10mb
```

## 📊 Monitoring

### Logs
```bash
# Via Dokploy UI ou SSH
dokploy logs ezia-platform -f
```

### Métriques
- CPU/Mémoire dans le dashboard Dokploy
- Health endpoint : `/api/health`

## 🚨 Troubleshooting

### Problème : Sous-domaines ne fonctionnent pas

1. Vérifiez le DNS :
   ```bash
   dig restfree.votredomaine.com
   ```

2. Vérifiez Nginx :
   ```bash
   dokploy nginx:test
   ```

3. Vérifiez les logs :
   ```bash
   dokploy logs ezia-platform | grep subdomain
   ```

### Problème : MongoDB connection failed

1. Vérifiez que MongoDB est accessible :
   ```bash
   dokploy exec mongodb mongosh
   ```

2. Testez la connexion :
   ```bash
   dokploy exec ezia-platform npm run test:db
   ```

### Problème : SSL ne fonctionne pas

1. Vérifiez les certificats :
   ```bash
   dokploy ssl:list
   ```

2. Renouveler manuellement :
   ```bash
   dokploy ssl:renew votredomaine.com
   ```

## 🎯 Commandes Utiles Dokploy

```bash
# Redémarrer l'application
dokploy restart ezia-platform

# Mise à jour
dokploy deploy ezia-platform

# Scale
dokploy scale ezia-platform --replicas=3

# Backup MongoDB
dokploy backup mongodb

# Voir les variables d'env
dokploy env ezia-platform
```

## ✅ Checklist de Déploiement

- [ ] MongoDB déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] Application déployée via Dokploy
- [ ] Domaine principal configuré avec SSL
- [ ] Wildcard DNS configuré (*.votredomaine.com)
- [ ] SSL wildcard activé
- [ ] Health check fonctionnel
- [ ] Test d'un sous-domaine réussi
- [ ] Monitoring configuré

## 📝 Notes

- Les sous-domaines sont automatiquement routés grâce au middleware
- Chaque site a son propre sous-domaine unique
- SSL wildcard est nécessaire pour HTTPS sur les sous-domaines
- Dokploy gère automatiquement les redémarrages et la santé