import { getFirebaseManager } from "../services";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch,
  runTransaction,
  doc,
  serverTimestamp,
  DocumentReference,
} from "firebase/firestore";

/**
 * Tests pour les services Firestore
 * Ces tests vérifient le bon fonctionnement des opérations CRUD sur Firestore
 */
export class FirestoreTest {
  /**
   * Test d'initialisation de Firestore
   * Vérifie que le service Firestore est correctement initialisé
   */
  static async testFirestoreInitialization(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();

      // Obtient l'instance Firestore
      const db = fbManager.db;

      return {
        success: true,
        message: "Service Firestore initialisé avec succès",
        data: {
          initialized: !!db,
          serviceName: "Firestore",
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'initialisation de Firestore: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de création d'un document
   * Crée un document test dans une collection temporaire
   */
  static async testCreateDocument(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test (avec un timestamp pour éviter les collisions)
      const testCollectionName = `test_collection_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Document de test à créer
      const testData = {
        name: "Test Document",
        createdAt: new Date().toISOString(),
        testValue: Math.random(),
      };

      // Ajoute le document
      const docRef = await addDoc(testCollection, testData);

      // Vérifie que le document a bien été créé
      const docSnap = await getDoc(docRef);

      return {
        success: docSnap.exists(),
        message: docSnap.exists()
          ? "Document créé avec succès"
          : "Le document n'a pas été créé correctement",
        data: {
          docId: docRef.id,
          collection: testCollectionName,
          docExists: docSnap.exists(),
          docData: docSnap.data(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la création du document: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de lecture d'un document
   * Crée un document et le lit ensuite
   */
  static async testReadDocument(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_collection_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Document de test avec des données
      const testData = {
        name: "Read Test Document",
        createdAt: new Date().toISOString(),
        testValue: Math.random(),
      };

      // Crée le document
      const docRef = await addDoc(testCollection, testData);

      // Lit le document
      const docSnap = await getDoc(docRef);

      return {
        success: docSnap.exists() && docSnap.data()?.name === testData.name,
        message: docSnap.exists()
          ? "Document lu avec succès"
          : "Échec de lecture du document",
        data: {
          docId: docRef.id,
          collection: testCollectionName,
          docExists: docSnap.exists(),
          docData: docSnap.data(),
          matches: docSnap.exists() && docSnap.data()?.name === testData.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la lecture du document: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de mise à jour d'un document
   * Crée un document, le met à jour, puis vérifie les modifications
   */
  static async testUpdateDocument(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_collection_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Document de test avec des données initiales
      const initialData = {
        name: "Update Test Document",
        createdAt: new Date().toISOString(),
        counter: 0,
      };

      // Crée le document
      const docRef = await addDoc(testCollection, initialData);

      // Données de mise à jour
      const updateData = {
        name: "Updated Document",
        updatedAt: new Date().toISOString(),
        counter: 1,
      };

      // Met à jour le document
      await updateDoc(docRef, updateData);

      // Lit le document mis à jour
      const docSnap = await getDoc(docRef);
      const updatedData = docSnap.data();

      return {
        success:
          docSnap.exists() &&
          updatedData?.name === updateData.name &&
          updatedData?.counter === updateData.counter,
        message: docSnap.exists()
          ? "Document mis à jour avec succès"
          : "Échec de mise à jour du document",
        data: {
          docId: docRef.id,
          collection: testCollectionName,
          docExists: docSnap.exists(),
          initialData: initialData,
          updateData: updateData,
          resultData: updatedData,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la mise à jour du document: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de suppression d'un document
   * Crée un document, le supprime, puis vérifie qu'il n'existe plus
   */
  static async testDeleteDocument(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_collection_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Document de test avec des données
      const testData = {
        name: "Delete Test Document",
        createdAt: new Date().toISOString(),
      };

      // Crée le document
      const docRef = await addDoc(testCollection, testData);

      // Vérifie que le document existe
      const beforeDeleteSnap = await getDoc(docRef);
      const existedBefore = beforeDeleteSnap.exists();

      // Supprime le document
      await deleteDoc(docRef);

      // Vérifie que le document n'existe plus
      const afterDeleteSnap = await getDoc(docRef);
      const existsAfter = afterDeleteSnap.exists();

      return {
        success: existedBefore && !existsAfter,
        message:
          existedBefore && !existsAfter
            ? "Document supprimé avec succès"
            : "Échec de suppression du document",
        data: {
          docId: docRef.id,
          collection: testCollectionName,
          existedBefore: existedBefore,
          existsAfter: existsAfter,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la suppression du document: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de requête sur une collection
   * Crée plusieurs documents, puis effectue une requête avec filtre
   */
  static async testQueryCollection(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_collection_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Crée plusieurs documents
      const docPromises = [];
      for (let i = 0; i < 5; i++) {
        const data = {
          name: `Document ${i}`,
          type: i % 2 === 0 ? "even" : "odd",
          value: i,
        };
        docPromises.push(addDoc(testCollection, data));
      }

      await Promise.all(docPromises);

      // Effectue une requête avec filtre (seulement les documents "even")
      const q = query(testCollection, where("type", "==", "even"), limit(10));

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => {
        const data = doc.data() as {
          type: string;
          name: string;
          value: number;
        };
        return { id: doc.id, ...data };
      });

      return {
        success:
          results.length > 0 && results.every((doc) => doc.type === "even"),
        message: "Requête exécutée avec succès",
        data: {
          collection: testCollectionName,
          query: "type == even",
          resultCount: results.length,
          expectedCount: 3, // 0, 2, 4 sont des nombres pairs
          results: results,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'exécution de la requête: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de batch pour modifications groupées
   * Crée plusieurs documents puis les modifie tous dans un seul batch
   */
  static async testFirestoreBatch(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_batch_${Date.now()}`;
      const testCollection = collection(db, testCollectionName);

      // Crée plusieurs documents initiaux
      const docRefs: DocumentReference[] = [];
      const initialDocs = [];

      for (let i = 0; i < 3; i++) {
        const initialData = {
          name: `Batch Document ${i}`,
          createdAt: new Date().toISOString(),
          counter: i,
          batchProcessed: false,
        };

        const docRef = await addDoc(testCollection, initialData);
        docRefs.push(docRef);
        initialDocs.push(initialData);
      }

      // Crée un batch pour modifier tous les documents
      const batch = writeBatch(db);

      docRefs.forEach((docRef, index) => {
        batch.update(docRef, {
          batchProcessed: true,
          updatedAt: serverTimestamp(),
          counter: index * 10,
          batchId: `batch-${Date.now()}`,
        });
      });

      // Exécute le batch
      await batch.commit();

      // Vérifie que tous les documents ont été modifiés
      const results = [];
      for (const docRef of docRefs) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          results.push({
            id: docRef.id,
            data: docSnap.data(),
          });
        }
      }

      // Vérifie que tous les documents ont batchProcessed = true
      const allProcessed = results.every(
        (result) => result.data.batchProcessed === true
      );

      return {
        success: allProcessed && results.length === docRefs.length,
        message: allProcessed
          ? "Batch exécuté avec succès sur tous les documents"
          : "Le batch n'a pas mis à jour tous les documents correctement",
        data: {
          collection: testCollectionName,
          documentsProcessed: results.length,
          allProcessed: allProcessed,
          results: results,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'exécution du batch: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test de transaction pour garantir l'atomicité
   * Modifie deux documents de manière atomique (tout ou rien)
   */
  static async testFirestoreTransaction(): Promise<any> {
    try {
      // Obtient l'instance du FirebaseManager
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Collection temporaire de test
      const testCollectionName = `test_transaction_${Date.now()}`;

      // Crée deux documents pour la transaction
      const docARef = doc(collection(db, testCollectionName));
      const docBRef = doc(collection(db, testCollectionName));

      // Données initiales
      await addDoc(collection(db, testCollectionName), {
        id: docARef.id,
        name: "Document A",
        balance: 100,
        transactionProcessed: false,
      });

      await addDoc(collection(db, testCollectionName), {
        id: docBRef.id,
        name: "Document B",
        balance: 50,
        transactionProcessed: false,
      });

      // Exécute une transaction qui transfère 30 unités de A vers B
      const transferAmount = 30;

      const transferResult = await runTransaction(db, async (transaction) => {
        // Lit les deux documents
        const docASnap = await transaction.get(docARef);
        const docBSnap = await transaction.get(docBRef);

        if (!docASnap.exists() || !docBSnap.exists()) {
          throw new Error("Les documents n'existent pas!");
        }

        // Récupère les soldes actuels
        const docAData = docASnap.data() || {};
        const docBData = docBSnap.data() || {};

        const balanceA = docAData.balance || 0;
        const balanceB = docBData.balance || 0;

        // Vérifie que le solde est suffisant
        if (balanceA < transferAmount) {
          throw new Error("Solde insuffisant pour le transfert");
        }

        // Effectue le transfert
        const newBalanceA = balanceA - transferAmount;
        const newBalanceB = balanceB + transferAmount;

        // Met à jour les documents
        transaction.update(docARef, {
          balance: newBalanceA,
          transactionProcessed: true,
          lastTransactionDate: serverTimestamp(),
        });

        transaction.update(docBRef, {
          balance: newBalanceB,
          transactionProcessed: true,
          lastTransactionDate: serverTimestamp(),
        });

        return {
          success: true,
          newBalanceA: newBalanceA,
          newBalanceB: newBalanceB,
          transferAmount: transferAmount,
        };
      });

      // Vérifie les résultats après la transaction
      const finalDocASnap = await getDoc(docARef);
      const finalDocBSnap = await getDoc(docBRef);

      const finalDocAData = finalDocASnap.data() || {};
      const finalDocBData = finalDocBSnap.data() || {};

      return {
        success:
          finalDocAData.transactionProcessed === true &&
          finalDocBData.transactionProcessed === true,
        message: "Transaction exécutée avec succès",
        data: {
          collection: testCollectionName,
          initialSetup: {
            docA: { id: docARef.id, initialBalance: 100 },
            docB: { id: docBRef.id, initialBalance: 50 },
          },
          transferAmount: transferAmount,
          result: transferResult,
          finalState: {
            docA: finalDocAData,
            docB: finalDocBData,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'exécution de la transaction: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }
}
