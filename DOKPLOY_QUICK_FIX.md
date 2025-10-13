# 🚀 Solution Rapide Dokploy - Variables d'Environnement

## ⚡ Méthode la plus simple (Via UI Dokploy)

### Étape 1 : Accéder aux variables d'environnement

1. Connexion à **Dokploy** : https://votre-dokploy.com
2. Sélectionner votre application **Ezia**
3. Aller dans l'onglet **"Environment"** ou **"Variables"** ou **"Settings"**

### Étape 2 : Ajouter UNIQUEMENT ces 3 variables critiques

**Important : Ajoutez-les UNE PAR UNE dans l'interface**

```
BREVO_API_KEY
```
Valeur :
```
VOTRE_CLE_BREVO_ICI
```

---

```
BREVO_SENDER_EMAIL
```
Valeur :
```
noreply@ezia.ai
```

---

```
ADMIN_NOTIFICATION_EMAIL
```
Valeur :
```
votre-email@example.com
```

### Étape 3 : Sauvegarder et Redéployer

1. Cliquez sur **"Save"** ou **"Update"**
2. Cliquez sur **"Redeploy"** ou **"Restart"**
3. Attendre 2-3 minutes que le redéploiement se termine

### Étape 4 : Vérifier

Accédez à : **https://ezia.ai/api/test-env**

Vous devriez voir :
```json
{
  "hasBrevoKey": true,  ← DOIT ÊTRE TRUE
  "brevoKeyPrefix": "VOTRE_CLE_BREVO_ICI...",
  "hasSenderEmail": true,
  "senderEmail": "noreply@ezia.ai",
  "hasAdminEmail": true,
  "adminEmail": "votre-email@example.com"
}
```

### Étape 5 : Tester l'envoi d'email

1. Aller sur **https://ezia.ai/webinaire**
2. Remplir le formulaire d'inscription
3. Soumettre
4. Vérifier votre boîte mail

✅ **Si vous recevez l'email → C'est bon !**

---

## 🔧 Méthode Alternative (Si l'interface Dokploy ne fonctionne pas)

### Via Docker Compose Override

Si Dokploy utilise docker-compose, vous pouvez créer un fichier sur le serveur :

```bash
# SSH sur le serveur
ssh user@serveur

# Aller dans le dossier du projet
cd /chemin/vers/ezia

# Créer .env.production
nano .env.production
```

Coller le contenu (copier depuis `.env.production.example` en local)

Puis redémarrer :
```bash
docker-compose restart
# ou
docker restart nom-du-container
```

---

## 📊 Vérification des logs

Pour voir les logs Docker et confirmer que les variables sont chargées :

```bash
# Trouver le container
docker ps | grep ezia

# Voir les logs
docker logs nom-du-container --tail 50

# Chercher ces lignes :
# ✅ Variables env dans API route: { hasBrevoKey: true, ... }
```

---

## ❓ FAQ

### Q: Où se trouve l'onglet "Environment" dans Dokploy ?

R: Généralement dans le menu latéral de l'application :
- **Settings** → Environment Variables
- **Configuration** → Environment
- **Deploy** → Environment

### Q: Les variables disparaissent après un redéploiement ?

R: C'est normal si elles ne sont pas persistées. Il faut :
1. Les ajouter dans l'interface Dokploy (elles seront sauvegardées)
2. OU créer un volume Docker pour monter `.env.production`

### Q: J'ai ajouté les variables mais ça ne marche toujours pas ?

R: Vérifiez que :
1. Les variables sont bien dans la section **"Production"** (pas Development)
2. Vous avez bien **redéployé** après l'ajout
3. Le container a bien redémarré (`docker ps` pour voir l'uptime)
4. Testez `/api/test-env` pour voir si elles sont chargées

---

## 🆘 Support

Si rien ne fonctionne, partagez :
1. Les logs Docker : `docker logs <container-id> | grep BREVO`
2. Le résultat de `/api/test-env`
3. La version de Dokploy utilisée
