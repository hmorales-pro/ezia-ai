# Résolution des problèmes avec les fournisseurs AI

## Erreur : "Failed to perform inference: an HTTP error occurred when requesting the provider"

Cette erreur se produit lorsque le fournisseur AI sélectionné ne peut pas traiter votre demande. Voici comment la résoudre :

### Solutions rapides

1. **Changer de fournisseur AI**
   - Cliquez sur le bouton "Settings" dans l'interface DeepSite
   - Sélectionnez un autre fournisseur (NovitaAI, Groq, ou Together AI)
   - Essayez à nouveau de générer votre site

2. **Vérifier votre token HuggingFace**
   - Si vous êtes connecté, assurez-vous que votre compte HuggingFace a des crédits disponibles
   - Si vous n'êtes pas connecté, connectez-vous via le bouton "Se connecter" dans l'interface

### Fournisseurs recommandés par modèle

- **DeepSeek V3** : NovitaAI (recommandé), Groq
- **DeepSeek R1** : NovitaAI (recommandé), Together AI
- **Qwen3 Coder** : NovitaAI (recommandé)
- **Kimi K2** : Groq (recommandé), NovitaAI

### Configuration pour les développeurs

Si vous déployez votre propre instance, assurez-vous d'avoir configuré les tokens dans `.env.local` :

```bash
# Token pour l'utilisation locale (optionnel)
HF_TOKEN=hf_votre_token_ici

# Token par défaut pour les utilisateurs non authentifiés (obligatoire)
DEFAULT_HF_TOKEN=hf_votre_token_par_defaut_ici
```

### Problèmes persistants

Si le problème persiste après avoir essayé différents fournisseurs :

1. Déconnectez-vous et reconnectez-vous
2. Videz le cache de votre navigateur
3. Essayez avec un navigateur différent
4. Contactez le support sur GitHub Issues