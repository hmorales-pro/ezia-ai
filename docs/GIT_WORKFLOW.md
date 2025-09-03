# Workflow Git - Ezia

## Branches principales

- **`main`** : Branche de production (déployée automatiquement sur Dokploy)
- **`preprod`** : Branche de pré-production pour tester les nouvelles fonctionnalités

## Workflow de développement

### 1. Toujours travailler sur `preprod`
```bash
# S'assurer d'être sur preprod
git checkout preprod

# Mettre à jour avec les derniers changements
git pull origin preprod
```

### 2. Développer et commiter
```bash
# Faire les modifications
# ...

# Commiter les changements
git add .
git commit -m "feat: nouvelle fonctionnalité"

# Pousser sur preprod
git push origin preprod
```

### 3. Tester en pré-production
- Les changements sont automatiquement déployés sur l'environnement preprod Dokploy
- Tester toutes les fonctionnalités
- Vérifier qu'il n'y a pas de régression

### 4. Merger vers main (après validation)
```bash
# Une fois validé, se mettre sur main
git checkout main
git pull origin main

# Merger preprod dans main
git merge preprod

# Pousser sur main
git push origin main
```

### Alternative : Pull Request
Au lieu du merge direct, créer une Pull Request sur GitHub :
1. Aller sur https://github.com/hmorales-pro/ezia-ai
2. Cliquer sur "New Pull Request"
3. Base: `main` ← Compare: `preprod`
4. Réviser les changements
5. Merger la PR

## Commandes utiles

### Voir l'état actuel
```bash
# Branche actuelle et modifications
git status

# Historique des commits
git log --oneline -10

# Différences entre branches
git diff main..preprod
```

### Synchroniser preprod avec main
```bash
# Si main a des changements qu'on veut dans preprod
git checkout preprod
git merge main
git push origin preprod
```

### Annuler des changements (si besoin)
```bash
# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Revenir à l'état de la branche distante
git reset --hard origin/preprod
```

## Configuration Dokploy recommandée

1. **Application Production** (existante)
   - Branche : `main`
   - URL : ezia.ai

2. **Application Preprod** (à créer)
   - Branche : `preprod`  
   - URL : preprod.ezia.ai (ou autre sous-domaine)

## Avantages de ce workflow

✅ **Sécurité** : Aucun risque de casser la production
✅ **Tests réels** : Validation en conditions réelles sur preprod
✅ **Traçabilité** : Historique clair des changements
✅ **Rollback facile** : Si un problème survient en production
✅ **Collaboration** : Permet de travailler à plusieurs sans conflit

## Convention de commit

Utiliser des préfixes pour clarifier les changements :
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, CSS, etc.
- `refactor:` - Refactoring du code
- `test:` - Ajout ou modification de tests
- `chore:` - Maintenance, config, etc.

Exemple :
```bash
git commit -m "feat: ajout du dashboard analytics"
git commit -m "fix: correction erreur validation waitlist"
git commit -m "docs: mise à jour guide MongoDB"
```

## Notes importantes

⚠️ **Ne jamais** pousser directement sur `main` sans passer par `preprod`
⚠️ **Toujours** tester sur preprod avant de merger
⚠️ **Vérifier** que preprod est à jour avec main avant de commencer à travailler

Ce workflow garantit une production stable tout en permettant d'itérer rapidement sur les nouvelles fonctionnalités.