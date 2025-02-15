import { firebaseManager } from '../services/firebase/services';
import { logger } from '../utils/firebase-logger';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Utilisation du manager unique
export const getFirebaseAuth = () => firebaseManager.getAuth();
export const getFirestore = () => firebaseManager.getFirestore();
export const getFunctions = () => firebaseManager.getFunctions();

logger.info({ 
  category: 'Firebase', 
  message: 'Firebase config exported successfully' 
});

export default firebaseConfig;
