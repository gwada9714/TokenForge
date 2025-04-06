import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { logger, LogLevel } from '../core/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export async function testFirebaseInit() {
  try {
    logger.log(LogLevel.INFO, '=== Test d\'initialisation Firebase ===');
    
    // 1. Initialiser l'app
    logger.log(LogLevel.INFO, '1. Initialisation de l\'app Firebase');
    const app = initializeApp(firebaseConfig);
    
    // 2. Tester chaque module séparément
    logger.log(LogLevel.INFO, '2. Test des modules Firebase');
    
    try {
      logger.log(LogLevel.INFO, '2.1 Test de Firestore');
      const db = getFirestore(app);
      logger.log(LogLevel.INFO, '✓ Firestore OK');
    } catch (error) {
      logger.log(LogLevel.ERROR, '✗ Erreur Firestore:', error);
    }
    
    try {
      logger.log(LogLevel.INFO, '2.2 Test de Storage');
      const storage = getStorage(app);
      logger.log(LogLevel.INFO, '✓ Storage OK');
    } catch (error) {
      logger.log(LogLevel.ERROR, '✗ Erreur Storage:', error);
    }
    
    try {
      logger.log(LogLevel.INFO, '2.3 Test de Functions');
      const functions = getFunctions(app);
      logger.log(LogLevel.INFO, '✓ Functions OK');
    } catch (error) {
      logger.log(LogLevel.ERROR, '✗ Erreur Functions:', error);
    }
    
    try {
      logger.log(LogLevel.INFO, '2.4 Test de Auth');
      const auth = getAuth(app);
      logger.log(LogLevel.INFO, '✓ Auth OK');
    } catch (error) {
      logger.log(LogLevel.ERROR, '✗ Erreur Auth:', error);
    }
    
    logger.log(LogLevel.INFO, '=== Fin du test ===');
    return true;
  } catch (error) {
    logger.log(LogLevel.ERROR, 'Erreur globale du test:', error);
    return false;
  }
}
