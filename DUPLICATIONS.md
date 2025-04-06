# Rapport des duplications dans le projet TokenForge

Ce document identifie les duplications dans le projet TokenForge et propose un plan pour les résoudre.

## 1. Configuration Firebase dupliquée

### Fichiers dupliqués:
- `src/config/firebase.ts`
- `src/config/firebase/index.ts` (version corrigée)
- `src/config/firebase/config.ts`
- `src/config/firebase/firebase.config.ts`

### Plan de correction:
1. Supprimer les fichiers redondants et conserver uniquement la version corrigée dans `src/config/firebase/index.ts`
2. Mettre à jour tous les imports pour pointer vers le fichier unifié

## 2. Services d'authentification dupliqués

### Services dupliqués:
- `src/core/auth/services/AuthService.ts`
- `src/auth/services/AuthService.ts`
- `src/security/services/EnhancedAuthService.ts`
- `src/features/auth/services/firebaseService.ts`
- `src/features/auth/services/web3AuthService.ts`

### Plan de correction:
1. Créer un service d'authentification unifié dans `src/core/auth/services/AuthService.ts`
2. Implémenter des adaptateurs pour les différentes méthodes d'authentification (Firebase, Web3)
3. Mettre à jour tous les imports pour utiliser le service unifié

## 3. Hooks d'authentification dupliqués

### Hooks dupliqués:
- `src/core/auth/hooks/useAuth.ts`
- `src/auth/hooks/useAuth.ts`
- `src/hooks/useAuth.ts`
- `src/features/auth/hooks/useFirebaseAuth.ts`
- `src/features/auth/hooks/useAuthState.ts`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/hooks/useTokenForgeAuth.tsx`

### Plan de correction:
1. Créer un hook d'authentification unifié dans `src/hooks/useAuth.ts`
2. Implémenter des options pour les différentes fonctionnalités
3. Mettre à jour tous les imports pour utiliser le hook unifié

## 4. Hooks de gestion d'erreur dupliqués

### Hooks dupliqués:
- `src/hooks/useError.ts` (version corrigée)
- `src/hooks/useErrorHandler.ts`
- `src/features/auth/hooks/useAuthError.ts`
- `src/components/hook/useErrorHandler.ts`

### Plan de correction:
1. Conserver uniquement la version corrigée dans `src/hooks/useError.ts`
2. Mettre à jour tous les imports pour utiliser le hook unifié

## 5. Configuration CSP dupliquée

### Fichiers dupliqués:
- `src/config/csp.ts`
- `src/security/csp-helper.ts`
- `src/security/middleware.ts` (version corrigée)
- `vite.config.ts.bak` (contient une configuration CSP)

### Plan de correction:
1. Conserver uniquement la version corrigée dans `src/security/middleware.ts`
2. Extraire les fonctions utilitaires dans un fichier séparé si nécessaire
3. Mettre à jour tous les imports pour utiliser la configuration unifiée

## 6. Configuration de tests dupliquée

### Fichiers dupliqués:
- `vitest.config.ts`
- `vitest.auth.config.ts`

### Plan de correction:
1. Créer un fichier de configuration de base `vitest.base.config.ts`
2. Étendre cette configuration dans des fichiers spécifiques si nécessaire
3. Mettre à jour les scripts de test pour utiliser la configuration appropriée

## 7. Services de logging dupliqués

### Fichiers dupliqués:
- `src/core/logger.ts`
- `src/utils/logger.ts`
- `backend/src/utils/logger.ts`

### Plan de correction:
1. Créer un service de logging unifié dans `src/core/logger.ts`
2. Implémenter des adaptateurs pour les différentes destinations (console, Firebase, Sentry)
3. Mettre à jour tous les imports pour utiliser le service unifié

## 8. Providers d'authentification dupliqués

### Fichiers dupliqués:
- `src/features/auth/providers/AuthProvider.tsx`
- `src/auth/AuthProvider.tsx`

### Plan de correction:
1. Créer un provider d'authentification unifié dans `src/core/auth/AuthProvider.tsx`
2. Mettre à jour tous les imports pour utiliser le provider unifié

## Étapes de mise en œuvre

1. **Phase 1: Nettoyage des configurations**
   - Supprimer les fichiers de configuration Firebase dupliqués
   - Unifier la configuration CSP
   - Unifier la configuration des tests

2. **Phase 2: Unification des services core**
   - Unifier le service de logging
   - Unifier le service d'authentification
   - Unifier le service de gestion d'erreurs

3. **Phase 3: Unification des hooks et providers**
   - Unifier les hooks d'authentification
   - Unifier les hooks de gestion d'erreur
   - Unifier les providers d'authentification

4. **Phase 4: Mise à jour des imports**
   - Mettre à jour tous les imports pour utiliser les fichiers unifiés
   - Vérifier qu'il n'y a pas de références aux anciens fichiers

5. **Phase 5: Tests et validation**
   - Exécuter les tests pour s'assurer que tout fonctionne correctement
   - Vérifier qu'il n'y a pas de régressions
