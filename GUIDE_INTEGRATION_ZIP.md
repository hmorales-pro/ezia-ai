# 🎯 Guide d'intégration du téléchargement ZIP

## ✅ Ce qui a été créé

### 1. **Modal de téléchargement ZIP**
Fichier: `components/editor/complete-site-export-modal.tsx`

**Fonctionnalités** :
- ✅ Modal avec progression en temps réel
- ✅ 7 phases trackées (architecture, design, contenu, blog, pages, assets, export)
- ✅ Barre de progression animée
- ✅ Création automatique du fichier ZIP côté client
- ✅ Téléchargement automatique
- ✅ Gestion d'erreurs

**Détails du contenu** :
- Liste des fichiers inclus dans le ZIP
- Temps estimé (3-4 minutes)
- Indication visuelle pour chaque phase

### 2. **API Endpoint**
Fichier: `app/api/sites/generate-complete/route.ts`

**Endpoint** : `GET /api/sites/generate-complete`

**Paramètres** :
- `name` : Nom du business (required)
- `industry` : Industrie (required)
- `description` : Description (optional)
- `baseUrl` : URL du site (optional)

**Réponse** :
```json
{
  "success": true,
  "website": {
    "metadata": {...},
    "totalPages": 11,
    "totalFiles": 15
  },
  "files": {
    "index.html": "...",
    "blog/index.html": "...",
    "assets/css/style.css": "...",
    ...
  }
}
```

## 📦 Dépendance requise

**Package** : `jszip`

```bash
npm install jszip
```

**Status** : ⏳ Installation en cours (timeout possible)

**Alternative si timeout** :
```bash
# Arrêter tous les processus npm
killall node

# Réinstaller
npm install jszip --legacy-peer-deps
```

## 🔧 Étapes pour intégrer dans l'UI

### Étape 1 : Importer le modal dans UnifiedEditor

**Fichier** : `components/editor/unified-editor.tsx`

```tsx
// Ajouter l'import en haut du fichier (ligne 20)
import { CompleteSiteExportModal } from "./complete-site-export-modal";
import { Download } from "lucide-react";
```

### Étape 2 : Ajouter le state pour contrôler le modal

```tsx
// Dans le composant, après les autres useState (ligne 46)
const [showExportModal, setShowExportModal] = useState(false);
```

### Étape 3 : Ajouter le bouton dans le header

**Localisation** : Ligne 189-210 (section Actions)

```tsx
{/* Bouton Export ZIP - À ajouter AVANT le bouton "Voir le site" */}
{projectData && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowExportModal(true)}
    className="border-purple-200 hover:bg-purple-50"
  >
    <Download className="w-4 h-4 mr-2" />
    Télécharger ZIP
  </Button>
)}
```

### Étape 4 : Ajouter le modal à la fin du composant

```tsx
{/* À la toute fin, juste avant le </div> de fermeture */}
<CompleteSiteExportModal
  open={showExportModal}
  onOpenChange={setShowExportModal}
  businessName={businessName || projectData?.name || "Mon Business"}
  industry={projectData?.industry || "Services professionnels"}
  description={projectData?.description}
/>
```

## 📝 Code complet à ajouter

### Import (ligne ~20)
```tsx
import { CompleteSiteExportModal } from "./complete-site-export-modal";
import { Download } from "lucide-react"; // Ajouter Download à la ligne 9
```

### State (ligne ~46)
```tsx
const [showExportModal, setShowExportModal] = useState(false);
```

### Bouton (ligne ~200, dans la section Actions)
```tsx
{/* Bouton Télécharger ZIP complet */}
{projectData && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowExportModal(true)}
    className="border-purple-200 hover:bg-purple-50"
  >
    <Download className="w-4 h-4 mr-2" />
    Télécharger ZIP
  </Button>
)}
```

### Modal (à la fin du return, ligne ~280)
```tsx
{/* Modal de téléchargement ZIP */}
<CompleteSiteExportModal
  open={showExportModal}
  onOpenChange={setShowExportModal}
  businessName={businessName || projectData?.name || "Mon Business"}
  industry={projectData?.industry || "Services professionnels"}
  description={projectData?.description}
/>
```

## 🧪 Test

Une fois intégré :

1. **Accéder** à http://localhost:3000/sites/new?businessName=TestZip&industry=Tech
2. **Générer** un site (aperçu rapide avec le système actuel)
3. **Cliquer** sur "Télécharger ZIP" dans le header
4. **Observer** :
   - Modal s'ouvre
   - Phases progressent
   - Barre de progression avance
   - Fichier ZIP se télécharge automatiquement (3-4 min)

## ✅ Checklist d'intégration

- [ ] npm install jszip terminé
- [ ] Import du modal ajouté
- [ ] State showExportModal ajouté
- [ ] Bouton "Télécharger ZIP" ajouté dans le header
- [ ] Modal CompleteSiteExportModal ajouté en fin de composant
- [ ] Serveur redémarré (npm run dev)
- [ ] Test end-to-end réussi

## 🐛 Problèmes potentiels

### 1. jszip timeout lors de l'installation
**Solution** :
```bash
killall node
npm install jszip --force
```

### 2. Modal ne s'ouvre pas
**Vérifier** :
- Import correct du composant
- State `showExportModal` existe
- Bouton onClick={() => setShowExportModal(true)}

### 3. API retourne une erreur
**Vérifier dans les logs serveur** :
```bash
tail -f /tmp/ezia-multipage.log | grep "Complete Site"
```

### 4. ZIP ne se télécharge pas
**Vérifier** :
- jszip est bien installé
- Pas d'erreur dans la console navigateur (F12)
- L'API retourne bien `data.files`

## 📊 Flux complet

```
Utilisateur clique "Télécharger ZIP"
         ↓
Modal s'ouvre avec infos du site
         ↓
Utilisateur clique "Générer le ZIP"
         ↓
API /generate-complete appelée
         ↓
Orchestrateur démarre (7 phases)
         ↓
Chaque phase met à jour la progression
         ↓
API retourne { files: {...} }
         ↓
jszip crée le fichier ZIP
         ↓
Téléchargement automatique démarre
         ↓
Message de succès affiché
```

## 🎉 Résultat attendu

L'utilisateur obtient un fichier ZIP nommé :
`testzip-site-complet.zip`

**Contenu** :
```
site-complet.zip/
├── index.html (8-12 pages)
├── blog/
│   ├── index.html
│   └── article-*.html (3 articles)
├── a-propos.html
├── services.html
├── contact.html
├── mentions-legales.html
├── cgv.html
├── 404.html
├── assets/
│   ├── css/style.css
│   └── js/main.js
├── sitemap.xml
├── robots.txt
├── README.md
└── .htaccess
```

**Prêt à déployer sur** :
- Netlify (drag & drop)
- Vercel (vercel --prod)
- GitHub Pages
- Serveur classique (FTP)

---

**Créé le** : 5 octobre 2025, 17:15
**Status** : En attente de l'installation de jszip
