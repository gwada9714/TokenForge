import {
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
  Firestore,
  writeBatch,
  runTransaction,
  DocumentReference,
  startAfter,
  QueryConstraint,
  serverTimestamp,
  Transaction
} from 'firebase/firestore';
import { logger } from '@/core/logger';
import { getFirebaseManager } from './services';

export class FirestoreService {
  private static instance: FirestoreService;
  private db: Firestore | null = null;

  private constructor() {
    logger.info({
      category: 'Firestore',
      message: 'Service Firestore en cours d\'initialisation'
    });
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Initialise la connexion à Firestore
   */
  public async ensureInitialized(): Promise<Firestore> {
    if (!this.db) {
      const firebaseManager = await getFirebaseManager();
      this.db = firebaseManager.db;
      logger.info({
        category: 'Firestore',
        message: 'Service Firestore initialisé via FirebaseManager'
      });
    }
    return this.db;
  }

  /**
   * Crée ou met à jour un document dans Firestore
   */
  public async setDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const docRef = doc(db, collectionName, docId);
      
      // Ajouter des timestamps pour faciliter le suivi
      const enhancedData = {
        ...data,
        updatedAt: Timestamp.now(),
        createdAt: data.createdAt || Timestamp.now()
      };
      
      await setDoc(docRef, enhancedData);
      
      logger.info({
        category: 'Firestore',
        message: 'Document créé/mis à jour avec succès',
        data: { collection: collectionName, docId }
      });
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: 'Erreur lors de la création/mise à jour du document',
        error: error instanceof Error ? error : new Error(String(error)),
        data: { collection: collectionName, docId }
      });
      
      // Réessayer une fois en cas d'erreur
      try {
        logger.info({
          category: 'Firestore',
          message: 'Nouvelle tentative de création/mise à jour du document',
          data: { collection: collectionName, docId }
        });
        
        const db = await this.ensureInitialized();
        const docRef = doc(db, collectionName, docId);
        
        // Ajouter des timestamps pour faciliter le suivi
        const enhancedData = {
          ...data,
          updatedAt: Timestamp.now(),
          createdAt: data.createdAt || Timestamp.now()
        };
        
        await setDoc(docRef, enhancedData);
        
        logger.info({
          category: 'Firestore',
          message: 'Document créé/mis à jour avec succès après nouvelle tentative',
          data: { collection: collectionName, docId }
        });
      } catch (retryError) {
        logger.error({
          category: 'Firestore',
          message: 'Échec de la nouvelle tentative de création/mise à jour du document',
          error: retryError instanceof Error ? retryError : new Error(String(retryError)),
          data: { collection: collectionName, docId }
        });
        throw retryError;
      }
    }
  }

  /**
   * Met à jour un document existant dans Firestore
   */
  public async updateDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const docRef = doc(db, collectionName, docId);
      
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
      const db = await this.ensureInitialized();
      const docRef = doc(db, collectionName, docId);
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
      const db = await this.ensureInitialized();
      const docRef = doc(db, collectionName, docId);
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
      const db = await this.ensureInitialized();
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where(fieldPath, operator, value));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      logger.debug({
        category: 'Firestore',
        message: `${results.length} documents trouvés dans ${collectionName}`,
        data: { fieldPath, operator, query: String(value) }
      });
      
      return results;
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la requête dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { fieldPath, operator, query: String(value) }
      });
      throw error;
    }
  }
  
  /**
   * Requête avancée avec pagination et plusieurs filtres
   * @param collectionName Nom de la collection
   * @param constraints Tableau de contraintes de requête (where, orderBy, limit, etc.)
   * @param lastDoc Document à partir duquel paginer (pour pagination)
   * @returns Documents correspondant aux critères et métadonnées de pagination
   */
  public async advancedQuery(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    lastDoc?: DocumentData
  ): Promise<{ results: DocumentData[]; hasMore: boolean; lastDoc?: DocumentData }> {
    try {
      const db = await this.ensureInitialized();
      const collectionRef = collection(db, collectionName);
      
      let queryConstraints = [...constraints];
      
      // Si on a un lastDoc, on ajoute la contrainte de pagination
      if (lastDoc && lastDoc.id) {
        const lastDocRef = await this.getDocument(collectionName, lastDoc.id);
        if (lastDocRef) {
          queryConstraints.push(startAfter(lastDocRef));
        }
      }
      
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const limitConstraint = constraints.find(c => c.type === 'limit') as any;
      const limitValue = limitConstraint ? limitConstraint.limit : 0;
      const hasMore = limitValue > 0 && results.length === limitValue;
      
      logger.debug({
        category: 'Firestore',
        message: `${results.length} documents trouvés dans ${collectionName} (requête avancée)`,
        data: { hasMore }
      });
      
      return {
        results,
        hasMore,
        lastDoc: results.length > 0 ? results[results.length - 1] : undefined
      };
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la requête avancée dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Exécute une transaction Firestore
   * Garantit que plusieurs opérations sont exécutées de manière atomique
   * @param transactionFn Fonction de transaction qui reçoit l'objet transaction
   * @returns Résultat de la transaction
   */
  public async executeTransaction<T>(
    transactionFn: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    try {
      const db = await this.ensureInitialized();
      
      const result = await runTransaction(db, async transaction => {
        return await transactionFn(transaction);
      });
      
      logger.info({
        category: 'Firestore',
        message: 'Transaction exécutée avec succès'
      });
      
      return result;
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: 'Erreur lors de l\'exécution de la transaction',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  /**
   * Crée un batch pour effectuer plusieurs opérations en une seule requête
   * @returns Un objet avec des méthodes pour manipuler et committer le batch
   */
  public async createBatch(): Promise<{
    set: (collectionName: string, docId: string, data: Record<string, unknown>) => void;
    update: (collectionName: string, docId: string, data: Record<string, unknown>) => void;
    delete: (collectionName: string, docId: string) => void;
    commit: () => Promise<void>;
  }> {
    const db = await this.ensureInitialized();
    const batch = writeBatch(db);
    
    // Cache des références de documents pour éviter de récréer des objets
    const docRefs: Record<string, DocumentReference> = {};
    
    const getDocRef = (collectionName: string, docId: string): DocumentReference => {
      const key = `${collectionName}/${docId}`;
      if (!docRefs[key]) {
        docRefs[key] = doc(db, collectionName, docId);
      }
      return docRefs[key];
    };
    
    return {
      set: (collectionName: string, docId: string, data: Record<string, unknown>) => {
        const docRef = getDocRef(collectionName, docId);
        const enhancedData = {
          ...data,
          updatedAt: serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp()
        };
        batch.set(docRef, enhancedData);
      },
      
      update: (collectionName: string, docId: string, data: Record<string, unknown>) => {
        const docRef = getDocRef(collectionName, docId);
        const enhancedData = {
          ...data,
          updatedAt: serverTimestamp()
        };
        batch.update(docRef, enhancedData);
      },
      
      delete: (collectionName: string, docId: string) => {
        const docRef = getDocRef(collectionName, docId);
        batch.delete(docRef);
      },
      
      commit: async () => {
        try {
          await batch.commit();
          logger.info({
            category: 'Firestore',
            message: 'Batch commité avec succès'
          });
        } catch (error) {
          logger.error({
            category: 'Firestore',
            message: 'Erreur lors du commit du batch',
            error: error instanceof Error ? error : new Error(String(error))
          });
          throw error;
        }
      }
    };
  }
  
  /**
   * Crée un document avec un ID automatique
   * @param collectionName Nom de la collection
   * @param data Données du document
   * @returns ID du nouveau document
   */
  public async addDocument(collectionName: string, data: Record<string, unknown>): Promise<string> {
    try {
      const db = await this.ensureInitialized();
      const collectionRef = collection(db, collectionName);
      
      // Générer un ID unique
      const newDocRef = doc(collectionRef);
      
      // Ajouter les timestamps
      const enhancedData = {
        ...data,
        id: newDocRef.id, // Inclure l'ID dans les données
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(newDocRef, enhancedData);
      
      logger.info({
        category: 'Firestore',
        message: `Document créé dans ${collectionName}`,
        data: { docId: newDocRef.id }
      });
      
      return newDocRef.id;
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la création du document dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }
  
  /**
   * Récupère plusieurs documents par leurs IDs
   * @param collectionName Nom de la collection
   * @param docIds Tableau d'IDs de documents
   * @returns Tableau de documents
   */
  public async getDocumentsByIds(collectionName: string, docIds: string[]): Promise<DocumentData[]> {
    try {
      // Utiliser 'in' pour récupérer plusieurs documents en une seule requête
      // Note: Firestore limite à 10 valeurs dans un 'in', donc diviser si nécessaire
      const db = await this.ensureInitialized();
      const results: DocumentData[] = [];
      
      // Traiter par lots de 10 (limite Firestore)
      const batchSize = 10;
      for (let i = 0; i < docIds.length; i += batchSize) {
        const batch = docIds.slice(i, i + batchSize);
        if (batch.length > 0) {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, where('id', 'in', batch));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach(doc => {
            results.push({
              id: doc.id,
              ...doc.data()
            });
          });
        }
      }
      
      logger.debug({
        category: 'Firestore',
        message: `${results.length}/${docIds.length} documents récupérés dans ${collectionName}`,
        data: { docIds }
      });
      
      return results;
    } catch (error) {
      logger.error({
        category: 'Firestore',
        message: `Erreur lors de la récupération des documents dans ${collectionName}`,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
