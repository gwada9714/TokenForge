// Force le chargement du module auth
import { initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { logger } from '../utils/firebase-logger';

const LOG_CATEGORY = 'FirebaseInit';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

logger.debug(LOG_CATEGORY, { message: ' Initialisation de Firebase App' });
export const app = initializeApp(firebaseConfig);
logger.info(LOG_CATEGORY, { message: ' Firebase App initialisé' });

// Initialize Firebase Authentication
let _auth: Auth | null = null;

export async function initializeAuth(): Promise<Auth> {
  if (_auth) return _auth;

  logger.debug(LOG_CATEGORY, { message: ' Initialisation de Firebase Auth' });
  
  // Ensure auth module is loaded
  await import('firebase/auth');
  logger.debug(LOG_CATEGORY, { message: ' Module Auth chargé' });
  
  // Get auth instance
  _auth = getAuth(app);
  logger.info(LOG_CATEGORY, { message: ' Service Auth initialisé' });
  
  return _auth;
}

// Initialize auth immediately
initializeAuth().catch(error => {
  logger.error(LOG_CATEGORY, { 
    message: 'Erreur lors de l\'initialisation de Auth',
    error
  });
});

// Export auth getter
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    throw new Error('Firebase Auth n\'est pas encore initialisé');
  }
  return _auth;
}
