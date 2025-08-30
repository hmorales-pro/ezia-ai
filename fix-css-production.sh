#!/bin/bash
# Script pour corriger le CSS avant le build de production

echo "🔧 Fixing CSS for production build..."

# Sauvegarder l'original
cp assets/globals.css assets/globals.css.backup

# Créer le nouveau contenu
cat > assets/globals.css << 'EOF'
/* Tailwind CSS v3 syntax for production */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ebe7e1;
  --foreground: #1E1E1E;
  --primary: #6D3FC8;
  --primary-foreground: #ffffff;
  --secondary: #F5F5F5;
  --secondary-foreground: #1E1E1E;
  --muted: #F5F5F5;
  --muted-foreground: #6B7280;
  --accent: #F3F4F6;
  --accent-foreground: #1E1E1E;
  --destructive: #EF4444;
  --destructive-foreground: #ffffff;
  --border: #E5E5E5;
  --input: #E5E5E5;
  --ring: #6D3FC8;
  --radius: 0.5rem;
  
  /* Font variables */
  --font-sans: 'Poppins', system-ui, sans-serif;
  --font-mono: 'PT Sans', monospace;
  --font-poppins: 'Poppins', system-ui, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-poppins), system-ui, sans-serif;
  margin: 0;
  padding: 0;
}

* {
  border-color: var(--border);
}

/* Ensure background is applied */
body::before {
  content: "";
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  background: var(--background);
}
EOF

echo "✅ CSS fixed! Original backed up to assets/globals.css.backup"
echo "📄 New content:"
head -n 5 assets/globals.css