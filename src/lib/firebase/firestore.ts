import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { logger } from '../../core/logger';
import { app } from '../../config/firebase';

export class FirestoreService {
  private static instance: FirestoreService;
  private db = getFirestore(app);

  private constructor() {
    logger.info({
      category: 'Firestore',
      message: 'Service Firestore initialisé'
    });
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Crée ou met à jour un document dans Firestore
   */
  public async setDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      
      // Ajouter des timestamps pour faciliter le suivi
      const enhancedData = {
        ...data,
        updatedAt: Timestamp.now(),
        createdAt: data.createdAt || Timestamp.now()
      };
      
      await setDoc(docRef, enhancedData);
      
      logger.info({
        category: 'Firestore',
        message: `Document créé/mis à jour dans ${collectionName}`,
        data: { docId }
      });
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la création/mise à jour du document dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Met à jour un document existant dans Firestore
   */
  public async updateDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      
      // Ajouter timestamp de mise à jour
      const enhancedData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, enhancedData);
      
      logger.info({
        category: 'Firestore',
        message: `Document mis à jour dans ${collectionName}`,
        data: { docId }
      });
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la mise à jour du document dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Récupère un document depuis Firestore
   */
  public async getDocument(collectionName: string, docId: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        logger.debug({
          category: 'Firestore',
          message: `Document récupéré depuis ${collectionName}`,
          data: { docId }
        });
        return docSnap.data();
      } else {
        logger.debug({
          category: 'Firestore',
          message: `Document non trouvé dans ${collectionName}`,
          data: { docId }
        });
        return null;
      }
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la récupération du document depuis ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Supprime un document de Firestore
   */
  public async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      
      logger.info({
        category: 'Firestore',
        message: `Document supprimé de ${collectionName}`,
        data: { docId }
      });
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la suppression du document de ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Requête des documents selon certains critères
   */
  public async queryDocuments(
    collectionName: string,
    fieldPath: string,
    operator: '==' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'in' | 'array-contains-any',
    value: unknown
  ): Promise<DocumentData[]> {
    try {
      const collectionRef = collection(this.db, collectionName);
      const q = query(collectionRef, where(fieldPath, operator, value));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      logger.debug({
        category: 'Firestore',
        message: `Requête exécutée sur ${collectionName}`,
        data: { 
          fieldPath, 
          operator, 
          resultsCount: results.length 
        }
      });
      
      return results;
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la requête sur ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
