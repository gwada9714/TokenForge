import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  Auth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { 
  Firestore,
  initializeFirestore,
  FirestoreSettings,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { 
  Functions,
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable
} from 'firebase/functions';
import { 
  getPerformance
} from 'firebase/performance';
import { logger } from '../utils/firebase-logger';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Singleton pour l'application Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;
let performance: ReturnType<typeof getPerformance> | null = null;

// Initialisation de l'application Firebase
try {
  app = initializeApp(firebaseConfig);
  logger.info('Firebase App initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase App', error);
  throw new Error('Critical: Firebase App initialization failed');
}

// Initialisation de Auth avec gestion d'erreur explicite
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence]
  });
  logger.info('Auth initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Auth', error);
  // Tentative de fallback avec une configuration minimale
  try {
    auth = initializeAuth(app, { persistence: [] });
    logger.warn('Auth initialized in fallback mode');
  } catch (fallbackError) {
    logger.error('Auth fallback initialization failed', fallbackError);
  }
}

// Initialisation de Firestore avec la nouvelle configuration de cache
try {
  const firestoreSettings: FirestoreSettings = {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: 40 * 1024 * 1024 // 40 MB
    })
  };

  firestore = initializeFirestore(app, firestoreSettings);
  
  if (import.meta.env.DEV) {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  }
  
  logger.info('Firestore initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firestore', error);
}

// Initialisation de Functions avec gestion d'erreur explicite
try {
  functions = getFunctions(app);
  if (import.meta.env.DEV) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
  logger.info('Functions initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Functions', error);
}

// Initialisation de Performance uniquement en production
if (import.meta.env.PROD) {
  try {
    performance = getPerformance(app);
    logger.info('Performance initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Performance', error);
  }
}

// Récupération des services Firebase avec vérification
export function getFirebaseServices() {
  if (!app) {
    throw new Error('Firebase App not initialized');
  }
  return {
    app,
    auth,
    firestore,
    functions,
    performance
  };
}

// Récupération spécifique de Auth avec fallback
export function getFirebaseAuth(): Auth {
  if (!app) {
    throw new Error('Firebase App not initialized');
  }
  if (!auth) {
    // Tentative de réinitialisation
    auth = initializeAuth(app, { persistence: [] });
    logger.warn('Auth re-initialized in fallback mode');
  }
  return auth;
}

// Export des fonctions Firebase
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  httpsCallable
};

// Export des types Firebase
export type {
  User,
  Auth,
  Firestore,
  Functions,
  FirebaseApp
};
