#!/bin/bash
# Script de build pour production avec gestion mémoire

echo "🔧 Build de production avec options optimisées..."

# Nettoyer les caches
rm -rf .next
rm -rf node_modules/.cache

# Variables d'environnement pour le build
export NODE_OPTIONS="--max-old-space-size=512"
export NEXT_TELEMETRY_DISABLED=1
export SKIP_ENV_VALIDATION=1
export MONGODB_URI="mongodb://localhost:27017/temp"

# Build avec gestion d'erreur
echo "📦 Lancement du build Next.js..."
npm run build || {
    echo "⚠️  Build échoué, tentative avec options réduites..."
    export NODE_OPTIONS="--max-old-space-size=256"
    npm run build || {
        echo "❌ Build impossible"
        exit 1
    }
}

echo "✅ Build terminé avec succès!"

# Nettoyer les fichiers inutiles
echo "🧹 Nettoyage des fichiers temporaires..."
find . -name "*.map" -delete
rm -rf .next/cache

echo "✨ Build de production prêt!"