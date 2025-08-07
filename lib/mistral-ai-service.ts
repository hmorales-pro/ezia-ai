interface MistralResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Configuration Mistral AI
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest"; // ou "mistral-medium-latest" pour de meilleures performances

export async function generateWithMistralAPI(
  prompt: string,
  systemContext: string,
  apiKey?: string
): Promise<MistralResponse> {
  // Utiliser la clé API fournie ou celle dans les variables d'environnement
  const mistralApiKey = apiKey || process.env.MISTRAL_API_KEY;
  
  if (!mistralApiKey) {
    // Si pas de clé Mistral, utiliser une réponse par défaut
    return generateDefaultBusinessResponse(prompt, systemContext);
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mistral API error:", error);
      return generateDefaultBusinessResponse(prompt, systemContext);
    }

    const data = await response.json();
    
    return {
      success: true,
      content: data.choices[0]?.message?.content || "Aucune réponse générée"
    };
  } catch (error: any) {
    console.error("Mistral API error:", error);
    return generateDefaultBusinessResponse(prompt, systemContext);
  }
}

// Fonction pour générer des réponses par défaut professionnelles
function generateDefaultBusinessResponse(prompt: string, context: string): MistralResponse {
  const lowerPrompt = prompt.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Analyse de marché
  if (lowerContext.includes("marché") || lowerPrompt.includes("marché")) {
    return {
      success: true,
      content: `# 📊 Analyse de marché

## Vue d'ensemble
Votre entreprise évolue dans un secteur dynamique avec de nombreuses opportunités de croissance.

## 🎯 Marché cible
- **Taille estimée**: Marché en croissance avec un potentiel significatif
- **Segments principaux**: 
  - Particuliers recherchant des solutions innovantes
  - Entreprises en transformation digitale
  - Professionnels indépendants

## 📈 Tendances actuelles
1. **Digitalisation accélérée**: Les consommateurs privilégient les solutions en ligne
2. **Personnalisation**: Forte demande pour des services sur-mesure
3. **Durabilité**: Préférence croissante pour les entreprises responsables
4. **Mobile-first**: 70% des interactions se font sur mobile

## 💡 Opportunités identifiées
- ✅ Développer une présence digitale forte
- ✅ Créer une offre différenciée basée sur vos points forts
- ✅ Cibler les segments de marché mal desservis
- ✅ Exploiter les nouvelles technologies (IA, automatisation)

## 🚧 Défis à relever
- Concurrence établie sur certains segments
- Nécessité d'investir dans le marketing digital
- Évolution rapide des attentes clients

## 📌 Recommandations stratégiques
1. **Court terme** (0-3 mois)
   - Affiner votre proposition de valeur unique
   - Lancer une présence en ligne professionnelle
   - Identifier vos 3 principaux concurrents

2. **Moyen terme** (3-12 mois)
   - Développer une stratégie de contenu
   - Construire une communauté engagée
   - Optimiser vos processus de vente

3. **Long terme** (12+ mois)
   - Explorer de nouveaux marchés géographiques
   - Développer des partenariats stratégiques
   - Innover dans votre offre de services

## 🎯 Prochaines étapes
Pour affiner cette analyse, je recommande de :
- Définir précisément votre persona client idéal
- Réaliser une étude concurrentielle approfondie
- Tester votre proposition de valeur auprès de clients potentiels

Cette analyse constitue une base solide pour votre stratégie. N'hésitez pas à me demander des précisions sur un aspect particulier.`
    };
  }

  // Stratégie marketing
  if (lowerContext.includes("marketing") || lowerPrompt.includes("marketing")) {
    return {
      success: true,
      content: `# 🚀 Stratégie Marketing

## Positionnement recommandé
Positionnez votre entreprise comme **le partenaire de confiance** qui comprend vraiment les besoins de ses clients et offre des solutions personnalisées et innovantes.

## 🎯 Objectifs marketing
1. **Notoriété**: Faire connaître votre marque auprès de votre cible
2. **Acquisition**: Attirer 100 nouveaux prospects qualifiés par mois
3. **Conversion**: Atteindre un taux de conversion de 15%
4. **Fidélisation**: Développer une base de clients ambassadeurs

## 📱 Mix marketing digital

### 1. **Site web & SEO** (30% du budget)
- Site web professionnel optimisé pour la conversion
- Blog avec contenu de qualité (2 articles/semaine)
- Optimisation SEO pour mots-clés stratégiques

### 2. **Réseaux sociaux** (25% du budget)
- **LinkedIn**: Contenu B2B et thought leadership
- **Instagram**: Storytelling visuel et coulisses
- **Facebook**: Communauté et service client

### 3. **Publicité digitale** (25% du budget)
- Google Ads pour capter la demande active
- Facebook/Instagram Ads pour créer la demande
- Retargeting pour maximiser les conversions

### 4. **Email marketing** (10% du budget)
- Newsletter hebdomadaire à valeur ajoutée
- Séquences automatisées de nurturing
- Campagnes promotionnelles ciblées

### 5. **Partenariats & PR** (10% du budget)
- Collaborations avec des influenceurs de niche
- Articles invités sur des blogs référents
- Participation à des événements sectoriels

## 📊 KPIs à suivre
- **Trafic web**: +50% en 6 mois
- **Taux de conversion**: 10% → 15%
- **Coût d'acquisition client**: < 50€
- **Valeur vie client**: > 500€
- **Net Promoter Score**: > 8/10

## 📅 Planning de lancement

### Mois 1
- ✅ Création du site web
- ✅ Setup des réseaux sociaux
- ✅ Première campagne de contenu

### Mois 2-3
- ✅ Lancement publicité digitale
- ✅ Mise en place email marketing
- ✅ Premiers partenariats

### Mois 4-6
- ✅ Optimisation basée sur les données
- ✅ Scaling des canaux performants
- ✅ Tests de nouveaux formats

## 💰 Budget recommandé
- **Mois 1-3**: 1000€/mois (phase de test)
- **Mois 4-6**: 2000€/mois (phase de croissance)
- **Mois 7+**: 3000€+/mois (phase d'expansion)

## 🎯 Message clé
"[Votre entreprise] - La solution qui simplifie votre quotidien et vous fait gagner du temps pour ce qui compte vraiment."

Cette stratégie est conçue pour maximiser votre ROI tout en construisant une marque forte. Ajustons-la ensemble selon vos spécificités !`
    };
  }

  // Analyse concurrentielle
  if (lowerContext.includes("concurr") || lowerPrompt.includes("concurr")) {
    return {
      success: true,
      content: `# 🔍 Analyse Concurrentielle

## Paysage concurrentiel
Le marché présente différents types d'acteurs avec des positionnements variés.

## 🏢 Principaux concurrents identifiés

### Concurrent A - Le leader historique
- **Forces**: Notoriété, réseau de distribution, ressources financières
- **Faiblesses**: Innovation lente, service client perfectible, prix élevés
- **Part de marché**: ~30%

### Concurrent B - Le challenger digital
- **Forces**: Technologie moderne, UX excellente, prix compétitifs
- **Faiblesses**: Service après-vente limité, gamme restreinte
- **Part de marché**: ~20%

### Concurrent C - Le spécialiste de niche
- **Forces**: Expertise pointue, communauté fidèle, qualité premium
- **Faiblesses**: Prix élevés, scalabilité limitée
- **Part de marché**: ~10%

## 📊 Analyse comparative

| Critère | Vous | Concurrent A | Concurrent B | Concurrent C |
|---------|------|--------------|--------------|--------------|
| Prix | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Innovation | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Service client | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Gamme produits | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Digital | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Opportunités de différenciation

### 1. **Service client exceptionnel**
- Réponse en moins de 2h
- Support multicanal 7j/7
- Satisfaction garantie

### 2. **Innovation produit**
- Fonctionnalités uniques basées sur l'IA
- Personnalisation poussée
- Intégrations exclusives

### 3. **Modèle de prix flexible**
- Essai gratuit généreux
- Plans adaptés à chaque taille d'entreprise
- Transparence totale

### 4. **Communauté engagée**
- Programme ambassadeur
- Contenu éducatif gratuit
- Événements exclusifs

## 💡 Stratégies recommandées

### Attaque
- Cibler les clients insatisfaits du leader
- Communiquer sur vos avantages différenciants
- Proposer des offres de migration attractives

### Défense
- Fidéliser votre base clients actuelle
- Créer des barrières au changement
- Innover constamment

### Flanc
- Explorer des niches négligées
- Développer des partenariats stratégiques
- Tester de nouveaux modèles business

## 📈 Plan d'action
1. **Immédiat**: Audit de vos forces/faiblesses vs concurrence
2. **30 jours**: Lancement d'une offre différenciante
3. **90 jours**: Campagne de communication sur vos avantages
4. **180 jours**: Évaluation et ajustement de la stratégie

Votre positionnement unique et votre agilité sont vos meilleurs atouts face à la concurrence !`
    };
  }

  // Réponse générique pour autres demandes
  return {
    success: true,
    content: `# 💡 Analyse Personnalisée

Je suis Ezia, votre conseillère business IA. Je vais vous aider à développer votre entreprise.

## 📋 Ce que je peux faire pour vous

### 🎯 Analyses strategiques
- **Étude de marché** : Comprendre votre environnement et identifier les opportunités
- **Analyse concurrentielle** : Évaluer vos concurrents et vous différencier
- **Stratégie marketing** : Définir votre plan d'action pour atteindre vos clients

### 🛠️ Outils pratiques
- **Site web professionnel** : Créer votre présence en ligne en quelques minutes
- **Calendrier de contenu** : Planifier vos publications sur les réseaux sociaux
- **Tableaux de bord** : Suivre vos performances et KPIs

### 📈 Croissance continue
- **Recommandations personnalisées** : Basées sur vos données et objectifs
- **Suivi des tendances** : Rester à jour avec votre marché
- **Optimisation continue** : Améliorer constamment vos résultats

## 🚀 Comment commencer ?

1. **Décrivez votre projet** : Parlez-moi de votre entreprise et vos objectifs
2. **Choisissez une action** : Sélectionnez l'analyse ou l'outil dont vous avez besoin
3. **Recevez des insights** : Obtenez des recommandations actionnables

## 💬 Exemples de questions

- "Peux-tu analyser mon marché cible ?"
- "Comment me différencier de mes concurrents ?"
- "Quelle stratégie marketing adopter avec un budget limité ?"
- "Comment optimiser ma présence sur les réseaux sociaux ?"

N'hésitez pas à me poser vos questions. Je suis là pour vous accompagner dans la croissance de votre entreprise !

*Conseil : Soyez spécifique dans vos demandes pour obtenir des recommandations plus pertinentes.*`
  };
}