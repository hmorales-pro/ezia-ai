# Résolution du Problème de Sauvegarde des Sites Web avec MongoDB

## Analyse du Problème

Le système utilise MongoDB correctement, mais il y a deux modèles différents :
- `UserProject` : pour les sites web créés par Ezia (collection: `user_projects`)
- `Project` : ancien modèle (collection: `projects`)

Les routes utilisent le bon modèle `UserProject`, donc le problème pourrait être :

1. **MongoDB non configuré** dans `.env.local`
2. **Problème de connexion** à MongoDB
3. **Données dans la mauvaise collection**

## Solution

### 1. Vérifier la Configuration MongoDB

Assurez-vous que dans `.env.local` vous avez :
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia
```

### 2. Vérifier la Connexion

Le système devrait automatiquement :
- Utiliser MongoDB si `MONGODB_URI` est configuré
- Utiliser la mémoire/fichiers sinon

### 3. Débugger la Création de Site

Quand vous créez un site via Ezia :
1. La route `/api/ezia/create-website` est appelée
2. Elle utilise `UserProject.create()` ou `UserProject.findOneAndUpdate()`
3. Le site est sauvé dans la collection `user_projects`

### 4. Débugger la Récupération

Quand l'interface charge :
1. La route `/api/business/[businessId]/website` est appelée
2. Elle utilise `UserProject.findOne()` pour chercher le site
3. Le site devrait être trouvé s'il existe

## Points à Vérifier

1. **Console du navigateur** : Y a-t-il des erreurs 404 ou 500 ?
2. **Logs du serveur** : Les requêtes MongoDB réussissent-elles ?
3. **MongoDB Atlas** : Les données sont-elles dans la collection `user_projects` ?

## Test Rapide

Pour tester si MongoDB fonctionne, vous pouvez :
1. Créer un site web via Ezia
2. Vérifier dans les logs : `[DEMO] Site web créé pour ...`
3. Rafraîchir la page
4. Le site devrait apparaître

Si le site n'apparaît pas, vérifiez :
- Les logs d'erreur dans la console
- La connexion MongoDB
- Les données dans MongoDB Atlas