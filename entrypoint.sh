#!/bin/sh
# Entrypoint qui force le fix du CSS avant de démarrer

echo "🔧 Fixing CSS for production..."

# Remplacer le contenu problématique
cat > /app/assets/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Production CSS for Ezia */

:root {
  --background: #ebe7e1;
  --foreground: #1E1E1E;
  --primary: #6D3FC8;
  --primary-foreground: #ffffff;
  --border: #E5E5E5;
  --radius: 0.5rem;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-poppins), system-ui, sans-serif;
}

* {
  border-color: var(--border);
}
EOF

echo "✅ CSS fixed!"
echo "🚀 Starting production server..."

# Démarrer le serveur de production
exec node server.js