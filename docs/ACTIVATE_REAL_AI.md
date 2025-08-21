# 🚀 Activer l'IA Réelle dans Ezia

## Vue d'ensemble

Par défaut, Ezia utilise des données simulées pour les analyses de marché et les stratégies marketing. Pour activer l'IA réelle (Mistral AI) et obtenir des analyses 100% personnalisées et sur-mesure :

## 1. Obtenir une clé API Mistral

1. Créez un compte sur [console.mistral.ai](https://console.mistral.ai/)
2. Générez une clé API dans la section "API Keys"
3. Copiez la clé (format: `sk-...`)

## 2. Configuration

### Option A : Fichier .env.local (Recommandé)

Créez ou éditez le fichier `.env.local` à la racine du projet :

```bash
MISTRAL_API_KEY=sk-votre-clé-ici
```

### Option B : Variables d'environnement système

```bash
export MISTRAL_API_KEY=sk-votre-clé-ici
```

## 3. Redémarrer l'application

```bash
npm run dev
```

## 4. Vérifier l'activation

Quand vous créez un nouveau business, regardez les logs :
- ✅ Mode IA activé : `[Mistral] Clé API détectée, appel à l'API Mistral`
- ❌ Mode simulé : `[Mistral] ⚠️ Mode développement activé - Pas de clé API Mistral`

## Différences Mode Simulé vs IA Réelle

### Mode Simulé (par défaut)
- Analyses génériques basées sur l'industrie
- Données prédéfinies
- Même résultat pour des business similaires
- Gratuit mais limité

### Mode IA Réelle (avec Mistral)
- Analyses 100% personnalisées
- Recherche en temps réel
- Recommandations spécifiques à VOTRE business
- Données de marché actuelles
- Stratégies uniques et actionnables

## Exemple de différence

### Simulé :
```
"GreenDesk peut se positionner sur un marché en croissance"
```

### IA Réelle :
```
"GreenDesk peut capturer 15% du marché des espaces de coworking écologiques 
à Paris (estimé à 45M€) en ciblant les startups tech éco-responsables. 
Principaux concurrents : WeWork Green (30% PDM), EcoSpace (20% PDM). 
Opportunité : aucun concurrent ne propose de certification carbone neutre."
```

## Coûts

- Mistral Small : ~0.002€ par analyse
- Mistral Medium : ~0.008€ par analyse (recommandé)
- Mistral Large : ~0.024€ par analyse (qualité maximale)

## Support

Des questions ? Contactez-nous ou consultez [docs.mistral.ai](https://docs.mistral.ai)