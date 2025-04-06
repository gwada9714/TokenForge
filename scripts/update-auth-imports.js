/**
 * Script pour mettre à jour les imports d'authentification dans le projet
 * 
 * Usage: node update-auth-imports.js
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
  '@/security/services/EnhancedAuthService': '@/core/auth/services/AuthService',
  'src/auth/services/AuthService': 'src/core/auth/services/AuthService',
  'src/auth/hooks/useAuth': 'src/hooks/useAuth',
  'src/auth/AuthProvider': 'src/core/auth/AuthProvider',
  'src/auth/types/auth.types': 'src/core/auth/services/AuthServiceBase',
  'src/features/auth/services/firebaseService': 'src/core/auth/services/FirebaseAuthService',
  'src/features/auth/services/web3AuthService': 'src/core/auth/services/Web3AuthService',
  'src/features/auth/hooks/useFirebaseAuth': 'src/hooks/useAuth',
  'src/features/auth/hooks/useAuthState': 'src/hooks/useAuth',
  'src/features/auth/hooks/useAuth': 'src/hooks/useAuth',
  'src/features/auth/hooks/useTokenForgeAuth': 'src/hooks/useAuth',
  'src/features/auth/providers/AuthProvider': 'src/core/auth/AuthProvider',
  'src/features/auth/types': 'src/core/auth/services/AuthServiceBase',
  'src/security/services/EnhancedAuthService': 'src/core/auth/services/AuthService',
  '../auth/services/AuthService': '../core/auth/services/AuthService',
  '../auth/hooks/useAuth': '../hooks/useAuth',
  '../auth/AuthProvider': '../core/auth/AuthProvider',
  '../auth/types/auth.types': '../core/auth/services/AuthServiceBase',
  '../features/auth/services/firebaseService': '../core/auth/services/FirebaseAuthService',
  '../features/auth/services/web3AuthService': '../core/auth/services/Web3AuthService',
  '../features/auth/hooks/useFirebaseAuth': '../hooks/useAuth',
  '../features/auth/hooks/useAuthState': '../hooks/useAuth',
  '../features/auth/hooks/useAuth': '../hooks/useAuth',
  '../features/auth/hooks/useTokenForgeAuth': '../hooks/useAuth',
  '../features/auth/providers/AuthProvider': '../core/auth/AuthProvider',
  '../features/auth/types': '../core/auth/services/AuthServiceBase',
  '../security/services/EnhancedAuthService': '../core/auth/services/AuthService',
  '../../auth/services/AuthService': '../../core/auth/services/AuthService',
  '../../auth/hooks/useAuth': '../../hooks/useAuth',
  '../../auth/AuthProvider': '../../core/auth/AuthProvider',
  '../../auth/types/auth.types': '../../core/auth/services/AuthServiceBase',
  '../../features/auth/services/firebaseService': '../../core/auth/services/FirebaseAuthService',
  '../../features/auth/services/web3AuthService': '../../core/auth/services/Web3AuthService',
  '../../features/auth/hooks/useFirebaseAuth': '../../hooks/useAuth',
  '../../features/auth/hooks/useAuthState': '../../hooks/useAuth',
  '../../features/auth/hooks/useAuth': '../../hooks/useAuth',
  '../../features/auth/hooks/useTokenForgeAuth': '../../hooks/useAuth',
  '../../features/auth/providers/AuthProvider': '../../core/auth/AuthProvider',
  '../../features/auth/types': '../../core/auth/services/AuthServiceBase',
  '../../security/services/EnhancedAuthService': '../../core/auth/services/AuthService',
  '../../../auth/services/AuthService': '../../../core/auth/services/AuthService',
  '../../../auth/hooks/useAuth': '../../../hooks/useAuth',
  '../../../auth/AuthProvider': '../../../core/auth/AuthProvider',
  '../../../auth/types/auth.types': '../../../core/auth/services/AuthServiceBase',
  '../../../features/auth/services/firebaseService': '../../../core/auth/services/FirebaseAuthService',
  '../../../features/auth/services/web3AuthService': '../../../core/auth/services/Web3AuthService',
  '../../../features/auth/hooks/useFirebaseAuth': '../../../hooks/useAuth',
  '../../../features/auth/hooks/useAuthState': '../../../hooks/useAuth',
  '../../../features/auth/hooks/useAuth': '../../../hooks/useAuth',
  '../../../features/auth/hooks/useTokenForgeAuth': '../../../hooks/useAuth',
  '../../../features/auth/providers/AuthProvider': '../../../core/auth/AuthProvider',
  '../../../features/auth/types': '../../../core/auth/services/AuthServiceBase',
  '../../../security/services/EnhancedAuthService': '../../../core/auth/services/AuthService',
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
  
  console.log('Updating authentication imports...');
  tsFiles.forEach(file => {
    updateImportsInFile(file);
  });
  
  console.log('Done!');
}

main();
