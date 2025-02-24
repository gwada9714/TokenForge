import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  appId: z.string().min(1)
});

export class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: FirebaseApp | null = null;

  private constructor() {}

  static getInstance(): FirebaseConfig {
    if (!this.instance) {
      this.instance = new FirebaseConfig();
    }
    return this.instance;
  }

  initializeApp() {
    if (!this.app && getApps().length === 0) {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      const validatedConfig = configSchema.parse(config);
      this.app = initializeApp(validatedConfig);
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

export const firebaseConfig = FirebaseConfig.getInstance();
