import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheckOptions } from 'firebase/app-check';
import { logger } from '../utils/logger';
import { FirebaseError, handleFirebaseError } from '../utils/error-handler';
import type { FirebaseConfig } from '../types/firebase';

const LOG_CATEGORY = 'Firebase';

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  analytics: Analytics;
}

const validateConfig = (config: FirebaseConfig): void => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new FirebaseError(
      'CONFIG_ERROR',
      'Configuration Firebase incomplète',
      { missingFields }
    );
  }
};

const initializeFirebaseServices = async (): Promise<FirebaseServices> => {
  try {
    validateConfig(firebaseConfig);

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const analytics = getAnalytics(app);

    logger.info(LOG_CATEGORY, {
      message: 'Services Firebase initialisés avec succès',
      context: {
        projectId: firebaseConfig.projectId,
        env: import.meta.env.VITE_ENV
      }
    });

    return { app, auth, db, analytics };
  } catch (error) {
    const firebaseError = handleFirebaseError(error);
    logger.error(LOG_CATEGORY, {
      message: 'Échec de l\'initialisation des services Firebase',
      error: firebaseError,
      context: {
        config: {
          ...firebaseConfig,
          apiKey: '[REDACTED]' // Ne pas logger la clé API
        }
      }
    });
    throw firebaseError;
  }
};

const initializeAppCheckService = (app: FirebaseApp): void => {
  const isDevelopment = import.meta.env.VITE_ENV?.toLowerCase() === 'development';

  if (isDevelopment) {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      logger.info(LOG_CATEGORY, {
        message: 'App Check en mode debug pour le développement local',
        context: { debugToken: true }
      });
    }
    return;
  }

  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  
  if (!recaptchaKey && !isDevelopment) {
    logger.warn(LOG_CATEGORY, {
      message: 'App Check non configuré en production',
      context: { env: import.meta.env.VITE_ENV }
    });
    return;
  }

  try {
    if (!recaptchaKey) {
      throw new FirebaseError(
        'APPCHECK_CONFIG_ERROR',
        'Clé reCAPTCHA manquante pour App Check'
      );
    }

    const provider = new ReCaptchaV3Provider(recaptchaKey);
    const appCheckConfig: AppCheckOptions = {
      provider,
      isTokenAutoRefreshEnabled: true
    };

    initializeAppCheck(app, appCheckConfig);
    
    logger.info(LOG_CATEGORY, {
      message: 'App Check initialisé avec succès',
      context: { provider: 'reCAPTCHA v3' }
    });
  } catch (error) {
    const appCheckError = handleFirebaseError(error);
    logger.error(LOG_CATEGORY, {
      message: 'Échec de l\'initialisation d\'App Check',
      error: appCheckError
    });

    if (isDevelopment) {
      // Fallback en mode debug pour le développement
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      logger.warn(LOG_CATEGORY, {
        message: 'Fallback vers le mode debug App Check',
        context: { debugToken: true }
      });
    }
  }
};

export const initializeFirebase = async (): Promise<FirebaseServices> => {
  const services = await initializeFirebaseServices();
  initializeAppCheckService(services.app);
  return services;
};
