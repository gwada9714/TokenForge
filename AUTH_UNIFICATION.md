# Unification des services d'authentification

Ce document décrit les changements effectués pour unifier les services d'authentification dans le projet TokenForge.

## Problèmes résolus

1. **Services d'authentification dupliqués**

   - Plusieurs implémentations de services d'authentification existaient dans le projet
   - Incohérences dans la gestion des erreurs et le rafraîchissement des tokens
   - Support incomplet pour différentes méthodes d'authentification

2. **Hooks d'authentification dupliqués**

   - Plusieurs hooks d'authentification avec des fonctionnalités similaires mais incohérentes
   - Gestion d'état inconsistante entre les différents hooks

3. **Providers d'authentification dupliqués**
   - Plusieurs providers d'authentification avec des contextes différents
   - Incohérences dans la gestion des changements d'état d'authentification

## Architecture de la solution

### 1. Classe de base abstraite pour les services d'authentification

Une classe de base abstraite `AuthServiceBase` a été créée pour définir l'interface commune à tous les services d'authentification:

```typescript
export abstract class AuthServiceBase {
  // Méthodes abstraites que chaque service doit implémenter
  public abstract login(credentials: LoginCredentials): Promise<AuthResponse>;
  public abstract signup(credentials: SignupCredentials): Promise<AuthResponse>;
  public abstract logout(): Promise<void>;
  public abstract getCurrentUser(): Promise<User | null>;
  public abstract resetPassword(email: string): Promise<boolean>;
  public abstract updateUserProfile(user: User, profile: Partial<SignupCredentials>): Promise<User>;
  public abstract isAuthenticated(): Promise<boolean>;
  public abstract getToken(forceRefresh?: boolean): Promise<string | null>;
  protected abstract setupTokenRefresh(user: User): Promise<void>;
  protected abstract clearTokenRefresh(): void;

  // Méthodes communes à tous les services
  protected isLoginBlocked(email: string): boolean { ... }
  protected incrementLoginAttempt(email: string): void { ... }
  protected lockAccount(email: string): void { ... }
  protected resetLoginAttempts(email: string): void { ... }
  protected checkEmailVerification(user: User): boolean { ... }
  protected handleAuthError(error: unknown, context: string): Error { ... }
}
```

### 2. Implémentations spécifiques

Deux implémentations spécifiques ont été créées:

1. **FirebaseAuthService**: Service d'authentification Firebase

   - Gère l'authentification par email/mot de passe
   - Gère le rafraîchissement des tokens Firebase
   - Implémente toutes les méthodes de la classe de base

2. **Web3AuthService**: Service d'authentification Web3
   - Gère l'authentification avec un wallet Ethereum
   - Implémente la signature de messages avec SIWE (Sign-In with Ethereum)
   - Implémente toutes les méthodes de la classe de base (certaines avec des comportements spécifiques à Web3)

### 3. Service d'authentification unifié

Un service d'authentification unifié `AuthService` a été créé pour orchestrer les différents services d'authentification:

```typescript
export class AuthService {
  private firebaseAuthService: FirebaseAuthService;
  private web3AuthService: Web3AuthService;
  private currentAuthType: AuthType | null = null;

  // Méthodes qui délèguent aux services spécifiques
  public async login(credentials: LoginCredentials | Web3Credentials, authType: AuthType): Promise<AuthResponse> { ... }
  public async signup(credentials: SignupCredentials, authType: AuthType): Promise<AuthResponse> { ... }
  public async logout(): Promise<void> { ... }
  public async getCurrentUser(): Promise<User | any | null> { ... }
  public async resetPassword(email: string): Promise<boolean> { ... }
  public async updateUserProfile(user: User, profile: Partial<SignupCredentials>): Promise<User> { ... }
  public async isAuthenticated(): Promise<boolean> { ... }
  public async getToken(forceRefresh: boolean = false): Promise<string | null> { ... }
  public onAuthStateChanged(callback: (user: User | null) => void): () => void { ... }
  public getCurrentAuthType(): AuthType | null { ... }
}
```

### 4. Hook d'authentification unifié

Un hook d'authentification unifié `useAuth` a été créé pour utiliser le service d'authentification unifié:

```typescript
export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = useState<User | any | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const { error, handleError, clearError } = useError();
  const [authType, setAuthType] = useState<AuthType | null>(null);

  // Méthodes d'authentification
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> { ... }, []);
  const signInWithWeb3 = useCallback(async (address?: string): Promise<AuthResponse> { ... }, []);
  const signUp = useCallback(async (credentials: SignupCredentials): Promise<AuthResponse> { ... }, []);
  const signOut = useCallback(async (): Promise<void> { ... }, []);
  const resetPassword = useCallback(async (email: string): Promise<boolean> { ... }, []);
  const updateUserProfile = useCallback(async (profile: Partial<SignupCredentials>): Promise<User | null> { ... }, []);
  const getToken = useCallback(async (forceRefresh: boolean = false): Promise<string | null> { ... }, []);

  // Propriétés dérivées
  const isAuthenticated = status === 'authenticated' && !!user;
  const isAdmin = isAuthenticated && !!user?.isAdmin;
  const isWeb3 = authType === AuthType.WEB3;

  return {
    user,
    status,
    error,
    isAuthenticated,
    isAdmin,
    isWeb3,
    isLoading: status === 'loading',
    authType,
    signIn,
    signInWithWeb3,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    getToken,
    clearError
  };
}
```

### 5. Provider d'authentification unifié

Un provider d'authentification unifié `AuthProvider` a été créé pour fournir le contexte d'authentification:

```typescript
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onAuthStateChanged,
  onError,
}) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [authType, setAuthType] = useState<AuthType | null>(null);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    // ...
  }, [onAuthStateChanged, onError]);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    authType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Avantages de la nouvelle architecture

1. **Cohérence**: Une interface unifiée pour toutes les méthodes d'authentification
2. **Extensibilité**: Facile d'ajouter de nouvelles méthodes d'authentification
3. **Maintenabilité**: Code plus propre et plus facile à maintenir
4. **Sécurité**: Gestion des erreurs et des tokens plus robuste
5. **Flexibilité**: Support pour différentes méthodes d'authentification (Firebase, Web3)

## Utilisation

### Authentification par email/mot de passe

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { signIn, error, isLoading } = useAuth();

  const handleSubmit = async (email, password) => {
    const response = await signIn(email, password);
    if (response.success) {
      // Redirection ou autre action
    }
  };

  return (
    // ...
  );
}
```

### Authentification Web3

```typescript
import { useAuth } from "@/hooks/useAuth";

function Web3LoginButton() {
  const { signInWithWeb3, error, isLoading } = useAuth();

  const handleConnect = async () => {
    const response = await signInWithWeb3();
    if (response.success) {
      // Redirection ou autre action
    }
  };

  return (
    <button onClick={handleConnect} disabled={isLoading}>
      Connect Wallet
    </button>
  );
}
```

### Utilisation du provider

```typescript
import { AuthProvider } from "@/core/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router>{/* ... */}</Router>
    </AuthProvider>
  );
}
```

## Prochaines étapes

1. **Tests**: Ajouter des tests pour les nouveaux services et hooks
2. **Documentation**: Mettre à jour la documentation pour refléter les changements
3. **Migration**: Migrer progressivement les composants existants pour utiliser les nouveaux services et hooks
