# Unification des services de logging

Ce document décrit les changements effectués pour unifier les services de logging dans le projet TokenForge.

## Problèmes résolus

1. **Services de logging dupliqués**

   - Plusieurs implémentations de services de logging existaient dans le projet
   - Incohérences dans le format et la destination des logs
   - Support incomplet pour différentes destinations de logs

2. **Gestion des erreurs incohérente**

   - Différentes approches pour gérer et logger les erreurs
   - Manque de standardisation dans le format des messages d'erreur

3. **Monitoring incomplet**
   - Absence d'un système centralisé pour le monitoring des erreurs
   - Manque d'intégration avec des services externes comme Sentry

## Architecture de la solution

### 1. Service de logging central

Un service de logging central `CentralLogger` a été créé pour gérer tous les logs de l'application:

```typescript
export class CentralLogger {
  private static instance: CentralLogger;
  private adapters: Map<string, LogAdapter> = new Map();
  private options: LoggerOptions = { ... };
  private logHistory: LogEntry[] = [];

  // Méthodes de logging
  public debug(entry: Partial<LogEntry> | string): void { ... }
  public info(entry: Partial<LogEntry> | string): void { ... }
  public warn(entry: Partial<LogEntry> | string): void { ... }
  public error(entry: Partial<LogEntry> | string): void { ... }
  public fatal(entry: Partial<LogEntry> | string): void { ... }
  public logEvent(eventName: string, data?: Record<string, any>): void { ... }

  // Méthodes de configuration
  public configure(options: Partial<LoggerOptions>): void { ... }
  public registerAdapter(name: string, adapter: LogAdapter): void { ... }
  public removeAdapter(name: string): void { ... }

  // Méthodes utilitaires
  public getLogHistory(): LogEntry[] { ... }
  public clearLogHistory(): void { ... }
  public createLogger(category: string): { ... } { ... }
}
```

### 2. Adaptateurs de logging

Plusieurs adaptateurs de logging ont été créés pour envoyer les logs vers différentes destinations:

1. **ConsoleLogger**: Adaptateur pour le logging dans la console

   ```typescript
   export class ConsoleLogger implements LogAdapter {
     public log(entry: LogEntry): void { ... }
     public setLogLevel(level: LogLevel): void { ... }
   }
   ```

2. **FirebaseLogger**: Adaptateur pour le logging dans Firebase

   ```typescript
   export class FirebaseLogger implements LogAdapter {
     public log(entry: LogEntry): void { ... }
   }
   ```

3. **LocalStorageLogger**: Adaptateur pour le logging dans le localStorage (utile pour le débogage)
   ```typescript
   export class LocalStorageLogger implements LogAdapter {
     public log(entry: LogEntry): void { ... }
     public setLogLevel(level: LogLevel): void { ... }
     public clearLogs(): void { ... }
     public getAllLogs(): any[] { ... }
   }
   ```

### 3. Types standardisés

Des types standardisés ont été définis pour assurer la cohérence des logs:

```typescript
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  error?: Error;
}

export interface LoggerOptions {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  enableFirebase: boolean;
}

export interface LogAdapter {
  log(entry: LogEntry): void;
  setLogLevel?(level: LogLevel): void;
}
```

## Avantages de la nouvelle architecture

1. **Cohérence**: Format de log standardisé dans toute l'application
2. **Extensibilité**: Facilité d'ajout de nouvelles destinations de logs via des adaptateurs
3. **Configurabilité**: Options de configuration centralisées
4. **Débogage**: Historique des logs en mémoire pour faciliter le débogage
5. **Monitoring**: Intégration avec Sentry pour le suivi des erreurs en production

## Utilisation

### Logging simple

```typescript
import { logger } from "@/core/logger";

// Logging simple
logger.debug("Message de débogage");
logger.info("Message d'information");
logger.warn("Avertissement");
logger.error("Erreur");
logger.fatal("Erreur fatale");

// Logging avec contexte
logger.info({
  category: "Auth",
  message: "Utilisateur connecté",
  data: { userId: "123" },
});

// Logging d'erreur
try {
  // Code qui peut générer une erreur
} catch (error) {
  logger.error({
    category: "API",
    message: "Erreur lors de l'appel API",
    error: error instanceof Error ? error : new Error(String(error)),
    data: { endpoint: "/users" },
  });
}
```

### Création d'un logger catégorisé

```typescript
import { logger } from "@/core/logger";

// Créer un logger pour une catégorie spécifique
const authLogger = logger.createLogger("Auth");

// Utilisation
authLogger.info("Utilisateur connecté", { userId: "123" });
authLogger.error(
  "Échec de connexion",
  { email: "user@example.com" },
  new Error("Invalid credentials")
);
```

### Configuration du logger

```typescript
import { logger, LogLevel } from "@/core/logger";

// Configurer le logger
logger.configure({
  minLevel: LogLevel.INFO, // Ne pas logger les messages de débogage
  enableSentry: true, // Activer l'envoi à Sentry
  enableFirebase: false, // Désactiver l'envoi à Firebase
});
```

### Ajout d'un adaptateur personnalisé

```typescript
import { logger, LogAdapter, LogEntry } from "@/core/logger";

// Créer un adaptateur personnalisé
class CustomAdapter implements LogAdapter {
  log(entry: LogEntry): void {
    // Logique personnalisée
  }
}

// Enregistrer l'adaptateur
logger.registerAdapter("custom", new CustomAdapter());
```

## Migration

Pour migrer vers le nouveau service de logging, exécutez le script `update-logger-imports.js`:

```bash
node update-logger-imports.js
```

Ce script mettra à jour tous les imports qui font référence aux anciens services de logging:

```javascript
// Mappings des imports à mettre à jour
const importMappings = {
  "@/utils/logger": "@/core/logger",
  "@/utils/firebase-logger": "@/core/logger",
  // ...
};
```

## Prochaines étapes

1. **Tests**: Ajouter des tests pour le service de logging et ses adaptateurs
2. **Documentation**: Mettre à jour la documentation pour refléter les changements
3. **Monitoring**: Améliorer l'intégration avec Sentry et d'autres services de monitoring
4. **Adaptateurs supplémentaires**: Ajouter des adaptateurs pour d'autres destinations (ElasticSearch, Logstash, etc.)
