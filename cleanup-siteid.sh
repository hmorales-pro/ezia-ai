#!/bin/bash

# Script pour supprimer tous les dossiers [siteId]

echo "Suppression des dossiers [siteId]..."

# Supprimer le dossier principal [siteId]
if [ -d "/Users/hugomorales/ezia36/app/sites/[siteId]" ]; then
    rm -rf "/Users/hugomorales/ezia36/app/sites/[siteId]"
    echo "✓ Supprimé: app/sites/[siteId]"
fi

# Supprimer le dossier public [siteId]
if [ -d "/Users/hugomorales/ezia36/app/sites/public/[siteId]" ]; then
    rm -rf "/Users/hugomorales/ezia36/app/sites/public/[siteId]"
    echo "✓ Supprimé: app/sites/public/[siteId]"
fi

# Supprimer le dossier API [siteId]
if [ -d "/Users/hugomorales/ezia36/app/api/sites/public/[siteId]" ]; then
    rm -rf "/Users/hugomorales/ezia36/app/api/sites/public/[siteId]"
    echo "✓ Supprimé: app/api/sites/public/[siteId]"
fi

echo "Nettoyage terminé!"