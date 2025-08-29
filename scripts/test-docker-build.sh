#!/bin/bash
# Script pour tester le build Docker en local

echo "🧹 Nettoyage des anciens builds..."
docker system prune -f

echo "📦 Test du build ultra-minimal..."
time docker build -f Dockerfile.ultra-minimal -t ezia-test . --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
    echo "📊 Taille de l'image:"
    docker images ezia-test --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    echo "🚀 Test de démarrage..."
    docker run --rm -d -p 3001:3000 --name ezia-test-run ezia-test
    sleep 5
    
    echo "🔍 Vérification du statut..."
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Application démarrée avec succès!"
    else
        echo "❌ L'application ne répond pas"
        docker logs ezia-test-run
    fi
    
    docker stop ezia-test-run
else
    echo "❌ Échec du build"
    exit 1
fi

echo "🎉 Test terminé!"