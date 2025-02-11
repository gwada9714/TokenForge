import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { logger, LogLevel } from './firebase-logger';

interface FirebaseServiceStatus {
  isInitialized: boolean;
  error?: string;
}

interface FirebaseDiagnostics {
  app: FirebaseServiceStatus;
  auth: FirebaseServiceStatus;
  firestore: FirebaseServiceStatus;
  functions: FirebaseServiceStatus;
  configPresent: boolean;
  emulatorsConfigured: boolean;
}

export class FirebaseDiagnosticsService {
  getAuthStatus(auth: Auth | null): FirebaseServiceStatus {
    return {
      isInitialized: !!auth,
      error: !auth ? 'Service Auth non initialisé' : undefined
    };
  }

  getFirestoreStatus(db: Firestore | null): FirebaseServiceStatus {
    return {
      isInitialized: !!db,
      error: !db ? 'Service Firestore non initialisé' : undefined
    };
  }

  getFunctionsStatus(functions: Functions | null): FirebaseServiceStatus {
    return {
      isInitialized: !!functions,
      error: !functions ? 'Service Functions non initialisé' : undefined
    };
  }

  getEnvironmentInfo() {
    return {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL
    };
  }

  getConfigurationStatus() {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(
      (envVar) => !import.meta.env[envVar]
    );

    return {
      isComplete: missingVars.length === 0,
      missingVariables: missingVars,
      environment: this.getEnvironmentInfo()
    };
  }

  static async checkFirebaseHealth(app: FirebaseApp): Promise<FirebaseDiagnostics> {
    const diagnostics: FirebaseDiagnostics = {
      app: { isInitialized: false },
      auth: { isInitialized: false },
      firestore: { isInitialized: false },
      functions: { isInitialized: false },
      configPresent: false,
      emulatorsConfigured: false
    };

    try {
      // Vérifier l'application
      diagnostics.app.isInitialized = !!app;
      logger.log(LogLevel.INFO, 'Firebase App status checked', { initialized: diagnostics.app.isInitialized });

      // Vérifier la configuration
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID'
      ];
      
      diagnostics.configPresent = requiredEnvVars.every(
        (envVar) => !!import.meta.env[envVar]
      );

      // Vérifier Auth
      try {
        const auth = getAuth(app);
        await signInAnonymously(auth);
        diagnostics.auth.isInitialized = true;
      } catch (error) {
        diagnostics.auth.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.log(LogLevel.ERROR, 'Firebase Auth check failed', { error });
      }

      // Vérifier Firestore
      try {
        const db = getFirestore(app);
        diagnostics.firestore.isInitialized = !!db;
      } catch (error) {
        diagnostics.firestore.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.log(LogLevel.ERROR, 'Firebase Firestore check failed', { error });
      }

      // Vérifier Functions
      try {
        const functions = getFunctions(app);
        diagnostics.functions.isInitialized = !!functions;
      } catch (error) {
        diagnostics.functions.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.log(LogLevel.ERROR, 'Firebase Functions check failed', { error });
      }

      // Vérifier les émulateurs
      diagnostics.emulatorsConfigured = import.meta.env.DEV && (
        process.env.FIREBASE_AUTH_EMULATOR_HOST ||
        process.env.FIREBASE_FIRESTORE_EMULATOR_HOST ||
        process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST
      ) !== undefined;

      return diagnostics;
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Firebase health check failed', { error });
      throw error;
    }
  }

  static async runConnectionTest(auth: Auth): Promise<boolean> {
    try {
      await signInAnonymously(auth);
      logger.log(LogLevel.INFO, 'Connection test successful');
      return true;
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Connection test failed', error);
      return false;
    }
  }

  static getServiceStatus(): string {
    const logs = logger.getLogs();
    const errors = logs.filter(log => log.level === LogLevel.ERROR);
    const warnings = logs.filter(log => log.level === LogLevel.WARN);
    
    return JSON.stringify({
      totalLogs: logs.length,
      errors: errors.length,
      warnings: warnings.length,
      recentErrors: errors.slice(-5),
      recentWarnings: warnings.slice(-5)
    }, null, 2);
  }
}
