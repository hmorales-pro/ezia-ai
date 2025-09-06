# Configuration Preprod Ezia

## Variables d'environnement requises

Pour que la preprod fonctionne correctement, les variables suivantes doivent être configurées dans Dokploy :

### 1. MongoDB (OBLIGATOIRE pour la persistence)

```bash
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

Sans MongoDB configuré, toutes les données seront perdues à chaque redéploiement.

#### Étapes pour MongoDB Atlas :
1. Créer un compte gratuit sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créer un cluster gratuit (M0 Sandbox)
3. Créer un utilisateur database avec mot de passe
4. Ajouter `0.0.0.0/0` dans les IP autorisées
5. Récupérer la connection string et remplacer dans Dokploy

### 2. APIs IA (AU MOINS UNE REQUISE)

#### Option A : Mistral AI (Recommandé)
```bash
MISTRAL_API_KEY=votre_clé_mistral
```

- Créer un compte sur [console.mistral.ai](https://console.mistral.ai/)
- Générer une clé API
- Les analyses seront plus précises et spécifiques

#### Option B : HuggingFace (Alternative gratuite)
```bash
HF_TOKEN=votre_token_huggingface
```

- Créer un compte sur [huggingface.co](https://huggingface.co)
- Générer un token d'accès
- Performances variables selon la disponibilité

### 3. Autres variables importantes

```bash
# JWT pour l'authentification
JWT_SECRET=une_longue_chaine_aleatoire_securisee

# URL de l'API externe (optionnel)
NEXT_APP_API_URL=https://api.deepsite.com

# Fallback token pour les utilisateurs non connectés
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxx
```

## Vérification du bon fonctionnement

1. **MongoDB** : Créer un business et vérifier qu'il persiste après redéploiement
2. **Analyses IA** : Lancer une analyse et vérifier qu'elle retourne des données spécifiques
3. **Si les analyses échouent** :
   - Vérifier les logs : `docker logs [container_id]`
   - Vérifier que Mistral API key est valide
   - Si pas de Mistral, vérifier que HF_TOKEN est configuré

## Problèmes courants

### "Analyses infinies" ou qui n'aboutissent pas
- Mistral API key manquante ou invalide
- Fallback HuggingFace non configuré
- Timeout réseau

### "Données disparaissent après redeploy"
- MONGODB_URI non configuré
- Erreur de connexion MongoDB
- Mauvaises permissions utilisateur MongoDB

### "Analyses retournent des données génériques"
- API IA non configurée
- Le système utilise les templates de fallback
- Configurer au moins Mistral ou HuggingFace

## Configuration minimale recommandée

Pour une preprod fonctionnelle :

```bash
MONGODB_URI=mongodb+srv://...
MISTRAL_API_KEY=sk-...
JWT_SECRET=random_secret_key_here_123456
```

Ces 3 variables permettront :
- Persistence des données
- Analyses IA de qualité
- Authentification sécurisée