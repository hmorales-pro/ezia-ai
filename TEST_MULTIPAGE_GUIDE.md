# Guide de Test - Système Multipage avec Sous-domaines

## 🚀 Préparation

### 1. Démarrer le serveur de développement
```bash
npm run dev
```

### 2. Vérifier que vous êtes connecté
- Aller sur http://localhost:3000
- Si pas connecté, aller sur http://localhost:3000/auth

## 📝 Test 1 : Création d'un site multipage

### Étapes :
1. Aller sur **http://localhost:3000/multipage/create**
2. Remplir le formulaire :
   - **Nom de l'entreprise** : "Restaurant Le Gourmet"
   - **Description** : "Restaurant gastronomique français avec une cuisine raffinée et un service d'exception. Nous proposons également un service de traiteur pour vos événements."
   - **Secteur d'activité** : "Restauration"
   - **Public cible** : "Professionnels et familles"
   - **Pages à inclure** : Laisser les pages par défaut cochées
   - **Exigences personnalisées** : "Utiliser des couleurs chaudes et élégantes, avec des photos de plats"

3. Cliquer sur **"Créer le site multipage"**

### Résultat attendu :
- ✅ Redirection vers l'éditeur multipage
- ✅ Message de succès
- ✅ Affichage du sous-domaine (ex: `restaurant-le-gourmet.ezia.ai`)

## 🎨 Test 2 : Éditeur multipage

### Navigation entre pages
1. Dans l'éditeur, cliquer sur différentes pages dans la sidebar gauche
2. Vérifier que le contenu change dans la preview

### Modification d'une page
1. Sélectionner la page "Accueil"
2. Dans "Modifier cette page", taper : "Ajouter une section avec les horaires d'ouverture"
3. Cliquer sur **"Appliquer"**

### Résultat attendu :
- ✅ Indicateur de chargement pendant la modification
- ✅ Message de succès
- ✅ La preview se met à jour avec les horaires

## 🤖 Test 3 : Suggestions d'Ezia

### Analyser les besoins
1. Dans la sidebar, trouver la carte **"Assistant Ezia"**
2. Cliquer sur **"Analyser et suggérer des pages"**

### Résultat attendu :
- ✅ Ezia suggère des pages pertinentes :
  - Menu (Essentiel)
  - Réservation (Essentiel)
  - Galerie (Recommandé)
  - Blog (Optionnel)

### Ajouter une page suggérée
1. Cliquer sur **"Ajouter"** à côté de "Menu"
2. Attendre la génération

### Résultat attendu :
- ✅ Page ajoutée dans la liste
- ✅ Contenu généré automatiquement
- ✅ Navigation mise à jour

## 📄 Test 4 : Gestion des pages

### Ajouter une page manuellement
1. Cliquer sur **"Nouvelle page"** dans le navigateur de pages
2. Remplir :
   - Nom : "Événements"
   - URL : "evenements"
   - Titre SEO : "Événements et soirées spéciales"
3. Cliquer sur **"Ajouter"**

### Dupliquer une page
1. Cliquer sur l'icône de duplication à côté d'une page
2. Vérifier que la copie apparaît avec "(Copie)" dans le nom

### Supprimer une page
1. Cliquer sur l'icône poubelle d'une page (sauf Accueil)
2. Confirmer la suppression

## 🌐 Test 5 : Publication et sous-domaine

### Publier le site
1. Cliquer sur **"Publier le site"** dans l'header
2. Attendre la confirmation

### Vérifier le sous-domaine (en développement)
1. Le badge dans l'header affiche le sous-domaine
2. Cliquer sur **"Voir le site"** (apparaît après publication)

### Test local du sous-domaine
Pour tester localement, accéder à :
- http://localhost:3000/restaurant-le-gourmet (page d'accueil)
- http://localhost:3000/restaurant-le-gourmet/services
- http://localhost:3000/restaurant-le-gourmet/contact

## 🔍 Test 6 : Vérifications supplémentaires

### Responsive Design
1. Dans l'éditeur, utiliser les boutons Mobile/Tablette/Desktop
2. Vérifier que le site s'adapte correctement

### Code source
1. Cliquer sur **"Voir le code"**
2. Parcourir les onglets HTML/CSS/JS
3. Vérifier que le code global et spécifique sont présents

### Navigation du site publié
1. Sur le site publié, cliquer sur les liens de navigation
2. Vérifier que toutes les pages sont accessibles
3. Vérifier que le lien actif est mis en évidence

## 🐛 Dépannage

### Si la création échoue
```bash
# Vérifier les logs du serveur
# Regarder la console du navigateur (F12)
```

### Si l'IA ne répond pas
- Vérifier que le modèle est bien : `deepseek-ai/DeepSeek-V3-0324`
- Vérifier les tokens d'API dans `.env.local`

### Si le sous-domaine ne fonctionne pas
En développement, les sous-domaines sont simulés via les routes :
- `/[subdomain]` → Page d'accueil
- `/[subdomain]/[slug]` → Pages internes

## 📊 Checklist finale

- [ ] Site multipage créé avec succès
- [ ] Sous-domaine généré automatiquement
- [ ] Navigation entre pages fonctionnelle
- [ ] Modifications AI appliquées correctement
- [ ] Suggestions d'Ezia pertinentes
- [ ] Ajout/suppression/duplication de pages
- [ ] Publication du site
- [ ] Accès via le sous-domaine (simulé en dev)
- [ ] Responsive design fonctionnel
- [ ] Navigation du site publié

## 💡 Cas de test avancés

### Test avec différents types d'entreprises
1. Créer un site pour une "Agence de design"
   - Vérifier qu'Ezia suggère : Portfolio, Process, Études de cas
   
2. Créer un site pour une "École de formation"
   - Vérifier qu'Ezia suggère : Formations, Inscription, Ressources

### Test de sous-domaines particuliers
1. Entreprise avec accents : "Café Côté Jardin"
   - Sous-domaine attendu : `cafe-cote-jardin`
   
2. Entreprise avec caractères spéciaux : "L'Atelier @Design"
   - Sous-domaine attendu : `l-atelier-design`

## 🎯 Métriques de succès

✅ **Temps de création** : < 2 minutes pour un site complet
✅ **Cohérence visuelle** : Toutes les pages utilisent le même thème
✅ **Suggestions pertinentes** : Au moins 80% des suggestions d'Ezia sont utiles
✅ **Navigation fluide** : Changement de page instantané
✅ **Modifications rapides** : < 10 secondes pour appliquer une modification

---

**Note** : En production, les vrais sous-domaines (*.ezia.ai) nécessiteraient une configuration DNS. En développement, nous simulons via les routes Next.js.