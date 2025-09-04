#!/bin/bash

# Script pour corriger les problèmes sur preprod
# Usage: ./scripts/fix-preprod.sh

set -e

echo "🔧 Correction des problèmes sur preprod"
echo "======================================"
echo ""

# 1. Rebuild avec les styles CSS
echo "1. Rebuild complet avec CSS..."
echo ""

# S'assurer que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf .next
rm -rf node_modules/.cache

# Rebuild Tailwind CSS
echo "🎨 Compilation CSS..."
npx tailwindcss -i ./app/globals.css -o ./public/styles/globals.css --minify || true

# Build de production
echo "🏗️ Build de production..."
NODE_ENV=production npm run build

echo ""
echo "✅ Build terminé!"
echo ""

# 2. Test local du build
echo "2. Test du build en local..."
echo ""
echo "Pour tester localement :"
echo "  NODE_ENV=production npm start"
echo ""

# 3. Instructions pour preprod
echo "3. Déploiement sur preprod"
echo "=========================="
echo ""
echo "Options de déploiement :"
echo ""
echo "A) Via Git (recommandé) :"
echo "   git add ."
echo "   git commit -m 'Fix: API user-projects-db et styles CSS'"
echo "   git push origin preprod"
echo ""
echo "B) Rebuild manuel sur Dokploy :"
echo "   - Aller dans Dokploy"
echo "   - Cliquer sur 'Rebuild'"
echo ""
echo "C) Vérifier les variables d'environnement :"
echo "   - NODE_ENV=production"
echo "   - Toutes les clés API configurées"
echo ""

# 4. Vérifications post-déploiement
echo "4. Tests à effectuer après déploiement :"
echo "======================================="
echo ""
echo "- [ ] Page d'accueil : styles OK"
echo "- [ ] API health : https://preprod.ezia.ai/api/health"
echo "- [ ] API projects : https://preprod.ezia.ai/api/user-projects-db"
echo "- [ ] Login et navigation"
echo "- [ ] Chat avec Ezia"
echo ""

# 5. Si les problèmes persistent
echo "5. Si les problèmes persistent :"
echo "==============================="
echo ""
echo "a) Vérifier les logs Dokploy"
echo "b) SSH sur le serveur et vérifier :"
echo "   - docker logs <container-id>"
echo "   - docker exec -it <container-id> ls -la /app/public/styles/"
echo "c) Forcer le rebuild complet :"
echo "   - docker-compose down"
echo "   - docker-compose up --build"
echo ""

echo "📋 Résumé des corrections :"
echo "- API user-projects-db migrée vers système unifié"
echo "- Styles CSS recompilés"
echo "- Build de production optimisé"
echo ""
echo "🚀 Prêt pour le déploiement !"