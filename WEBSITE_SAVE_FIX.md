# Solution pour la Sauvegarde des Sites Web

## Problème Identifié

Les sites web sont créés mais ne sont pas retrouvés dans l'interface car :
1. **Deux systèmes de stockage différents** : MongoDB direct vs système unifié
2. **Deux modèles différents** : `UserProject` vs `Project`
3. **Incohérence des routes** : création vs récupération utilisent des systèmes différents

## Solution Immédiate

### Option 1 : Remplacer les Routes (Recommandé)

```bash
# Sauvegarder les anciennes routes
mv app/api/ezia/create-website/route.ts app/api/ezia/create-website/route.old.ts
mv app/api/business/[businessId]/website/route.ts app/api/business/[businessId]/website/route.old.ts

# Utiliser les nouvelles routes unifiées
mv app/api/ezia/create-website/route-unified.ts app/api/ezia/create-website/route.ts
mv app/api/business/[businessId]/website/route-unified.ts app/api/business/[businessId]/website/route.ts
```

### Option 2 : Patch Temporaire

Ajouter dans `lib/storage/unified-storage.ts` une synchronisation avec MongoDB si disponible.

## Test de la Solution

1. **Créer un site web** via l'interface Ezia
2. **Vérifier la sauvegarde** dans `.data/projects.json`
3. **Rafraîchir la page** et vérifier que le site apparaît
4. **Redémarrer le serveur** et vérifier la persistance

## Structure des Données Attendue

### Dans `.data/projects.json` :
```json
{
  "userId": [
    {
      "id": "project-xxx",
      "projectId": "project-xxx",
      "businessId": "bus_xxx",
      "name": "Site Web Business",
      "html": "...",
      "status": "published"
    }
  ]
}
```

### Dans `.data/businesses.json` :
```json
[
  {
    "business_id": "bus_xxx",
    "website_url": "https://...",
    "websiteGeneratedAt": "2025-08-21T..."
  }
]
```

## Commandes de Débogage

```bash
# Vérifier les projets sauvegardés
cat .data/projects.json | jq '.'

# Vérifier les businesses avec sites web
cat .data/businesses.json | jq '.[] | select(.website_url != null)'

# Tester la création
node test-website-creation.js
```