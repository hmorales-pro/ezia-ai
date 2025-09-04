#!/bin/bash

# Script pour migrer l'API business-simple vers business-unified
# Ce script met à jour les références de l'ancienne API vers la nouvelle

echo "🔄 Migration de l'API business-simple vers business-unified"
echo "=========================================================="
echo ""

# Chercher toutes les références à l'ancienne API
echo "📍 Recherche des références à l'ancienne API..."
grep -r "api/me/business-simple" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ./app ./components ./lib 2>/dev/null | head -20

echo ""
echo "🔧 Remplacement des références..."

# Remplacer dans tous les fichiers
find ./app ./components ./lib -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak 's|api/me/business-simple|api/me/business-unified|g' {} \;

# Supprimer les fichiers de sauvegarde
find . -name "*.bak" -delete

echo "✅ Migration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifier que l'application fonctionne correctement"
echo "2. Tester la création d'un nouveau business"
echo "3. Vérifier que les analyses se terminent correctement"
echo "4. Supprimer l'ancienne API si tout fonctionne"
echo ""
echo "⚠️  Note: L'ancienne API business-simple est toujours présente"
echo "   Elle peut être supprimée après validation complète"