import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { logger } from '../../utils/firebase-logger';
import { app } from '../../config/firebase-init';

const LOG_CATEGORY = 'FirebaseManager';

export class FirebaseManager {
  private static instance: FirebaseManager;
  private readonly app: FirebaseApp;
  private _auth: Auth | null = null;
  private _db: Firestore;
  private _functions: Functions;

  private constructor() {
    logger.info(LOG_CATEGORY, { message: '🚀 Démarrage de l\'initialisation de Firebase' });
    
    try {
      // Utiliser l'instance Firebase déjà initialisée
      this.app = app;
      
      // Initialiser Firestore
      logger.debug(LOG_CATEGORY, { message: '📚 Initialisation de Firestore' });
      this._db = getFirestore(this.app);
      logger.info(LOG_CATEGORY, { message: '✅ Service Firestore initialisé' });

      // Initialiser Functions
      logger.debug(LOG_CATEGORY, { message: '⚡ Initialisation des Functions' });
      this._functions = getFunctions(this.app, import.meta.env.VITE_FIREBASE_REGION);
      logger.info(LOG_CATEGORY, { message: '✅ Service Functions initialisé' });
      
      logger.info(LOG_CATEGORY, { message: '🎉 Services Firebase de base initialisés' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'initialisation de Firebase', error });
      throw error;
    }
  }

  public static async getInstanceAsync(): Promise<FirebaseManager> {
    if (!FirebaseManager.instance) {
      logger.info(LOG_CATEGORY, { message: '🏗️ Création d\'une nouvelle instance FirebaseManager' });
      FirebaseManager.instance = new FirebaseManager();
      
      // Initialiser Auth de manière asynchrone
      await FirebaseManager.instance.initializeAuth();
    }
    return FirebaseManager.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔐 Initialisation de Firebase Auth' });
      
      // Import dynamique de firebase/auth
      await import('firebase/auth');
      const { getAuth } = await import('firebase/auth');
      
      // Initialiser Auth
      this._auth = getAuth(this.app);
      logger.info(LOG_CATEGORY, { message: '✅ Service Auth initialisé' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'initialisation de Auth', error });
      throw error;
    }
  }

  get auth(): Auth {
    if (!this._auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé. Assurez-vous d\'avoir appelé getInstanceAsync().');
    }
    return this._auth;
  }

  get db(): Firestore {
    return this._db;
  }

  get functions(): Functions {
    return this._functions;
  }
}

// Export une fonction asynchrone pour obtenir l'instance
export async function getFirebaseManager(): Promise<FirebaseManager> {
  return FirebaseManager.getInstanceAsync();
}
