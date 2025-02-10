# Authentication System

Le système d'authentification de TokenForge combine l'authentification Web3 (wallet) avec Firebase pour une gestion sécurisée des sessions et des emails.

## Architecture

### Hooks Principaux

#### useTokenForgeAuth (Hook Principal)
- Gère l'état global de l'authentification
- Synchronise l'état du wallet avec Wagmi
- Expose l'interface TokenForgeAuthState complète
- Centralise la logique métier

#### Hooks Spécialisés
- `useAuthState` : Gestion pure de l'état Firebase
- `useWalletState` : Gestion pure de l'état du wallet
- `useNetworkManagement` : Gestion du réseau
- `useWalletDetection` : Détection du wallet

### Services

- `firebaseAuth` : Authentification Firebase
- `sessionService` : Gestion des sessions utilisateur
- `secureStorageService` : Stockage sécurisé des tokens
- `errorService` : Gestion centralisée des erreurs
- `securityHeadersService` : Vérification des headers de sécurité
- `authSyncService` : Synchronisation multi-onglets

### Store

#### Actions
Actions unifiées dans `authReducer.ts` :
- LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILURE
- LOGOUT
- UPDATE_USER, UPDATE_WALLET
- SET_ERROR, CLEAR_ERROR

#### État
```typescript
interface TokenForgeAuthState {
  user: TokenForgeUser | null;
  wallet: {
    address: `0x${string}` | null;
    isConnected: boolean;
    chainId?: number;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
}
```

### Composants

- `TokenForgeAuthProvider` : Provider principal
  - Gestion de l'état global
  - Synchronisation wallet/auth
  - Gestion des sessions
  - Vérification des headers de sécurité

## Tests

### Tests Unitaires
- Tests des reducers
- Tests des hooks
- Tests des services
- Tests des providers

### Tests d'Intégration
- Flux d'authentification complet
- Interaction wallet-auth
- Gestion des erreurs

### Couverture
Configuration Vitest avec seuils :
- Branches : 80%
- Fonctions : 80%
- Lignes : 80%
- Statements : 80%

## Utilisation

### Configuration de Base

```typescript
import { TokenForgeAuthProvider } from 'features/auth/providers';

function App() {
  return (
    <TokenForgeAuthProvider>
      <YourApp />
    </TokenForgeAuthProvider>
  );
}
```

### Utilisation dans les Composants

```typescript
import { useTokenForgeAuth } from 'features/auth/providers';

function YourComponent() {
  const { isAuthenticated, user, wallet } = useTokenForgeAuth();

  if (!isAuthenticated) {
    return <div>Please connect your wallet and sign in</div>;
  }

  return (
    <div>
      <p>Welcome {user?.email}</p>
      <p>Wallet: {wallet.address}</p>
    </div>
  );
}
```

### Gestion des Erreurs

```typescript
import { useTokenForgeAuth } from 'features/auth/providers';
import { errorService } from 'features/auth/services';

function YourComponent() {
  const { dispatch } = useTokenForgeAuth();

  const handleError = (error: unknown) => {
    dispatch(authActions.setError(errorService.handleError(error)));
  };
}
```

## Sécurité

- Stockage sécurisé des tokens
- Vérification des headers de sécurité
- Validation des signatures wallet
- Protection contre les attaques CSRF
- Gestion sécurisée des sessions

## Bonnes Pratiques

1. Toujours utiliser `useTokenForgeAuth` pour accéder à l'état d'authentification
2. Gérer les erreurs via `errorService`
3. Utiliser les hooks spécialisés pour des cas d'usage spécifiques
4. Suivre le pattern d'actions unifiées pour les modifications d'état
5. Maintenir une couverture de tests adéquate
