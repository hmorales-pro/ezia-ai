#!/bin/sh
# Script pour forcer le démarrage en mode production sur Dokploy

# S'assurer que NODE_ENV est en production
export NODE_ENV=production

# Démarrer l'application en mode production
echo "Starting Ezia in production mode..."
exec pnpm start