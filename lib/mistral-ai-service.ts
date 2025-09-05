interface MistralResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Configuration Mistral AI
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-large-latest"; // Modèle plus performant et disponible

export async function generateWithMistralAPI(
  prompt: string,
  systemContext: string,
  apiKey?: string
): Promise<MistralResponse> {
  // Utiliser la clé API fournie ou celle dans les variables d'environnement
  const mistralApiKey = apiKey || process.env.MISTRAL_API_KEY;
  
  console.log("[Mistral] Vérification de la clé API...");
  console.log("[Mistral] Clé présente:", !!mistralApiKey);
  console.log("[Mistral] Format de clé:", mistralApiKey ? `${mistralApiKey.substring(0, 4)}...` : 'Aucune');
  console.log("[Mistral] Longueur de la clé:", mistralApiKey?.length || 0);
  
  // Vérifier si c'est une demande de génération de site web
  const isWebsiteGeneration = systemContext.toLowerCase().includes("html") || 
                             systemContext.toLowerCase().includes("site web") ||
                             prompt.toLowerCase().includes("site web");
  
  // Vérifier si c'est une demande de stratégie complexe nécessitant plus de tokens
  const isComplexStrategy = systemContext.toLowerCase().includes("marketing") ||
                           systemContext.toLowerCase().includes("stratégie") ||
                           systemContext.toLowerCase().includes("analyse de marché") ||
                           prompt.toLowerCase().includes("json") ||
                           prompt.toLowerCase().includes("structure complète");
  
  if (!mistralApiKey || mistralApiKey === 'placeholder' || mistralApiKey.length < 10) {
    console.log("[Mistral] ⚠️ Mode développement activé - Pas de clé API Mistral valide");
    console.log("[Mistral] Pour activer le mode production avec l'IA réelle :");
    console.log("[Mistral] 1. Créez un compte sur https://console.mistral.ai/");
    console.log("[Mistral] 2. Générez une clé API");
    console.log("[Mistral] 3. Ajoutez MISTRAL_API_KEY=votre-clé dans votre fichier .env.local");
    
    // Si pas de clé Mistral valide, utiliser une réponse par défaut
    if (isWebsiteGeneration) {
      return generateDefaultWebsite(prompt);
    }
    return generateDefaultBusinessResponse(prompt, systemContext);
  }
  
  console.log("[Mistral] Clé API détectée, appel à l'API Mistral");
  console.log(`[Mistral] Type de génération - Website: ${isWebsiteGeneration}, Stratégie complexe: ${isComplexStrategy}`);
  console.log(`[Mistral] Max tokens: ${isWebsiteGeneration ? 4000 : (isComplexStrategy ? 4000 : 2000)}`);

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
        max_tokens: isWebsiteGeneration ? 4000 : (isComplexStrategy ? 8000 : 2000), // Beaucoup plus de tokens pour les stratégies complexes
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Mistral] API error response:", response.status, errorText);
      
      try {
        const error = JSON.parse(errorText);
        console.error("[Mistral] Error details:", error);
        
        // Si le modèle n'est pas disponible, essayer avec un modèle alternatif
        if (error.message?.includes('model') || response.status === 404) {
          console.log("[Mistral] Modèle non disponible, essai avec mistral-small-latest");
          
          const fallbackResponse = await fetch(MISTRAL_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mistralApiKey}`
            },
            body: JSON.stringify({
              model: "mistral-small-latest",
              messages: [
                { role: "system", content: systemContext },
                { role: "user", content: prompt }
              ],
              temperature: 0.7,
              max_tokens: isWebsiteGeneration ? 4000 : (isComplexStrategy ? 4000 : 2000),
              stream: false
            })
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            return {
              success: true,
              content: fallbackData.choices[0]?.message?.content || "Aucune réponse générée"
            };
          }
        }
      } catch (e) {
        console.error("[Mistral] Erreur parsing error:", e);
      }
      
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      content: data.choices[0]?.message?.content || "Aucune réponse générée"
    };
  } catch (error: any) {
    console.error("[Mistral] Exception:", error.message);
    throw error; // Propager l'erreur pour que le système utilise HuggingFace
  }
}

// Fonction pour générer un site web par défaut
function generateDefaultWebsite(prompt: string): MistralResponse {
  // Extraire les informations du prompt
  let businessName = "Mon Business";
  let industry = "general";
  let description = "Notre entreprise innovante";
  
  const businessMatch = prompt.match(/pour ([^.]+)\./);
  if (businessMatch) {
    businessName = businessMatch[1].trim();
  }
  
  const descMatch = prompt.match(/Description[^:]*:\s*([^\n]+)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }
  
  const industryMatch = prompt.match(/Industrie[^:]*:\s*([^\n]+)/i);
  if (industryMatch) {
    industry = industryMatch[1].trim().toLowerCase();
  }

  // Générer un site HTML personnalisé
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Solutions innovantes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #6D3FC8; color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        nav { display: flex; justify-content: space-between; align-items: center; }
        nav ul { display: flex; list-style: none; gap: 2rem; }
        nav a { color: white; text-decoration: none; transition: opacity 0.3s; }
        nav a:hover { opacity: 0.8; }
        .hero { background: linear-gradient(135deg, #6D3FC8 0%, #5A35A5 100%); color: white; padding: 120px 0 80px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; animation: fadeInUp 0.8s ease-out; }
        .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; animation: fadeInUp 0.8s ease-out 0.2s both; }
        .btn { display: inline-block; padding: 12px 30px; background: white; color: #6D3FC8; text-decoration: none; border-radius: 5px; font-weight: bold; transition: transform 0.3s; animation: fadeInUp 0.8s ease-out 0.4s both; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        section { padding: 80px 0; }
        h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #333; }
        .services { background: #f8f9fa; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .service-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s; }
        .service-card:hover { transform: translateY(-5px); box-shadow: 0 5px 20px rgba(0,0,0,0.15); }
        .service-icon { font-size: 3rem; margin-bottom: 1rem; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .hero h1 { font-size: 2rem; } nav ul { gap: 1rem; } }
        .contact-form { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
        textarea { resize: vertical; min-height: 120px; }
        footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <h3>${businessName}</h3>
            <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section id="accueil" class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>${description}</p>
            <p class="tagline">Innovation et excellence au service de votre réussite</p>
            <a href="#contact" class="btn">Découvrez nos solutions</a>
        </div>
    </section>

    <section id="services" class="services">
        <div class="container">
            <h2>Nos Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">🚀</div>
                    <h3>Innovation</h3>
                    <p>Solutions créatives et modernes adaptées à vos besoins spécifiques</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">💡</div>
                    <h3>Expertise</h3>
                    <p>Une équipe d'experts passionnés à votre service</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">🛡️</div>
                    <h3>Fiabilité</h3>
                    <p>Un partenaire de confiance pour accompagner votre croissance</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2>Contactez-nous</h2>
            <form class="contact-form">
                <div class="form-group">
                    <label for="name">Nom</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn">Envoyer</button>
            </form>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${businessName}. Tous droits réservés. | Créé avec Ezia</p>
        </div>
    </footer>
</body>
</html>`;

  return {
    success: true,
    content: html
  };
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