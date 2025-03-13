# Système d'Authentification Firebase pour TokenForge

Ce document décrit l'architecture et l'utilisation du système d'authentification Firebase implémenté dans l'application TokenForge.

## Architecture

Le système d'authentification est composé des éléments suivants :

1. **Service d'authentification Firebase** (`src/lib/firebase/auth.ts`)
   - Initialise et gère les interactions avec l'API Firebase Authentication
   - Fournit des méthodes pour toutes les opérations d'authentification

2. **Hook useAuth** (`src/hooks/useAuth.ts`)
   - Encapsule le service d'authentification dans un hook React
   - Gère l'état d'authentification, les erreurs et les callbacks
   - Fournit des méthodes pour toutes les opérations d'authentification

3. **Contexte d'authentification** (`src/contexts/AuthContext.tsx`)
   - Rend l'état d'authentification disponible dans toute l'application
   - Permet d'accéder aux fonctionnalités d'authentification depuis n'importe quel composant

4. **Composant de garde d'authentification** (`src/components/AuthGuard.tsx`)
   - Protège les routes qui nécessitent une authentification
   - Permet de restreindre l'accès aux utilisateurs authentifiés et/ou administrateurs

## Utilisation

### 1. Accès à l'authentification via le contexte

```tsx
import { useAuthContext } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, signIn, signOut } = useAuthContext();

  // Utilisation des fonctionnalités d'authentification
  // ...
};
```

### 2. Protection des routes

```tsx
import AuthGuard from '@/components/AuthGuard';

const ProtectedPage = () => {
  return (
    <AuthGuard requireAuth={true} fallbackUrl="/auth-demo">
      {/* Contenu protégé */}
    </AuthGuard>
  );
};
```

### 3. Protection des routes administrateur

```tsx
import AuthGuard from '@/components/AuthGuard';

const AdminPage = () => {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true} fallbackUrl="/auth-demo">
      {/* Contenu réservé aux administrateurs */}
    </AuthGuard>
  );
};
```

## Fonctionnalités disponibles

Le système d'authentification offre les fonctionnalités suivantes :

- Connexion avec email et mot de passe
- Inscription avec email et mot de passe
- Connexion anonyme
- Déconnexion
- Réinitialisation du mot de passe
- Mise à jour du profil utilisateur
- Gestion de l'état d'authentification
- Protection des routes

## Pages de démonstration

L'application inclut les pages suivantes pour démontrer l'utilisation du système d'authentification :

- **Page de démonstration** (`/auth-demo`) : Démontre toutes les fonctionnalités d'authentification
- **Page protégée** (`/protected-page`) : Accessible uniquement aux utilisateurs authentifiés
- **Page d'administration** (`/admin-page`) : Accessible uniquement aux utilisateurs avec des privilèges d'administrateur
- **Documentation** (`/docs/auth-hook`) : Documentation complète du hook d'authentification

## Documentation détaillée

Pour une documentation plus détaillée sur l'utilisation du hook d'authentification, consultez le fichier `src/docs/AuthHook.md` ou la page `/docs/auth-hook` dans l'application.

## Intégration avec d'autres hooks

Le système d'authentification peut être utilisé en combinaison avec les hooks Firestore pour créer des applications complètes avec authentification et gestion de données. Consultez la documentation des hooks Firestore pour plus d'informations.

## Sécurité

N'oubliez pas d'ajouter des règles de sécurité dans Firebase pour protéger vos données. L'authentification seule ne suffit pas à sécuriser vos données Firestore.
