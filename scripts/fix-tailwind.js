// Script pour convertir la syntaxe Tailwind v4 en v3
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../assets/globals.css');
const content = fs.readFileSync(cssPath, 'utf8');

// Remplacer @import "tailwindcss" par les directives v3
const fixed = content.replace(
  '@import "tailwindcss";',
  '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
);

fs.writeFileSync(cssPath, fixed);
console.log('✅ CSS fixed for production build');