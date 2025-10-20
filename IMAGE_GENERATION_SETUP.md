# Configuration de la Génération d'Images

## Vue d'ensemble

Le système de génération d'images utilise **Stable Diffusion XL** via l'API Hugging Face pour créer des images de haute qualité pour vos contenus marketing.

## Fonctionnalités

### 1. Génération d'images intelligente
- **Modèle**: Stable Diffusion XL Base 1.0
- **Résolution**: 1024x1024 pixels
- **Optimisation automatique** des prompts selon le type de contenu
- **Génération automatique** depuis le titre si aucun prompt n'est fourni

### 2. Quotas par plan

| Plan | Quota mensuel | Prix |
|------|--------------|------|
| Gratuit | 0 images | 0€ |
| Creator | 50 images | 29€/mois |
| Pro/Enterprise | Illimité* | Sur demande |

*Note: Pour les plans Pro/Enterprise, le quota peut être ajusté selon les besoins

### 3. Types de contenu supportés
- Articles de blog
- Posts réseaux sociaux
- Publicités
- Images standalone

## Configuration

### 1. Token Hugging Face

Vous devez avoir un token Hugging Face avec accès aux modèles. Ajoutez-le dans votre `.env.local` :

```bash
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

Ou utilisez le token par défaut pour les utilisateurs non authentifiés :

```bash
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

### 2. Variables d'environnement

```bash
# Token Hugging Face
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
DEFAULT_HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# MongoDB (pour stocker les quotas utilisateur)
MONGODB_URI=mongodb+srv://...

# Stripe (pour gérer les abonnements)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Utilisation

### 1. Via l'interface de calendrier

1. Créez un nouveau contenu (Article, Post social, ou Image)
2. Remplissez le titre et la description
3. Dans la section "Générer une image avec Stable Diffusion" :
   - Soit laissez le champ vide (génération auto depuis le titre)
   - Soit décrivez précisément l'image souhaitée
4. Cliquez sur le bouton de génération (icône baguette magique)
5. L'image sera générée et affichée sous le formulaire

### 2. Via l'API

#### Générer une image

```bash
POST /api/images/generate
Content-Type: application/json
Cookie: token=xxx

{
  "prompt": "A modern office workspace with plants",
  "width": 1024,
  "height": 1024
}
```

Ou en auto-génération depuis un contenu :

```bash
POST /api/images/generate
Content-Type: application/json
Cookie: token=xxx

{
  "contentTitle": "Les meilleures pratiques du télétravail en 2024",
  "contentDescription": "Découvrez comment optimiser votre espace de travail",
  "contentType": "article"
}
```

**Réponse** :
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "usage": {
    "used": 15,
    "quota": 50,
    "remaining": 35
  }
}
```

#### Consulter son quota

```bash
GET /api/images/generate
Cookie: token=xxx
```

**Réponse** :
```json
{
  "plan": "creator",
  "usage": {
    "used": 15,
    "quota": 50,
    "remaining": 35
  },
  "lastReset": "2024-01-01T00:00:00.000Z"
}
```

## Gestion des quotas

### Reset mensuel automatique

Les quotas se réinitialisent automatiquement chaque mois. Pour implémenter le reset mensuel, créez un cron job qui appelle cette fonction :

```typescript
import { resetMonthlyImageQuotas } from '@/lib/image-generation-service';

// À exécuter le 1er de chaque mois à 00:00
await resetMonthlyImageQuotas();
```

### Configuration du cron job

#### Option 1: Vercel Cron Jobs

Ajoutez dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-image-quotas",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

Créez le fichier `/app/api/cron/reset-image-quotas/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { resetMonthlyImageQuotas } from '@/lib/image-generation-service';

export async function GET() {
  try {
    await resetMonthlyImageQuotas();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

#### Option 2: Plateforme externe (Cron-Job.org, EasyCron, etc.)

Configurez un appel HTTP GET vers :
```
https://votre-domaine.com/api/cron/reset-image-quotas
```

Fréquence : `0 0 1 * *` (1er du mois à 00:00)

## Optimisation des coûts

### 1. Modèle utilisé

Nous utilisons **Stable Diffusion XL Base 1.0** qui offre le meilleur rapport qualité/prix :
- Gratuit via l'API Inference de Hugging Face (avec limitations de rate)
- Pas de coût par image générée
- Limité par les rate limits de l'API

### 2. Stratégies d'optimisation

- **Quotas stricts** : 50 images/mois pour le plan Creator (29€)
- **Génération à la demande uniquement** : pas de génération automatique
- **Cache des prompts** : évite de régénérer des images similaires
- **Résolution optimale** : 1024x1024 (bon compromis qualité/vitesse)

### 3. Rentabilité

Pour un abonnement Creator à 29€/mois :
- Coût moyen par image : ~0€ (Inference API gratuite)
- Quota : 50 images/mois
- **ROI**: 100% de marge sur cette feature

## Troubleshooting

### Erreur "Le modèle est en cours de chargement"

**Cause** : Le modèle Stable Diffusion doit se charger en mémoire (cold start)

**Solution** : Réessayez après quelques secondes. Le modèle reste chargé pendant ~15 minutes.

### Erreur "Quota d'images épuisé"

**Cause** : L'utilisateur a atteint son quota mensuel

**Solution** :
- Attendre le mois prochain (reset automatique)
- Upgrader vers un plan supérieur

### Erreur "Token Hugging Face non configuré"

**Cause** : Variable d'environnement `HF_TOKEN` manquante

**Solution** : Ajoutez votre token dans `.env.local`

### Images de mauvaise qualité

**Cause** : Prompt pas assez détaillé

**Solution** :
- Ajoutez plus de détails dans le prompt
- Utilisez des mots-clés de qualité (high quality, professional, detailed)
- L'optimisation automatique des prompts est déjà activée

## Améliorations futures

- [ ] Support de FLUX.1 (meilleure qualité)
- [ ] Génération d'images en différentes résolutions
- [ ] Édition d'images existantes (inpainting)
- [ ] Variations d'une image générée
- [ ] Historique des images générées
- [ ] Galerie d'images partagée entre les contenus
- [ ] Export automatique vers un CDN

## Support

Pour toute question ou problème :
- Vérifiez les logs du serveur
- Consultez la documentation Hugging Face : https://huggingface.co/docs/api-inference
- Vérifiez les quotas : GET /api/images/generate
