// Chargement synchrone des modules critiques
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  inMemoryPersistence,
  indexedDBLocalPersistence,
  setPersistence,
  connectAuthEmulator,
  User,
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore, 
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getFunctions, 
  type Functions, 
  connectFunctionsEmulator, 
  httpsCallable
} from 'firebase/functions';
import { AuthComponentNotRegisteredError, AuthIntegrityError } from '../features/auth/errors/AuthError';
import { logger, LogLevel } from '../utils/firebase-logger';
import { FirebaseDiagnosticsService } from '../utils/firebase-diagnostics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Singleton pour l'application Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

// Types pour les services Firebase
interface FirebaseServices {
  auth: Auth;
  db: Firestore | null;
  functions: Functions | null;
}

// État global des services
const services: FirebaseServices = {
  auth: null,
  db: null,
  functions: null
};

// Initialisation de Firebase
export const initializeFirebase = async (): Promise<void> => {
  try {
    if (!app) {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        logger.log(LogLevel.INFO, 'Firebase initialisé avec succès');
      } else {
        app = getApps()[0];
        logger.log(LogLevel.INFO, 'Firebase déjà initialisé');
      }

      // Initialiser les services
      auth = getAuth(app);
      firestore = getFirestore(app);
      functions = getFunctions(app);

      // Configurer la persistence Auth
      await configureAuthPersistence(auth);

      // Initialiser Firestore avec persistence optimisée
      services.db = await initializeFirestore(app);

      // Initialiser Functions
      services.functions = initializeFunctions(app);

      // Observer les changements d'état d'authentification
      setupAuthStateObserver(auth);

      // Vérifier l'état final
      verifyFirebaseServices();
    }
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Erreur lors de l\'initialisation de Firebase:', { error });
    throw error;
  }
};

// Configurer la persistence Auth
const configureAuthPersistence = async (auth: Auth): Promise<void> => {
  logger.log(LogLevel.INFO, 'Configuration de la persistence Auth');
  
  try {
    const persistence = import.meta.env.PROD 
      ? indexedDBLocalPersistence 
      : browserLocalPersistence;
    
    await setPersistence(auth, persistence);
    logger.log(LogLevel.INFO, `Persistence Auth configurée: ${persistence.type}`);
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Erreur lors de la configuration de la persistence Auth:', error);
    throw error;
  }
};

// Initialiser Firestore avec persistence optimisée
const initializeFirestore = async (app: FirebaseApp): Promise<Firestore> => {
  logger.log(LogLevel.INFO, 'Initialisation de Firestore');
  
  try {
    const db = getFirestore(app);

    // Activer la persistence multi-onglets en production
    if (import.meta.env.PROD) {
      await enableMultiTabIndexedDbPersistence(db);
      logger.log(LogLevel.INFO, 'Persistence Firestore activée');
    }

    // Configurer l'émulateur en développement
    if (import.meta.env.DEV) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      logger.log(LogLevel.INFO, 'Émulateur Firestore configuré');
    }

    return db;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Erreur lors de l\'initialisation de Firestore:', error);
    throw error;
  }
};

// Initialiser Cloud Functions
const initializeFunctions = (app: FirebaseApp): Functions => {
  logger.log(LogLevel.INFO, 'Initialisation de Cloud Functions');
  
  try {
    const functions = getFunctions(app);
    
    // Configurer l'émulateur en développement
    if (import.meta.env.DEV) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      logger.log(LogLevel.INFO, 'Émulateur Functions configuré');
    }
    
    return functions;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Erreur lors de l\'initialisation de Functions:', error);
    throw error;
  }
};

// Observer les changements d'état d'authentification
const setupAuthStateObserver = (auth: Auth): void => {
  onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      logger.log(LogLevel.INFO, 'Utilisateur connecté:', user.uid);
    } else {
      logger.log(LogLevel.INFO, 'Utilisateur déconnecté');
    }
  });
};

// Vérifier l'état des services Firebase
const verifyFirebaseServices = (): void => {
  logger.log(LogLevel.INFO, 'Vérification des services Firebase');
  
  if (!services.auth) {
    throw new AuthComponentNotRegisteredError('Le service Auth n\'est pas initialisé');
  }

  if (!services.db) {
    logger.log(LogLevel.WARN, 'Le service Firestore n\'est pas initialisé');
  }

  if (!services.functions) {
    logger.log(LogLevel.WARN, 'Le service Functions n\'est pas initialisé');
  }
};

// Getters sécurisés pour les services Firebase
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth n\'est pas initialisé. Appelez initializeFirebase() d\'abord.');
  }
  return auth!;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!firestore) {
    throw new Error('Firebase Firestore n\'est pas initialisé');
  }
  return firestore;
};

export const getFirebaseFunctions = (): Functions => {
  if (!functions) {
    throw new Error('Firebase Functions n\'est pas initialisé');
  }
  return functions;
};

// Export des fonctions d'authentification
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Export des fonctions de diagnostic
export const getDiagnostics = () => {
  const diagnostics = new FirebaseDiagnosticsService();
  return {
    authStatus: diagnostics.getAuthStatus(services.auth),
    dbStatus: diagnostics.getFirestoreStatus(services.db),
    functionsStatus: diagnostics.getFunctionsStatus(services.functions),
    environment: diagnostics.getEnvironmentInfo(),
    configuration: diagnostics.getConfigurationStatus()
  };
};

// Export de l'état des services
export const getFirebaseStatus = () => {
  return {
    auth: !!services.auth,
    db: !!services.db,
    functions: !!services.functions,
    initialized: services.auth && services.db && services.functions
  };
};
