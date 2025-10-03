# Guide de Test du Générateur de Sites Web Propriétaire

## 🚀 Méthodes de Test

### Méthode 1 : Test avec le Script Automatisé (Recommandé)

#### Prérequis
- Node.js installé
- Serveur de développement démarré (`npm run dev`)
- Accès à l'API

#### Étapes

1. **Démarrer le serveur**
```bash
npm run dev
```

2. **Exécuter le script de test**
```bash
node scripts/test-site-generator.js
```

3. **Vérifier les résultats**
- Les fichiers HTML générés seront dans `test-output/`
- Le script affiche un rapport détaillé dans la console

#### Exemple de sortie attendue
```
🚀 Démarrage des tests du générateur de sites...

📋 Test: Restaurant Français
📝 Prompt: Restaurant gastronomique français à Paris...
✅ Succès!
📊 Site ID: site_123456_abc123
📄 Titre: Le Gourmet Parisien
🎨 Thème: Restaurant Élégant
📐 Pages: 1
⏱️  Temps de génération: 4500ms
🔄 Événements: 8
📦 Taille HTML: 45KB
🔍 Validation HTML:
   - DOCTYPE: ✅
   - Head: ✅
   - Body: ✅
   - Title: ✅
💾 HTML sauvegardé: test-restaurant-français.html
📈 Événements de génération:
   1. phase_start - 2024-01-15T10:30:00.000Z
   2. theme - 2024-01-15T10:30:01.200Z
   3. phase_complete - 2024-01-15T10:30:01.200Z
   ...
─────────────────────────────────────────────────────────────
🏁 Tests terminés!
```

### Méthode 2 : Test Manuel avec cURL

#### Test simple
```bash
curl -X POST http://localhost:3000/api/test-site-generator \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Restaurant français traditionnel à Paris",
    "businessInfo": {
      "industry": "Restaurant",
      "tone": "Élégant"
    }
  }'
```

#### Test avec couleurs personnalisées
```bash
curl -X POST http://localhost:3000/api/test-site-generator \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Startup tech SaaS pour la gestion de projets",
    "businessInfo": {
      "industry": "Technology",
      "tone": "Moderne",
      "colors": {
        "primary": "#6366F1",
        "secondary": "#4F46E5",
        "accent": "#A5B4FC"
      }
    }
  }'
```

### Méthode 3 : Test via l'Interface Web

#### 1. Créer une page de test
```bash
# Créer un fichier de test
echo '<!DOCTYPE html>
<html>
<head>
    <title>Test Site Generator</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Test du Générateur de Sites</h1>
    
    <div>
        <label>Description du business:</label>
        <textarea id="prompt">Restaurant gastronomique français à Paris</textarea>
    </div>
    
    <div>
        <label>Industrie:</label>
        <input type="text" id="industry" value="Restaurant">
    </div>
    
    <div>
        <label>Ton:</label>
        <input type="text" id="tone" value="Élégant">
    </div>
    
    <button onclick="testGenerator()">Tester</button>
    
    <div id="result"></div>
    
    <script>
        async function testGenerator() {
            const prompt = document.getElementById("prompt").value;
            const industry = document.getElementById("industry").value;
            const tone = document.getElementById("tone").value;
            
            const response = await fetch("/api/test-site-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    businessInfo: { industry, tone }
                })
            });
            
            const result = await response.json();
            const resultDiv = document.getElementById("result");
            
            if (result.ok) {
                resultDiv.innerHTML = `
                    <h2>✅ Succès!</h2>
                    <p><strong>Titre:</strong> ${result.site.title}</p>
                    <p><strong>Thème:</strong> ${result.site.theme}</p>
                    <p><strong>Temps:</strong> ${result.generationTime}ms</p>
                    <p><strong>HTML:</strong> ${Math.round(result.html.length / 1024)}KB</p>
                    <h3>HTML généré:</h3>
                    <pre><code>${result.html}</code></pre>
                `;
            } else {
                resultDiv.innerHTML = `<h2>❌ Erreur:</h2><p>${result.error}</p>`;
            }
        }
    </script>
</body>
</html>' > test-site-generator.html
```

#### 2. Ouvrir la page de test
```bash
# Ouvrir dans votre navigateur
open test-site-generator.html
```

### Méthode 4 : Test via Postman (ou outil similaire)

#### Configuration
- **URL**: `http://localhost:3000/api/test-site-generator`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Body (JSON)
```json
{
  "prompt": "Agence de marketing digital créative",
  "businessInfo": {
    "industry": "Marketing",
    "tone": "Créatif",
    "keywords": ["branding", "communication", "digital"],
    "colors": {
      "primary": "#0EA5E9",
      "secondary": "#0284C7",
      "accent": "#E0F2FE"
    }
  }
}
```

## 🔍 Points de Validation

### 1. Validation Technique
- [ ] **Temps de réponse**: < 10 secondes
- [ ] **Code HTTP**: 200 OK
- [ ] **Structure JSON**: Valide
- [ ] **HTML généré**: Complet et valide
- [ ] **Événements streaming**: Tous présents

### 2. Validation du Contenu
- [ ] **Titre du site**: Pertinent et descriptif
- [ ] **Thème visuel**: Cohérent avec l'industrie
- [ ] **Couleurs**: Appliquées correctement
- [ ] **Typographie**: Lisible et adaptée
- [ ] **Structure**: Sections logiques

### 3. Validation HTML
- [ ] **DOCTYPE**: Présent
- [ ] **Balises sémantiques**: Utilisées correctement
- [ ] **Meta tags**: Présents
- [ ] **CSS**: Variables générées
- [ ] **Responsive**: Design mobile-friendly

### 4. Validation Fonctionnelle
- [ ] **Navigation**: Liens fonctionnels
- [ ] **Formulaires**: Structure correcte
- [ ] **Images**: Placeholders appropriés
- [ ] **Animations**: CSS fluides
- [ ] **Accessibilité**: ARIA labels

## 🐛 Dépannage

### Problèmes Courants

#### 1. Erreur 500 - Internal Server Error
```bash
# Vérifier les logs du serveur
npm run dev > server.log 2>&1
tail -f server.log
```

#### 2. Timeout
- Augmenter le timeout dans la configuration
- Vérifier la connexion à l'API IA
- Optimiser le prompt

#### 3. HTML vide ou incomplet
- Vérifier que l'IA génère du contenu valide
- Valider la structure du prompt
- Tester avec un prompt plus simple

#### 4. Problèmes de dépendances
```bash
# Réinstaller les dépendances
npm install
# ou
pnpm install
```

### Commandes Utiles

```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3000

# Tester l'endpoint de santé
curl http://localhost:3000/api/test-site-generator -X GET

# Nettoyer les fichiers de test
rm -rf test-output/

# Vérifier la version de Node
node --version
npm --version
```

## 📊 Critères de Succès

### Performance
- ⏱️ **Temps de génération**: < 8 secondes
- 📦 **Taille HTML**: < 100KB
- 🔄 **Nombre d'événements**: 6-10 événements

### Qualité
- 🎨 **Design cohérent**: Couleurs et typographie harmonieuses
- 📱 **Responsive**: Fonctionnel sur mobile et desktop
- 🔍 **SEO**: Meta tags et structure optimisés
- ♿ **Accessibilité**: Bonne structure sémantique

### Fonctionnalité
- 🧩 **Blocs variés**: Au moins 3-4 types de blocs
- 🎯 **Contenu pertinent**: Adapté au type de business
- 🎪 **Navigation**: Structure logique
- 📝 **Formulaire**: Contact fonctionnel

## 🎯 Prochaines Étapes

Une fois les tests validés :

1. **Intégrer** dans le chat Ezia
2. **Optimiser** les performances
3. **Ajouter** plus de blocs prédéfinis
4. **Implémenter** le système de templates
5. **Déployer** en production
