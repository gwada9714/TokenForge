# Refactorisation des services d'authentification

Ce document décrit les changements effectués pour refactoriser les services d'authentification dans le projet TokenForge.

## Changements apportés

### 1. Intégration avec le service de configuration

Les services d'authentification ont été mis à jour pour utiliser le service de configuration centralisé:

```typescript
// Avant
private constructor(options: AuthServiceOptions = {}) {
  super(options);
  this.auth = getAuth(app);
  // ...
}

// Après
private constructor(options: AuthServiceOptions = {}) {
  // Fusionner les options avec les valeurs de configuration
  const securityConfig = configService.getSecurityConfig();
  const mergedOptions: AuthServiceOptions = {
    enablePersistence: true,
    tokenRefreshInterval: 55 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    sessionTimeout: securityConfig.session.timeout * 1000,
    requireEmailVerification: true,
    ...options
  };

  super(mergedOptions);

  // Initialiser Firebase avec la configuration
  const firebaseConfig = configService.getFirebaseConfig();
  this.app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId
  });

  this.auth = getAuth(this.app);
  // ...
}
```

### 2. Intégration avec le service de logging

Les services d'authentification ont été mis à jour pour utiliser le service de logging centralisé:

```typescript
// Avant
logger.error("Auth", "Échec de connexion", error);

// Après
logger.error({
  category: "Auth",
  message: "Échec de connexion",
  error: authError,
  data: { email: credentials.email },
});
```

### 3. Amélioration de la gestion des erreurs

La gestion des erreurs a été améliorée pour fournir des messages plus précis et pour journaliser plus d'informations:

```typescript
// Avant
return {
  success: false,
  error: {
    ...authError,
    message: errorMessage,
  },
};

// Après
return {
  success: false,
  error: new Error(errorMessage),
};
```

### 4. Amélioration de la sécurité

La sécurité a été renforcée avec:

- Validation des chaînes blockchain supportées
- Gestion des tentatives de connexion échouées
- Verrouillage des comptes après trop de tentatives
- Vérification de l'email obligatoire

```typescript
// Vérifier si le compte est bloqué
if (this.isLoginBlocked(credentials.email)) {
  return {
    success: false,
    error: new Error(
      `Trop de tentatives de connexion. Veuillez réessayer après ${
        this.options.lockoutDuration! / 60000
      } minutes.`
    ),
  };
}

// Vérifier si la chaîne est supportée
const network = await this.provider.getNetwork();
const web3Config = configService.getWeb3Config();

if (!web3Config.supportedChains.includes(network.chainId)) {
  return {
    success: false,
    error: new Error(
      `Chaîne non supportée. Veuillez vous connecter à l'une des chaînes supportées: ${web3Config.supportedChains.join(
        ", "
      )}`
    ),
  };
}
```

### 5. Amélioration de la gestion des tokens

La gestion des tokens a été améliorée pour:

- Rafraîchir automatiquement les tokens avant expiration
- Gérer les erreurs de rafraîchissement
- Nettoyer les intervalles de rafraîchissement lors de la déconnexion

```typescript
// Configurer un nouvel intervalle avec une fonction de rafraîchissement robuste
const intervalId = window.setInterval(async () => {
  try {
    // Vérifier si l'utilisateur est toujours connecté
    const currentUser = this.auth.currentUser;
    if (!currentUser || currentUser.uid !== user.uid) {
      logger.warn({
        category: "Auth",
        message: "Utilisateur déconnecté, arrêt du rafraîchissement du token",
      });
      this.clearTokenRefreshInterval(user.uid);
      return;
    }

    const token = await user.getIdToken(true);
    logger.info({
      category: "Auth",
      message: "Token rafraîchi avec succès",
      data: { tokenLength: token.length },
    });
  } catch (error) {
    // Gérer les erreurs...
  }
}, this.options.tokenRefreshInterval);
```

## Avantages de la refactorisation

1. **Cohérence**: Utilisation cohérente des services de configuration et de logging
2. **Sécurité**: Gestion plus robuste des erreurs et des tokens
3. **Maintenabilité**: Code plus propre et plus facile à maintenir
4. **Extensibilité**: Facilité d'ajout de nouvelles méthodes d'authentification
5. **Configurabilité**: Options de configuration centralisées

## Utilisation

### Authentification par email/mot de passe

```typescript
import { authService } from "@/core/auth/services/AuthService";
import { AuthType } from "@/core/auth/services/AuthServiceBase";

// Connexion
const response = await authService.login(
  { email: "user@example.com", password: "password123" },
  AuthType.EMAIL_PASSWORD
);

// Inscription
const response = await authService.signup(
  { email: "user@example.com", password: "password123", displayName: "User" },
  AuthType.EMAIL_PASSWORD
);
```

### Authentification Web3

```typescript
import { authService } from "@/core/auth/services/AuthService";
import { AuthType } from "@/core/auth/services/AuthServiceBase";

// Connexion
const response = await authService.login(
  { address: "0x1234..." },
  AuthType.WEB3
);
```

### Opérations communes

```typescript
// Déconnexion
await authService.logout();

// Vérifier l'authentification
const isAuthenticated = await authService.isAuthenticated();

// Obtenir l'utilisateur actuel
const user = await authService.getCurrentUser();

// Obtenir un token
const token = await authService.getToken();

// Réinitialiser le mot de passe
await authService.resetPassword("user@example.com");

// Mettre à jour le profil
await authService.updateUserProfile(user, { displayName: "New Name" });
```

## Migration

Pour migrer vers les nouveaux services d'authentification, exécutez le script `update-auth-imports.js`:

```bash
node update-auth-imports.js
```

Ce script mettra à jour tous les imports qui font référence aux anciens services d'authentification.
