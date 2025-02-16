import { initializeApp, FirebaseOptions } from 'firebase/app';
import { z } from 'zod';
import { firebaseManager } from '../services/firebase/services';
import { logger } from '../utils/firebase-logger';

const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().min(1)
});

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(configSchema.parse(firebaseConfig));

// Utilisation du manager unique
export const getFirebaseAuth = () => firebaseManager.getAuth();
export const getFirestore = () => firebaseManager.getFirestore();
export const getFunctions = () => firebaseManager.getFunctions();

logger.info({ 
  category: 'Firebase', 
  message: 'Firebase config exported successfully' 
});

export default firebaseConfig;
