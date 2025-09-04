#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const API_DIRS = [
  'app/api/me/business',
  'app/api/ezia',
  'app/api/user-projects',
];

async function findFilesRecursively(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

async function migrateFile(filePath: string) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  
  // Check if file uses isUsingMemoryDB
  if (!content.includes('isUsingMemoryDB')) {
    return false;
  }
  
  console.log(`📝 Migrating: ${filePath}`);
  
  // Update imports
  if (content.includes('import { getMemoryDB, isUsingMemoryDB }')) {
    content = content.replace(
      'import { getMemoryDB, isUsingMemoryDB }',
      'import { getMemoryDB }'
    );
    
    // Add db-utils import if not present
    if (!content.includes('from "@/lib/db-utils"')) {
      const lastImport = content.lastIndexOf('import');
      const endOfLine = content.indexOf('\n', lastImport);
      content = content.slice(0, endOfLine + 1) + 
        'import { getDatabase } from "@/lib/db-utils";\n' + 
        content.slice(endOfLine + 1);
    }
    modified = true;
  }
  
  // Replace isUsingMemoryDB() patterns
  const patterns = [
    {
      from: /if \(isUsingMemoryDB\(\)\) {/g,
      to: 'const { type, db } = await getDatabase();\n    if (type === \'memory\') {'
    },
    {
      from: /const memoryDB = getMemoryDB\(\);/g,
      to: '// Memory DB is now available as db parameter'
    }
  ];
  
  for (const pattern of patterns) {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      modified = true;
    }
  }
  
  // Fix memoryDB usage to db
  content = content.replace(/memoryDB\./g, 'db!.');
  
  if (modified) {
    await fs.writeFile(filePath, content);
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 Starting MongoDB migration...\n');
  
  let totalFiles = 0;
  let migratedFiles = 0;
  
  for (const dir of API_DIRS) {
    if (await fs.access(dir).then(() => true).catch(() => false)) {
      const files = await findFilesRecursively(dir);
      totalFiles += files.length;
      
      for (const file of files) {
        if (await migrateFile(file)) {
          migratedFiles++;
        }
      }
    }
  }
  
  console.log(`\n📊 Migration complete!`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files migrated: ${migratedFiles}`);
  
  if (migratedFiles > 0) {
    console.log('\n⚠️  Please review the changes and test thoroughly!');
    console.log('💡 Run "npm run dev" and test all features to ensure everything works.');
  }
}

main().catch(console.error);