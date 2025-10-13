# 📧 Guide : Installation du script PHP pour les emails Webinaire

## 🎯 Avantages de cette solution

✅ **Simple** : Pas de configuration Docker/Dokploy complexe
✅ **Indépendant** : Le script PHP gère ses propres credentials
✅ **Sécurisé** : Authentification par token Bearer
✅ **Réutilisable** : Peut être utilisé par d'autres projets
✅ **Facile à débugger** : Logs PHP accessibles directement

---

## 📋 Étape 1 : Déployer le script PHP

### A. Uploader les fichiers sur votre hébergement

Via FTP, SSH, ou le gestionnaire de fichiers de votre hébergement, uploadez ces 2 fichiers :

```
/votre-hebergement/
  ├── send-webinar-email.php          (script principal)
  └── email-template-confirmation.html (template email)
```

**Localisation recommandée** :
- `https://votre-hebergement.com/webhooks/send-webinar-email.php`
- ou `https://eziom.com/api/send-webinar-email.php`
- ou tout autre emplacement accessible par HTTPS

### B. Configurer les credentials dans le PHP

Éditez `send-webinar-email.php` ligne 23-27 :

```php
define('BREVO_API_KEY', 'VOTRE_CLE_BREVO_API_ICI');
define('BREVO_SENDER_EMAIL', 'noreply@ezia.ai');
define('BREVO_SENDER_NAME', 'Ezia.ai');
define('ADMIN_EMAIL', 'hugo.morales.pro+waitlist@gmail.com');
define('SECRET_KEY', 'ezia-webhook-secret-2025-CHANGEZ-CETTE-CLE');
```

⚠️ **IMPORTANT** :
- Changez `SECRET_KEY` par une valeur aléatoire longue
- Cette clé doit être la même dans Ezia et dans le PHP

### C. Tester le script PHP

```bash
curl -X POST https://votre-hebergement.com/send-webinar-email.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ezia-webhook-secret-2025-CHANGEZ-CETTE-CLE" \
  -d '{
    "type": "confirmation",
    "firstName": "Test",
    "lastName": "User",
    "email": "votre-email@test.com",
    "company": "Test Corp",
    "position": "Testeur"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Email de confirmation envoyé",
  "timestamp": "2025-10-13T12:00:00+00:00"
}
```

---

## 📋 Étape 2 : Configurer Ezia pour utiliser le PHP

### A. Ajouter les variables d'environnement dans Dokploy

Dans l'interface Dokploy, ajoute ces 2 variables :

| Variable | Valeur |
|----------|--------|
| `PHP_EMAIL_ENDPOINT` | `https://votre-hebergement.com/send-webinar-email.php` |
| `PHP_EMAIL_SECRET` | `ezia-webhook-secret-2025-CHANGEZ-CETTE-CLE` |

⚠️ La valeur de `PHP_EMAIL_SECRET` **DOIT** être identique à `SECRET_KEY` dans le PHP.

### B. Redéployer Ezia

Une fois les variables ajoutées dans Dokploy :
1. Clique sur **"Redeploy"** ou **"Restart"**
2. Attends 2-3 minutes

---

## 📋 Étape 3 : Vérifier que tout fonctionne

### A. Tester une inscription webinaire

1. Va sur **https://ezia.ai/webinaire**
2. Remplis le formulaire d'inscription
3. Soumets

**Ce qui doit se passer** :
- ✅ L'inscription est enregistrée dans MongoDB
- ✅ Tu reçois un email de confirmation avec fichier .ics
- ✅ L'admin reçoit une notification

### B. Vérifier les logs

**Logs Docker (Ezia)** :
```bash
# Sur le serveur Dokploy
docker logs <container-id> | grep "PHP endpoint"
```

Tu devrais voir :
```
📤 Envoi confirmation via PHP endpoint: https://votre-hebergement.com/send-webinar-email.php
✅ confirmation envoyé avec succès via PHP: Email de confirmation envoyé
```

**Logs PHP** :
- Selon ton hébergement, les logs sont dans `/var/log/apache2/error.log` ou via le panel d'administration

---

## 🔧 Troubleshooting

### ❌ Erreur 401 Unauthorized

**Cause** : La clé secrète ne correspond pas entre Ezia et le PHP

**Solution** :
1. Vérifie que `PHP_EMAIL_SECRET` dans Dokploy = `SECRET_KEY` dans le PHP
2. Redéploie Ezia

### ❌ Erreur CORS

**Cause** : Le serveur PHP bloque les requêtes cross-origin

**Solution** : Dans `send-webinar-email.php` ligne 11, vérifie :
```php
header('Access-Control-Allow-Origin: https://ezia.ai');
```

Si Ezia est sur un autre domaine, change `https://ezia.ai`.

### ❌ Erreur 500 Internal Server Error

**Cause** : Erreur PHP (syntaxe, extension manquante, etc.)

**Solution** :
1. Vérifie les logs PHP de ton hébergement
2. Vérifie que l'extension `curl` est activée : `php -m | grep curl`
3. Vérifie les permissions du fichier : `chmod 644 send-webinar-email.php`

### ❌ Email non reçu mais status 200

**Cause** : La clé Brevo est incorrecte ou le sender n'est pas vérifié

**Solution** :
1. Vérifie sur https://app.brevo.com que `noreply@ezia.ai` est vérifié
2. Teste la clé Brevo directement :
```bash
curl https://api.brevo.com/v3/account \
  -H "api-key: VOTRE_CLE_BREVO_API_ICI"
```

---

## 🔒 Sécurité

### Protection supplémentaire (optionnel)

Tu peux ajouter d'autres couches de sécurité dans le PHP :

**1. Limiter par IP** :
```php
$allowed_ips = ['IP-DU-SERVEUR-DOKPLOY'];
if (!in_array($_SERVER['REMOTE_ADDR'], $allowed_ips)) {
    http_response_code(403);
    exit;
}
```

**2. Rate limiting** :
```php
// Limiter à 10 requêtes par minute
if (get_rate_limit($_SERVER['REMOTE_ADDR']) > 10) {
    http_response_code(429);
    exit;
}
```

**3. Logs d'audit** :
```php
file_put_contents('/var/log/ezia-webhooks.log',
    date('Y-m-d H:i:s') . ' - ' . json_encode($data) . PHP_EOL,
    FILE_APPEND
);
```

---

## 📊 Monitoring

### Vérifier que le PHP fonctionne

Crée un endpoint de health check dans `send-webinar-email.php` :

```php
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['health'])) {
    echo json_encode([
        'status': 'ok',
        'timestamp': date('c'),
        'php_version': phpversion(),
        'curl_enabled': extension_loaded('curl')
    ]);
    exit;
}
```

Teste : `https://votre-hebergement.com/send-webinar-email.php?health`

---

## ✅ Checklist finale

- [ ] Fichiers PHP uploadés sur l'hébergement
- [ ] Credentials Brevo configurés dans le PHP
- [ ] SECRET_KEY changée et sécurisée
- [ ] `email-template-confirmation.html` au même emplacement que le PHP
- [ ] Variables `PHP_EMAIL_ENDPOINT` et `PHP_EMAIL_SECRET` ajoutées dans Dokploy
- [ ] Ezia redéployée
- [ ] Test d'inscription webinaire → email reçu ✅
- [ ] Notification admin reçue ✅
- [ ] Logs PHP vérifiés

**Si toutes les cases sont cochées → 🎉 C'EST PRÊT !**

---

## 🆘 Support

Si tu rencontres des problèmes :

1. Vérifie les logs Docker Ezia : `docker logs <container-id>`
2. Vérifie les logs PHP de ton hébergement
3. Teste le endpoint PHP directement avec curl
4. Vérifie que Brevo fonctionne : https://status.brevo.com/

