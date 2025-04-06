/**
 * Script pour mettre à jour les imports du logger dans le projet
 * 
 * Usage: node update-logger-imports.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obtenir le répertoire actuel en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mappings des imports à mettre à jour
const importMappings = {
  // Logger
  '@/utils/logger': '@/core/logger',
  '@/utils/firebase-logger': '@/core/logger',
  'src/utils/logger': 'src/core/logger',
  'src/utils/firebase-logger': 'src/core/logger',
  '../utils/logger': '../core/logger',
  '../utils/firebase-logger': '../core/logger',
  '../../utils/logger': '../../core/logger',
  '../../utils/firebase-logger': '../../core/logger',
  '../../../utils/logger': '../../../core/logger',
  '../../../utils/firebase-logger': '../../../core/logger',
};

// Fonction pour trouver tous les fichiers TypeScript et TSX
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findTsFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour mettre à jour les imports dans un fichier
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Vérifier et mettre à jour chaque mapping d'import
  Object.entries(importMappings).forEach(([oldImport, newImport]) => {
    // Regex pour trouver les imports
    const importRegex = new RegExp(`import\\s+(?:{[^}]*}|[^{};]*)\\s+from\\s+['"]${oldImport.replace('/', '\\/')}['"]`, 'g');
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match) => {
        return match.replace(oldImport, newImport);
      });
      updated = true;
    }
    
    // Regex pour trouver les imports dynamiques
    const dynamicImportRegex = new RegExp(`import\\(['"]${oldImport.replace('/', '\\/')}['"]\\)`, 'g');
    
    if (dynamicImportRegex.test(content)) {
      content = content.replace(dynamicImportRegex, (match) => {
        return match.replace(oldImport, newImport);
      });
      updated = true;
    }
  });
  
  // Sauvegarder le fichier si des modifications ont été apportées
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

// Fonction principale
function main() {
  console.log('Searching for TypeScript files...');
  const tsFiles = findTsFiles(path.join(__dirname, '..', 'src'));
  console.log(`Found ${tsFiles.length} TypeScript files.`);
  
  console.log('Updating logger imports...');
  tsFiles.forEach(file => {
    updateImportsInFile(file);
  });
  
  console.log('Done!');
}

main();
