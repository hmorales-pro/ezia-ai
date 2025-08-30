#!/bin/sh
# Script pour fixer le CSS pendant le build Docker

# 1. Remplacer @import "tailwindcss" dans globals.css
echo "Fixing globals.css..."
sed -i 's/@import "tailwindcss";/@tailwind base;\n@tailwind components;\n@tailwind utilities;/' assets/globals.css

# 2. Si ça ne marche pas, copier le fichier fixé
if grep -q "@import \"tailwindcss\"" assets/globals.css; then
  echo "sed failed, copying fixed CSS..."
  cp assets/globals.fixed.css assets/globals.css
fi

# 3. Vérifier que le fix a marché
if grep -q "@import \"tailwindcss\"" assets/globals.css; then
  echo "ERROR: CSS still contains @import tailwindcss!"
  exit 1
fi

echo "CSS fixed successfully!"