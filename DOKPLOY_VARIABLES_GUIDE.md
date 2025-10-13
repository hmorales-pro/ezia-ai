# 🎯 Guide Complet : Ajouter Variables d'Environnement dans Dokploy

## ❗ Problème Actuel

Les variables `MONGODB_URI` et `HF_TOKEN` fonctionnent car elles étaient déjà configurées.
Les nouvelles variables `BREVO_API_KEY` et `ADMIN_NOTIFICATION_EMAIL` ne fonctionnent PAS car elles ne sont pas dans Dokploy.

## ✅ Solution : Ajouter dans l'Interface Dokploy (PERMANENT)

### Étape 1 : Trouver la section Variables

Dans Dokploy, selon la version :

**Option A : Menu latéral**
```
Application → Settings → Environment Variables
```

**Option B : Onglets**
```
Deploy → Environment → Variables
```

**Option C : Configuration**
```
Configuration → Environment
```

### Étape 2 : Ajouter EXACTEMENT ces 3 variables

⚠️ **IMPORTANT** : Copie-colle les noms ET valeurs EXACTEMENT comme ci-dessous

---

#### Variable 1 : BREVO_API_KEY

**Nom de la variable :**
```
BREVO_API_KEY
```

**Valeur :**
```
VOTRE_CLE_BREVO_ICI
```

---

#### Variable 2 : BREVO_SENDER_EMAIL

**Nom de la variable :**
```
BREVO_SENDER_EMAIL
```

**Valeur :**
```
noreply@ezia.ai
```

---

#### Variable 3 : ADMIN_NOTIFICATION_EMAIL

**Nom de la variable :**
```
ADMIN_NOTIFICATION_EMAIL
```

**Valeur :**
```
votre-email@example.com
```

---

### Étape 3 : Vérifier le Scope

Assure-toi que les variables sont configurées pour **"Production"** ou **"All Environments"**

❌ Pas seulement "Development" ou "Preview"

### Étape 4 : Sauvegarder et Redéployer

1. Clique sur **"Save"** ou **"Add"**
2. Clique sur **"Redeploy"** ou **"Restart"**
3. Attends 2-3 minutes

### Étape 5 : Vérifier

Accède à : **https://ezia.ai/api/test-env**

Tu DOIS voir :
```json
{
  "fromProcessEnv": {
    "hasBrevoKey": true,  ← DOIT ÊTRE TRUE
    "brevoKeyPrefix": "VOTRE_CLE_BREVO_ICI...",
    "hasSenderEmail": true,
    "senderEmail": "noreply@ezia.ai",
    "hasAdminEmail": true,
    "adminEmail": "votre-email@example.com"
  },
  "allEnvKeys": ["BREVO_API_KEY", "BREVO_SENDER_EMAIL", "ADMIN_NOTIFICATION_EMAIL", ...]
}
```

Si `allEnvKeys` contient bien `"BREVO_API_KEY"` → ✅ **C'EST BON !**

---

## 🔍 Pourquoi certaines variables fonctionnent et pas d'autres ?

Les variables qui fonctionnent (`MONGODB_URI`, `HF_TOKEN`) étaient déjà dans Dokploy.
Les nouvelles variables (`BREVO_*`) ne sont PAS dans Dokploy → Il faut les ajouter manuellement.

---

## 📸 Screenshots des interfaces Dokploy courantes

### Interface Type 1 : Liste de variables

```
┌─────────────────────────────────────────┐
│ Environment Variables                    │
├─────────────────────────────────────────┤
│ Key              │ Value                │
│ MONGODB_URI      │ mongodb+srv://...    │ ← Existe déjà
│ HF_TOKEN         │ hf_...               │ ← Existe déjà
│                                          │
│ [+ Add Variable]                         │ ← Cliquer ici
└─────────────────────────────────────────┘
```

### Interface Type 2 : Formulaire

```
┌─────────────────────────────────────────┐
│ Add Environment Variable                 │
├─────────────────────────────────────────┤
│ Name:  [_______________________]         │
│ Value: [_______________________]         │
│                                          │
│ Scope: [x] Production                    │
│        [ ] Development                   │
│                                          │
│        [Cancel]  [Add Variable]          │
└─────────────────────────────────────────┘
```

---

## ❓ FAQ

### Q: Dois-je recréer le fichier .env.production à chaque déploiement ?

**R: NON !** Une fois les variables ajoutées dans l'interface Dokploy, elles sont **PERMANENTES**.
Le fichier `.env.production` n'est nécessaire que si l'interface Dokploy ne fonctionne pas.

### Q: Les variables disparaissent après un redéploiement ?

**R:** Cela signifie qu'elles n'ont PAS été ajoutées dans l'interface Dokploy, mais seulement dans le container (via docker exec).
→ **Solution** : Les ajouter dans l'interface Dokploy pour les rendre permanentes.

### Q: Je ne trouve pas l'onglet "Environment Variables" ?

**R:** Essaye ces chemins :
- Settings → Environment
- Configuration → Variables
- Deploy → Env
- Advanced → Environment

Si tu ne trouves vraiment pas, envoie un screenshot de l'interface Dokploy.

### Q: Puis-je importer un fichier .env dans Dokploy ?

**R:** Certaines versions de Dokploy permettent d'uploader un fichier `.env`.
Cherche un bouton **"Import .env"** ou **"Upload file"** dans la section Environment Variables.

---

## 🆘 Si rien ne fonctionne

### Plan B : Fichier .env monté via volume Docker

Si l'interface Dokploy ne permet vraiment pas d'ajouter des variables, on peut monter un fichier via un volume Docker.

**Crée un fichier** sur le serveur (en dehors du container) :

```bash
# Sur le serveur Dokploy
mkdir -p /opt/dokploy/ezia-config
nano /opt/dokploy/ezia-config/.env.production
```

**Contenu** (coller toutes les variables)

Puis dans Dokploy, ajouter un **volume mount** :
```
Host Path: /opt/dokploy/ezia-config/.env.production
Container Path: /app/.env.production
```

---

## ✅ Checklist Finale

- [ ] Ouvrir Dokploy → Application Ezia
- [ ] Trouver "Environment Variables"
- [ ] Ajouter `BREVO_API_KEY`
- [ ] Ajouter `BREVO_SENDER_EMAIL`
- [ ] Ajouter `ADMIN_NOTIFICATION_EMAIL`
- [ ] Scope = "Production"
- [ ] Sauvegarder
- [ ] Redéployer l'application
- [ ] Tester https://ezia.ai/api/test-env
- [ ] Vérifier que `allEnvKeys` contient "BREVO_API_KEY"
- [ ] Tester inscription https://ezia.ai/webinaire
- [ ] Recevoir l'email de confirmation

**Si toutes les cases sont cochées → 🎉 C'EST RÉGLÉ !**
