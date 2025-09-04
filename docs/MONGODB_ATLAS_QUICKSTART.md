# Guide Rapide MongoDB Atlas pour Ezia Preprod

## 🚀 Configuration en 5 minutes

### 1. Créer un compte MongoDB Atlas
- Aller sur [cloud.mongodb.com](https://cloud.mongodb.com)
- Créer un compte gratuit

### 2. Créer un cluster gratuit
- Cliquer sur "Create" → "Create a New Cluster"
- Choisir "Shared" (gratuit)
- Sélectionner un provider cloud et région proche
- Nommer le cluster : `ezia-preprod`
- Cliquer "Create Cluster"

### 3. Configurer l'accès
#### Security → Network Access
- Cliquer "Add IP Address"
- Cliquer "Allow Access from Anywhere"
- Confirmer avec "0.0.0.0/0"

#### Security → Database Access
- Cliquer "Add New Database User"
- Méthode : Password
- Username : `ezia-preprod`
- Password : Générer un mot de passe sécurisé
- Permissions : "Atlas Admin"
- Cliquer "Add User"

### 4. Obtenir la connection string
- Cliquer "Connect" sur votre cluster
- Choisir "Connect your application"
- Driver : Node.js, Version : 5.5 or later
- Copier la connection string

### 5. Configurer dans Dokploy
Dans les variables d'environnement de votre application Dokploy :

```bash
MONGODB_URI=mongodb+srv://ezia-preprod:VOTRE_PASSWORD@VOTRE_CLUSTER.mongodb.net/ezia-preprod?retryWrites=true&w=majority
```

⚠️ Remplacer :
- `VOTRE_PASSWORD` par le mot de passe créé
- `VOTRE_CLUSTER` par le nom de votre cluster

### 6. Vérifier la connexion
Dans les logs de Dokploy, vous devriez voir :
```
✅ MongoDB connected successfully
```

## 🔧 Dépannage

### Erreur "Authentication failed"
- Vérifier le mot de passe dans l'URI
- Vérifier que l'utilisateur existe dans Database Access

### Erreur "Network timeout"
- Vérifier que "Allow Access from Anywhere" est configuré
- Attendre 1-2 minutes après la configuration

### Données qui disparaissent
- Si vous voyez "Using memory database as fallback"
- Vérifier que MONGODB_URI est bien configuré dans Dokploy

## 📊 Monitoring
Dans MongoDB Atlas :
- Onglet "Metrics" pour voir l'utilisation
- Onglet "Collections" pour explorer les données
- Le plan gratuit offre 512MB de stockage