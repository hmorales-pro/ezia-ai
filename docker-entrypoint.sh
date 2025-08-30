#!/bin/sh
# Entrypoint compatible avec Alpine Linux (sh au lieu de bash)

echo "🚀 Starting Ezia..."
echo "📦 Node version: $(node --version)"
echo "📦 pnpm version: $(pnpm --version)"
echo "🌍 NODE_ENV: ${NODE_ENV}"

# S'assurer que nous sommes en mode production
export NODE_ENV=production

# Démarrer l'application
exec pnpm start