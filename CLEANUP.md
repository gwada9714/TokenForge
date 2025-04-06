# Nettoyage du projet TokenForge

Ce document résume les actions entreprises pour nettoyer le projet TokenForge et résoudre les problèmes de duplication.

## Changements effectués

### 1. Suppression des fichiers dupliqués

Les fichiers suivants ont été supprimés car ils étaient dupliqués:

- `src/config/firebase.ts`
- `src/config/firebase/config.ts`
- `src/config/firebase/firebase.config.ts`
- `src/hooks/useErrorHandler.ts`
- `src/components/hook/useErrorHandler.ts`
- `src/config/csp.ts`
- `src/security/csp-helper.ts`

### 2. Unification des configurations

#### Configuration Firebase
- Tous les fichiers de configuration Firebase ont été unifiés dans `src/config/firebase/index.ts`
- La nouvelle configuration utilise des variables d'environnement sans valeurs par défaut
- Un système de validation a été ajouté pour vérifier les variables d'environnement

#### Configuration CSP
- La configuration CSP a été unifiée dans `src/security/middleware.ts`
- La nouvelle configuration est plus sécurisée et adaptée au mode de développement/production

#### Configuration des tests
- Un fichier de configuration de base `vitest.base.config.ts` a été créé
- Les fichiers `vitest.config.ts` et `vitest.auth.config.ts` ont été mis à jour pour étendre la configuration de base

### 3. Mise à jour des imports

Un script `update-imports.js` a été créé pour mettre à jour tous les imports qui font référence aux fichiers supprimés:

```javascript
// Mappings des imports à mettre à jour
const importMappings = {
  // Firebase
  '@/config/firebase': '@/config/firebase/index',
  '@/config/firebase/config': '@/config/firebase/index',
  '@/config/firebase/firebase.config': '@/config/firebase/index',
  
  // Hooks d'erreur
  '@/hooks/useErrorHandler': '@/hooks/useError',
  '@/components/hook/useErrorHandler': '@/hooks/useError',
  '@/features/auth/hooks/useAuthError': '@/hooks/useError',
  
  // CSP
  '@/config/csp': '@/security/middleware',
  '@/security/csp-helper': '@/security/middleware',
};
```

## Prochaines étapes

Les actions suivantes sont recommandées pour continuer le nettoyage du projet:

1. **Unifier les services d'authentification**
   - Créer un service d'authentification unifié dans `src/core/auth/services/AuthService.ts`
   - Implémenter des adaptateurs pour les différentes méthodes d'authentification

2. **Unifier les hooks d'authentification**
   - Créer un hook d'authentification unifié dans `src/hooks/useAuth.ts`
   - Mettre à jour tous les imports pour utiliser le hook unifié

3. **Unifier les services de logging**
   - Créer un service de logging unifié dans `src/core/logger.ts`
   - Mettre à jour tous les imports pour utiliser le service unifié

4. **Unifier les providers d'authentification**
   - Créer un provider d'authentification unifié dans `src/core/auth/AuthProvider.tsx`
   - Mettre à jour tous les imports pour utiliser le provider unifié

## Comment exécuter le script de mise à jour des imports

```bash
node update-imports.js
```

Ce script parcourt tous les fichiers TypeScript et TSX du projet et met à jour les imports qui font référence aux fichiers supprimés.
