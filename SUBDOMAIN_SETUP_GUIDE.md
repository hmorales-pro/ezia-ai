# Guide de Configuration des Sous-domaines

Ce guide explique comment faire fonctionner les sous-domaines pour votre plateforme Ezia.

## 🏗️ Architecture Actuelle

Le système de sous-domaines est déjà intégré dans le code :

1. **Génération automatique** : Chaque nouveau site reçoit un sous-domaine unique
2. **Middleware** : Le fichier `middleware.ts` intercepte les requêtes de sous-domaines
3. **Route dynamique** : `/app/[subdomain]/page.tsx` affiche le contenu des sites

## 🚀 Pour le Développement Local

### Option 1 : Utiliser /etc/hosts (Recommandé)

1. Éditez votre fichier hosts :
```bash
sudo nano /etc/hosts
```

2. Ajoutez vos sous-domaines de test :
```
127.0.0.1   restfree.localhost
127.0.0.1   business-de-demonstration.localhost
127.0.0.1   business-de-demonstration-1.localhost
```

3. Accédez aux sites via : `http://restfree.localhost:3000`

### Option 2 : Utiliser un service comme nip.io

Accédez directement via : `http://restfree.127.0.0.1.nip.io:3000`

## 🌐 Pour la Production

### Option 1 : Configuration DNS (Domaine personnel)

Si vous déployez sur votre propre domaine :

1. **Configurez un wildcard DNS** chez votre registrar :
   ```
   *.votredomaine.com → IP de votre serveur
   ```

2. **Modifiez le middleware** pour votre domaine :
   ```typescript
   // Dans lib/subdomain-utils.ts
   export function getFullUrl(subdomain: string, baseDomain: string = 'votredomaine.com'): string {
     return `https://${subdomain}.${baseDomain}`;
   }
   ```

### Option 2 : Utiliser Vercel (Recommandé)

1. **Déployez sur Vercel** :
   ```bash
   vercel
   ```

2. **Configurez le domaine wildcard** dans Vercel :
   - Allez dans Project Settings → Domains
   - Ajoutez `*.votredomaine.com`
   - Vercel gérera automatiquement le SSL

### Option 3 : Utiliser un sous-domaine de service

Services qui offrent des sous-domaines gratuits :
- **Vercel** : `*.vercel.app`
- **Netlify** : `*.netlify.app`
- **Railway** : `*.up.railway.app`

## 📝 Test des Sous-domaines

### 1. Vérifier qu'un site a un sous-domaine
```bash
# Dans la console du navigateur
fetch('/api/user-projects-db')
  .then(r => r.json())
  .then(data => console.log(data.projects.map(p => ({ name: p.name, subdomain: p.subdomain }))))
```

### 2. Tester la disponibilité d'un sous-domaine
```bash
# Dans la console du navigateur
fetch('/api/subdomain/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subdomain: 'mon-test' })
})
.then(r => r.json())
.then(data => console.log(data))
```

### 3. Accéder à un site via son sous-domaine
- **En local** : `http://[subdomain].localhost:3000`
- **En production** : `https://[subdomain].votredomaine.com`

## 🔧 Configuration SSL (Production)

### Avec Vercel/Netlify
SSL automatique, rien à faire !

### Avec votre serveur
1. Utilisez **Let's Encrypt** avec wildcard :
   ```bash
   certbot certonly --manual --preferred-challenges dns \
     -d "*.votredomaine.com" -d "votredomaine.com"
   ```

2. Configurez Nginx :
   ```nginx
   server {
     server_name ~^(?<subdomain>.+)\.votredomaine\.com$;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Subdomain $subdomain;
     }
   }
   ```

## 🎯 Statut Actuel

✅ **Déjà implémenté** :
- Génération automatique de sous-domaines uniques
- Stockage dans la base de données
- Middleware pour router les requêtes
- Page dynamique pour afficher les sites
- API de vérification de disponibilité

⏳ **À configurer selon votre déploiement** :
- Configuration DNS (wildcard)
- SSL pour HTTPS
- Domaine personnalisé

## 💡 Conseils

1. **Pour tester rapidement** : Utilisez `/etc/hosts` en local
2. **Pour la production** : Vercel est le plus simple
3. **Pour un contrôle total** : Utilisez votre propre serveur avec Nginx

## 🚨 Important

- Les sous-domaines ne fonctionnent PAS avec `localhost` directement
- Vous devez configurer DNS ou hosts pour tester
- En production, un wildcard DNS est nécessaire