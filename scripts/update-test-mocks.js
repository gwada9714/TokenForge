/**
 * Script pour mettre à jour les mocks dans les tests
 * 
 * Usage: node update-test-mocks.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire actuel en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mappings des mocks à mettre à jour
const mockMappings = {
  // Logger
  "'@/utils/logger'": "'@/core/logger'",
  "'@/utils/firebase-logger'": "'@/core/logger'",
  "'src/utils/logger'": "'src/core/logger'",
  "'src/utils/firebase-logger'": "'src/core/logger'",
  "'../utils/logger'": "'../core/logger'",
  "'../utils/firebase-logger'": "'../core/logger'",
  "'../../utils/logger'": "'../../core/logger'",
  "'../../utils/firebase-logger'": "'../../core/logger'",
  "'../../../utils/logger'": "'../../../core/logger'",
  "'../../../utils/firebase-logger'": "'../../../core/logger'",
  
  // Configuration
  "'@/config/env'": "'@/core/config'",
  "'@/config/validator'": "'@/core/config'",
  "'@/utils/env'": "'@/core/config'",
  "'@/config/index'": "'@/core/config'",
  "'@/utils/config'": "'@/core/config'",
  "'@/config/constants/index'": "'@/core/config'",
  "'@/utils/validateConfig'": "'@/core/config'",
  "'@/config/firebase/types'": "'@/core/config'",
  
  // Authentification
  "'@/auth/services/AuthService'": "'@/core/auth/services/AuthService'",
  "'@/auth/hooks/useAuth'": "'@/hooks/useAuth'",
  "'@/auth/AuthProvider'": "'@/core/auth/AuthProvider'",
  "'@/auth/types/auth.types'": "'@/core/auth/services/AuthServiceBase'",
  "'@/features/auth/services/firebaseService'": "'@/core/auth/services/FirebaseAuthService'",
  "'@/features/auth/services/web3AuthService'": "'@/core/auth/services/Web3AuthService'",
  "'@/features/auth/hooks/useFirebaseAuth'": "'@/hooks/useAuth'",
  "'@/features/auth/hooks/useAuthState'": "'@/hooks/useAuth'",
  "'@/features/auth/hooks/useAuth'": "'@/hooks/useAuth'",
  "'@/features/auth/hooks/useTokenForgeAuth'": "'@/hooks/useAuth'",
  "'@/features/auth/providers/AuthProvider'": "'@/core/auth/AuthProvider'",
  "'@/features/auth/types'": "'@/core/auth/services/AuthServiceBase'",
  "'@/security/services/EnhancedAuthService'": "'@/core/auth/services/AuthService'"
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

// Fonction pour mettre à jour les mocks dans un fichier
function updateMocksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Vérifier et mettre à jour chaque mapping de mock
  Object.entries(mockMappings).forEach(([oldMock, newMock]) => {
    // Regex pour trouver les mocks
    const mockRegex = new RegExp(`vi\\.mock\\(${oldMock}`, 'g');
    
    if (mockRegex.test(content)) {
      content = content.replace(mockRegex, `vi.mock(${newMock}`);
      updated = true;
    }
    
    // Regex pour trouver les mocks avec jest
    const jestMockRegex = new RegExp(`jest\\.mock\\(${oldMock}`, 'g');
    
    if (jestMockRegex.test(content)) {
      content = content.replace(jestMockRegex, `jest.mock(${newMock}`);
      updated = true;
    }
  });
  
  // Sauvegarder le fichier si des modifications ont été apportées
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated mocks in ${filePath}`);
  }
}

// Fonction principale
function main() {
  console.log('Searching for test files...');
  const testFiles = findTestFiles(path.join(__dirname, '..', 'src'));
  console.log(`Found ${testFiles.length} test files.`);
  
  console.log('Updating mocks...');
  testFiles.forEach(file => {
    updateMocksInFile(file);
  });
  
  console.log('Done!');
}

main();
