# Configuration des variables d'environnement sur Dokploy

## 🔴 Problème

Les variables d'environnement configurées dans l'interface Dokploy ne sont pas accessibles au runtime de l'application Next.js.

## ✅ Solution

Créer un fichier `.env.production` directement sur le serveur Dokploy.

---

## 📋 Procédure

### Étape 1 : Se connecter au serveur via SSH

```bash
ssh votre-utilisateur@votre-serveur-dokploy
```

### Étape 2 : Localiser le dossier de l'application

```bash
# Trouver le dossier de l'app (généralement dans /home/dokploy ou /var/lib/dokploy)
cd /chemin/vers/ezia36
```

### Étape 3 : Créer le fichier .env.production

```bash
# Méthode 1 : Utiliser le script fourni
bash scripts/create-env-production.sh

# Méthode 2 : Créer manuellement
nano .env.production
# Puis coller le contenu ci-dessous
```

### Étape 4 : Contenu du fichier .env.production

```bash
# Configuration Ezia Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ezia.ai

# MongoDB
MONGODB_URI=VOTRE_MONGODB_URI_ICI/ezia?retryWrites=true&w=majority

# HuggingFace
HF_TOKEN=VOTRE_TOKEN_HUGGINGFACE_ICI
DEFAULT_HF_TOKEN=VOTRE_TOKEN_HUGGINGFACE_ICI

# Mistral AI
MISTRAL_API_KEY=VOTRE_CLE_MISTRAL_ICI

# Auth
JWT_SECRET=ezia-secret-key-2024-secure-random-string-change-this-in-production
NEXTAUTH_SECRET=ezia-nextauth-secret-2024-random-string-change-this-in-production

# Feature Flags
DISABLE_ECOSYSTEM_FEATURE=true
NEXT_PUBLIC_DISABLE_ECOSYSTEM_FEATURE=true

# ========================================
# BREVO EMAIL SERVICE (CRITIQUE POUR WEBINAIRE)
# ========================================
BREVO_API_KEY=VOTRE_CLE_API_BREVO_ICI
BREVO_LIST_ID_STARTUP=3
BREVO_LIST_ID_ENTERPRISE=4
BREVO_TEMPLATE_WAITLIST_STARTUP=id-template-1
BREVO_TEMPLATE_WAITLIST_ENTERPRISE=id-template-2
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=votre-email@example.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T9XL833P0F

# HuggingFace Spaces
DEEPSITE_HF_URL=https://huggingface.co/spaces
DEEPSITE_SPACE_ID=hmorales/deepsite-v2

# Next.js Config
NEXT_APP_API_URL=https://api-inference.huggingface.co
NEXT_TELEMETRY_DISABLED=1

# Quotas
FREE_MONTHLY_WEBSITES=1
FREE_MONTHLY_ANALYSES=5
FREE_MONTHLY_CONVERSATIONS=50

# Redirect
NEXT_PUBLIC_REDIRECT_URL=https://ezia.ai/auth/callback
```

### Étape 5 : Vérifier les permissions

```bash
chmod 600 .env.production  # Sécuriser le fichier
```

### Étape 6 : Redémarrer l'application sur Dokploy

Via l'interface Dokploy :
- Allez sur votre application
- Cliquez sur **"Restart"** ou **"Redeploy"**

Ou via Docker CLI :
```bash
docker restart nom-du-container-ezia
```

---

## 🧪 Vérification

Après le redémarrage, testez l'inscription webinaire sur :
https://ezia.ai/webinaire

Vérifiez les logs pour confirmer :
```
✅ Variables env dans API route: { hasBrevoKey: true, ... }
✅ Email envoyé avec succès
```

---

## 🔍 Dépannage

### Les variables ne sont toujours pas chargées

1. Vérifier que le fichier existe :
```bash
cat .env.production
```

2. Vérifier le dossier de travail de l'app :
```bash
docker exec -it nom-container pwd
docker exec -it nom-container ls -la | grep .env
```

3. Vérifier que Next.js charge bien le fichier :
```bash
docker logs nom-container | grep "BREVO"
```

### Accès à la route de test

https://ezia.ai/api/test-env

Devrait retourner :
```json
{
  "hasBrevoKey": true,
  "brevoKeyPrefix": "xkeysib-8f..."
}
```

---

## 📝 Notes importantes

- ⚠️ Le fichier `.env.production` contient des secrets - **NE PAS** le committer dans Git
- 🔒 Toujours utiliser `chmod 600` pour sécuriser le fichier
- 🔄 Redémarrer l'application après chaque modification des variables
- 📧 Les emails Brevo nécessitent que `BREVO_API_KEY` soit valide et que le domaine `ezia.ai` soit vérifié dans Brevo

---

## 🆘 Support

Si le problème persiste :
1. Vérifier les logs Dokploy
2. Tester la route `/api/test-env`
3. Vérifier que la clé Brevo est valide sur console.brevo.com
