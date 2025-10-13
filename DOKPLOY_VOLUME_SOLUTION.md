# 🔧 Solution Volume Docker pour Variables Brevo

## ❌ Problème
Les variables d'environnement ajoutées dans l'interface Dokploy ne sont pas transmises au container.
Seules `MONGODB_URI`, `HF_TOKEN`, `DEFAULT_HF_TOKEN` sont accessibles.

## ✅ Solution : Volume Docker permanent

Au lieu d'utiliser l'interface Dokploy (qui ne fonctionne pas), on monte un fichier `.env.production` externe via un volume Docker.

---

## 📋 Étape 1 : Créer le fichier sur le serveur

Connecte-toi en SSH au serveur Dokploy et exécute ces commandes :

```bash
# SSH vers le serveur
ssh root@ton-serveur.ovh.net

# Créer le répertoire de config (hors du container)
mkdir -p /opt/ezia-config

# Créer le fichier .env.production
cat > /opt/ezia-config/.env.production << 'EOF'
BREVO_API_KEY=VOTRE_CLE_BREVO_ICI
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=VOTRE_EMAIL_ADMIN_ICI
EOF

# ⚠️ IMPORTANT : Remplace VOTRE_CLE_BREVO_ICI et VOTRE_EMAIL_ADMIN_ICI
# par les vraies valeurs depuis .env.local ou DOKPLOY_VARIABLES_GUIDE_COMPLETE.md

# Vérifier que le fichier est bien créé
echo "✅ Fichier créé :"
cat /opt/ezia-config/.env.production

# Définir les permissions (important pour la sécurité)
chmod 600 /opt/ezia-config/.env.production
```

---

## 📋 Étape 2 : Configurer le volume dans Dokploy

Dans l'interface Dokploy :

1. Va dans l'application **Ezia**
2. Trouve la section **"Volumes"** ou **"Mounts"** ou **"Storage"**
3. Clique sur **"Add Volume"** ou **"+ New Mount"**
4. Configure comme suit :

**Type** : `Bind Mount` (ou `Volume`)
**Host Path** : `/opt/ezia-config/.env.production`
**Container Path** : `/app/.env.production`
**Read-Only** : ✅ (coché) pour la sécurité

5. **Sauvegarde** la configuration
6. **Redéploie** l'application

---

## 📋 Étape 3 : Vérifier le bon fonctionnement

Après le redéploiement :

### A. Vérifier les logs Docker
```bash
# Sur le serveur
docker logs <container-id> | grep "Environment variables"
```

Tu devrais voir :
```
🚀 Starting Ezia.ai...
📄 Loading variables from /app/.env.production...
✅ Variables loaded from .env.production
📋 Environment variables status:
  - BREVO_API_KEY: ✅
  - BREVO_SENDER_EMAIL: ✅
  - ADMIN_NOTIFICATION_EMAIL: ✅
```

### B. Tester l'endpoint
Accède à : **https://ezia.ai/api/test-env**

Tu devrais voir :
```json
{
  "fromProcessEnv": {
    "hasBrevoKey": true,
    "hasAdminEmail": true
  },
  "allEnvKeys": ["MONGODB_URI", "HF_TOKEN", "BREVO_API_KEY", ...]
}
```

### C. Tester l'inscription webinaire
Va sur : **https://ezia.ai/webinaire**
Inscris-toi avec un email de test → tu dois recevoir l'email de confirmation

---

## 🔄 Modifier les variables plus tard

Si tu dois changer les variables Brevo :

```bash
# SSH vers le serveur
ssh root@ton-serveur.ovh.net

# Éditer le fichier
nano /opt/ezia-config/.env.production

# Redémarrer le container Dokploy (via l'interface)
# OU via CLI :
docker restart <container-id>
```

---

## ✅ Avantages de cette solution

1. ✅ **Permanent** : Le fichier survit aux redéploiements
2. ✅ **Sécurisé** : Fichier hors du container, permissions 600
3. ✅ **Simple** : Un seul fichier à maintenir
4. ✅ **Flexible** : Facile à modifier sans rebuild Docker

---

## 🆘 Troubleshooting

### Les variables ne se chargent toujours pas

**Vérifier que le volume est bien monté :**
```bash
docker exec -it <container-id> ls -la /app/.env.production
```

Si le fichier n'existe pas → le volume n'est pas monté correctement dans Dokploy.

**Vérifier le contenu du fichier dans le container :**
```bash
docker exec -it <container-id> cat /app/.env.production
```

**Vérifier que start.sh s'exécute bien :**
```bash
docker logs <container-id> 2>&1 | grep "Loading variables"
```

Tu devrais voir :
```
📄 Loading variables from /app/.env.production...
✅ Variables loaded from .env.production
```

---

## 📌 Important

- Ce fichier `/opt/ezia-config/.env.production` est **en dehors du container**
- Il ne sera **jamais supprimé** lors des redéploiements
- Il faut le monter via l'interface Dokploy dans la section **Volumes**
- Une fois configuré, tu n'auras **plus jamais à le recréer**

