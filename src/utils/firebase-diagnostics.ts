import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Functions, getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getPerformance } from 'firebase/performance';
import { logger } from './firebase-logger';
import { captureException } from '../config/sentry';

// Définition de la constante LOG_CATEGORY manquante
const LOG_CATEGORY = 'FirebaseDiagnostics';

// Types personnalisés pour les erreurs
type FirebaseError = Error & { code?: string };
type EmulatorEnvironment = {
  [key in 'auth' | 'firestore' | 'functions']: string | undefined;
};

// Interfaces améliorées
interface FirebaseServiceStatus {
  isInitialized: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

interface FirebaseDiagnostics {
  app: FirebaseServiceStatus;
  auth: FirebaseServiceStatus;
  firestore: FirebaseServiceStatus;
  functions: FirebaseServiceStatus;
  performance: FirebaseServiceStatus;
  configPresent: boolean;
  emulatorsConfigured: boolean;
  timestamp: number;
}

interface EmulatorConfig {
  host: string;
  port: number;
  secure?: boolean;
}

interface EnvironmentInfo {
  isDevelopment: boolean;
  isProduction: boolean;
  mode: string;
  baseUrl: string;
  timestamp: number;
}

export class FirebaseDiagnosticsService {
  private readonly app: FirebaseApp;
  private static instance: FirebaseDiagnosticsService | null = null;

  constructor(app: FirebaseApp) {
    this.app = app;
  }

  // Singleton pattern amélioré
  public static create(app: FirebaseApp): FirebaseDiagnosticsService {
    if (!FirebaseDiagnosticsService.instance) {
      FirebaseDiagnosticsService.instance = new FirebaseDiagnosticsService(app);
    }
    return FirebaseDiagnosticsService.instance;
  }

  // Méthodes helper améliorées
  private getAuthStatus(auth: Auth | null): FirebaseServiceStatus {
    try {
      return {
        isInitialized: !!auth && auth.currentUser !== null,
        details: auth ? {
          currentUser: auth.currentUser?.uid,
          isEmulator: auth.app.options.appId !== undefined // Vérification alternative pour l'émulateur
        } : undefined
      };
    } catch (error) {
      return {
        isInitialized: false,
        error: this.formatError(error)
      };
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;
      return `${firebaseError.name}: ${firebaseError.message} ${firebaseError.code ? `(${firebaseError.code})` : ''}`;
    }
    return String(error);
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

  getPerformanceStatus(performance: unknown | null): FirebaseServiceStatus {
    return {
      isInitialized: !!performance,
      error: !performance ? 'Service Performance non initialisé' : undefined
    };
  }

  getEnvironmentInfo(): EnvironmentInfo {
    return {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL,
      timestamp: Date.now()
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

  private parseEmulatorConfig(hostString: string): EmulatorConfig {
    const [host, portStr] = hostString.split(':');
    const port = parseInt(portStr, 10);
    
    if (!host || isNaN(port)) {
      throw new Error(`Configuration d'émulateur invalide: ${hostString}`);
    }
    
    return { host, port };
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(typeof error === 'string' ? error : 'Une erreur inconnue est survenue');
  }

  private async initializeEmulators(): Promise<void> {
    if (!import.meta.env.DEV) return;

    const emulators: EmulatorEnvironment = {
      auth: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST,
      firestore: import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST,
      functions: import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST
    };

    try {
      if (emulators.auth) {
        const auth = getAuth(this.app);
        connectAuthEmulator(auth, `http://${emulators.auth}`, { disableWarnings: true });
      }

      if (emulators.firestore) {
        const db = getFirestore(this.app);
        const config = this.parseEmulatorConfig(emulators.firestore);
        connectFirestoreEmulator(db, config.host, config.port);
      }

      if (emulators.functions) {
        const functions = getFunctions(this.app);
        const config = this.parseEmulatorConfig(emulators.functions);
        connectFunctionsEmulator(functions, config.host, config.port);
      }
    } catch (error) {
      logger.error({
        message: 'Failed to initialize emulators',
        category: LOG_CATEGORY,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  async runConnectionTest(): Promise<boolean> {
    try {
      const auth = getAuth(this.app);
      await signInAnonymously(auth);
      logger.info({
        message: 'Connection test successful',
        category: LOG_CATEGORY
      });
      return true;
    } catch (error) {
      logger.error({
        message: 'Connection test failed',
        category: LOG_CATEGORY,
        error: error instanceof Error ? error : new Error(String(error))
      });
      captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Connection Test' });
      return false;
    }
  }

  getServiceStatus(): Record<string, unknown> {
    try {
      const auth = getAuth(this.app);
      const firestore = getFirestore(this.app);
      const functions = getFunctions(this.app);
      
      return {
        auth: this.getAuthStatus(auth),
        firestore: this.getFirestoreStatus(firestore),
        functions: this.getFunctionsStatus(functions),
        performance: this.getPerformanceStatus(
          !import.meta.env.DEV ? getPerformance(this.app) : null
        ),
        emulators: {
          enabled: import.meta.env.DEV,
          auth: !!import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST,
          firestore: !!import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST,
          functions: !!import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST
        },
        environment: this.getEnvironmentInfo()
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get service status',
        category: LOG_CATEGORY,
        error: error instanceof Error ? error : new Error(String(error))
      });
      captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Service Status' });
      return { error: 'Failed to get service status' };
    }
  }

  async checkFirebaseHealth(): Promise<FirebaseDiagnostics> {
    const diagnostics: FirebaseDiagnostics = {
      app: { isInitialized: false },
      auth: { isInitialized: false },
      firestore: { isInitialized: false },
      functions: { isInitialized: false },
      performance: { isInitialized: false },
      configPresent: false,
      emulatorsConfigured: false,
      timestamp: Date.now()
    };

    try {
      await this.initializeEmulators();
      // Vérifier l'application
      diagnostics.app.isInitialized = !!this.app;
      logger.info({
        message: 'Firebase App status checked',
        category: LOG_CATEGORY,
        initialized: diagnostics.app.isInitialized
      });

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
        const auth = getAuth(this.app);
        
        if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
          const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
          connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
        }
        
        await signInAnonymously(auth);
        diagnostics.auth.isInitialized = true;
      } catch (error) {
        diagnostics.auth.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error({
          message: 'Firebase Auth check failed',
          category: LOG_CATEGORY,
          error: error instanceof Error ? error : new Error(String(error))
        });
        captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Auth Diagnostics' });
      }

      // Vérifier Firestore
      try {
        const db = getFirestore(this.app);
        
        if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST) {
          const config = this.parseEmulatorConfig(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST);
          connectFirestoreEmulator(db, config.host, config.port);
        }
        
        diagnostics.firestore.isInitialized = !!db;
      } catch (error) {
        diagnostics.firestore.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error({
          message: 'Firebase Firestore check failed',
          category: LOG_CATEGORY,
          error: error instanceof Error ? error : new Error(String(error))
        });
        captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Firestore Diagnostics' });
      }

      // Vérifier Functions
      try {
        const functions = getFunctions(this.app);
        
        if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST) {
          const config = this.parseEmulatorConfig(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST);
          connectFunctionsEmulator(functions, config.host, config.port);
        }
        
        diagnostics.functions.isInitialized = !!functions;
      } catch (error) {
        diagnostics.functions.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error({
          message: 'Firebase Functions check failed',
          category: LOG_CATEGORY,
          error: error instanceof Error ? error : new Error(String(error))
        });
        captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Functions Diagnostics' });
      }

      // Vérifier Performance
      try {
        // Ne pas initialiser Performance en mode développement ou test
        if (!import.meta.env.DEV && !import.meta.env.TEST) {
          const performance = getPerformance(this.app);
          diagnostics.performance.isInitialized = !!performance;
        } else {
          diagnostics.performance.isInitialized = true;
          diagnostics.performance.error = 'Performance monitoring désactivé en développement';
        }
      } catch (error) {
        diagnostics.performance.error = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error({
          message: 'Firebase Performance check failed',
          category: LOG_CATEGORY,
          error: error instanceof Error ? error : new Error(String(error))
        });
        captureException(error instanceof Error ? error : new Error(String(error)), { context: 'Firebase Performance Diagnostics' });
      }

      // Vérifier les émulateurs
      const emulatorHosts = {
        auth: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST,
        firestore: import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST,
        functions: import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST
      };
      
      diagnostics.emulatorsConfigured = import.meta.env.DEV &&
        Object.values(emulatorHosts).some(host => !!host);
      
      return diagnostics;
    } catch (error) {
      logger.error({
        message: 'Firebase health check failed',
        category: LOG_CATEGORY,
        error: error instanceof Error ? error : new Error(String(error))
      });
      captureException(error instanceof Error ? error : new Error(String(error)), {
        context: 'Firebase Health Check',
        extra: { diagnostics }
      });
      throw this.handleError(error);
    }
  }
}
