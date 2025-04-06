# Script PowerShell pour organiser les commits par catégories

# Fonction pour effectuer un commit
function Commit-Files {
    param (
        [string]$message,
        [string[]]$files
    )
    
    try {
        foreach ($file in $files) {
            git add $file
        }
        git commit -m $message
        Write-Host "Commit effectué: $message" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Erreur lors du commit: $message" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Commit de la documentation
Write-Host "Commit de la documentation..." -ForegroundColor Cyan
Commit-Files "docs: ajout de la documentation pour la refactorisation des services fondamentaux" @(
    "README.md",
    "LOGGER_UNIFICATION.md",
    "CONFIG_UNIFICATION.md",
    "AUTH_REFACTORING.md",
    "AUTH_UNIFICATION.md",
    "REFACTORING_SUMMARY.md",
    "NEXT_STEPS.md",
    "CLEANUP.md",
    "CORRECTIONS.md",
    "DUPLICATIONS.md"
)

# Commit des services de base
Write-Host "Commit des services de base..." -ForegroundColor Cyan
Commit-Files "feat: unification du service de logging" @(
    "src/core/logger/CentralLogger.ts",
    "src/core/logger/adapters/LocalStorageLogger.ts",
    "src/core/logger/index.ts"
)

Commit-Files "feat: unification du service de configuration" @(
    "src/core/config/ConfigService.ts",
    "src/core/config/index.ts",
    "src/core/config/types.ts"
)

Commit-Files "feat: refactorisation des services d'authentification" @(
    "src/core/auth/services/AuthService.ts",
    "src/core/auth/services/AuthServiceBase.ts",
    "src/core/auth/services/FirebaseAuthService.ts",
    "src/core/auth/services/Web3AuthService.ts",
    "src/core/errors/ErrorService.ts",
    "src/core/errors/index.ts"
)

# Commit des scripts de migration
Write-Host "Commit des scripts de migration..." -ForegroundColor Cyan
Commit-Files "feat: ajout de scripts de migration pour les imports" @(
    "scripts/update-logger-imports.js",
    "scripts/update-config-imports.js",
    "scripts/update-auth-imports.js",
    "scripts/update-test-mocks.js",
    "scripts/update-test-imports.js",
    "scripts/update-test-classes.js",
    "scripts/package.json",
    "scripts/package-lock.json",
    "scripts/README.md"
)

# Commit des tests
Write-Host "Commit des tests..." -ForegroundColor Cyan
Commit-Files "test: ajout de tests pour les services refactorisés" @(
    "src/tests/logger.test.ts",
    "src/tests/config.test.ts",
    "src/tests/auth.test.ts"
)

# Commit des hooks
Write-Host "Commit des hooks..." -ForegroundColor Cyan
Commit-Files "refactor: mise à jour des hooks pour utiliser les services refactorisés" @(
    "src/hooks/useAuth.ts",
    "src/hooks/useError.ts",
    "src/hooks/useTokenDeploy.ts",
    "src/hooks/useTokenForge.ts",
    "src/hooks/useWagmiConfig.tsx"
)

# Commit des fonctionnalités
Write-Host "Commit des fonctionnalités..." -ForegroundColor Cyan
Commit-Files "refactor: mise à jour des fonctionnalités de création de token" @(
    "src/features/token-creation/services/tokenDeploymentService.ts"
)

# Commit de la configuration
Write-Host "Commit de la configuration..." -ForegroundColor Cyan
Commit-Files "chore: mise à jour de la configuration du projet" @(
    "package.json",
    "package-lock.json",
    "vitest.base.config.ts",
    "vitest.auth.config.ts",
    "vitest.config.ts"
)

Write-Host "Organisation des commits terminée !" -ForegroundColor Green
