import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { logger } from '@/core/logger/Logger';
import { firebaseConfig } from '@/config/firebase';
import { BaseService } from '@/core/services/BaseService';

export class FirebaseInitializer extends BaseService {
  private static instance: FirebaseInitializer;

  private constructor() {
    super('FirebaseInitializer');
  }

  static getInstance(): FirebaseInitializer {
    if (!FirebaseInitializer.instance) {
      FirebaseInitializer.instance = new FirebaseInitializer();
    }
    return FirebaseInitializer.instance;
  }

  async initialize(): Promise<void> {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);

      logger.info({
        category: 'Firebase',
        message: 'Firebase initialized successfully'
      });
    } catch (error) {
      logger.error({
        category: 'Firebase',
        message: 'Firebase initialization failed',
        error: error as Error
      });
      throw error;
    }
  }
}

export const firebaseInitializer = FirebaseInitializer.getInstance();
