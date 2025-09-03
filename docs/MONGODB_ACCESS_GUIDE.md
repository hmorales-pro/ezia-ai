# Guide d'accès aux données MongoDB

## 1. Accès via MongoDB Atlas (Interface Web)

### Connexion
1. Va sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Connecte-toi avec tes identifiants
3. Sélectionne ton cluster (probablement "Cluster0")

### Consulter les données
1. Clique sur **"Browse Collections"** dans ton cluster
2. Sélectionne la base de données `ezia`
3. Clique sur la collection `waitlists`
4. Tu verras toutes les inscriptions avec options de :
   - Filtrer par champs
   - Trier les résultats
   - Exporter en JSON/CSV

### Filtres utiles
```javascript
// Voir uniquement les startups
{ "listType": "startup" }

// Voir uniquement les entreprises  
{ "listType": "enterprise" }

// Chercher par email
{ "email": "exemple@email.com" }

// Voir les dernières inscriptions
Sort by: { "createdAt": -1 }
```

## 2. Accès via MongoDB Compass (Application Desktop)

### Installation
1. Télécharge [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Installe l'application

### Connexion
1. Récupère ton URI de connexion depuis `.env.local` :
   ```
   mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia?retryWrites=true&w=majority
   ```
2. Colle l'URI dans Compass
3. Clique sur "Connect"

### Avantages de Compass
- Interface graphique intuitive
- Création facile de requêtes
- Visualisation des données
- Export CSV/JSON en un clic
- Analyse des performances

## 3. Accès via Terminal (MongoDB Shell)

### Installation
```bash
# macOS
brew install mongosh

# ou télécharge depuis
# https://www.mongodb.com/try/download/shell
```

### Connexion et requêtes
```bash
# Connexion
mongosh "mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia"

# Une fois connecté
use ezia

# Voir toutes les inscriptions
db.waitlists.find()

# Compter les inscriptions
db.waitlists.countDocuments()

# Filtrer par type
db.waitlists.find({ listType: "enterprise" })

# Voir les 10 dernières inscriptions
db.waitlists.find().sort({ createdAt: -1 }).limit(10)

# Exporter en JSON
db.waitlists.find().forEach(printjson)
```

## 4. Script Node.js pour extraction

Crée un fichier `extract-waitlist.js` :

```javascript
const mongoose = require('mongoose');

// URI de connexion
const MONGODB_URI = 'mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia?retryWrites=true&w=majority';

// Schema simplifié
const waitlistSchema = new mongoose.Schema({}, { strict: false });
const Waitlist = mongoose.model('Waitlist', waitlistSchema);

async function extractData() {
  try {
    // Connexion
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupérer toutes les données
    const allData = await Waitlist.find({}).lean();
    console.log(`Total inscriptions: ${allData.length}`);

    // Séparer par type
    const startups = allData.filter(d => d.listType === 'startup');
    const enterprises = allData.filter(d => d.listType === 'enterprise');

    console.log(`Startups: ${startups.length}`);
    console.log(`Enterprises: ${enterprises.length}`);

    // Exporter en JSON
    const fs = require('fs');
    fs.writeFileSync('waitlist-export.json', JSON.stringify(allData, null, 2));
    console.log('Données exportées dans waitlist-export.json');

    // Créer un CSV
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: 'waitlist-export.csv',
      header: [
        {id: 'name', title: 'Nom'},
        {id: 'email', title: 'Email'},
        {id: 'company', title: 'Entreprise'},
        {id: 'listType', title: 'Type'},
        {id: 'position', title: 'Position'},
        {id: 'createdAt', title: 'Date inscription'}
      ]
    });

    await csvWriter.writeRecords(allData);
    console.log('CSV créé: waitlist-export.csv');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

extractData();
```

Puis exécute :
```bash
npm install mongoose csv-writer
node extract-waitlist.js
```

## 5. Tutoriels recommandés

### Vidéos YouTube
1. **[MongoDB Crash Course](https://www.youtube.com/watch?v=ofme2o29ngU)** - Traversy Media
   - Parfait pour débuter
   - Couvre Atlas et Compass

2. **[MongoDB Atlas Tutorial](https://www.youtube.com/watch?v=bBA9rUdqmgY)** - MongoDB officiel
   - Focus sur l'interface web
   - Export et analyse de données

### Documentation officielle
1. **[MongoDB Atlas Getting Started](https://www.mongodb.com/docs/atlas/getting-started/)**
   - Guide complet d'Atlas
   - Inclut la gestion des données

2. **[MongoDB Compass Documentation](https://www.mongodb.com/docs/compass/current/)**
   - Tout sur l'utilisation de Compass
   - Requêtes visuelles

3. **[MongoDB Query Tutorial](https://www.mongodb.com/docs/manual/tutorial/query-documents/)**
   - Syntaxe des requêtes
   - Exemples pratiques

## 6. Requêtes utiles pour ton cas

```javascript
// Dans Atlas ou Compass, utilise ces filtres :

// 1. Voir les inscriptions des 7 derniers jours
{
  "createdAt": {
    "$gte": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
}

// 2. Chercher par domaine email
{
  "email": { "$regex": "@gmail.com$" }
}

// 3. Statistiques par secteur (entreprises)
[
  { "$match": { "listType": "enterprise" } },
  { "$group": {
    "_id": "$industry",
    "count": { "$sum": 1 }
  }}
]

// 4. Top 10 des outils les plus utilisés
[
  { "$match": { "listType": "enterprise" } },
  { "$unwind": "$currentTools" },
  { "$group": {
    "_id": "$currentTools",
    "count": { "$sum": 1 }
  }},
  { "$sort": { "count": -1 } },
  { "$limit": 10 }
]
```

## 7. Sécurité

⚠️ **Important** :
- Ne partage jamais ton URI de connexion MongoDB
- Utilise des utilisateurs avec permissions limitées en production
- Active l'authentification à deux facteurs sur Atlas
- Configure les IP autorisées dans Atlas Network Access

## Conseil

Pour débuter rapidement, je recommande :
1. **MongoDB Atlas** (interface web) pour consulter rapidement
2. **MongoDB Compass** pour des analyses plus poussées
3. Un script Node.js pour des exports automatisés

L'interface Atlas est la plus simple pour voir tes données immédiatement sans rien installer.