# Unification des services de configuration

Ce document décrit les changements effectués pour unifier les services de configuration dans le projet TokenForge.

## Problèmes résolus

1. **Services de configuration dupliqués**

   - Plusieurs implémentations de services de configuration existaient dans le projet
   - Incohérences dans l'accès aux variables d'environnement
   - Validation incomplète des variables d'environnement

2. **Accès incohérent aux variables d'environnement**

   - Utilisation de `import.meta.env` et `process.env` dans différentes parties du code
   - Absence de typage fort pour les variables d'environnement

3. **Validation incomplète**
   - Différentes approches de validation des variables d'environnement
   - Certaines variables requises non validées

## Architecture de la solution

### 1. Service de configuration central

Un service de configuration central `ConfigService` a été créé pour gérer toutes les configurations de l'application:

```typescript
export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  // Méthodes d'accès à la configuration
  public getConfig(): AppConfig { ... }
  public getFirebaseConfig(): FirebaseConfig { ... }
  public getWeb3Config(): Web3Config { ... }
  public getApiConfig(): ApiConfig { ... }
  public getSecurityConfig(): SecurityConfig { ... }
  public getLoggingConfig(): LoggingConfig { ... }
  public getCacheConfig(): CacheConfig { ... }
  public getFeaturesConfig(): FeaturesConfig { ... }
  public getIpfsConfig(): IpfsConfig { ... }

  // Méthodes utilitaires
  public isDevelopment(): boolean { ... }
  public isProduction(): boolean { ... }
}
```

### 2. Validation avec Zod

La validation des variables d'environnement est effectuée avec Zod, une bibliothèque de validation de schéma:

```typescript
export const FirebaseEnvSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_USE_FIREBASE_EMULATOR: z.string().optional(),
});
```

### 3. Types standardisés

Des types standardisés ont été définis pour assurer la cohérence des configurations:

```typescript
export interface AppConfig {
  firebase: FirebaseConfig;
  web3: Web3Config;
  api: ApiConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
  features: FeaturesConfig;
  ipfs: IpfsConfig;
}
```

## Avantages de la nouvelle architecture

1. **Cohérence**: Accès standardisé aux variables d'environnement
2. **Typage fort**: Types TypeScript pour toutes les configurations
3. **Validation**: Validation complète des variables d'environnement
4. **Centralisation**: Point d'accès unique pour toutes les configurations
5. **Extensibilité**: Facilité d'ajout de nouvelles configurations

## Utilisation

### Accès à la configuration

```typescript
import { configService } from "@/core/config";

// Accès à la configuration complète
const config = configService.getConfig();

// Accès à une configuration spécifique
const firebaseConfig = configService.getFirebaseConfig();
const web3Config = configService.getWeb3Config();
const apiConfig = configService.getApiConfig();

// Vérification de l'environnement
if (configService.isDevelopment()) {
  // Code spécifique au développement
}

if (configService.isProduction()) {
  // Code spécifique à la production
}
```

### Accès aux types

```typescript
import { FirebaseConfig, Web3Config, ApiConfig } from "@/core/config";

// Utilisation des types
const myFirebaseConfig: FirebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  useEmulator: false,
};
```

## Migration

Pour migrer vers le nouveau service de configuration, exécutez le script `update-config-imports.js`:

```bash
node update-config-imports.js
```

Ce script mettra à jour tous les imports qui font référence aux anciens services de configuration:

```javascript
// Mappings des imports à mettre à jour
const importMappings = {
  "@/config/env": "@/core/config",
  "@/config/validator": "@/core/config",
  "@/utils/env": "@/core/config",
  // ...
};
```

## Prochaines étapes

1. **Tests**: Ajouter des tests pour le service de configuration
2. **Documentation**: Mettre à jour la documentation pour refléter les changements
3. **Intégration**: Intégrer le service de configuration avec les autres services
4. **Validation avancée**: Ajouter des validations plus avancées pour les variables d'environnement
