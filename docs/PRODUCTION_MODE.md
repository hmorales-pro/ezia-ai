# 🚀 Activer le Mode Production d'Ezia

## Vue d'ensemble

Par défaut, Ezia fonctionne en **mode développement** avec des réponses d'IA pré-générées pour vous permettre de tester l'application sans frais. Pour obtenir des analyses personnalisées et uniques pour chaque business, vous devez activer le **mode production** en configurant une clé API Mistral AI.

## Différences entre les modes

### Mode Développement (par défaut)
- ✅ Gratuit et immédiat
- ⚠️ Réponses génériques pré-définies
- ⚠️ Analyses identiques pour tous les business
- ✅ Parfait pour tester l'interface

### Mode Production
- ✅ Analyses IA personnalisées et uniques
- ✅ Contenu adapté à chaque business
- ✅ Recommandations spécifiques
- 💰 Nécessite une clé API Mistral (tarifs très abordables)

## Comment activer le Mode Production

### 1. Créer un compte Mistral AI

1. Rendez-vous sur [console.mistral.ai](https://console.mistral.ai/)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Générer une clé API

1. Dans la console Mistral, allez dans "API Keys"
2. Cliquez sur "Create new key"
3. Donnez un nom à votre clé (ex: "Ezia Production")
4. Copiez la clé générée (elle ne sera plus visible après)

### 3. Configurer Ezia

1. Créez ou éditez le fichier `.env.local` à la racine du projet
2. Ajoutez votre clé API :

```bash
# Clé API Mistral pour les analyses business
MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Redémarrez le serveur de développement :

```bash
npm run dev
```

### 4. Vérifier l'activation

Lorsque vous créez une nouvelle analyse, vérifiez les logs du serveur :
- ✅ Mode Production : `[Mistral] Clé API détectée, appel à l'API Mistral`
- ⚠️ Mode Dev : `[Mistral] ⚠️ Mode développement activé - Pas de clé API Mistral`

## Tarification Mistral AI

Mistral AI propose des tarifs très compétitifs :

- **mistral-small-latest** : ~0.15€ pour 1M tokens d'entrée
- **mistral-medium-latest** : ~0.65€ pour 1M tokens d'entrée

Pour référence :
- Une analyse de marché complète ≈ 2000 tokens
- Coût par analyse ≈ 0.0003€ (moins d'un centime)

## Modèles disponibles

Le fichier `lib/mistral-ai-service.ts` utilise par défaut `mistral-small-latest`. Pour de meilleures performances, vous pouvez changer pour :

```typescript
const MISTRAL_MODEL = "mistral-medium-latest"; // Analyses plus détaillées
```

## Dépannage

### L'API retourne toujours des réponses génériques

1. Vérifiez que `.env.local` contient bien `MISTRAL_API_KEY`
2. Assurez-vous d'avoir redémarré le serveur
3. Vérifiez les logs pour voir si la clé est détectée

### Erreur 401 Unauthorized

Votre clé API est invalide ou expirée. Générez une nouvelle clé dans la console Mistral.

### Erreur de quota

Vérifiez votre usage et vos limites dans la console Mistral. Les nouveaux comptes ont des limites généreuses.

## Support

Pour toute question sur l'activation du mode production :
- Consultez la [documentation Mistral](https://docs.mistral.ai/)
- Ouvrez une issue sur le repo GitHub d'Ezia