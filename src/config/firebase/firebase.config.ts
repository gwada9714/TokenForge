import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1)
});

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!this.instance) {
      this.instance = new FirebaseService();
    }
    return this.instance;
  }

  initializeApp() {
    if (!this.app && getApps().length === 0) {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      try {
        const validatedConfig = configSchema.parse(config);
        this.app = initializeApp(validatedConfig);
      } catch (error) {
        console.error('Configuration Firebase invalide:', error);
        throw error;
      }
    }
    return this.app;
  }

  getAuth() {
    if (!this.app) {
      this.initializeApp();
    }
    return getAuth(this.app!);
  }
}

export const firebaseService = FirebaseService.getInstance();
