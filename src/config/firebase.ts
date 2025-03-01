import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logger, LogLevel } from '@/utils/logger';
// import admin from './firebaseAdmin'; // Commenter ou supprimer cette ligne si non nécessaire

// Vérification des variables d'environnement
const isDevelopment = import.meta.env.DEV;

// En mode développement, utiliser des valeurs par défaut si les variables d'environnement ne sont pas définies
if (!isDevelopment && (!process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_AUTH_DOMAIN || !process.env.VITE_FIREBASE_PROJECT_ID || !process.env.VITE_FIREBASE_STORAGE_BUCKET || !process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || !process.env.VITE_FIREBASE_APP_ID)) {
  throw new Error('Les variables d\'environnement Firebase ne sont pas correctement configurées.');
}

// Configuration Firebase avec valeurs par défaut pour le développement
export const firebaseConfig = isDevelopment ? {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'dev-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'dev-project.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'dev-project',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'dev-project.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
} : {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

class FirebaseService {
  private static instance: FirebaseService;
  private auth: Auth | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      this.auth = getAuth(app);

      if (import.meta.env.DEV) {
        connectAuthEmulator(this.auth, 'http://localhost:9099');
        connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
      }

      this.initialized = true;
      logger.info('Firebase initialized successfully', LogLevel.INFO);
    } catch (error) {
      logger.error('Firebase initialization failed', LogLevel.ERROR);
      throw error;
    }
  }

  public getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    return this.auth;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const firebaseService = FirebaseService.getInstance();

// Export des instances Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage();

export const getFirebaseStatus = async () => {
  try {
    const auth = getAuth(app);
    return {
      initialized: !!auth,
      currentUser: auth.currentUser,
      status: 'connected'
    };
  } catch (error) {
    return {
      initialized: false,
      currentUser: null,
      status: 'error',
      error
    };
  }
};

export const getDiagnostics = async () => {
  const status = await getFirebaseStatus();
  return {
    firebase: status,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.VITE_FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.VITE_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID
    }
  };
};
