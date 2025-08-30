#!/bin/sh
# Entrypoint pour Dokploy qui gère le CSS et force le mode production

echo "🚀 Démarrage Ezia pour Dokploy..."

# Remplacer le CSS avec la version statique si en mode dev
if [ "$NODE_ENV" != "production" ] || [ -z "$NODE_ENV" ]; then
  echo "⚠️  Mode développement détecté, remplacement du CSS..."
  if [ -f "./app/global.static.css" ]; then
    cp ./app/global.static.css ./app/global.css
    echo "✅ CSS statique appliqué"
  fi
fi

# Si Dokploy force npm run dev, on intercepte et on lance en production
if [ "$1" = "npm" ] && [ "$2" = "run" ] && [ "$3" = "dev" ]; then
  echo "🔄 Redirection vers le mode production..."
  export NODE_ENV=production
  exec pnpm start
else
  # Sinon, exécuter la commande normale
  exec "$@"
fi