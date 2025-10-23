# 🚨 FIX CRITIQUE : MongoDB en Production

## Problème
**Les utilisateurs perdent leurs business à chaque redéploiement** car MongoDB n'est pas correctement configuré en production.

L'application utilise la base de données en mémoire au lieu de MongoDB, donc toutes les données sont perdues au redémarrage.

---

## Solution : Configurer MongoDB dans Dokploy

### Étape 1 : Se connecter à Dokploy

1. Allez sur votre panel Dokploy
2. Sélectionnez votre application **Ezia**

### Étape 2 : Configurer les Variables d'Environnement

Dans l'onglet **Environment Variables** de Dokploy, ajoutez **TOUTES** ces variables :

```bash
# ========================================
# CRITIQUE - Base de données MongoDB
# ========================================
NODE_ENV=production
MONGODB_URI=mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia?retryWrites=true&w=majority

# ========================================
# HuggingFace API
# ========================================
HF_TOKEN=<VOTRE_TOKEN_HF>
DEFAULT_HF_TOKEN=<VOTRE_TOKEN_HF>

# ========================================
# Mistral AI
# ========================================
MISTRAL_API_KEY=<VOTRE_CLE_MISTRAL>

# ========================================
# Authentification
# ========================================
JWT_SECRET=ezia-secret-key-2024-secure-random-string-change-this-in-production
NEXTAUTH_SECRET=ezia-nextauth-secret-2024-random-string-change-this-in-production

# ========================================
# URLs
# ========================================
NEXT_PUBLIC_APP_URL=https://ezia.ai
NEXT_APP_API_URL=https://api-inference.huggingface.co
NEXT_PUBLIC_REDIRECT_URL=https://ezia.ai/auth/callback

# ========================================
# Email Brevo
# ========================================
BREVO_API_KEY=<VOTRE_CLE_BREVO>
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=<VOTRE_EMAIL_ADMIN>

# ========================================
# Analytics
# ========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T9XL833P0F

# ========================================
# Feature Flags
# ========================================
DISABLE_ECOSYSTEM_FEATURE=true
NEXT_PUBLIC_DISABLE_ECOSYSTEM_FEATURE=true

# ========================================
# Limites
# ========================================
FREE_MONTHLY_WEBSITES=1
FREE_MONTHLY_ANALYSES=5
FREE_MONTHLY_CONVERSATIONS=50
NEXT_TELEMETRY_DISABLED=1
```

### Étape 3 : Vérifier le Dockerfile

Assurez-vous que votre `Dockerfile` ou `docker-compose.yml` ne surcharge PAS les variables d'environnement.

**Vérifier dans Dokploy :**
- Onglet **Settings** → **Build Args** : ne doit PAS contenir `MONGODB_URI`
- Seul l'onglet **Environment Variables** doit avoir `MONGODB_URI`

### Étape 4 : Redéployer

1. Sauvegardez les variables d'environnement
2. Cliquez sur **Deploy** ou **Redeploy**
3. Attendez la fin du build

### Étape 5 : Vérifier les Logs

Après le déploiement, vérifiez les logs :

```bash
# Dans les logs Dokploy, vous devriez voir :
✅ Business "Mon Business" successfully saved to MongoDB
   - Business ID: biz_xxxxxxxxxxxx
   - MongoDB _id: 68f9ca1d171a9210f75ecb82
   - User: hugo.morales.pro@gmail.com (68f9ca1d171a9210f75ecb82)
```

**❌ Si vous voyez ce message, MongoDB n'est PAS configuré :**
```
⚠️  Using in-memory database - business will NOT be persisted!
```

---

## Vérification Post-Déploiement

### Test 1 : Créer un Business

1. Connectez-vous sur https://ezia.ai
2. Créez un nouveau business
3. Vérifiez les logs → vous devez voir `✅ Business successfully saved to MongoDB`

### Test 2 : Redéployer

1. Faites un nouveau déploiement (sans changer de code)
2. Reconnectez-vous
3. **Votre business doit toujours être là !** ✅

Si le business a disparu → MongoDB n'est toujours pas configuré

---

## Diagnostic des Problèmes

### Problème : "Missing required fields"

**Cause** : `MONGODB_URI` n'est pas défini

**Solution** :
1. Vérifiez que `MONGODB_URI` est dans les variables d'environnement Dokploy
2. Redéployez l'application

### Problème : "Database not configured"

**Cause** : `MONGODB_URI` est vide ou invalide

**Solution** :
1. Vérifiez l'URI MongoDB (doit commencer par `mongodb+srv://`)
2. Testez la connexion depuis MongoDB Compass
3. Redéployez

### Problème : "Using in-memory database"

**Cause** : L'application ne voit pas la variable `MONGODB_URI`

**Solution** :
1. Dans Dokploy, vérifiez que `MONGODB_URI` est dans **Environment Variables**, pas dans **Build Args**
2. Redémarrez le conteneur
3. Vérifiez les logs

---

## Alternative : Monter .env.production en Volume

Si les variables d'environnement Dokploy ne marchent pas, vous pouvez monter le fichier `.env.production` :

### Option 1 : Via Dokploy UI

1. Onglet **Volumes** → Ajouter un volume
2. **Host Path** : `/chemin/vers/.env.production`
3. **Container Path** : `/app/.env.production`
4. Redéployer

### Option 2 : Via docker-compose.yml

```yaml
services:
  ezia:
    image: your-image
    volumes:
      - /chemin/vers/.env.production:/app/.env.production:ro
    environment:
      - NODE_ENV=production
```

---

## Checklist Finale

Avant de redéployer, vérifiez :

- [ ] `MONGODB_URI` est configuré dans Dokploy Environment Variables
- [ ] `NODE_ENV=production` est défini
- [ ] Aucune variable ne surcharge `MONGODB_URI` dans Build Args
- [ ] Le fichier `.env.production` n'est PAS commité dans Git
- [ ] Les logs montrent "MongoDB (persistent)" et pas "MEMORY (temporary)"
- [ ] Après création d'un business, vous voyez "successfully saved to MongoDB"

---

## Support

Si le problème persiste :

1. Vérifiez les logs Dokploy
2. Testez la connexion MongoDB depuis votre VPS :
   ```bash
   mongosh "mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia"
   ```
3. Vérifiez que MongoDB Atlas autorise les connexions depuis votre VPS (IP whitelist)

---

## Résultat Attendu

Après cette configuration :

✅ Les business sont sauvegardés dans MongoDB
✅ Les redéploiements ne perdent plus les données
✅ Les utilisateurs conservent leurs business
✅ Les logs montrent clairement "MongoDB (persistent)"

🎯 **L'application doit TOUJOURS utiliser MongoDB en production, JAMAIS la mémoire !**
