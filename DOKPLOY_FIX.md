# Solution pour l'erreur Tailwind CSS sur Dokploy

## Problème
Dokploy force l'utilisation de `npm run dev` qui ne peut pas parser les directives `@tailwind` dans Next.js 15.

## Solution appliquée
1. Le fichier `app/global.css` contient maintenant du CSS compilé (sans directives @tailwind)
2. Le fichier original avec les directives est dans `app/global.original.css`

## Pour le développement local
```bash
# Régénérer le CSS après des changements Tailwind
pnpm run css:build

# Ou en mode watch
pnpm run css:watch
```

## Pour Dokploy
Le CSS est déjà compilé dans le repository, donc ça devrait fonctionner directement.

## Si vous devez revenir en arrière
```bash
cp app/global.original.css app/global.css
```
EOF < /dev/null