import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { logger } from '../core/logger';

// Vérification du mode de l'application
const isDevelopment = import.meta.env.DEV;

// Configuration Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dev-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dev-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dev-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dev-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// En production, vérifier que les variables d'environnement sont définies
if (!isDevelopment) {
  const missingVars = [];
  if (!import.meta.env.VITE_FIREBASE_API_KEY) missingVars.push('VITE_FIREBASE_API_KEY');
  if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingVars.push('VITE_FIREBASE_PROJECT_ID');
  if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!import.meta.env.VITE_FIREBASE_APP_ID) missingVars.push('VITE_FIREBASE_APP_ID');
  
  if (missingVars.length > 0) {
    logger.error({
      category: 'Firebase',
      message: `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}`,
      error: new Error('Configuration Firebase incomplète')
    });
  }
}

/**
 * Service de gestion de la configuration et de l'initialisation de l'application Firebase.
 * Ce service est responsable uniquement de l'initialisation de base de Firebase.
 * Pour les services spécifiques (auth, firestore, etc.), utilisez les modules dédiés:
 * - src/lib/firebase/auth.ts : Gestion authentification
 * - src/lib/firebase/firestore.ts : Interactions base de données
 * - src/lib/firebase/services.ts : Initialisation cœur
 */
class FirebaseService {
  private static instance: FirebaseService;
  private _app: FirebaseApp | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialise l'application Firebase si elle n'est pas déjà initialisée.
   * Utilise getApps() pour vérifier si une instance existe déjà.
   */
  public initialize(): FirebaseApp {
    if (this.initialized && this._app) {
      logger.debug({
        category: 'Firebase',
        message: 'Firebase déjà initialisé, réutilisation de l\'instance existante'
      });
      return this._app;
    }

    try {
      logger.info({
        category: 'Firebase',
        message: 'Initialisation du service Firebase'
      });
      
      // Vérifier si Firebase est déjà initialisé par une autre partie de l'application
      if (getApps().length > 0) {
        this._app = getApps()[0];
        logger.info({
          category: 'Firebase',
          message: 'Instance Firebase existante détectée et réutilisée'
        });
      } else {
        // Initialiser l'application Firebase seulement si aucune instance n'existe
        this._app = initializeApp(firebaseConfig);
        logger.info({
          category: 'Firebase',
          message: 'Nouvelle instance Firebase initialisée'
        });
      }
      
      this.initialized = true;
      return this._app;
    } catch (error) {
      this.initialized = false;
      logger.error({
        category: 'Firebase',
        message: 'Erreur lors de l\'initialisation de Firebase',
        error: error instanceof Error ? error : new Error(String(error))
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

// Initialisation de Firebase et export de l'instance unique
export const app = firebaseService.app;

// Fonction pour vérifier l'état de Firebase
export function getFirebaseStatus() {
  try {
    const isInitialized = firebaseService.isInitialized();
    const appsCount = getApps().length;
    
    return {
      isInitialized,
      appsCount,
      config: {
        apiKey: firebaseConfig.apiKey ? 'configured' : 'missing',
        authDomain: firebaseConfig.authDomain ? 'configured' : 'missing',
        projectId: firebaseConfig.projectId ? 'configured' : 'missing',
        environment: isDevelopment ? 'development' : 'production'
      }
    };
  } catch (error) {
    logger.error({
      category: 'Firebase',
      message: 'Erreur lors de la vérification du statut Firebase',
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return {
      isInitialized: false,
      appsCount: -1,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Fonction pour le diagnostic
export function getDiagnostics() {
  return {
    firebase: getFirebaseStatus(),
    env: {
      isDevelopment,
      useEmulator: isDevelopment && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
    }
  };
}
