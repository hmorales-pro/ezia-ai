# Corriger l'erreur MongoDB "bad auth : Authentication failed" sur Preprod

## Problème
```
MongoServerError: bad auth : Authentication failed
code: 8000
codeName: 'AtlasError'
```

## Solution

### 1. Vérifier votre URI MongoDB dans Dokploy

L'URI doit avoir ce format exact :
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

### 2. Points à vérifier

#### ✅ Le mot de passe
- **ATTENTION** : Si votre mot de passe contient des caractères spéciaux (`@`, `#`, `$`, etc.), vous devez les encoder
- Exemple : `P@ssw0rd!` devient `P%40ssw0rd%21`
- Utilisez un encodeur URL : https://www.urlencoder.org/

#### ✅ L'utilisateur
- Vérifiez dans MongoDB Atlas → Security → Database Access
- L'utilisateur doit avoir les permissions "Atlas Admin" ou "Read and write to any database"

#### ✅ L'accès réseau
- MongoDB Atlas → Security → Network Access
- Doit avoir "0.0.0.0/0 (Allow access from anywhere)"

#### ✅ Le nom du cluster
- Vérifiez que le nom du cluster dans l'URI correspond exactement
- Sensible à la casse !

### 3. Exemple d'URI correcte

**Mauvais** (mot de passe avec @ non encodé) :
```
mongodb+srv://ezia-preprod:P@ssw0rd!@cluster0.abc123.mongodb.net/ezia?retryWrites=true&w=majority
```

**Bon** (mot de passe encodé) :
```
mongodb+srv://ezia-preprod:P%40ssw0rd%21@cluster0.abc123.mongodb.net/ezia?retryWrites=true&w=majority
```

### 4. Tester la connexion

1. Dans Dokploy, mettez à jour MONGODB_URI avec l'URI corrigée
2. Redéployez l'application
3. Dans les logs, vous devriez voir :
   ```
   ✅ MongoDB connected successfully
   ```

### 5. Si ça ne fonctionne toujours pas

1. **Recréer l'utilisateur MongoDB** :
   - Supprimez l'utilisateur actuel dans MongoDB Atlas
   - Créez-en un nouveau avec un mot de passe SANS caractères spéciaux
   - Exemple : `EziaPreprod2024SecurePass`

2. **Vérifier le statut du cluster** :
   - Le cluster doit être "Running" (pas en pause)
   - MongoDB Atlas met en pause les clusters inactifs après 7 jours

3. **Utiliser la connection string legacy** :
   Au lieu de `mongodb+srv://`, essayez avec `mongodb://` :
   ```
   mongodb://ezia-preprod:password@shard1.abc123.mongodb.net:27017,shard2.abc123.mongodb.net:27017,shard3.abc123.mongodb.net:27017/ezia?ssl=true&replicaSet=atlas-xyz&authSource=admin&retryWrites=true&w=majority
   ```

## Alternative temporaire

Si MongoDB pose trop de problèmes, l'application continuera à fonctionner avec la base de données en mémoire, mais les données seront perdues à chaque redéploiement.