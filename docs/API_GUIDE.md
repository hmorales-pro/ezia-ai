# Guide des API Ezia vBeta

## Vue d'ensemble

Les API Ezia suivent le pattern RESTful avec authentification via HuggingFace OAuth. Toutes les réponses suivent le format : `{ ok: true/false, ...data }`.

## Authentification

Toutes les routes nécessitent une authentification. Le token peut être passé via :
- Cookie : `ezia-auth-token` 
- Header : `Authorization: Bearer <token>`

## Endpoints Business

### Gestion des Business

#### Liste des business
```
GET /api/me/business
```
Retourne tous les business actifs de l'utilisateur (limite 50).

#### Créer un business
```
POST /api/me/business
Body: {
  "name": "Mon Business",
  "description": "Description",
  "industry": "Tech",
  "stage": "startup" // idea|startup|growth|established
}
```
Limite : 10 business par utilisateur.

#### Récupérer un business
```
GET /api/me/business/{businessId}
```

#### Mettre à jour un business
```
PUT /api/me/business/{businessId}
Body: Champs à modifier (name, description, industry, stage, social_media, etc.)
```

#### Archiver un business
```
DELETE /api/me/business/{businessId}
```
Soft delete - le business est marqué comme inactif.

### Sessions d'Agents

#### Liste des sessions
```
GET /api/me/business/{businessId}/sessions
Query params:
  - status: active|completed|paused|failed
  - agentType: ezia|market_analyst|marketing_chief|etc
  - limit: number (défaut 20)
  - offset: number (défaut 0)
```

#### Créer une session
```
POST /api/me/business/{businessId}/sessions
Body: {
  "objective": "Analyser mon marché",
  "initial_request": "J'aimerais comprendre mon marché cible",
  "agent_type": "ezia" // optionnel, défaut: ezia
}
```

#### Récupérer une session
```
GET /api/me/business/{businessId}/sessions/{sessionId}
```

#### Mettre à jour une session
```
PUT /api/me/business/{businessId}/sessions/{sessionId}
Body: {
  "action": "add_message|complete|pause|resume|fail",
  "data": { /* données selon l'action */ }
}
```

Actions disponibles :
- `add_message` : Ajouter un message à la conversation
- `complete` : Terminer la session avec résultats
- `pause` : Mettre en pause
- `resume` : Reprendre une session pausée
- `fail` : Marquer comme échouée

#### Supprimer une session
```
DELETE /api/me/business/{businessId}/sessions/{sessionId}
```

### Projets (Sites Web)

#### Liste des projets d'un business
```
GET /api/me/business/{businessId}/projects
```

#### Créer ou lier un projet
```
POST /api/me/business/{businessId}/projects
```

**Créer un nouveau projet :**
```json
{
  "title": "Site Web Mon Business",
  "description": "Landing page moderne",
  "type": "landing_page" // landing_page|portfolio|e_commerce|blog|corporate|other
}
```

**Lier un projet existant :**
```json
{
  "action": "link_existing",
  "space_id": "username/repo-name",
  "title": "Titre optionnel",
  "description": "Description optionnelle"
}
```

## Codes de Statut

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Exemples d'Utilisation

### Créer un business et démarrer une session

```javascript
// 1. Créer un business
const business = await fetch('/api/me/business', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Ma Startup Tech",
    description: "Plateforme SaaS innovante",
    industry: "Technology",
    stage: "startup"
  })
});

const { business: newBusiness } = await business.json();

// 2. Démarrer une session avec Ezia
const session = await fetch(`/api/me/business/${newBusiness.business_id}/sessions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    objective: "Analyser le marché SaaS",
    initial_request: "J'aimerais comprendre le marché SaaS B2B en France"
  })
});

const { session: newSession } = await session.json();

// 3. Ajouter un message à la session
await fetch(`/api/me/business/${newBusiness.business_id}/sessions/${newSession.session_id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: "add_message",
    data: {
      role: "assistant",
      content: "Je vais analyser le marché SaaS B2B français...",
      metadata: {
        agent_name: "Ezia",
        confidence: 0.95
      }
    }
  })
});
```

## Limites et Quotas

- **Business par utilisateur** : 10 maximum
- **Sessions actives simultanées** : 5 par business
- **Taille des messages** : 10KB maximum
- **Historique des sessions** : Conservé 90 jours

## Notes

- Tous les timestamps sont en UTC
- Les IDs suivent le format : `{prefix}_{nanoid}`
  - Business : `biz_xxxxxxxxxxxx`
  - Session : `ses_xxxxxxxxxxxxxxxx`
  - Project : `prj_xxxxxxxxxxxx`
- Les business supprimés sont archivés (soft delete)
- Les sessions complétées restent accessibles en lecture seule