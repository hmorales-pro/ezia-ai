#!/bin/sh
# Script de démarrage pour Next.js standalone avec variables d'environnement

echo "🚀 Starting Ezia.ai..."

# Forcer le mode production
export NODE_ENV=production

# Charger les variables depuis .env.production s'il existe (volume monté)
if [ -f "/app/.env.production" ]; then
  echo "📄 Loading variables from /app/.env.production..."
  set -a
  . /app/.env.production
  set +a
  echo "✅ Variables loaded from .env.production"
fi

# Debug: Afficher quelles variables sont disponibles (sans valeurs sensibles)
echo "📋 Environment variables status:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - MONGODB_URI: $([ -n "$MONGODB_URI" ] && echo '✅' || echo '❌')"
echo "  - HF_TOKEN: $([ -n "$HF_TOKEN" ] && echo '✅' || echo '❌')"
echo "  - BREVO_API_KEY: $([ -n "$BREVO_API_KEY" ] && echo '✅' || echo '❌')"
echo "  - BREVO_SENDER_EMAIL: $([ -n "$BREVO_SENDER_EMAIL" ] && echo '✅' || echo '❌')"
echo "  - ADMIN_NOTIFICATION_EMAIL: $([ -n "$ADMIN_NOTIFICATION_EMAIL" ] && echo '✅' || echo '❌')"

# Exporter explicitement toutes les variables d'environnement
# pour qu'elles soient accessibles par Node.js
export MONGODB_URI
export HF_TOKEN
export DEFAULT_HF_TOKEN
export MISTRAL_API_KEY
export JWT_SECRET
export NEXTAUTH_SECRET
export BREVO_API_KEY
export BREVO_SENDER_EMAIL
export ADMIN_NOTIFICATION_EMAIL
export NEXT_PUBLIC_APP_URL
export NEXT_PUBLIC_GA_MEASUREMENT_ID

# Démarrer le serveur Next.js standalone
# Note: exec remplace le shell par Node.js, permettant à tini de gérer les signaux proprement
echo "🌐 Starting Next.js standalone server..."
echo "⚡ Using tini as init system to prevent zombie processes"
exec node server.js
