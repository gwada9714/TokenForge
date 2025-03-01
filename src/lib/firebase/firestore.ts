import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  increment, 
  Firestore
} from 'firebase/firestore';
import { getFirebaseManager } from './services';
import { handleFirebaseError } from '../../utils/error-handler';
import { logger } from '../../utils/firebase-logger';

const LOG_CATEGORY = 'FirestoreService';

// Variable pour stocker l'instance Firestore
let _db: Firestore | null = null;

// Fonction pour obtenir l'instance Firestore
export async function getFirestore(): Promise<Firestore> {
  if (!_db) {
    logger.debug({ category: LOG_CATEGORY, message: ' Initialisation de Firestore' });
    const firebaseManager = await getFirebaseManager();
    _db = firebaseManager.db;
    logger.info({ category: LOG_CATEGORY, message: ' Service Firestore initialis' });
  }
  return _db;
}

export const firestoreService = {
  async createUserProfile(userId: string, data: any) {
    try {
      const db = await getFirestore();
      const userRef = doc(collection(db, 'users'), userId);
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logger.debug({ 
        category: LOG_CATEGORY,
        message: ' Profil utilisateur cr',
        userId 
      });
    } catch (error) {
      logger.error({ 
        category: LOG_CATEGORY,
        message: ' Erreur lors de la cration du profil utilisateur',
        userId,
        error 
      });
      throw handleFirebaseError(error);
    }
  },

  async updateUserProfile(userId: string, data: any) {
    try {
      const db = await getFirestore();
      const userRef = doc(collection(db, 'users'), userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      logger.debug({ 
        category: LOG_CATEGORY,
        message: ' Profil utilisateur mis jour',
        userId 
      });
    } catch (error) {
      logger.error({ 
        category: LOG_CATEGORY,
        message: ' Erreur lors de la mise jour du profil utilisateur',
        userId,
        error 
      });
      throw handleFirebaseError(error);
    }
  },

  async updateUserActivity(userId: string) {
    try {
      const db = await getFirestore();
      const userRef = doc(collection(db, 'users'), userId);
      await updateDoc(userRef, {
        lastActivity: serverTimestamp(),
        activityCount: increment(1)
      });
      logger.debug({ 
        category: LOG_CATEGORY,
        message: ' Activit utilisateur mise jour',
        userId 
      });
    } catch (error) {
      logger.error({ 
        category: LOG_CATEGORY,
        message: ' Erreur lors de la mise jour de lactivit utilisateur',
        userId,
        error 
      });
      throw handleFirebaseError(error);
    }
  }
};
