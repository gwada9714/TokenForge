import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logger } from '@/utils/logger';
import { FIREBASE_CONFIG, LOG_CATEGORIES } from './constants';

// Configuration Firebase
export const firebaseConfig = {
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
      logger.info('Firebase initialized successfully', { category: 'Firebase' });
    } catch (error) {
      logger.error('Firebase initialization failed', { category: 'Firebase', error: error instanceof Error ? error : new Error(String(error)) });
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
