#!/bin/bash

# Script de déploiement pour HuggingFace Spaces
# Usage: ./scripts/deploy-huggingface.sh [username] [space-name]

set -e

# Configuration
HF_USERNAME=${1:-"hmorales"}
SPACE_NAME=${2:-"ezia"}
SPACE_URL="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"

echo "🚀 Déploiement vers HuggingFace Spaces"
echo "Space: $SPACE_URL"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Créer une copie temporaire pour le déploiement
echo "📦 Préparation des fichiers..."
TEMP_DIR=$(mktemp -d)
cp -r . "$TEMP_DIR"
cd "$TEMP_DIR"

# Utiliser le Dockerfile HuggingFace
if [ -f "Dockerfile.huggingface" ]; then
    echo "📋 Utilisation du Dockerfile HuggingFace..."
    cp Dockerfile.huggingface Dockerfile
fi

# Utiliser la config Next.js HuggingFace
if [ -f "next.config.huggingface.ts" ]; then
    echo "⚙️ Configuration Next.js pour HuggingFace..."
    cp next.config.huggingface.ts next.config.ts
fi

# Copier le README HuggingFace
if [ -f "README-HUGGINGFACE.md" ]; then
    echo "📄 Configuration du README pour HuggingFace Spaces..."
    cp README-HUGGINGFACE.md README.md
fi

# Nettoyer les fichiers non nécessaires
echo "🧹 Nettoyage des fichiers non nécessaires..."
rm -rf .git
rm -rf node_modules
rm -rf .next
rm -rf .data
rm -f .env*
rm -rf scripts
rm -rf nginx
rm -f docker-compose*
rm -f Dockerfile.dokploy
rm -f Dockerfile.huggingface
rm -f README-*.md

# Initialiser un nouveau repo git
echo "🔄 Initialisation du repository git..."
git init
git add .
git commit -m "Deploy to HuggingFace Spaces"

# Ajouter le remote HuggingFace
echo "🔗 Configuration du remote HuggingFace..."
git remote add hf "https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"

# Push vers HuggingFace
echo "📤 Push vers HuggingFace Spaces..."
echo ""
echo "⚠️  Vous allez être invité à entrer vos identifiants HuggingFace"
echo "   Username: votre nom d'utilisateur HuggingFace"
echo "   Password: un token avec permissions 'write'"
echo ""
git push -f hf main

# Nettoyer
cd ..
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📌 Prochaines étapes:"
echo "1. Allez sur $SPACE_URL/settings"
echo "2. Ajoutez les variables d'environnement suivantes dans la section 'Repository secrets':"
echo "   - MONGODB_URI"
echo "   - HF_TOKEN"
echo "   - DEFAULT_HF_TOKEN" 
echo "   - MISTRAL_API_KEY"
echo "   - JWT_SECRET"
echo "   - NEXTAUTH_SECRET"
echo "   - BREVO_API_KEY (optionnel)"
echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID (optionnel)"
echo ""
echo "3. Le Space devrait automatiquement rebuilder après l'ajout des secrets"
echo "4. Vérifiez les logs si le build échoue"
echo ""
echo "🔗 URL du Space: $SPACE_URL"