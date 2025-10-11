#!/bin/bash
# Script pour créer .env.production sur le serveur de production
# À exécuter sur le serveur Dokploy via SSH

cat > .env.production << 'EOF'
# Configuration Ezia Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ezia.ai

# MongoDB - Remplacer par votre URI MongoDB
MONGODB_URI=VOTRE_MONGODB_URI_ICI

# HuggingFace - Remplacer par vos tokens
HF_TOKEN=VOTRE_TOKEN_HUGGINGFACE_ICI
DEFAULT_HF_TOKEN=VOTRE_TOKEN_HUGGINGFACE_ICI

# Mistral AI - Remplacer par votre clé API
MISTRAL_API_KEY=VOTRE_CLE_MISTRAL_ICI

# Auth
JWT_SECRET=ezia-secret-key-2024-secure-random-string-change-this-in-production
NEXTAUTH_SECRET=ezia-nextauth-secret-2024-random-string-change-this-in-production

# Feature Flags
DISABLE_ECOSYSTEM_FEATURE=true
NEXT_PUBLIC_DISABLE_ECOSYSTEM_FEATURE=true

# ========================================
# BREVO EMAIL SERVICE (CRITIQUE) - Remplacer par vos clés Brevo
# ========================================
BREVO_API_KEY=VOTRE_CLE_API_BREVO_ICI
BREVO_LIST_ID_STARTUP=3
BREVO_LIST_ID_ENTERPRISE=4
BREVO_TEMPLATE_WAITLIST_STARTUP=id-template-1
BREVO_TEMPLATE_WAITLIST_ENTERPRISE=id-template-2
BREVO_SENDER_EMAIL=noreply@ezia.ai
ADMIN_NOTIFICATION_EMAIL=votre-email@example.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T9XL833P0F

# HuggingFace Spaces
DEEPSITE_HF_URL=https://huggingface.co/spaces
DEEPSITE_SPACE_ID=hmorales/deepsite-v2

# Next.js Config
NEXT_APP_API_URL=https://api-inference.huggingface.co
NEXT_TELEMETRY_DISABLED=1

# Quotas
FREE_MONTHLY_WEBSITES=1
FREE_MONTHLY_ANALYSES=5
FREE_MONTHLY_CONVERSATIONS=50

# Redirect
NEXT_PUBLIC_REDIRECT_URL=https://ezia.ai/auth/callback
EOF

echo "✅ Fichier .env.production créé avec succès"
echo "🔄 Redémarrez l'application Dokploy maintenant"
