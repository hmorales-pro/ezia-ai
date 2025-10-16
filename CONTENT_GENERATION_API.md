# 📅 Ezia — API de Génération de Contenu

## Vue d'ensemble

Cette API permet de générer automatiquement des calendriers éditoriaux et du contenu quotidien pour les réseaux sociaux, en utilisant **MistralAI** comme moteur d'intelligence artificielle.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EZIA CONTENT GENERATION                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. EDITORIAL STRATEGY AGENT (Mistral)                       │
│     ├─ Analyse du business profile                           │
│     ├─ Génération ligne éditoriale                           │
│     └─ Création calendrier éditorial (1 mois)                │
│                                                               │
│  2. DAILY CONTENT AGENT (Mistral)                            │
│     ├─ Génération contenu par plateforme                     │
│     ├─ Variantes A/B/C pour testing                          │
│     ├─ Self-review qualité (tone, hallucination, engagement) │
│     └─ Suggestions d'assets visuels                          │
│                                                               │
│  3. STORAGE (MongoDB)                                         │
│     ├─ ContentCalendar: Calendriers éditoriaux               │
│     └─ GeneratedContent: Contenu quotidien généré            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage rapide

### Prérequis

1. Clé API MistralAI configurée dans `.env.local`:
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

2. MongoDB connecté et configuré

3. Business existant dans la base de données

### Exemple complet

```typescript
// 1. Créer un calendrier éditorial
const calendarResponse = await fetch('/api/content/calendar/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    business_id: 'BUSINESS-123',
    request: {
      request_type: 'content_calendar_create',
      timeframe: {
        start_date: '2025-11-01',
        end_date: '2025-11-30'
      },
      cadence: {
        days_per_week: 5
      },
      pillars: [
        { name: 'Éducation', ratio: 0.4 },
        { name: 'Autorité', ratio: 0.25 },
        { name: 'Produit', ratio: 0.2 },
        { name: 'Communauté', ratio: 0.15 }
      ],
      campaigns: [
        {
          name: 'Demo Ezia Q4',
          goal: 'bookings',
          cta: 'Réserve ta démo',
          landing_url: 'https://ezia.ai/demo'
        }
      ]
    },
    platforms: [
      { name: 'LinkedIn', post_length_hint: '120-180 mots' },
      { name: 'Twitter/X', post_length_hint: '280-500 caractères' }
    ]
  })
});

const { data: calendar } = await calendarResponse.json();
console.log('Calendar ID:', calendar.calendar_id);
console.log('Editorial Line:', calendar.editorial_line);
console.log('Total days:', calendar.stats.total_days);

// 2. Générer du contenu pour un jour spécifique
const contentResponse = await fetch('/api/content/daily/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request: {
      request_type: 'daily_content_generate',
      calendar_id: calendar.calendar_id,
      date: '2025-11-03',
      platforms: ['LinkedIn', 'Twitter/X'],
      variants: 2,
      tracking: {
        enable_utm: true
      }
    }
  })
});

const { data: content } = await contentResponse.json();
console.log('Content ID:', content.content_id);
console.log('Items generated:', content.items.length);

// 3. Récupérer et publier le contenu
content.items.forEach(item => {
  console.log(`\n=== ${item.platform} ===`);
  item.variants.forEach(variant => {
    console.log(`\nVariante ${variant.variant_id}:`);
    console.log(variant.text);
    console.log('Quality:', variant.quality_metrics);
  });
});
```

---

## 📚 Endpoints API

### 1. Calendrier Éditorial

#### POST `/api/content/calendar/create`

Crée un nouveau calendrier éditorial avec ligne éditoriale générée par MistralAI.

**Request Body:**
```json
{
  "business_id": "BUSINESS-123",
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
  ],
  "advanced_options": {
    "ab_testing": { "enable": true, "split": 0.5 },
    "suggested_assets": {
      "enable": true,
      "fields": ["image_prompt", "b_roll_ideas"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calendar_id": "CAL-2025-11-EZIA",
    "editorial_line": {
      "positioning_statement": "Ezia aide les solopreneurs...",
      "voice": ["bienveillant", "expert", "concret"],
      "key_themes": ["Automatisation", "Productivité", "IA"]
    },
    "calendar": [
      {
        "date": "2025-11-03",
        "theme": "Automatiser ses RDV + UTM",
        "pillar": "Éducation",
        "platform_plans": [
          {
            "platform": "LinkedIn",
            "objective": "reach",
            "cta": "Teste la démo Ezia"
          }
        ]
      }
    ],
    "stats": {
      "total_days": 20,
      "pillar_distribution": {
        "Éducation": 8,
        "Autorité": 5,
        "Produit": 4,
        "Communauté": 3
      }
    },
    "created_at": "2025-10-16T10:30:00.000Z"
  }
}
```

#### GET `/api/content/calendar/[calendarId]`

Récupère un calendrier éditorial existant.

**Response:**
```json
{
  "success": true,
  "data": {
    "calendar_id": "CAL-2025-11-EZIA",
    "business_id": "BUSINESS-123",
    "editorial_line": { ... },
    "calendar": [ ... ],
    "stats": {
      "total_days": 20,
      "upcoming_days": 15,
      "pillar_distribution": { ... },
      "is_active": true
    }
  }
}
```

#### PATCH `/api/content/calendar/[calendarId]`

Met à jour le statut d'un calendrier.

**Request Body:**
```json
{
  "status": "archived"
}
```

#### DELETE `/api/content/calendar/[calendarId]`

Archive un calendrier (soft delete).

---

### 2. Contenu Quotidien

#### POST `/api/content/daily/generate`

Génère du contenu quotidien pour une date spécifique.

**Request Body:**
```json
{
  "request": {
    "request_type": "daily_content_generate",
    "calendar_id": "CAL-2025-11-EZIA",
    "date": "2025-11-03",
    "platforms": ["LinkedIn", "Twitter/X", "Facebook"],
    "variants": 2,
    "tracking": {
      "enable_utm": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content_id": "EZIA-20251103-LI-ABC123",
    "calendar_id": "CAL-2025-11-EZIA",
    "date": "2025-11-03",
    "items": [
      {
        "platform": "LinkedIn",
        "pillar": "Éducation",
        "theme": "Automatiser ses RDV + UTM",
        "variants": [
          {
            "variant_id": "A",
            "text": "🎯 Vous perdez 2h/jour à gérer vos rendez-vous ?\n\nVoici la méthode en 3 étapes que j'utilise...",
            "metadata": {
              "cta": "Réserve ta démo Ezia",
              "hashtags": ["#Automatisation", "#Productivité"],
              "word_count": 150,
              "char_count": 897,
              "utm_params": {
                "utm_source": "linkedin",
                "utm_medium": "social",
                "utm_campaign": "demo_ezia_q4",
                "utm_content": "variant_a"
              }
            },
            "quality_metrics": {
              "tone_match": 92,
              "hallucination_risk": 3,
              "engagement_potential": 85
            }
          },
          {
            "variant_id": "B",
            "text": "💡 73% des entrepreneurs passent +10h/semaine sur l'admin.\n\nEt si vous automatisiez tout ça ?...",
            "metadata": { ... },
            "quality_metrics": { ... }
          }
        ],
        "suggested_assets": {
          "image_prompt": "Illustration moderne d'un calendrier automatisé avec des icônes de productivité",
          "b_roll_ideas": [
            "Capture d'écran de l'interface calendrier",
            "Animation du processus d'automatisation"
          ],
          "visual_style": "Moderne, minimaliste, couleurs brand Ezia"
        }
      }
    ],
    "stats": {
      "platforms": 3,
      "total_variants": 6,
      "average_quality": 87
    },
    "created_at": "2025-10-16T10:45:00.000Z"
  }
}
```

#### GET `/api/content/daily/[contentId]`

Récupère un contenu quotidien existant.

#### PATCH `/api/content/daily/[contentId]`

Met à jour le statut de publication d'un contenu.

**Request Body:**
```json
{
  "platform": "LinkedIn",
  "publication_status": {
    "variant": "A",
    "status": "published",
    "published_at": "2025-11-03T09:00:00.000Z"
  },
  "performance_metrics": {
    "variant": "A",
    "impressions": 1250,
    "engagement": 87,
    "clicks": 23,
    "conversions": 3
  }
}
```

#### DELETE `/api/content/daily/[contentId]`

Supprime un contenu quotidien.

---

## 🎨 Types TypeScript

Tous les types sont définis dans `/lib/types/content-generation.ts`:

```typescript
import {
  ContentCalendarCreateRequest,
  DailyContentGenerateRequest,
  BusinessProfile,
  ContentVariant,
  // ... autres types
} from '@/lib/types/content-generation';
```

---

## 🤖 Agents MistralAI

### Editorial Strategy Agent

Responsable de la création de la ligne éditoriale et du calendrier.

```typescript
import { editorialStrategyAgent } from '@/lib/agents/editorial-strategy-agent';

const response = await editorialStrategyAgent.generateEditorialCalendar(
  request,
  businessProfile
);
```

**Capacités:**
- Analyse du profil business
- Génération de positionnement stratégique
- Création de calendrier équilibré selon les piliers
- Adaptation aux campagnes marketing

### Daily Content Agent

Responsable de la génération de contenu quotidien avec variantes.

```typescript
import { dailyContentAgent } from '@/lib/agents/daily-content-agent';

const response = await dailyContentAgent.generateDailyContent(
  request,
  calendarDay,
  businessProfile
);
```

**Capacités:**
- Génération de 1-3 variantes par plateforme
- Adaptation au ton et style de la marque
- Self-review automatique (tone_match, hallucination_risk, engagement_potential)
- Suggestions d'assets visuels
- Génération de hashtags pertinents
- Support UTM tracking

---

## 📊 Modèles MongoDB

### ContentCalendar

Stocke les calendriers éditoriaux.

**Méthodes utiles:**
```typescript
// Vérifier si le calendrier est actif
calendar.isActive()

// Récupérer le contenu pour une date
calendar.getContentForDate('2025-11-03')

// Obtenir la distribution des piliers
calendar.getPillarDistribution()
```

### GeneratedContent

Stocke le contenu quotidien généré.

**Méthodes utiles:**
```typescript
// Récupérer le contenu pour une plateforme
content.getContentForPlatform('LinkedIn')

// Obtenir la meilleure variante
content.getBestVariant('LinkedIn')

// Mettre à jour le statut de publication
await content.updatePublicationStatus('LinkedIn', {
  variant: 'A',
  status: 'published',
  published_at: new Date()
})

// Vérifier si publié
content.isPublished('LinkedIn')
```

---

## 🔧 Configuration

### Variables d'environnement

```bash
# Obligatoire
MISTRAL_API_KEY=your_mistral_api_key

# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret
```

### Paramètres avancés

```typescript
// Options avancées dans la création de calendrier
{
  advanced_options: {
    // A/B Testing
    ab_testing: {
      enable: true,
      split: 0.5  // 50/50
    },

    // Repurposing cross-platform
    repurposing: {
      enable: true,
      from_platform: 'LinkedIn',
      to_platforms: ['Twitter/X', 'Facebook']
    },

    // Suggestions d'assets
    suggested_assets: {
      enable: true,
      fields: ['image_prompt', 'b_roll_ideas', 'visual_style']
    },

    // Termes interdits
    forbidden_terms: ['gratuit', 'meilleur du monde'],

    // Vérification de compliance
    compliance_check: true
  }
}
```

---

## 📈 Bonnes pratiques

### 1. Gestion des piliers

Les ratios doivent **toujours** sommer à 1.0:

```typescript
const pillars = [
  { name: 'Éducation', ratio: 0.4 },    // 40%
  { name: 'Autorité', ratio: 0.25 },    // 25%
  { name: 'Produit', ratio: 0.2 },      // 20%
  { name: 'Communauté', ratio: 0.15 }   // 15%
];
// Total = 1.0 ✅
```

### 2. Cadence recommandée

- **Solopreneur**: 3-5 jours/semaine
- **PME**: 5 jours/semaine
- **Grande entreprise**: 7 jours/semaine

### 3. Nombre de variantes

- **1 variante**: Génération rapide, pas d'A/B testing
- **2 variantes**: A/B testing optimal
- **3 variantes**: A/B/C testing avancé (coût API plus élevé)

### 4. Qualité du contenu

Les métriques de qualité sont automatiquement calculées:

- **tone_match** > 80: Excellent respect de la voix de la marque
- **hallucination_risk** < 10: Contenu fiable, pas d'inventions
- **engagement_potential** > 70: Fort potentiel d'engagement

### 5. Planification

```typescript
// Générer le calendrier à l'avance
const calendar = await createCalendar({ ... });

// Générer le contenu 1-2 jours avant publication
const content = await generateDailyContent({
  date: '2025-11-03',  // J-1 ou J-2
  variants: 2
});

// Publier au meilleur moment
await publishContent({
  platform: 'LinkedIn',
  variant: 'A',
  scheduled_at: '2025-11-03T09:00:00Z'  // 9h du matin
});
```

---

## 🐛 Gestion des erreurs

### Erreurs courantes

```typescript
// 400 - Validation échouée
{
  "error": "Invalid pillars: ratios must sum to 1.0"
}

// 401 - Non authentifié
{
  "error": "Unauthorized: No token provided"
}

// 404 - Ressource non trouvée
{
  "error": "Calendar not found"
}

// 500 - Erreur serveur
{
  "error": "Internal server error",
  "message": "Failed to generate content from Mistral API"
}
```

### Fallback automatique

Les agents ont des fallbacks intégrés:

1. **Mistral API échoue** → Génération basique fonctionnelle
2. **Parsing JSON échoue** → Structure minimale valide
3. **MongoDB indisponible** → Erreur claire avec retry suggestions

---

## 📞 Support et contribution

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation complète**: Voir `/docs/EZIA_PROJECT.md`
- **API Reference**: Ce fichier

---

© 2025 Ezia.ai — Documentation API Génération de Contenu v1.0.0
