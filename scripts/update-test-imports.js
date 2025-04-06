/**
 * Script pour mettre à jour les imports dans les tests
 * 
 * Usage: node update-test-imports.js
 */

import fs from 'fs';
import path from 'path';
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
  
  // Configuration
  '@/config/env': '@/core/config',
  '@/config/validator': '@/core/config',
  '@/utils/env': '@/core/config',
  '@/config/index': '@/core/config',
  '@/utils/config': '@/core/config',
  '@/config/constants/index': '@/core/config',
  '@/utils/validateConfig': '@/core/config',
  '@/config/firebase/types': '@/core/config',
  
  // Authentification
  '@/auth/services/AuthService': '@/core/auth/services/AuthService',
  '@/auth/hooks/useAuth': '@/hooks/useAuth',
  '@/auth/AuthProvider': '@/core/auth/AuthProvider',
  '@/auth/types/auth.types': '@/core/auth/services/AuthServiceBase',
  '@/features/auth/services/firebaseService': '@/core/auth/services/FirebaseAuthService',
  '@/features/auth/services/web3AuthService': '@/core/auth/services/Web3AuthService',
  '@/features/auth/hooks/useFirebaseAuth': '@/hooks/useAuth',
  '@/features/auth/hooks/useAuthState': '@/hooks/useAuth',
  '@/features/auth/hooks/useAuth': '@/hooks/useAuth',
  '@/features/auth/hooks/useTokenForgeAuth': '@/hooks/useAuth',
  '@/features/auth/providers/AuthProvider': '@/core/auth/AuthProvider',
  '@/features/auth/types': '@/core/auth/services/AuthServiceBase',
  '@/security/services/EnhancedAuthService': '@/core/auth/services/AuthService'
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
  console.log('Searching for test files...');
  const testFiles = findTestFiles(path.join(__dirname, '..', 'src'));
  console.log(`Found ${testFiles.length} test files.`);
  
  console.log('Updating imports...');
  testFiles.forEach(file => {
    updateImportsInFile(file);
  });
  
  console.log('Done!');
}

main();
