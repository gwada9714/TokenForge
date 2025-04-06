import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { z } from "zod";
import { logger } from "../../core/logger";

// Schéma de validation pour la configuration Firebase
const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
  measurementId: z.string().optional(),
});

// Configuration Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Ajouter measurementId si disponible
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
}

// Paramètres Firebase
export const firebaseSettings = {
  sessionPersistence: true,
  emulatorMode:
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true",
  authEmulatorHost: "http://localhost:9099",
  firestoreEmulatorHost: "localhost:8080",
  functionsEmulatorHost: "localhost:5001",
};

/**
 * Service de gestion de la configuration et de l'initialisation de l'application Firebase.
 */
class FirebaseService {
  private static instance: FirebaseService;
  private _app: FirebaseApp | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!this.instance) {
      this.instance = new FirebaseService();
    }
    return this.instance;
  }

  /**
   * Initialise l'application Firebase avec la configuration validée
   */
  public initialize(): FirebaseApp {
    if (this._app || getApps().length > 0) {
      this._app = getApps()[0];
      this.initialized = true;
      return this._app;
    }

    try {
      // Valider la configuration
      const validatedConfig = configSchema.parse(firebaseConfig);

      // Initialiser l'application
      this._app = initializeApp(validatedConfig);

      logger.info({
        category: "Firebase",
        message: "Firebase initialisé avec succès",
        data: {
          projectId: validatedConfig.projectId,
          useEmulator: firebaseSettings.emulatorMode,
        },
      });

      this.initialized = true;
      return this._app;
    } catch (error) {
      this.initialized = false;
      logger.error({
        category: "Firebase",
        message: "Erreur lors de l'initialisation de Firebase",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Récupère l'instance de l'application Firebase, l'initialise si nécessaire.
   */
  public get app(): FirebaseApp {
    if (!this._app) {
      return this.initialize();
    }
    return this._app;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Création de l'instance singleton du service Firebase
export const firebaseService = FirebaseService.getInstance();

// Initialisation de Firebase et export des services
export const app = firebaseService.app;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Fonction pour vérifier l'état de Firebase
export function getFirebaseStatus() {
  try {
    const isInitialized = firebaseService.isInitialized();
    const appsCount = getApps().length;

    return {
      isInitialized,
      appsCount,
      config: {
        apiKey: firebaseConfig.apiKey ? "configured" : "missing",
        authDomain: firebaseConfig.authDomain ? "configured" : "missing",
        projectId: firebaseConfig.projectId ? "configured" : "missing",
        environment: import.meta.env.DEV ? "development" : "production",
      },
    };
  } catch (error) {
    logger.error({
      category: "Firebase",
      message: "Erreur lors de la vérification du statut Firebase",
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return {
      isInitialized: false,
      appsCount: -1,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Fonction pour valider les variables d'environnement Firebase
export function validateFirebaseEnv(): {
  valid: boolean;
  missingVars: string[];
} {
  const requiredEnvVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}
