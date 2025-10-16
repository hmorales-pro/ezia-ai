// Script d'initialisation MongoDB pour Docker
// Crée la base de données et un utilisateur de test

db = db.getSiblingDB('ezia');

// Créer un business de test
db.businesses.insertOne({
  user_id: 'test-user-123',
  business_id: 'TEST-DOCKER-001',
  name: 'Ezia Demo',
  description: 'L\'IA orchestratrice des tâches de l\'entrepreneur',
  industry: 'SaaS',
  stage: 'startup',

  market_analysis: {
    target_audience: 'Solopreneurs et entrepreneurs',
    value_proposition: 'Automatisation intelligente avec multi-agents IA',
    market_size: 'Marché en forte croissance',
    competitors: ['Zapier', 'Make', 'n8n'],
    opportunities: ['Automatisation IA', 'No-code', 'Multi-agents'],
    threats: ['Concurrence établie']
  },

  business_model: {
    type: 'saas',
    unique_selling_points: [
      'Orchestration multi-agents IA',
      'Automatisations no/low-code',
      'Hébergement en France',
      'Interface intuitive'
    ]
  },

  customer_insights: {
    ideal_customer_profile: 'Entrepreneurs solos ou TPE de 1-5 personnes',
    customer_pain_points: [
      'Manque de temps',
      'Trop de tâches répétitives',
      'Difficulté à automatiser sans coder'
    ],
    acquisition_channels: ['LinkedIn', 'Twitter/X', 'SEO']
  },

  social_media: {
    linkedin: 'ezia-ai',
    twitter: '@ezia_ai'
  },

  is_active: true,
  _createdAt: new Date(),
  _updatedAt: new Date()
});

print('✅ Business de test créé: TEST-DOCKER-001');

// Créer un index pour optimiser les requêtes
db.businesses.createIndex({ user_id: 1, business_id: 1 });
db.businesses.createIndex({ user_id: 1, is_active: 1 });

print('✅ Index créés sur la collection businesses');

// Créer les collections pour le contenu
db.createCollection('contentcalendars');
db.createCollection('generatedcontents');

db.contentcalendars.createIndex({ user_id: 1, business_id: 1 });
db.contentcalendars.createIndex({ calendar_id: 1 }, { unique: true });

db.generatedcontents.createIndex({ user_id: 1, business_id: 1 });
db.generatedcontents.createIndex({ calendar_id: 1, date: 1 });
db.generatedcontents.createIndex({ content_id: 1 }, { unique: true });

print('✅ Collections et index créés pour la génération de contenu');

print('🎉 Initialisation MongoDB terminée !');
