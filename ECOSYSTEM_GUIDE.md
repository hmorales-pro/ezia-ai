# Guide de l'Écosystème Unifié Ezia

## 🎯 Vue d'ensemble

Le nouvel éditeur unifié combine la création de sites simples et multipages dans une interface unique, avec un système d'écosystème pour faire évoluer progressivement votre site.

## 🚀 Fonctionnalités principales

### 1. **Éditeur Unifié**
- Interface unique pour sites simples et multipages
- 3 vues : Éditeur, Écosystème, Aperçu
- Transition fluide entre les modes

### 2. **Vue Écosystème**
- Suggestions intelligentes d'Ezia basées sur votre activité
- Ajout de fonctionnalités en un clic
- Catégories : Pages, Fonctionnalités, Intégrations

### 3. **Évolution Progressive**
- Commencez avec un site simple
- Ajoutez des pages selon vos besoins
- Convertissez en multipage quand nécessaire

## 📱 Utilisation

### Créer un nouveau site
1. Allez sur `/sites/new`
2. L'éditeur unifié s'ouvre automatiquement
3. Créez votre site initial via le chat
4. Basculez sur la vue "Écosystème" pour voir les suggestions

### Éditer un site existant
1. Allez sur `/sites/[projectId]/edit`
2. L'éditeur détecte automatiquement le type (simple/multipage)
3. Utilisez les 3 vues selon vos besoins

### Vue Écosystème
Dans cette vue, vous pouvez :
- **Voir les suggestions d'Ezia** : Basées sur votre type d'entreprise
- **Ajouter des pages** : Blog, Portfolio, Boutique
- **Activer des fonctionnalités** : Réservation, Chat, Espace membres
- **Intégrer des services** : Réseaux sociaux, Analytics

### Conversion en Multipage
Si votre site est simple et que vous ajoutez des pages :
1. Un message vous propose de convertir en multipage
2. Cliquez sur "Passer en multipage"
3. Votre site conserve son contenu et gagne un sous-domaine

## 🏗️ Architecture Technique

### Routes API
- `/api/ezia/analyze-ecosystem` - Analyse et suggestions
- `/api/multipage/convert` - Conversion simple → multipage
- `/api/ecosystem/[projectId]/features` - Gestion des fonctionnalités

### Composants
- `UnifiedEditor` - Éditeur principal unifié
- `EziaEcosystemPanel` - Panneau des fonctionnalités
- `MultipageEditor` - Éditeur pour sites multipages
- `EziaSimpleEditor` - Éditeur pour sites simples

### Modèles de données
- Sites simples : `UserProject`
- Sites multipages : `UserProjectMultipage`
- Fonctionnalités : Stockées dans `metadata.features`

## 🧪 Test du système

### 1. Test basique
```bash
# Créer un nouveau site
http://localhost:3000/sites/new?businessName=Restaurant%20Test&businessId=test123

# Dans l'éditeur :
1. Créez un site simple via le chat
2. Cliquez sur "Écosystème"
3. Observez les suggestions d'Ezia
```

### 2. Test des suggestions
```bash
# Différents types d'entreprises pour tester les suggestions :

# Restaurant
businessName=Restaurant%20Le%20Gourmet&industry=restauration

# Boutique
businessName=Boutique%20Mode&industry=commerce

# Service
businessName=Cabinet%20Conseil&industry=service
```

### 3. Test de conversion
1. Créez un site simple
2. Dans Écosystème, ajoutez une page (ex: Blog)
3. Un message propose la conversion
4. Cliquez pour convertir en multipage

## 📊 Fonctionnalités disponibles

### Pages
- **Blog** : Articles et actualités (SEO)
- **Portfolio** : Présentation de réalisations
- **Boutique** : Vente en ligne

### Fonctionnalités
- **Réservation** : Prise de RDV en ligne
- **Espace membres** : Zone privée clients
- **Chat** : Support en direct

### Intégrations
- **Réseaux sociaux** : Partage automatique
- **Analytics** : Suivi des visiteurs
- **CRM** : Gestion des contacts (bientôt)

## 💡 Conseils d'utilisation

1. **Commencez simple** : Créez d'abord votre site de base
2. **Écoutez Ezia** : Les suggestions sont basées sur votre industrie
3. **Évoluez progressivement** : Ajoutez des fonctionnalités selon vos besoins
4. **Testez régulièrement** : Utilisez la vue Aperçu

## 🐛 Résolution de problèmes

### "Cannot read properties of undefined"
- Vérifiez que le projet existe
- Rechargez la page

### "Erreur lors de la conversion"
- Vérifiez que MongoDB est accessible
- Consultez les logs serveur

### Les suggestions ne s'affichent pas
- Cliquez sur "Analyser mes besoins"
- Vérifiez que businessInfo est défini

## 🎉 Avantages du nouveau système

1. **Interface unifiée** : Plus besoin de jongler entre éditeurs
2. **Évolution naturelle** : Le site grandit avec votre business
3. **Suggestions intelligentes** : Ezia comprend vos besoins
4. **Sous-domaines automatiques** : Publication instantanée
5. **Modules prêts à l'emploi** : Activez des fonctionnalités complexes facilement

---

Le système d'écosystème unifié transforme la création de sites web en une expérience progressive et intelligente, guidée par Ezia !