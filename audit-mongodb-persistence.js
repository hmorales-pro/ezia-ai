const fs = require('fs');
const path = require('path');

// Patterns à rechercher
const PATTERNS = {
  MEMORY_STORAGE: {
    regex: /global\.|localStorage|sessionStorage|new Map\(|new Set\(/g,
    severity: 'HIGH',
    description: 'Stockage en mémoire ou local'
  },
  MONGODB_SAVE: {
    regex: /\.create\(|\.save\(|\.findOneAndUpdate\(|\.updateOne\(|\.insertOne\(/g,
    severity: 'GOOD',
    description: 'Sauvegarde MongoDB'
  },
  MEMORY_DB_USAGE: {
    regex: /isUsingMemoryDB\(\)|getMemoryDB\(\)|memoryDB\./g,
    severity: 'CRITICAL',
    description: 'Utilisation de MemoryDB'
  }
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    for (const [name, pattern] of Object.entries(PATTERNS)) {
      const matches = content.match(pattern.regex);
      if (matches) {
        findings.push({
          pattern: name,
          severity: pattern.severity,
          count: matches.length,
          description: pattern.description,
          file: filePath.replace(process.cwd(), '')
        });
      }
    }

    return findings;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let allFindings = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          allFindings = allFindings.concat(scanDirectory(filePath, extensions));
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const findings = scanFile(filePath);
        allFindings = allFindings.concat(findings);
      }
    }
  } catch (error) {
    // Ignorer les erreurs de permission
  }

  return allFindings;
}

console.log('🔍 Audit MongoDB Persistence - Ezia vBeta\n');
console.log('='.repeat(60));

const findings = scanDirectory(process.cwd());

// Grouper par sévérité
const critical = findings.filter(f => f.severity === 'CRITICAL');
const high = findings.filter(f => f.severity === 'HIGH');
const good = findings.filter(f => f.severity === 'GOOD');

console.log(`\n🚨 CRITICAL (${critical.length}) - Utilisation MemoryDB :`);
critical.forEach(f => {
  console.log(`   ${f.file}: ${f.count}x ${f.description}`);
});

console.log(`\n⚠️  HIGH (${high.length}) - Stockage temporaire :`);
const highGrouped = {};
high.forEach(f => {
  if (!highGrouped[f.file]) highGrouped[f.file] = [];
  highGrouped[f.file].push(f);
});
Object.entries(highGrouped).forEach(([file, items]) => {
  console.log(`   ${file}:`);
  items.forEach(item => {
    console.log(`      - ${item.count}x ${item.description}`);
  });
});

console.log(`\n✅ GOOD (${good.length}) - Sauvegardes MongoDB détectées :`);
const goodGrouped = {};
good.forEach(f => {
  if (!goodGrouped[f.file]) goodGrouped[f.file] = 0;
  goodGrouped[f.file] += f.count;
});
Object.entries(goodGrouped).slice(0, 10).forEach(([file, count]) => {
  console.log(`   ${file}: ${count} opérations`);
});

console.log(`\n${'='.repeat(60)}`);
console.log('\n📊 Résumé :');
console.log(`   - ${critical.length} fichiers utilisent MemoryDB (À CORRIGER)`);
console.log(`   - ${high.length} fichiers utilisent du stockage temporaire (À VÉRIFIER)`);
console.log(`   - ${Object.keys(goodGrouped).length} fichiers sauvegardent dans MongoDB (BON)`);

console.log('\n💡 Recommandations :');
if (critical.length > 0) {
  console.log('   1. ❌ URGENT: Remplacer isUsingMemoryDB par MongoDB dans les APIs');
}
if (high.length > 10) {
  console.log('   2. ⚠️  Vérifier que les stockages global/local sont des caches temporaires');
}
console.log('   3. ✅ Vérifier que MONGODB_URI est configuré en production');
console.log('\n');
