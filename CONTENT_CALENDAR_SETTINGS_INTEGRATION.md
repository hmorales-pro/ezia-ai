# 🎯 Guide d'Intégration - Paramètres Calendrier de Contenu

## ✅ Ce qui est déjà fait

1. **Composant ContentCalendarSettings créé** ([components/business/content-calendar-settings.tsx](components/business/content-calendar-settings.tsx))
   - Interface de configuration des règles de publication
   - Sélection plateforme + type de contenu + fréquence
   - Statistiques en temps réel (total publications/semaine et /mois)
   - Design avec icônes et couleurs Ezia

2. **État ajouté dans UnifiedContentCalendar**
   - `publicationRules: PublicationRule[]` - Stockage des règles
   - `showSettings: boolean` - Affichage du panneau de configuration
   - Interface `PublicationRule` définie

---

## 🔧 Étapes d'Intégration Complète

### Étape 1 : Afficher le panneau de paramètres

**Fichier** : `components/business/unified-content-calendar.tsx`

**Action** : Ajouter un bouton pour ouvrir les paramètres et afficher le composant

```typescript
// Dans le header du calendrier, ajouter un bouton Settings :
<Button
  variant="outline"
  onClick={() => setShowSettings(!showSettings)}
  className="flex items-center gap-2"
>
  <Settings className="w-4 h-4" />
  Paramètres
</Button>

// Afficher le composant quand showSettings === true :
{showSettings && (
  <div className="mb-6">
    <ContentCalendarSettings
      businessId={businessId}
      existingRules={publicationRules}
      onSettingsSaved={handleSaveSettings}
    />
  </div>
)}
```

### Étape 2 : Gérer la sauvegarde des règles

**Fonction à ajouter** dans `UnifiedContentCalendar` :

```typescript
const handleSaveSettings = async (rules: PublicationRule[]) => {
  setPublicationRules(rules);
  setShowSettings(false);

  // Sauvegarder dans MongoDB
  try {
    await api.post(`/api/me/business/${businessId}/calendar-settings`, {
      publicationRules: rules
    });
    toast.success("Paramètres sauvegardés !");

    // Lancer la génération automatique du calendrier
    generateCalendarFromRules(rules);
  } catch (error) {
    console.error("Error saving calendar settings:", error);
    toast.error("Erreur lors de la sauvegarde");
  }
};
```

### Étape 3 : Charger les règles au démarrage

**Dans `loadSavedCalendar()`** :

```typescript
const loadSavedCalendar = async () => {
  try {
    const response = await api.get(`/api/me/business/${businessId}/calendar`);

    if (response.data.calendar?.items) {
      setContentItems(response.data.calendar.items);
    }

    // Charger les règles de publication
    if (response.data.calendar?.publicationRules) {
      setPublicationRules(response.data.calendar.publicationRules);
    }

    setHasAICalendar(response.data.calendar?.items?.some(item => item.ai_generated));
  } catch (error) {
    console.error("Error loading calendar:", error);
  }
};
```

### Étape 4 : Générer le calendrier basé sur les règles

**Nouvelle fonction** à ajouter :

```typescript
const generateCalendarFromRules = async (rules: PublicationRule[]) => {
  if (rules.length === 0) {
    toast.error("Aucune règle définie");
    return;
  }

  setGeneratingCalendar(true);

  try {
    // Construire le prompt pour l'IA avec les règles
    const rulesDescription = rules.map(rule => {
      const periodLabel = rule.period === 'day' ? 'par jour' :
                         rule.period === 'week' ? 'par semaine' : 'par mois';
      return `- ${rule.frequency} ${rule.contentType} pour ${rule.platform} ${periodLabel}`;
    }).join('\n');

    const response = await api.post(`/api/me/business/${businessId}/regenerate-calendar`, {
      businessInfo: {
        name: businessName,
        description: businessDescription,
        industry: businessIndustry,
        marketAnalysis,
        marketingStrategy,
        competitorAnalysis
      },
      publicationRules: rules, // Envoyer les règles
      rulesDescription, // Description textuelle pour l'IA
      existingItems: contentItems,
      keepExisting: false
    });

    if (response.data.success && response.data.calendar) {
      await saveContentItems(response.data.calendar);
      setHasAICalendar(true);
      toast.success(`Calendrier généré avec ${response.data.calendar.length} publications !`);
    }
  } catch (error) {
    console.error("Error generating calendar:", error);
    toast.error("Erreur lors de la génération");
  } finally {
    setGeneratingCalendar(false);
  }
};
```

---

## 📡 Modifications API Nécessaires

### API 1 : Sauvegarde des paramètres

**Fichier** : `app/api/me/business/[businessId]/calendar-settings/route.ts` (à créer)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import dbConnect from "@/lib/db";
import { Calendar } from "@/models/Calendar";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const { businessId } = params;
  const { publicationRules } = await request.json();

  await dbConnect();

  const calendar = await Calendar.findOneAndUpdate(
    { businessId, userId: user.id },
    { publicationRules, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, calendar });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const user = await isAuthenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const { businessId } = params;

  await dbConnect();

  const calendar = await Calendar.findOne({ businessId, userId: user.id });

  return NextResponse.json({
    success: true,
    publicationRules: calendar?.publicationRules || []
  });
}
```

### API 2 : Modifier la génération du calendrier

**Fichier** : `app/api/me/business/[businessId]/regenerate-calendar/route.ts`

**Ajouter dans le prompt de l'IA** :

```typescript
// Dans la route POST, récupérer les règles :
const { publicationRules, rulesDescription } = await request.json();

// Modifier le prompt pour inclure les règles :
const prompt = `Tu es un expert en stratégie de contenu...

${rulesDescription ? `
RÈGLES DE PUBLICATION À RESPECTER ABSOLUMENT :
${rulesDescription}

Génère exactement le nombre de publications demandé pour chaque plateforme et type de contenu.
` : ''}

Génère un calendrier de contenu sur 1 mois...`;
```

### Modèle MongoDB : Ajouter publicationRules

**Fichier** : `models/Calendar.ts`

```typescript
// Ajouter dans le schema :
publicationRules: [{
  id: String,
  platform: String,
  contentType: String,
  frequency: Number,
  period: String
}]
```

---

## 🎯 Exemple d'Utilisation

### Scénario Utilisateur

L'utilisateur veut :
- 5 posts LinkedIn/semaine (articles professionnels)
- 3 posts Instagram/semaine (visuels inspirants)
- 1 vidéo YouTube/semaine (tutoriels)

**Résultat attendu** :
- Calendrier généré avec **exactement** ces quantités
- Répartition intelligente sur la semaine
- Contenu adapté à chaque plateforme
- Respect du ton et de l'identité du business

---

## 📋 Checklist d'Intégration

- [ ] Ajouter bouton "Paramètres" dans le header du calendrier
- [ ] Afficher `ContentCalendarSettings` conditionnellement
- [ ] Créer fonction `handleSaveSettings`
- [ ] Créer fonction `generateCalendarFromRules`
- [ ] Modifier `loadSavedCalendar` pour charger les règles
- [ ] Créer API `/calendar-settings` (POST + GET)
- [ ] Modifier API `/regenerate-calendar` pour utiliser les règles
- [ ] Ajouter `publicationRules` au modèle Calendar MongoDB
- [ ] Tester génération avec règles personnalisées
- [ ] Vérifier sauvegarde et persistance des règles

---

## 🚀 Améliorations Futures

1. **Templates de règles pré-définis**
   - "Startup en croissance" (agressif)
   - "PME stable" (modéré)
   - "Lancement produit" (intensif)

2. **Calendrier prédictif**
   - Meilleurs jours/heures selon la plateforme
   - Optimisation automatique de la répartition

3. **Analyse de performance**
   - Tracking des publications
   - Suggestions d'ajustement des règles

4. **Import/Export de configurations**
   - Partager des stratégies de contenu
   - Dupliquer entre plusieurs business

---

## 💡 Notes Techniques

### Format des Règles

```typescript
interface PublicationRule {
  id: string;              // Ex: "rule_1703429873654"
  platform: string;        // Ex: "linkedin", "instagram"
  contentType: string;     // Ex: "article", "video", "social"
  frequency: number;       // Ex: 5
  period: "day" | "week" | "month"; // Ex: "week"
}
```

### Calcul des Publications

```typescript
// Publications par semaine
const perWeek = rules.reduce((total, rule) => {
  if (rule.period === "day") return total + rule.frequency * 7;
  if (rule.period === "week") return total + rule.frequency;
  if (rule.period === "month") return total + (rule.frequency / 4);
  return total;
}, 0);
```

---

**Dernière mise à jour** : 23 Octobre 2025
**Status** : Phase 1 complète - En attente d'intégration UI et API
