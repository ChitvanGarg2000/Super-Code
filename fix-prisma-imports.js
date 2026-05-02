import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prismaDir = path.join(__dirname, 'generated', 'prisma');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace .js imports with .ts imports for local files
  content = content.replace(/from ["']\.\/([^"']+)\.js["']/g, 'from "./$1.ts"');
  content = content.replace(/from ["'](\.\/internal\/[^"']+)\.js["']/g, 'from "$1.ts"');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Fixed imports in ${path.relative(__dirname, filePath)}`);
}

// Process all generated TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixImportsInFile(filePath);
    }
  }
}

processDirectory(prismaDir);
console.log('✓ All Prisma imports fixed for ESM TypeScript');
