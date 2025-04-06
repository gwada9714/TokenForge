/**
 * Script pour mettre à jour les classes dans les tests
 * 
 * Usage: node update-test-classes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire actuel en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mappings des classes à mettre à jour
const classMappings = {
  // Authentification
  'AuthService': 'authService',
  'FirebaseService': 'firebaseAuthService',
  'Web3AuthService': 'web3AuthService',
  'EnhancedAuthService': 'authService',
  'TokenForgeAuthService': 'authService',
  'FirebaseAuthService': 'firebaseAuthService',
  
  // Logger
  'Logger': 'logger',
  'FirebaseLogger': 'logger',
  'ConsoleLogger': 'logger',
  
  // Configuration
  'ConfigService': 'configService',
  'EnvironmentService': 'configService',
  'FirebaseConfigService': 'configService'
};

// Fonction pour trouver tous les fichiers de test
function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findTestFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.spec.ts') || file.endsWith('.spec.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour mettre à jour les classes dans un fichier
function updateClassesInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Vérifier et mettre à jour chaque mapping de classe
  Object.entries(classMappings).forEach(([oldClass, newClass]) => {
    // Regex pour trouver les instanciations de classe
    const classRegex = new RegExp(`new ${oldClass}\\(`, 'g');
    
    if (classRegex.test(content)) {
      content = content.replace(classRegex, `${newClass}`);
      updated = true;
    }
    
    // Regex pour trouver les appels de méthodes statiques
    const staticMethodRegex = new RegExp(`${oldClass}\\.getInstance\\(\\)`, 'g');
    
    if (staticMethodRegex.test(content)) {
      content = content.replace(staticMethodRegex, `${newClass}`);
      updated = true;
    }
  });
  
  // Sauvegarder le fichier si des modifications ont été apportées
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated classes in ${filePath}`);
  }
}

// Fonction principale
function main() {
  console.log('Searching for test files...');
  const testFiles = findTestFiles(path.join(__dirname, '..', 'src'));
  console.log(`Found ${testFiles.length} test files.`);
  
  console.log('Updating classes...');
  testFiles.forEach(file => {
    updateClassesInFile(file);
  });
  
  console.log('Done!');
}

main();
