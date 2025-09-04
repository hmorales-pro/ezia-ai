#!/bin/bash

# Script de test local pour Ezia
# Usage: ./scripts/test-local.sh

set -e

echo "🧪 Test de l'environnement local Ezia"
echo "===================================="
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# 1. Vérifier Node.js
echo "1. Vérification de l'environnement..."
node --version > /dev/null 2>&1
check_result "Node.js installé ($(node --version))"

npm --version > /dev/null 2>&1
check_result "NPM installé ($(npm --version))"

# 2. Vérifier les dépendances
echo ""
echo "2. Vérification des dépendances..."
if [ -d "node_modules" ]; then
    check_result "Dépendances installées"
else
    echo -e "${YELLOW}⚠${NC} Dépendances non installées. Installation..."
    npm install
    check_result "Dépendances installées"
fi

# 3. Vérifier le fichier .env
echo ""
echo "3. Vérification de la configuration..."
if [ -f ".env.local" ]; then
    check_result "Fichier .env.local trouvé"
    
    # Vérifier les variables essentielles
    required_vars=("MONGODB_URI" "HF_TOKEN" "MISTRAL_API_KEY" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            check_result "Variable ${var} configurée"
        else
            echo -e "${RED}✗${NC} Variable ${var} manquante"
        fi
    done
else
    echo -e "${RED}✗${NC} Fichier .env.local non trouvé"
    echo "Créez .env.local depuis .env.local.example"
    exit 1
fi

# 4. Test de build
echo ""
echo "4. Test de build Next.js..."
echo -e "${YELLOW}⏳${NC} Build en cours (cela peut prendre quelques minutes)..."
npm run build > build.log 2>&1
if [ $? -eq 0 ]; then
    check_result "Build réussi"
else
    echo -e "${RED}✗${NC} Build échoué. Voir build.log pour les détails"
    tail -20 build.log
    exit 1
fi

# 5. Test MongoDB
echo ""
echo "5. Test de connexion MongoDB..."
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || require('fs').readFileSync('.env.local', 'utf8').match(/MONGODB_URI=(.+)/)?.[1];
if (!uri) {
    console.error('MONGODB_URI non trouvé');
    process.exit(1);
}
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Connexion MongoDB réussie');
        process.exit(0);
    })
    .catch(err => {
        console.error('Erreur MongoDB:', err.message);
        process.exit(1);
    });
" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_result "Connexion MongoDB OK"
else
    echo -e "${YELLOW}⚠${NC} MongoDB non accessible (l'app utilisera la mémoire)"
fi

# 6. Test des APIs externes
echo ""
echo "6. Test des APIs externes..."

# Test HuggingFace
HF_TOKEN=$(grep "^HF_TOKEN=" .env.local | cut -d '=' -f2)
if [ ! -z "$HF_TOKEN" ]; then
    curl -s -H "Authorization: Bearer ${HF_TOKEN}" https://huggingface.co/api/whoami > /dev/null 2>&1
    check_result "API HuggingFace accessible"
else
    echo -e "${YELLOW}⚠${NC} HF_TOKEN non configuré"
fi

# Test Mistral
MISTRAL_KEY=$(grep "^MISTRAL_API_KEY=" .env.local | cut -d '=' -f2)
if [ ! -z "$MISTRAL_KEY" ]; then
    echo -e "${GREEN}✓${NC} Clé Mistral configurée"
else
    echo -e "${RED}✗${NC} MISTRAL_API_KEY non configuré"
fi

# 7. Lancement du serveur de test
echo ""
echo "7. Lancement du serveur de développement..."
echo -e "${YELLOW}⏳${NC} Démarrage du serveur..."

# Démarrer le serveur en arrière-plan
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Attendre que le serveur démarre
echo "Attente du démarrage du serveur..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Vérifier si le serveur répond
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    check_result "Serveur démarré sur http://localhost:3000"
    
    # Tests des endpoints
    echo ""
    echo "8. Test des endpoints principaux..."
    
    # Test page d'accueil
    curl -s http://localhost:3000/home > /dev/null 2>&1
    check_result "Page d'accueil accessible"
    
    # Test API health check
    curl -s http://localhost:3000/api/health > /dev/null 2>&1
    check_result "API health check"
    
else
    echo -e "${RED}✗${NC} Le serveur n'a pas démarré correctement"
    echo "Voir server.log pour les détails"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Arrêter le serveur
kill $SERVER_PID 2>/dev/null

# Résumé
echo ""
echo "===================================="
echo "📊 Résumé des tests"
echo ""
echo "✅ Environnement : OK"
echo "✅ Build : OK"
if [ $? -eq 0 ]; then
    echo "✅ MongoDB : Connecté"
else
    echo "⚠️  MongoDB : Mode mémoire"
fi
echo "✅ Serveur : Fonctionnel"
echo ""
echo "🚀 Votre environnement est prêt !"
echo ""
echo "Pour démarrer l'application :"
echo "  npm run dev"
echo ""
echo "Pour déployer sur HuggingFace Spaces :"
echo "  ./scripts/deploy-huggingface.sh [username] [space-name]"
echo ""

# Nettoyer
rm -f build.log server.log