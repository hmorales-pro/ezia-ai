# Guide Simple Déploiement Dokploy

## Configuration Dokploy

1. **Dans Dokploy, utilisez ces paramètres :**
   - Repository: `https://github.com/hmorales-pro/ezia-ai.git`
   - Branch: `main`
   - **Docker Compose Path: `docker-compose.production.yml`**

2. **Variables d'environnement à ajouter dans Dokploy :**
```env
MONGODB_URI=mongodb://votre-mongodb:27017/ezia
HF_TOKEN=hf_xxxxxxxxxxxxx
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxx
MISTRAL_API_KEY=votre-cle-mistral
JWT_SECRET=une-cle-secrete-longue
NEXTAUTH_SECRET=une-autre-cle-secrete
NEXT_PUBLIC_APP_URL=https://ezia.ai
```

3. **Déployez**

## Ce que fait le nouveau Dockerfile

1. **Corrige le CSS** - Remplace `@import "tailwindcss"` par les directives Tailwind classiques
2. **Supprime le middleware** - Évite les erreurs Edge Runtime
3. **Force la production** - Utilise `node server.js` au lieu de `npm run dev`
4. **Optimise l'image** - Multi-stage build avec user non-root

## Si ça ne marche toujours pas

Vérifiez dans les logs Dokploy que vous voyez :
- `NODE_ENV production` (pas development)
- `CMD ["node", "server.js"]` (pas npm run dev)
- Le build doit dire "Creating an optimized production build"

## Pourquoi ça marche

- Next.js 15 est déjà installé ✓
- Le CSS est réécrit pendant le build ✓
- On utilise le mode production standalone ✓
- Pas de middleware problématique ✓