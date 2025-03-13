import { logger } from '@/core/logger';
import { firestoreService } from './firestore';
import { Timestamp, doc, DocumentData } from 'firebase/firestore';

const LOG_CATEGORY = 'FirestoreTest';

/**
 * Teste les opérations de transaction Firestore
 * Les transactions permettent d'effectuer plusieurs opérations de lecture/écriture
 * de manière atomique (tout réussit ou tout échoue)
 */
export async function testFirestoreTransaction(): Promise<boolean> {
  try {
    logger.info({
      category: LOG_CATEGORY,
      message: '🔄 Démarrage du test de transaction Firestore'
    });

    // Collection et documents pour le test
    const testCollection = 'transaction-tests';
    const docId1 = `test-doc-1-${Date.now()}`;
    const docId2 = `test-doc-2-${Date.now()}`;

    // Créer les documents initiaux
    await firestoreService.setDocument(testCollection, docId1, {
      value: 100,
      name: 'Document 1',
      createdAt: Timestamp.now()
    });

    await firestoreService.setDocument(testCollection, docId2, {
      value: 50,
      name: 'Document 2',
      createdAt: Timestamp.now()
    });

    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Documents de test créés avec succès',
      data: { docId1, docId2 }
    });

    // Exécuter une transaction qui transfère de la "valeur" du document 1 au document 2
    const transferAmount = 25;
    const result = await firestoreService.executeTransaction(async (transaction) => {
      // Obtenir les références des documents
      const db = await firestoreService.ensureInitialized();
      const doc1Ref = doc(db, testCollection, docId1);
      const doc2Ref = doc(db, testCollection, docId2);
      
      const doc1Snapshot = await transaction.get(doc1Ref);
      const doc2Snapshot = await transaction.get(doc2Ref);
      
      if (!doc1Snapshot.exists() || !doc2Snapshot.exists()) {
        throw new Error('Un des documents n\'existe pas');
      }
      
      const doc1Data = doc1Snapshot.data() as DocumentData & { value: number };
      const doc2Data = doc2Snapshot.data() as DocumentData & { value: number };
      
      // Vérifier que le document 1 a suffisamment de "valeur"
      if (doc1Data.value < transferAmount) {
        throw new Error('Valeur insuffisante dans le document source');
      }
      
      // Mettre à jour les deux documents dans la transaction
      transaction.update(doc1Ref, {
        value: doc1Data.value - transferAmount,
        updatedAt: Timestamp.now()
      });
      
      transaction.update(doc2Ref, {
        value: doc2Data.value + transferAmount,
        updatedAt: Timestamp.now()
      });
      
      return {
        success: true,
        previousValues: {
          doc1: doc1Data.value,
          doc2: doc2Data.value
        },
        newValues: {
          doc1: doc1Data.value - transferAmount,
          doc2: doc2Data.value + transferAmount
        }
      };
    });

    // Vérifier le résultat
    const doc1AfterTransaction = await firestoreService.getDocument(testCollection, docId1);
    const doc2AfterTransaction = await firestoreService.getDocument(testCollection, docId2);

    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Transaction Firestore exécutée avec succès',
      data: {
        result,
        doc1After: doc1AfterTransaction,
        doc2After: doc2AfterTransaction
      }
    });

    return true;
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Erreur lors du test de transaction Firestore',
      error: error instanceof Error ? error : new Error(String(error))
    });
    return false;
  }
}

/**
 * Teste les opérations par lots (batches) Firestore
 * Les batches permettent d'effectuer plusieurs opérations d'écriture
 * de manière atomique, mais sans lecture préalable (contrairement aux transactions)
 */
export async function testFirestoreBatch(): Promise<boolean> {
  try {
    logger.info({
      category: LOG_CATEGORY,
      message: '🔄 Démarrage du test de batch Firestore'
    });

    // Collection et documents pour le test
    const testCollection = 'batch-tests';
    const timestamp = Date.now();
    const docIds = Array.from({ length: 5 }, (_, i) => `batch-doc-${i + 1}-${timestamp}`);

    // Créer un batch pour ajouter 5 documents d'un coup
    const batch = await firestoreService.createBatch();
    
    docIds.forEach((docId, index) => {
      batch.set(testCollection, docId, {
        index: index + 1,
        name: `Document ${index + 1}`,
        createdInBatch: true,
        timestamp: Timestamp.now()
      });
    });
    
    await batch.commit();

    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Batch Firestore exécuté avec succès',
      data: { docIds }
    });

    // Vérifier que tous les documents ont été créés
    const verificationPromises = docIds.map(docId => 
      firestoreService.getDocument(testCollection, docId)
    );
    
    const results = await Promise.all(verificationPromises);
    
    const allDocsCreated = results.every(doc => doc !== null && doc.createdInBatch === true);
    
    logger.info({
      category: LOG_CATEGORY,
      message: allDocsCreated 
        ? '✅ Tous les documents du batch ont été créés avec succès' 
        : '❌ Certains documents du batch n\'ont pas été créés correctement',
      data: { results }
    });

    // Maintenant, créer un batch pour mettre à jour tous les documents
    const updateBatch = await firestoreService.createBatch();
    
    docIds.forEach(docId => {
      updateBatch.update(testCollection, docId, {
        updated: true,
        updateTimestamp: Timestamp.now()
      });
    });
    
    await updateBatch.commit();

    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Batch de mise à jour Firestore exécuté avec succès'
    });

    // Vérifier les mises à jour
    const updatedDocs = await Promise.all(
      docIds.map(docId => firestoreService.getDocument(testCollection, docId))
    );
    
    const allDocsUpdated = updatedDocs.every(doc => doc !== null && doc.updated === true);
    
    logger.info({
      category: LOG_CATEGORY,
      message: allDocsUpdated 
        ? '✅ Tous les documents ont été mis à jour avec succès' 
        : '❌ Certains documents n\'ont pas été mis à jour correctement',
      data: { updatedDocs }
    });

    return allDocsCreated && allDocsUpdated;
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Erreur lors du test de batch Firestore',
      error: error instanceof Error ? error : new Error(String(error))
    });
    return false;
  }
}

/**
 * Fonction principale qui exécute tous les tests Firestore
 */
export async function runAllFirestoreTests(): Promise<{
  transactionSuccess: boolean;
  batchSuccess: boolean;
}> {
  logger.info({
    category: LOG_CATEGORY,
    message: '🚀 Démarrage de tous les tests Firestore'
  });

  const transactionSuccess = await testFirestoreTransaction();
  const batchSuccess = await testFirestoreBatch();

  logger.info({
    category: LOG_CATEGORY,
    message: '📊 Résultats des tests Firestore',
    data: {
      transactionSuccess,
      batchSuccess
    }
  });

  return {
    transactionSuccess,
    batchSuccess
  };
}
