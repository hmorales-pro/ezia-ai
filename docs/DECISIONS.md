# Décisions Architecturales - Ezia vBeta

Ce document trace toutes les décisions importantes prises lors du développement d'Ezia vBeta.

## Format des décisions
Chaque décision suit le format :
- **Date** : YYYY-MM-DD
- **Contexte** : Pourquoi cette décision était nécessaire
- **Décision** : Ce qui a été décidé
- **Raison** : Justification du choix
- **Conséquences** : Impact sur le projet

---

## 2025-01-06 : Architecture Multi-Agents basée sur DeepSite v2

**Contexte** : Transformation de DeepSite v2 en Ezia vBeta, une plateforme d'accompagnement business complète.

**Décision** : Construire Ezia vBeta autour de l'infrastructure existante de DeepSite v2 plutôt que de repartir de zéro.

**Raison** :
- Infrastructure AI déjà fonctionnelle
- Authentification HuggingFace OAuth en place
- Système de déploiement sur HuggingFace Spaces existant
- Gain de temps considérable

**Conséquences** :
- Héritage de la stack technique (Next.js 15, MongoDB, HuggingFace)
- Nécessité d'adapter plutôt que de recréer
- Conservation de la compatibilité avec HuggingFace

---

## 2025-01-06 : Modèle de Données Orienté Business

**Contexte** : Besoin de structurer les données pour supporter multiple business par utilisateur avec suivi complet.

**Décision** : Création de 4 modèles principaux :
1. `Business` - Entité business principale
2. `AgentSession` - Sessions de conversation avec les agents
3. `AgentTemplate` - Configuration des agents IA
4. `EziaProject` - Sites web liés aux business

**Raison** :
- Séparation claire des responsabilités
- Historisation complète des interactions
- Flexibilité pour ajouter de nouveaux types d'agents
- Support multi-business natif

**Conséquences** :
- Plus de complexité que le modèle simple de DeepSite
- Meilleure traçabilité et évolutivité
- Possibilité d'analytics avancées

---

## 2025-01-06 : Hiérarchie d'Agents avec Ezia comme Cheffe de Projet

**Contexte** : Organisation du système multi-agents pour couvrir tous les aspects business.

**Décision** : Structure hiérarchique avec :
- Ezia : Cheffe de projet, interface unique avec l'utilisateur
- Chefs d'équipe : Agents nommés qui gèrent des domaines spécifiques
- Agents spécialisés : Ultra-spécialisés dans leurs domaines

**Raison** :
- Clarté pour l'utilisateur (un seul point de contact)
- Délégation naturelle des tâches
- Scalabilité du système
- Possibilité d'audit des décisions

**Conséquences** :
- Complexité de la coordination inter-agents
- Nécessité d'un système de messaging robuste
- Ezia devient le goulot d'étranglement potentiel

---

## 2025-01-06 : Hébergement sur HuggingFace Spaces

**Contexte** : Choix de la plateforme d'hébergement pour les sites créés.

**Décision** : Continuer à utiliser HuggingFace Spaces avec préfixe "ezia-" pour la marque.

**Raison** :
- Infrastructure déjà en place
- Gratuit pour les utilisateurs
- Intégration native avec l'authentification
- Possibilité de migrer plus tard

**Conséquences** :
- Dépendance à HuggingFace
- URLs sous le domaine huggingface.co
- Limitations des Spaces (static sites)
- Besoin futur de custom domains

---

## 2025-01-06 : Authentification via HuggingFace OAuth

**Contexte** : Système d'authentification pour Ezia vBeta.

**Décision** : Conserver et étendre le système OAuth HuggingFace existant.

**Raison** :
- Déjà implémenté et fonctionnel
- Intégration naturelle avec les Spaces
- Pas de gestion de mots de passe
- Trust de la communauté HuggingFace

**Conséquences** :
- Tous les utilisateurs doivent avoir un compte HuggingFace
- Dépendance externe pour l'auth
- Possibilité limitée de customisation
- Onboarding business après première connexion

---

## 2025-01-06 : MongoDB pour la Persistance

**Contexte** : Choix de la base de données.

**Décision** : Garder MongoDB (déjà utilisé par DeepSite).

**Raison** :
- Déjà configuré et fonctionnel
- Flexibilité du schéma pour l'évolution
- Bon support des structures complexes
- Compatible avec Mongoose ODM

**Conséquences** :
- NoSQL donc pas de relations strictes
- Besoin de gérer la cohérence manuellement
- Scalabilité horizontale native
- Requêtes complexes plus difficiles

---

## 2025-01-06 : Règles de Développement Strictes

**Contexte** : Standards de qualité pour le projet.

**Décision** :
1. Aucun hardcode toléré
2. Aucun fallback toléré
3. Configuration externalisée
4. Modification minimale de DeepSite v2

**Raison** :
- Maintenabilité à long terme
- Facilité de configuration
- Éviter la dette technique
- Respect de l'existant

**Conséquences** :
- Plus de fichiers de configuration
- Code plus verbeux mais plus clair
- Temps de développement initial plus long
- Meilleure qualité globale

---

## 2025-01-06 : Architecture des API Business

**Contexte** : Création des endpoints API pour gérer les business, sessions et projets.

**Décision** : Suivre exactement le pattern des API existantes de DeepSite v2 :
- Structure RESTful avec routes dynamiques Next.js
- Authentication via `isAuthenticated()` middleware
- Format de réponse uniforme `{ ok: true/false, ...data }`
- Soft delete pour les business (is_active flag)
- Pagination pour les listes volumineuses

**Raison** :
- Cohérence avec l'existant
- Facilité de maintenance
- Pattern déjà testé et fonctionnel
- Familiarité pour les développeurs

**Conséquences** :
- Routes créées :
  - `/api/me/business` - CRUD des business
  - `/api/me/business/[businessId]` - Gestion d'un business
  - `/api/me/business/[businessId]/sessions` - Sessions d'agents
  - `/api/me/business/[businessId]/projects` - Projets du business
- Limite de 10 business par utilisateur
- Historisation de toutes les interactions

---

## Décisions Futures à Prendre

### Court terme
- [ ] Choix du design system pour Ezia
- [ ] Structure des prompts pour chaque agent
- [ ] Stratégie de rate limiting par utilisateur
- [ ] Format des rapports générés

### Moyen terme
- [ ] Migration vers serveur dédié
- [ ] Système de paiement/abonnements
- [ ] Custom domains pour les sites
- [ ] Intégrations tierces (CRM, email, etc.)

### Long terme
- [ ] Architecture microservices
- [ ] API publique Ezia
- [ ] SDK pour développeurs
- [ ] Marketplace d'agents

---

## Notes de Maintenance

- Ce document doit être mis à jour à chaque décision importante
- Format de commit : "docs: ADR - [sujet de la décision]"
- Revoir les décisions tous les 3 mois
- Archiver les décisions obsolètes dans `/docs/archive/`