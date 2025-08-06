# Déploiement Ezia sur HuggingFace Spaces

## Configuration du Space

### 1. Variables d'Environnement (Secrets)

Dans les Settings de votre Space, ajoutez ces secrets :

```
MONGODB_URI=mongodb+srv://...
OAUTH_CLIENT_ID=votre_client_id
OAUTH_CLIENT_SECRET=votre_client_secret
HF_TOKEN=hf_xxxx
DEFAULT_HF_TOKEN=hf_xxxx
NEXT_APP_API_URL=https://api-inference.huggingface.co
```

### 2. Configuration Docker

Le Dockerfile est déjà configuré pour HuggingFace Spaces.

### 3. Déploiement

```bash
# Ajouter le remote HuggingFace
git remote add hf https://huggingface.co/spaces/VOTRE_USERNAME/ezia

# Pousser le code
git push hf main
```

## URLs de Production

Une fois déployé, votre app sera accessible à :
- https://huggingface.co/spaces/VOTRE_USERNAME/ezia

## MongoDB Atlas (Recommandé pour la production)

1. Créez un compte gratuit sur https://www.mongodb.com/atlas
2. Créez un cluster M0 (gratuit)
3. Dans Network Access, ajoutez `0.0.0.0/0` (permet l'accès depuis n'importe où)
4. Créez un utilisateur database
5. Récupérez la connection string et mettez-la dans MONGODB_URI

## Vérification

Après déploiement :
1. Vérifiez les logs dans l'onglet "Logs" du Space
2. Testez la connexion OAuth
3. Créez un premier business pour tester

## Troubleshooting

- **Erreur de build** : Vérifiez les logs
- **Erreur MongoDB** : Vérifiez la connection string et l'IP whitelist
- **Erreur OAuth** : Vérifiez que les redirect URIs correspondent exactement