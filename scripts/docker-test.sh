#!/bin/bash

# Script de test pour l'API de génération de contenu via Docker
# Usage: ./scripts/docker-test.sh

set -e

echo "🐳 Ezia Docker - Test de génération de contenu"
echo "=============================================="

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
BUSINESS_ID="TEST-DOCKER-001"

# Fonction pour générer un token JWT
generate_token() {
    echo -e "${BLUE}📝 Génération du token JWT...${NC}"

    # Utiliser Node.js pour générer le token
    TOKEN=$(node -e "
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: 'test-user-123', email: 'test@ezia.ai' },
            process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
            { expiresIn: '1h' }
        );
        console.log(token);
    ")

    echo -e "${GREEN}✅ Token généré${NC}"
}

# Fonction pour attendre que le serveur soit prêt
wait_for_server() {
    echo -e "${BLUE}⏳ Attente du serveur...${NC}"

    for i in {1..30}; do
        if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Serveur prêt !${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
    done

    echo -e "${RED}❌ Le serveur n'a pas démarré${NC}"
    exit 1
}

# Test 1: Créer un calendrier éditorial
test_create_calendar() {
    echo ""
    echo -e "${BLUE}📅 Test 1: Création d'un calendrier éditorial${NC}"
    echo "--------------------------------------------"

    RESPONSE=$(curl -s -X POST "$BASE_URL/api/content/calendar/create" \
        -H "Content-Type: application/json" \
        -H "Cookie: ezia-auth-token=$TOKEN" \
        -d '{
            "business_id": "'"$BUSINESS_ID"'",
            "request": {
                "request_type": "content_calendar_create",
                "timeframe": {
                    "start_date": "2025-11-01",
                    "end_date": "2025-11-30"
                },
                "cadence": {
                    "days_per_week": 5
                },
                "pillars": [
                    { "name": "Éducation", "ratio": 0.4 },
                    { "name": "Autorité", "ratio": 0.25 },
                    { "name": "Produit", "ratio": 0.2 },
                    { "name": "Communauté", "ratio": 0.15 }
                ],
                "campaigns": [
                    {
                        "name": "Demo Ezia Q4",
                        "goal": "bookings",
                        "cta": "Réserve ta démo",
                        "landing_url": "https://ezia.ai/demo"
                    }
                ]
            },
            "platforms": [
                { "name": "LinkedIn", "post_length_hint": "120-180 mots" },
                { "name": "Twitter/X", "post_length_hint": "280-500 caractères" }
            ]
        }')

    # Extraire le calendar_id
    CALENDAR_ID=$(echo "$RESPONSE" | jq -r '.data.calendar_id // empty')

    if [ -z "$CALENDAR_ID" ]; then
        echo -e "${RED}❌ Échec de la création du calendrier${NC}"
        echo "$RESPONSE" | jq '.'
        return 1
    fi

    echo -e "${GREEN}✅ Calendrier créé: $CALENDAR_ID${NC}"

    # Afficher les statistiques
    TOTAL_DAYS=$(echo "$RESPONSE" | jq -r '.data.stats.total_days')
    POSITIONING=$(echo "$RESPONSE" | jq -r '.data.editorial_line.positioning_statement')

    echo -e "${YELLOW}📊 Total de jours planifiés: $TOTAL_DAYS${NC}"
    echo -e "${YELLOW}🎯 Positionnement: $POSITIONING${NC}"

    # Afficher la distribution des piliers
    echo -e "${YELLOW}📈 Distribution des piliers:${NC}"
    echo "$RESPONSE" | jq -r '.data.stats.pillar_distribution | to_entries[] | "  - \(.key): \(.value) posts"'
}

# Test 2: Récupérer le calendrier
test_get_calendar() {
    echo ""
    echo -e "${BLUE}📖 Test 2: Récupération du calendrier${NC}"
    echo "------------------------------------"

    RESPONSE=$(curl -s -X GET "$BASE_URL/api/content/calendar/$CALENDAR_ID" \
        -H "Cookie: ezia-auth-token=$TOKEN")

    STATUS=$(echo "$RESPONSE" | jq -r '.data.status // empty')

    if [ "$STATUS" != "active" ]; then
        echo -e "${RED}❌ Échec de la récupération${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Calendrier récupéré avec succès${NC}"

    # Afficher le premier jour du calendrier
    FIRST_DATE=$(echo "$RESPONSE" | jq -r '.data.calendar[0].date')
    FIRST_THEME=$(echo "$RESPONSE" | jq -r '.data.calendar[0].theme')

    echo -e "${YELLOW}📅 Premier jour: $FIRST_DATE${NC}"
    echo -e "${YELLOW}📝 Thème: $FIRST_THEME${NC}"
}

# Test 3: Générer du contenu quotidien
test_generate_content() {
    echo ""
    echo -e "${BLUE}✍️  Test 3: Génération de contenu quotidien${NC}"
    echo "----------------------------------------"

    # Récupérer la première date du calendrier
    FIRST_DATE=$(curl -s -X GET "$BASE_URL/api/content/calendar/$CALENDAR_ID" \
        -H "Cookie: ezia-auth-token=$TOKEN" | jq -r '.data.calendar[0].date')

    echo -e "${YELLOW}📅 Génération pour la date: $FIRST_DATE${NC}"

    RESPONSE=$(curl -s -X POST "$BASE_URL/api/content/daily/generate" \
        -H "Content-Type: application/json" \
        -H "Cookie: ezia-auth-token=$TOKEN" \
        -d '{
            "request": {
                "request_type": "daily_content_generate",
                "calendar_id": "'"$CALENDAR_ID"'",
                "date": "'"$FIRST_DATE"'",
                "platforms": ["LinkedIn"],
                "variants": 2,
                "tracking": {
                    "enable_utm": true
                }
            }
        }')

    CONTENT_ID=$(echo "$RESPONSE" | jq -r '.data.content_id // empty')

    if [ -z "$CONTENT_ID" ]; then
        echo -e "${RED}❌ Échec de la génération de contenu${NC}"
        echo "$RESPONSE" | jq '.'
        return 1
    fi

    echo -e "${GREEN}✅ Contenu généré: $CONTENT_ID${NC}"

    # Afficher les variantes
    echo ""
    echo -e "${YELLOW}📝 Variantes générées:${NC}"
    echo "$RESPONSE" | jq -r '.data.items[0].variants[] | "
\u001b[1m=== Variante \(.variant_id) ===\u001b[0m
\(.text)

📊 Métriques:
  - Respect du ton: \(.quality_metrics.tone_match)%
  - Risque hallucination: \(.quality_metrics.hallucination_risk)%
  - Potentiel engagement: \(.quality_metrics.engagement_potential)%

🏷️  Hashtags: \(.metadata.hashtags | join(", "))
📞 CTA: \(.metadata.cta)
"'
}

# Test 4: Vérifier MongoDB
test_mongodb() {
    echo ""
    echo -e "${BLUE}🗄️  Test 4: Vérification MongoDB${NC}"
    echo "-------------------------------"

    # Compter les documents dans MongoDB
    CALENDARS_COUNT=$(docker exec ezia-mongodb mongosh \
        --quiet \
        --username ezia \
        --password eziadev123 \
        --authenticationDatabase admin \
        ezia \
        --eval "db.contentcalendars.countDocuments()" 2>/dev/null || echo "0")

    CONTENTS_COUNT=$(docker exec ezia-mongodb mongosh \
        --quiet \
        --username ezia \
        --password eziadev123 \
        --authenticationDatabase admin \
        ezia \
        --eval "db.generatedcontents.countDocuments()" 2>/dev/null || echo "0")

    echo -e "${GREEN}✅ MongoDB connecté${NC}"
    echo -e "${YELLOW}📅 Calendriers: $CALENDARS_COUNT${NC}"
    echo -e "${YELLOW}📝 Contenus: $CONTENTS_COUNT${NC}"
}

# Fonction principale
main() {
    echo ""
    echo -e "${YELLOW}⚠️  Assurez-vous que Docker Compose est démarré:${NC}"
    echo -e "${YELLOW}   docker-compose -f docker-compose.dev.yml up -d${NC}"
    echo ""

    # Générer le token
    generate_token

    # Attendre que le serveur soit prêt
    wait_for_server

    # Exécuter les tests
    test_create_calendar || exit 1
    test_get_calendar || exit 1
    test_generate_content || exit 1
    test_mongodb || exit 1

    echo ""
    echo -e "${GREEN}🎉 Tous les tests sont passés avec succès !${NC}"
    echo ""
    echo -e "${BLUE}📊 Accès aux outils:${NC}"
    echo -e "  - Application: http://localhost:3000"
    echo -e "  - Mongo Express: http://localhost:8081 (admin / admin123)"
    echo ""
}

# Exécuter le script
main
