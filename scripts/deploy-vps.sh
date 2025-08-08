#!/bin/bash
# Script de déploiement Ezia sur VPS avec Dokploy

set -e

echo "🚀 Déploiement Ezia sur VPS..."

# Vérifier les prérequis
command -v docker >/dev/null 2>&1 || { echo "❌ Docker n'est pas installé"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose n'est pas installé"; exit 1; }

# Vérifier le fichier .env.production
if [ ! -f .env.production ]; then
    echo "❌ Fichier .env.production manquant"
    echo "👉 Copiez .env.production.example vers .env.production et configurez-le"
    exit 1
fi

# Charger les variables d'environnement
export $(cat .env.production | grep -v '^#' | xargs)

# Pull les dernières modifications
echo "📥 Récupération des dernières modifications..."
git pull origin main

# Construire l'image Docker
echo "🔨 Construction de l'image Docker..."
docker-compose build --no-cache

# Arrêter les anciens conteneurs
echo "🛑 Arrêt des anciens conteneurs..."
docker-compose down

# Démarrer les nouveaux conteneurs
echo "🎯 Démarrage des nouveaux conteneurs..."
docker-compose up -d

# Attendre que l'application soit prête
echo "⏳ Attente du démarrage de l'application..."
sleep 10

# Vérifier la santé de l'application
echo "🏥 Vérification de la santé..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application démarrée avec succès!"
else
    echo "❌ L'application ne répond pas"
    echo "📋 Logs:"
    docker-compose logs --tail=50 ezia
    exit 1
fi

# Nettoyer les anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "🎉 Déploiement terminé avec succès!"
echo "👉 Accédez à votre application sur: ${NEXT_PUBLIC_APP_URL}"

# Afficher les conteneurs en cours
echo ""
echo "📦 Conteneurs actifs:"
docker-compose ps