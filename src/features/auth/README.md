# Authentication System

Le système d'authentification de TokenForge combine l'authentification Web3 (wallet) avec Firebase pour une gestion sécurisée des sessions et des emails.

## Architecture

### Services

- `firebaseAuth` : Service singleton gérant l'authentification Firebase
  - Connexion avec signature de wallet
  - Gestion des sessions
  - Vérification d'email
  - Gestion des claims personnalisés

### Hooks

- `useFirebaseAuth` : Hook React pour l'authentification Firebase
  - État de la session
  - Connexion/déconnexion
  - Vérification d'email
  - Gestion des erreurs

### Composants

- `AuthContainer` : Conteneur principal d'authentification
  - Intègre le bouton de connexion et le sélecteur de réseau
  - Gère la vérification d'email
  - Affiche les messages d'erreur

- `AuthButton` : Bouton de connexion/déconnexion
  - États multiples (non connecté, connecté wallet, connecté Firebase)
  - Gestion des états de chargement
  - Affichage de l'adresse du wallet

- `EmailVerification` : Dialog de vérification d'email
  - Envoi d'email de vérification
  - Gestion des erreurs
  - États de chargement

## Utilisation

### Configuration

1. Configurer Firebase dans `config/firebase.ts`
2. Déployer la Cloud Function d'authentification
3. Configurer la variable d'environnement `VITE_API_URL`

### Intégration basique

```tsx
import { AuthContainer } from 'features/auth/components/AuthContainer';

function App() {
  return (
    <AuthContainer
      requireEmailVerification={true}
      showNetworkSelector={true}
    />
  );
}
```

### Utilisation avancée

```tsx
import { useFirebaseAuth } from 'features/auth/hooks/useFirebaseAuth';

function ProtectedComponent() {
  const { session, isLoading } = useFirebaseAuth();

  if (isLoading) return <Loading />;
  if (!session) return <NotAuthenticated />;
  if (!session.emailVerified) return <EmailNotVerified />;

  return <YourComponent />;
}
```

## Sécurité

1. Les signatures de wallet sont vérifiées côté serveur
2. Les sessions sont gérées par Firebase Auth
3. Les claims personnalisés sont utilisés pour stocker l'adresse du wallet
4. Les emails sont vérifiés avant l'accès complet

## Tests

Les tests sont organisés en trois catégories :

1. Tests de service (`firebaseAuth.test.ts`)
   - Authentification wallet
   - Gestion des sessions
   - Vérification d'email

2. Tests de hook (`useFirebaseAuth.test.tsx`)
   - États de connexion
   - Gestion des erreurs
   - Cycle de vie

3. Tests de composants (`EmailVerification.test.tsx`)
   - Rendu conditionnel
   - Interactions utilisateur
   - États de chargement

## Gestion des erreurs

Les erreurs sont centralisées dans `errors/AuthError.ts` avec des codes spécifiques :

- `AUTH_001` : Wallet non connecté
- `AUTH_003` : Échec d'authentification wallet
- `AUTH_004` : Erreur de session
- `AUTH_005` : Échec d'envoi d'email

## Cloud Function

La Cloud Function `authenticateWallet` gère :

1. Validation de la signature
2. Création/mise à jour de l'utilisateur Firebase
3. Génération du token JWT
4. Gestion des claims personnalisés

## À faire

- [ ] Ajouter la récupération de mot de passe
- [ ] Implémenter la déconnexion automatique
- [ ] Ajouter des tests E2E
- [ ] Améliorer la gestion des erreurs réseau
