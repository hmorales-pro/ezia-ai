# 🧪 Guide de Test Local - API Génération de Contenu

## Prérequis

### 1. Variables d'environnement

Créez/modifiez `.env.local` à la racine du projet :

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ezia
# OU si vous utilisez MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezia

# Mistral AI (OBLIGATOIRE pour la génération)
MISTRAL_API_KEY=votre_cle_mistral_ici

# JWT Secret
JWT_SECRET=your-secret-key-for-dev

# HuggingFace (optionnel, pour fallback)
HF_TOKEN=votre_token_hf
```

### 2. Obtenir une clé Mistral API

1. Allez sur [console.mistral.ai](https://console.mistral.ai/)
2. Créez un compte / Connectez-vous
3. Allez dans **API Keys**
4. Créez une nouvelle clé
5. Copiez la clé dans `.env.local`

### 3. Démarrer le serveur

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 🔧 Test 1 : Créer un Business de test

Avant de tester la génération de contenu, vous devez avoir un business dans la base de données.

### Option A : Via l'interface Ezia

1. Connectez-vous à `http://localhost:3000`
2. Créez un nouveau business via l'interface
3. Notez le `business_id`

### Option B : Via script direct MongoDB

Créez un fichier `scripts/create-test-business.js` :

```javascript
// scripts/create-test-business.js
const { MongoClient } = require('mongodb');

async function createTestBusiness() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');

  try {
    await client.connect();
    const db = client.db('ezia');

    const testBusiness = {
      user_id: 'test-user-123',
      business_id: 'TEST-BUSINESS-001',
      name: 'GreenDesk',
      description: 'Fabricant de mobilier de bureau éco-responsable en bois local',
      industry: 'Mobilier durable',
      stage: 'startup',
      market_analysis: {
        target_audience: 'Entreprises soucieuses de leur impact environnemental',
        value_proposition: 'Bureaux 100% éco-conçus en bois français',
        market_size: 'Croissance du marché du mobilier durable',
        competitors: ['IKEA', 'Bureaux standards'],
        opportunities: ['Transition écologique', 'RSE des entreprises'],
        threats: ['Prix plus élevés']
      },
      business_model: {
        type: 'product',
        unique_selling_points: [
          'Bois 100% français certifié',
          'Zéro colle toxique',
          'Garantie 15 ans',
          'Traçabilité totale'
        ]
      },
      customer_insights: {
        ideal_customer_profile: 'DRH et dirigeants d\'entreprises de 20-200 employés',
        customer_pain_points: [
          'Impact environnemental du mobilier',
          'Qualité de l\'air au bureau',
          'Durabilité des produits'
        ]
      },
      social_media: {
        linkedin: 'greendesk-fr',
        instagram: '@greendesk_fr'
      },
      is_active: true,
      _createdAt: new Date(),
      _updatedAt: new Date()
    };

    const result = await db.collection('businesses').insertOne(testBusiness);
    console.log('✅ Business de test créé:', result.insertedId);
    console.log('📋 business_id:', testBusiness.business_id);
    console.log('👤 user_id:', testBusiness.user_id);

    return testBusiness;
  } finally {
    await client.close();
  }
}

createTestBusiness().catch(console.error);
```

Exécutez :
```bash
node scripts/create-test-business.js
```

---

## 🧪 Test 2 : Créer un token JWT de test

Pour les tests API, vous avez besoin d'un token d'authentification.

### Script de génération de token

Créez `scripts/generate-test-token.js` :

```javascript
// scripts/generate-test-token.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-dev';

const token = jwt.sign(
  {
    userId: 'test-user-123',
    email: 'test@ezia.ai'
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('🔑 Token JWT généré:');
console.log(token);
console.log('\n💡 Utilisez ce token dans vos requêtes HTTP:');
console.log('Cookie: ezia-auth-token=' + token);
```

Exécutez :
```bash
node scripts/generate-test-token.js
```

Copiez le token généré.

---

## 📡 Test 3 : Test avec cURL

### 3.1 Créer un calendrier éditorial

```bash
# Remplacez YOUR_TOKEN par le token généré
curl -X POST http://localhost:3000/api/content/calendar/create \
  -H "Content-Type: application/json" \
  -H "Cookie: ezia-auth-token=YOUR_TOKEN" \
  -d '{
    "business_id": "TEST-BUSINESS-001",
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
          "name": "Demo GreenDesk Q4",
          "goal": "bookings",
          "cta": "Découvrez nos bureaux éco-responsables",
          "landing_url": "https://greendesk.fr/demo"
        }
      ]
    },
    "platforms": [
      { "name": "LinkedIn", "post_length_hint": "120-180 mots" },
      { "name": "Twitter/X", "post_length_hint": "280-500 caractères" },
      { "name": "Facebook", "post_length_hint": "80-140 mots" }
    ],
    "advanced_options": {
      "ab_testing": { "enable": true, "split": 0.5 },
      "suggested_assets": {
        "enable": true,
        "fields": ["image_prompt", "b_roll_ideas"]
      }
    }
  }' | jq '.'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "calendar_id": "CAL-2025-11-TESTBUSI",
    "editorial_line": {
      "positioning_statement": "GreenDesk révolutionne...",
      "voice": ["bienveillant", "expert", "concret"],
      "key_themes": [...]
    },
    "calendar": [
      {
        "date": "2025-11-03",
        "theme": "Les 3 erreurs fatales...",
        "pillar": "Éducation",
        "platform_plans": [...]
      }
    ],
    "stats": {
      "total_days": 20,
      "pillar_distribution": {...}
    }
  }
}
```

**Notez le `calendar_id` pour les tests suivants !**

### 3.2 Récupérer le calendrier

```bash
curl -X GET http://localhost:3000/api/content/calendar/CAL-2025-11-TESTBUSI \
  -H "Cookie: ezia-auth-token=YOUR_TOKEN" | jq '.'
```

### 3.3 Générer du contenu quotidien

```bash
curl -X POST http://localhost:3000/api/content/daily/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: ezia-auth-token=YOUR_TOKEN" \
  -d '{
    "request": {
      "request_type": "daily_content_generate",
      "calendar_id": "CAL-2025-11-TESTBUSI",
      "date": "2025-11-03",
      "platforms": ["LinkedIn", "Twitter/X"],
      "variants": 2,
      "tracking": {
        "enable_utm": true
      }
    }
  }' | jq '.'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "content_id": "EZIA-20251103-LI-...",
    "items": [
      {
        "platform": "LinkedIn",
        "theme": "Les 3 erreurs fatales...",
        "variants": [
          {
            "variant_id": "A",
            "text": "🌿 Les 3 erreurs fatales en mobilier de bureau...",
            "metadata": {
              "cta": "Découvrez GreenDesk",
              "hashtags": ["#MobilierDurable", "#RSE"],
              "utm_params": {...}
            },
            "quality_metrics": {
              "tone_match": 92,
              "hallucination_risk": 3,
              "engagement_potential": 85
            }
          },
          {
            "variant_id": "B",
            "text": "💡 73% des entreprises ignorent...",
            ...
          }
        ],
        "suggested_assets": {
          "image_prompt": "Illustration moderne...",
          "b_roll_ideas": [...]
        }
      }
    ]
  }
}
```

---

## 🔬 Test 4 : Test avec Postman / Insomnia

### Collection Postman

Créez une collection avec ces requêtes :

**1. Setup - Variables d'environnement**
```
base_url: http://localhost:3000
auth_token: YOUR_JWT_TOKEN
business_id: TEST-BUSINESS-001
calendar_id: (sera rempli après création)
```

**2. POST Create Calendar**
- URL: `{{base_url}}/api/content/calendar/create`
- Headers: `Cookie: ezia-auth-token={{auth_token}}`
- Body: (voir exemple cURL ci-dessus)

**3. GET Retrieve Calendar**
- URL: `{{base_url}}/api/content/calendar/{{calendar_id}}`
- Headers: `Cookie: ezia-auth-token={{auth_token}}`

**4. POST Generate Daily Content**
- URL: `{{base_url}}/api/content/daily/generate`
- Headers: `Cookie: ezia-auth-token={{auth_token}}`
- Body: (voir exemple cURL ci-dessus)

**5. PATCH Update Publication Status**
- URL: `{{base_url}}/api/content/daily/{{content_id}}`
- Headers: `Cookie: ezia-auth-token={{auth_token}}`
- Body:
```json
{
  "platform": "LinkedIn",
  "publication_status": {
    "variant": "A",
    "status": "scheduled",
    "scheduled_at": "2025-11-03T09:00:00Z"
  }
}
```

---

## 🧩 Test 5 : Test avec un script Node.js

Créez `scripts/test-content-generation.js` :

```javascript
// scripts/test-content-generation.js
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-dev';

// Générer un token
const token = jwt.sign(
  { userId: 'test-user-123', email: 'test@ezia.ai' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function testContentGeneration() {
  console.log('🚀 Début des tests de génération de contenu\n');

  // 1. Créer un calendrier
  console.log('📅 Étape 1 : Création du calendrier éditorial...');
  const calendarResponse = await fetch(`${BASE_URL}/api/content/calendar/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ezia-auth-token=${token}`
    },
    body: JSON.stringify({
      business_id: 'TEST-BUSINESS-001',
      request: {
        request_type: 'content_calendar_create',
        timeframe: {
          start_date: '2025-11-01',
          end_date: '2025-11-30'
        },
        cadence: { days_per_week: 5 },
        pillars: [
          { name: 'Éducation', ratio: 0.4 },
          { name: 'Autorité', ratio: 0.25 },
          { name: 'Produit', ratio: 0.2 },
          { name: 'Communauté', ratio: 0.15 }
        ]
      },
      platforms: [
        { name: 'LinkedIn', post_length_hint: '120-180 mots' }
      ]
    })
  });

  const calendarData = await calendarResponse.json();

  if (!calendarData.success) {
    console.error('❌ Erreur création calendrier:', calendarData);
    return;
  }

  console.log('✅ Calendrier créé:', calendarData.data.calendar_id);
  console.log('📊 Statistiques:', calendarData.data.stats);
  console.log('📝 Ligne éditoriale:', calendarData.data.editorial_line.positioning_statement);
  console.log('📅 Nombre de jours planifiés:', calendarData.data.calendar.length);
  console.log('');

  const calendarId = calendarData.data.calendar_id;
  const firstDate = calendarData.data.calendar[0]?.date;

  if (!firstDate) {
    console.error('❌ Aucune date dans le calendrier');
    return;
  }

  // 2. Générer du contenu pour le premier jour
  console.log(`📝 Étape 2 : Génération de contenu pour le ${firstDate}...`);
  const contentResponse = await fetch(`${BASE_URL}/api/content/daily/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ezia-auth-token=${token}`
    },
    body: JSON.stringify({
      request: {
        request_type: 'daily_content_generate',
        calendar_id: calendarId,
        date: firstDate,
        platforms: ['LinkedIn'],
        variants: 2,
        tracking: { enable_utm: true }
      }
    })
  });

  const contentData = await contentResponse.json();

  if (!contentData.success) {
    console.error('❌ Erreur génération contenu:', contentData);
    return;
  }

  console.log('✅ Contenu généré:', contentData.data.content_id);
  console.log('📊 Statistiques:', contentData.data.stats);
  console.log('');

  // 3. Afficher les variantes générées
  contentData.data.items.forEach((item, i) => {
    console.log(`\n=== ${item.platform} - ${item.theme} ===\n`);

    item.variants.forEach((variant, j) => {
      console.log(`\n--- Variante ${variant.variant_id} ---`);
      console.log(variant.text);
      console.log('\n📈 Métriques de qualité:');
      console.log('  - Respect du ton:', variant.quality_metrics?.tone_match + '%');
      console.log('  - Risque hallucination:', variant.quality_metrics?.hallucination_risk + '%');
      console.log('  - Potentiel engagement:', variant.quality_metrics?.engagement_potential + '%');
      console.log('\n🏷️ Hashtags:', variant.metadata.hashtags?.join(', '));
      console.log('📞 CTA:', variant.metadata.cta);
    });

    if (item.suggested_assets) {
      console.log('\n🎨 Assets suggérés:');
      console.log('  - Image:', item.suggested_assets.image_prompt);
      if (item.suggested_assets.b_roll_ideas) {
        console.log('  - B-roll:', item.suggested_assets.b_roll_ideas.join(', '));
      }
    }
  });

  console.log('\n\n✅ Tests terminés avec succès !');
}

testContentGeneration().catch(console.error);
```

Exécutez :
```bash
node scripts/test-content-generation.js
```

---

## 🐛 Troubleshooting

### Erreur : "Unauthorized"

**Problème :** Token JWT invalide ou manquant

**Solution :**
```bash
# Regénérer un token
node scripts/generate-test-token.js

# Vérifier que le JWT_SECRET est identique dans .env.local et le script
```

### Erreur : "Business not found"

**Problème :** Le business n'existe pas dans MongoDB

**Solution :**
```bash
# Créer un business de test
node scripts/create-test-business.js

# OU vérifier dans MongoDB
mongosh
> use ezia
> db.businesses.find()
```

### Erreur : "Failed to generate from Mistral API"

**Problème :** Clé Mistral API invalide ou manquante

**Solution :**
```bash
# Vérifier .env.local
cat .env.local | grep MISTRAL

# Si manquant, ajouter :
echo "MISTRAL_API_KEY=votre_cle" >> .env.local

# Redémarrer le serveur
npm run dev
```

### Erreur : "MongoDB connection failed"

**Problème :** MongoDB non démarré ou URI incorrect

**Solution :**
```bash
# Si MongoDB local
brew services start mongodb-community
# OU
sudo systemctl start mongod

# Si MongoDB Atlas, vérifier MONGODB_URI dans .env.local
```

### Le contenu généré est générique (fallback)

**Problème :** Mistral API non appelée (pas de clé ou erreur)

**Vérification :**
```bash
# Regarder les logs du serveur
# Vous devriez voir :
# [EditorialStrategyAgent] Generating editorial calendar...
# [Mistral] Clé API détectée, appel à l'API Mistral

# Si vous voyez :
# [Mistral] Mode développement activé - Pas de clé API Mistral valide
# → Ajoutez MISTRAL_API_KEY dans .env.local
```

---

## 📊 Vérification dans MongoDB

```bash
# Connectez-vous à MongoDB
mongosh

# Sélectionnez la base de données
use ezia

# Vérifier les calendriers créés
db.contentcalendars.find().pretty()

# Vérifier le contenu généré
db.generatedcontents.find().pretty()

# Compter les documents
db.contentcalendars.countDocuments()
db.generatedcontents.countDocuments()

# Supprimer les données de test
db.contentcalendars.deleteMany({ user_id: 'test-user-123' })
db.generatedcontents.deleteMany({ user_id: 'test-user-123' })
```

---

## ✅ Checklist de test complet

- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Clé Mistral API valide obtenue
- [ ] MongoDB connecté et accessible
- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Business de test créé dans MongoDB
- [ ] Token JWT généré
- [ ] Test création calendrier (cURL/Postman)
- [ ] Calendrier sauvegardé dans MongoDB
- [ ] Test génération contenu quotidien
- [ ] Contenu avec variantes A/B généré
- [ ] Métriques de qualité présentes
- [ ] UTM params générés (si activé)
- [ ] Assets suggérés présents

---

## 📞 Aide supplémentaire

Si vous rencontrez des problèmes :

1. **Logs serveur** : Regardez la console où tourne `npm run dev`
2. **Logs MongoDB** : Vérifiez que les documents sont bien créés
3. **Network tab** : Dans le navigateur, inspectez les requêtes/réponses
4. **Variables d'env** : `console.log(process.env.MISTRAL_API_KEY)` dans une route API

---

Bons tests ! 🚀
