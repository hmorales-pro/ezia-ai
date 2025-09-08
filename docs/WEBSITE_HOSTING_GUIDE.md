# Guide d'Hébergement des Sites Web sur Ezia

## Vue d'ensemble

Lorsqu'un utilisateur génère un site web via Ezia, le site est automatiquement hébergé sur un sous-domaine personnalisé au format `[nom-business].ezia.ai`.

## Processus de Génération et d'Hébergement

### 1. Génération du Site

Quand un utilisateur clique sur "Générer un site web" :

1. **Création du contenu** : L'IA génère le HTML/CSS basé sur les informations du business
2. **Attribution du sous-domaine** : Un sous-domaine unique est généré automatiquement
   - Exemple : `pizzeria-mario.ezia.ai` pour "Pizzeria Mario"
   - Si le nom est déjà pris, un suffixe numérique est ajouté : `pizzeria-mario-2.ezia.ai`

3. **Sauvegarde en base de données** : Le site est stocké avec :
   - Le HTML/CSS généré
   - Le sous-domaine attribué
   - Les métadonnées (date de création, version, etc.)

4. **Publication instantanée** : Le site est immédiatement accessible à l'URL générée

### 2. Accès au Site

Les sites sont accessibles de deux manières :

#### Via le sous-domaine (recommandé)
```
https://[sous-domaine].ezia.ai
```
- URL professionnelle et mémorisable
- Idéale pour partager avec les clients
- SEO-friendly

#### Via l'URL directe
```
https://ezia.ai/sites/view/[projectId]
```
- URL de secours
- Utile pour le développement/debug

### 3. Architecture Technique

#### Middleware de Routage
Le fichier `middleware.ts` intercepte toutes les requêtes entrantes :
- Détecte les sous-domaines
- Redirige vers la route appropriée `[subdomain]/page.tsx`

#### Résolution du Contenu
1. La route `[subdomain]/page.tsx` :
   - Cherche le projet par sous-domaine dans la base de données
   - Récupère le HTML/CSS
   - Affiche le contenu

#### Sécurité des iFrames
- Les previews utilisent des attributs `sandbox` pour empêcher la navigation interne
- Les liens s'ouvrent automatiquement dans de nouveaux onglets
- Protection contre l'effet "Inception" (site dans site)

### 4. Gestion des Sous-domaines

#### Règles de Validation
- 3-63 caractères
- Commence par une lettre
- Contient uniquement : lettres minuscules, chiffres, tirets
- Pas de tirets consécutifs
- Pas de tirets au début ou à la fin

#### Noms Réservés
Les sous-domaines suivants sont interdits :
- www, api, admin, app, mail, ftp
- blog, shop, store, help, support
- Et autres noms système

#### Génération Intelligente
L'algorithme de génération :
1. Nettoie le nom du business (enlève accents, caractères spéciaux)
2. Convertit en minuscules et remplace les espaces par des tirets
3. Vérifie la disponibilité
4. Ajoute un suffixe numérique si nécessaire

### 5. Cas d'Usage

#### Pour les Entrepreneurs
1. Créent leur business sur Ezia
2. Génèrent un site web en 1 clic
3. Obtiennent instantanément une URL professionnelle
4. Peuvent partager le lien immédiatement

#### Pour les Développeurs
1. Peuvent éditer le HTML/CSS via l'éditeur
2. Les modifications sont reflétées en temps réel
3. Support des versions pour rollback si nécessaire

### 6. API Endpoints

#### Création de Site
```
POST /api/ezia/create-website
{
  "businessId": "xxx",
  "businessName": "Pizzeria Mario",
  "html": "<html>...",
  "css": "body { ... }"
}
```

#### Vérification de Disponibilité
```
POST /api/subdomain/check
{
  "subdomain": "pizzeria-mario"
}
```

### 7. Limitations Actuelles

- Pas de support pour les domaines personnalisés (pour l'instant)
- Pas de SSL personnalisé (utilise le wildcard *.ezia.ai)
- Limite de taille du HTML/CSS stocké

### 8. Évolutions Futures Possibles

1. **Domaines Personnalisés** : Permettre aux utilisateurs de connecter leur propre domaine
2. **Éditeur Visuel** : Interface drag-and-drop pour modifier le site
3. **Templates** : Bibliothèque de templates par industrie
4. **Analytics** : Statistiques de visite intégrées
5. **Formulaires** : Gestion des formulaires de contact avec envoi d'email

## Résumé

Le système d'hébergement d'Ezia permet une publication instantanée des sites générés sur des sous-domaines professionnels. L'architecture est conçue pour être scalable, sécurisée et facile à utiliser pour les entrepreneurs non-techniques.