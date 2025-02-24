import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';
import { logger } from '../utils/firebase-logger';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

logger.info({ 
  category: 'Firebase', 
  message: 'Firebase config exported successfully' 
});

export default app;
