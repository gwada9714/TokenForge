// Import Firebase core
import { initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { logger, LogLevel } from '../utils/firebase-logger';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de Auth avec gestion d'erreur explicite
let firebaseAuth: Auth;
try {
  firebaseAuth = getAuth(app);
  logger.log(LogLevel.INFO, 'Firebase Auth initialisé avec succès');
} catch (error) {
  logger.log(LogLevel.ERROR, 'Erreur lors de l\'initialisation de Auth:', error);
  throw error;
}

export { app, firebaseAuth as auth };
