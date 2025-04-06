/**
 * Script pour organiser les commits par catégories
 * 
 * Usage: node organize-commits.js
 */

const { execSync } = require('child_process');

// Fonction pour exécuter une commande shell
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Fonction pour effectuer un commit
function commit(message, files) {
  const fileList = Array.isArray(files) ? files.join(' ') : files;
  try {
    runCommand(`git add ${fileList}`);
    runCommand(`git commit -m "${message}"`);
    console.log(`Commit effectué: ${message}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors du commit: ${message}`);
    console.error(error.message);
    return false;
  }
}

// Catégories de fichiers
const categories = {
  documentation: [
    'README.md',
    'LOGGER_UNIFICATION.md',
    'CONFIG_UNIFICATION.md',
    'AUTH_REFACTORING.md',
    'AUTH_UNIFICATION.md',
    'REFACTORING_SUMMARY.md',
    'NEXT_STEPS.md',
    'CLEANUP.md',
    'CORRECTIONS.md',
    'DUPLICATIONS.md'
  ],
  coreServices: [
    'src/core/logger/**/*',
    'src/core/config/**/*',
    'src/core/auth/**/*',
    'src/core/errors/**/*'
  ],
  scripts: [
    'scripts/update-logger-imports.js',
    'scripts/update-config-imports.js',
    'scripts/update-auth-imports.js',
    'scripts/update-test-mocks.js',
    'scripts/update-test-imports.js',
    'scripts/update-test-classes.js',
    'scripts/package.json',
    'scripts/package-lock.json',
    'scripts/README.md'
  ],
  tests: [
    'src/tests/**/*'
  ],
  hooks: [
    'src/hooks/useAuth.ts',
    'src/hooks/useError.ts',
    'src/hooks/useTokenDeploy.ts',
    'src/hooks/useTokenForge.ts',
    'src/hooks/useWagmiConfig.tsx'
  ],
  features: [
    'src/features/token-creation/**/*',
    'src/features/auth/**/*',
    'src/features/services/**/*'
  ],
  components: [
    'src/components/**/*',
    'src/providers/**/*',
    'src/guards/**/*'
  ],
  config: [
    'package.json',
    'package-lock.json',
    'vitest.base.config.ts',
    'vitest.auth.config.ts',
    'vitest.config.ts'
  ]
};

// Fonction principale
async function main() {
  console.log('Organisation des commits par catégories...');
  
  // Commit de la documentation
  commit('docs: ajout de la documentation pour la refactorisation des services fondamentaux', categories.documentation);
  
  // Commit des services de base
  commit('feat: unification du service de logging', ['src/core/logger/**/*']);
  commit('feat: unification du service de configuration', ['src/core/config/**/*']);
  commit('feat: refactorisation des services d\'authentification', ['src/core/auth/**/*', 'src/core/errors/**/*']);
  
  // Commit des scripts de migration
  commit('feat: ajout de scripts de migration pour les imports', categories.scripts);
  
  // Commit des tests
  commit('test: ajout de tests pour les services refactorisés', categories.tests);
  
  // Commit des hooks
  commit('refactor: mise à jour des hooks pour utiliser les services refactorisés', categories.hooks);
  
  // Commit des fonctionnalités
  commit('refactor: mise à jour des fonctionnalités de création de token', ['src/features/token-creation/**/*']);
  commit('refactor: mise à jour des fonctionnalités d\'authentification', ['src/features/auth/**/*']);
  commit('refactor: mise à jour des fonctionnalités de services', ['src/features/services/**/*']);
  
  // Commit des composants
  commit('refactor: mise à jour des composants pour utiliser les services refactorisés', categories.components);
  
  // Commit de la configuration
  commit('chore: mise à jour de la configuration du projet', categories.config);
  
  console.log('Organisation des commits terminée !');
}

main().catch(console.error);
