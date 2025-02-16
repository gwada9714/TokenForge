import { BaseService } from '@/core/services/BaseService';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/config/firebase';

export class FirebaseService extends BaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;

  constructor() {
    super('FirebaseService');
  }

  async initialize(): Promise<void> {
    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.log('Firebase initialized successfully');
    } catch (error) {
      this.logError('Firebase initialization failed', error as Error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup logic for Firebase service
    this.auth = null;
    this.app = null;
  }

  getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    return this.auth;
  }
}
