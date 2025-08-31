#!/bin/sh
# Script pour forcer le mode production sur Dokploy

echo "🚀 Forcer le démarrage en production..."

# Ignorer complètement la commande de Dokploy
export NODE_ENV=production

# Si on détecte "dev" dans les arguments, rediriger vers "start"
if echo "$@" | grep -q "dev"; then
    echo "⚠️  Mode dev détecté, redirection vers production..."
    exec pnpm start
else
    exec pnpm start
fi