@echo off
echo Organisation des commits par categories...

REM Commit de la documentation
echo Commit de la documentation...
git add README.md LOGGER_UNIFICATION.md CONFIG_UNIFICATION.md AUTH_REFACTORING.md AUTH_UNIFICATION.md REFACTORING_SUMMARY.md NEXT_STEPS.md CLEANUP.md CORRECTIONS.md DUPLICATIONS.md
git commit -m "docs: ajout de la documentation pour la refactorisation des services fondamentaux"

REM Commit des services de base
echo Commit des services de base...
git add src/core/logger/CentralLogger.ts src/core/logger/adapters/LocalStorageLogger.ts src/core/logger/index.ts
git commit -m "feat: unification du service de logging"

git add src/core/config/ConfigService.ts src/core/config/index.ts src/core/config/types.ts
git commit -m "feat: unification du service de configuration"

git add src/core/auth/services/AuthService.ts src/core/auth/services/AuthServiceBase.ts src/core/auth/services/FirebaseAuthService.ts src/core/auth/services/Web3AuthService.ts src/core/errors/ErrorService.ts src/core/errors/index.ts
git commit -m "feat: refactorisation des services d'authentification"

REM Commit des scripts de migration
echo Commit des scripts de migration...
git add scripts/update-logger-imports.js scripts/update-config-imports.js scripts/update-auth-imports.js scripts/update-test-mocks.js scripts/update-test-imports.js scripts/update-test-classes.js scripts/package.json scripts/package-lock.json scripts/README.md
git commit -m "feat: ajout de scripts de migration pour les imports"

REM Commit des tests
echo Commit des tests...
git add src/tests/logger.test.ts src/tests/config.test.ts src/tests/auth.test.ts
git commit -m "test: ajout de tests pour les services refactorises"

REM Commit des hooks
echo Commit des hooks...
git add src/hooks/useAuth.ts src/hooks/useError.ts src/hooks/useTokenDeploy.ts src/hooks/useTokenForge.ts src/hooks/useWagmiConfig.tsx
git commit -m "refactor: mise a jour des hooks pour utiliser les services refactorises"

REM Commit des fonctionnalités
echo Commit des fonctionnalites...
git add src/features/token-creation/services/tokenDeploymentService.ts
git commit -m "refactor: mise a jour des fonctionnalites de creation de token"

REM Commit de la configuration
echo Commit de la configuration...
git add package.json package-lock.json vitest.base.config.ts vitest.auth.config.ts vitest.config.ts
git commit -m "chore: mise a jour de la configuration du projet"

echo Organisation des commits terminee !
