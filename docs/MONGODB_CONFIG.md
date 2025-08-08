# Configuration MongoDB pour HuggingFace Spaces

## Variables à ajouter dans HuggingFace Spaces Settings

Aller sur : https://huggingface.co/spaces/hmorales/ezia/settings

Dans "Variables and secrets", ajouter :

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
```

Note : Si l'URL ci-dessus ne fonctionne pas, essayez ces variantes :

1. Sans options :
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database
```

2. Avec un cluster différent (remplacez your-cluster par votre nom de cluster) :
```
MONGODB_URI=mongodb+srv://your-username:your-password@[VOTRE-CLUSTER].mongodb.net/your-database
```

## Test de connexion

Une fois configuré, l'application devrait pouvoir :
- Créer des business
- Les sauvegarder dans MongoDB
- Les récupérer entre les sessions

## Important

- Ne PAS commiter ces identifiants dans le code
- Utiliser uniquement les variables d'environnement HuggingFace Spaces
- Le fichier .env.local reste avec localhost pour le développement local