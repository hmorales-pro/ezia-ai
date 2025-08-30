# ⚠️ URGENT - Fix Dokploy

## Le problème actuel

Les logs montrent que Dokploy exécute `npm run dev` au lieu du mode production !
- ❌ `webpack.hot-update` = mode développement
- ❌ `Fast Refresh` = mode développement
- ❌ `@import "tailwindcss"` = CSS non corrigé

## Solution immédiate

### 1. Dans Dokploy, utilisez :
```
docker-compose.force-production.yml
```

### 2. IMPORTANT : Vérifiez dans Dokploy

⚠️ **Dokploy ne doit PAS avoir de "command" configuré !**

Si Dokploy a une section comme :
```
command: npm run dev
```
**SUPPRIMEZ-LA !**

### 3. Le nouveau système :

1. `Dockerfile.force-production` force le build de production
2. `entrypoint.sh` corrige le CSS au démarrage
3. Lance `node server.js` (pas npm run dev)

### 4. Vérification

Dans les logs Dokploy, vous devez voir :
```
🔧 Fixing CSS for production...
✅ CSS fixed!
🚀 Starting production server...
```

Et PAS :
- ❌ "next dev"
- ❌ "webpack.hot-update"
- ❌ "Fast Refresh"

## Si ça ne marche toujours pas

Dokploy override peut-être la commande. Dans ce cas :
1. Vérifiez les paramètres Dokploy
2. Supprimez toute "command" custom
3. Laissez le Dockerfile gérer le démarrage