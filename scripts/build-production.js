#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Preparing production build...');

// 1. Backup and fix CSS
const cssPath = path.join(__dirname, '..', 'assets', 'globals.css');
const backupPath = path.join(__dirname, '..', 'assets', 'globals.backup.css');

const cssContent = fs.readFileSync(cssPath, 'utf8');
fs.writeFileSync(backupPath, cssContent);

// Replace Tailwind v4 syntax with v3
const fixedCss = cssContent.replace('@import "tailwindcss";', `
@tailwind base;
@tailwind components;
@tailwind utilities;
`);

fs.writeFileSync(cssPath, fixedCss);
console.log('✅ CSS fixed for production');

// 2. Fix PostCSS config
const postcssPath = path.join(__dirname, '..', 'postcss.config.js');
const postcssBackup = path.join(__dirname, '..', 'postcss.config.backup.js');

const postcssContent = fs.readFileSync(postcssPath, 'utf8');
fs.writeFileSync(postcssBackup, postcssContent);

fs.writeFileSync(postcssPath, `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);
console.log('✅ PostCSS config fixed');

// 3. Run build
console.log('🏗️ Running production build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // 4. Restore original files
  fs.writeFileSync(cssPath, cssContent);
  fs.writeFileSync(postcssPath, postcssContent);
  console.log('✅ Original files restored');
}