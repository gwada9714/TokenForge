import React, { useState, useEffect } from "react";
import {
  getDocumentOptimized,
  queryOptimized,
  invalidateDocumentCache,
  invalidateCollectionCache,
  clearCache,
} from "@/lib/firebase/firestore-optimized";
import { where, limit, orderBy, QueryConstraint } from "firebase/firestore";
import { logger } from "@/core/logger";
import { FirebaseError } from "@/utils/error-handler";

interface TestResult {
  operation: string;
  status: "success" | "error" | "pending";
  data?: any;
  error?: string;
  duration?: number;
  fromCache?: boolean;
}

const FirestoreOptimizedTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [collectionName, setCollectionName] = useState("tokens");
  const [docId, setDocId] = useState("");

  // Fonction pour ajouter un résultat
  const addResult = (result: TestResult) => {
    setResults((prev) => [result, ...prev]);
  };

  // Fonction pour effacer les résultats
  const clearResults = () => {
    setResults([]);
  };

  // Test de récupération d'un document avec mise en cache
  const testDocumentCache = async () => {
    if (!docId) {
      addResult({
        operation: "Test document cache",
        status: "error",
        error: "Veuillez spécifier un ID de document",
      });
      return;
    }

    setIsRunning(true);

    try {
      // Première requête (sans cache)
      addResult({
        operation: "Récupération document (1ère requête)",
        status: "pending",
      });

      const startTime1 = performance.now();
      const doc1 = await getDocumentOptimized(collectionName, docId);
      const duration1 = performance.now() - startTime1;

      addResult({
        operation: "Récupération document (1ère requête)",
        status: "success",
        data: doc1,
        duration: duration1,
        fromCache: false,
      });

      // Deuxième requête (devrait utiliser le cache)
      addResult({
        operation: "Récupération document (2ème requête - cache)",
        status: "pending",
      });

      const startTime2 = performance.now();
      const doc2 = await getDocumentOptimized(collectionName, docId);
      const duration2 = performance.now() - startTime2;

      addResult({
        operation: "Récupération document (2ème requête - cache)",
        status: "success",
        data: doc2,
        duration: duration2,
        fromCache: true,
      });

      // Invalider le cache
      invalidateDocumentCache(collectionName, docId);

      addResult({
        operation: "Invalidation du cache",
        status: "success",
      });

      // Troisième requête (après invalidation du cache)
      addResult({
        operation: "Récupération document (3ème requête - après invalidation)",
        status: "pending",
      });

      const startTime3 = performance.now();
      const doc3 = await getDocumentOptimized(collectionName, docId);
      const duration3 = performance.now() - startTime3;

      addResult({
        operation: "Récupération document (3ème requête - après invalidation)",
        status: "success",
        data: doc3,
        duration: duration3,
        fromCache: false,
      });
    } catch (error) {
      logger.error({
        category: "FirestoreOptimizedTest",
        message: "Erreur lors du test de cache de document",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      addResult({
        operation: "Test document cache",
        status: "error",
        error:
          error instanceof FirebaseError
            ? error.message
            : "Une erreur est survenue lors du test",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test de requête avec mise en cache
  const testQueryCache = async () => {
    setIsRunning(true);

    try {
      // Contraintes de requête
      const constraints: QueryConstraint[] = [
        where("type", "==", "token"),
        orderBy("createdAt", "desc"),
        limit(5),
      ];

      // Première requête (sans cache)
      addResult({
        operation: "Exécution requête (1ère requête)",
        status: "pending",
      });

      const startTime1 = performance.now();
      const results1 = await queryOptimized(collectionName, constraints);
      const duration1 = performance.now() - startTime1;

      addResult({
        operation: "Exécution requête (1ère requête)",
        status: "success",
        data: results1,
        duration: duration1,
        fromCache: false,
      });

      // Deuxième requête (devrait utiliser le cache)
      addResult({
        operation: "Exécution requête (2ème requête - cache)",
        status: "pending",
      });

      const startTime2 = performance.now();
      const results2 = await queryOptimized(collectionName, constraints);
      const duration2 = performance.now() - startTime2;

      addResult({
        operation: "Exécution requête (2ème requête - cache)",
        status: "success",
        data: results2,
        duration: duration2,
        fromCache: true,
      });

      // Invalider le cache de la collection
      invalidateCollectionCache(collectionName);

      addResult({
        operation: "Invalidation du cache de collection",
        status: "success",
      });

      // Troisième requête (après invalidation du cache)
      addResult({
        operation: "Exécution requête (3ème requête - après invalidation)",
        status: "pending",
      });

      const startTime3 = performance.now();
      const results3 = await queryOptimized(collectionName, constraints);
      const duration3 = performance.now() - startTime3;

      addResult({
        operation: "Exécution requête (3ème requête - après invalidation)",
        status: "success",
        data: results3,
        duration: duration3,
        fromCache: false,
      });
    } catch (error) {
      logger.error({
        category: "FirestoreOptimizedTest",
        message: "Erreur lors du test de cache de requête",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      addResult({
        operation: "Test query cache",
        status: "error",
        error:
          error instanceof FirebaseError
            ? error.message
            : "Une erreur est survenue lors du test",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test de gestion des erreurs
  const testErrorHandling = async () => {
    setIsRunning(true);

    try {
      // Test avec un document inexistant
      addResult({
        operation: "Test gestion erreurs - Document inexistant",
        status: "pending",
      });

      try {
        await getDocumentOptimized("collection_inexistante", "doc_inexistant");
      } catch (error) {
        addResult({
          operation: "Test gestion erreurs - Document inexistant",
          status: "success",
          error:
            error instanceof FirebaseError ? error.message : "Erreur inconnue",
          data: error instanceof FirebaseError ? error.toLog() : error,
        });
      }

      // Test avec une requête sur une collection inexistante
      addResult({
        operation: "Test gestion erreurs - Collection inexistante",
        status: "pending",
      });

      try {
        await queryOptimized("collection_inexistante", [
          where("field", "==", "value"),
        ]);
      } catch (error) {
        addResult({
          operation: "Test gestion erreurs - Collection inexistante",
          status: "success",
          error:
            error instanceof FirebaseError ? error.message : "Erreur inconnue",
          data: error instanceof FirebaseError ? error.toLog() : error,
        });
      }
    } catch (error) {
      logger.error({
        category: "FirestoreOptimizedTest",
        message: "Erreur lors du test de gestion des erreurs",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      addResult({
        operation: "Test gestion erreurs",
        status: "error",
        error: "Une erreur inattendue est survenue lors du test",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test de performance
  const testPerformance = async () => {
    setIsRunning(true);
    clearCache(); // Vider le cache avant le test

    try {
      const iterations = 5;
      const results: { withCache: number[]; withoutCache: number[] } = {
        withCache: [],
        withoutCache: [],
      };

      // Test sans cache
      addResult({
        operation: `Test performance - ${iterations} itérations sans cache`,
        status: "pending",
      });

      for (let i = 0; i < iterations; i++) {
        clearCache(); // Vider le cache à chaque itération

        const startTime = performance.now();
        await getDocumentOptimized(collectionName, docId, {
          cache: { enabled: false, ttl: 0 },
        });
        const duration = performance.now() - startTime;

        results.withoutCache.push(duration);
      }

      // Test avec cache
      addResult({
        operation: `Test performance - ${iterations} itérations avec cache`,
        status: "pending",
      });

      // Première requête pour remplir le cache
      await getDocumentOptimized(collectionName, docId, {
        cache: { enabled: true, ttl: 60000 },
      });

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await getDocumentOptimized(collectionName, docId, {
          cache: { enabled: true, ttl: 60000 },
        });
        const duration = performance.now() - startTime;

        results.withCache.push(duration);
      }

      // Calculer les moyennes
      const avgWithoutCache =
        results.withoutCache.reduce((a, b) => a + b, 0) / iterations;
      const avgWithCache =
        results.withCache.reduce((a, b) => a + b, 0) / iterations;
      const improvement =
        ((avgWithoutCache - avgWithCache) / avgWithoutCache) * 100;

      addResult({
        operation: "Test performance - Résultats",
        status: "success",
        data: {
          withoutCache: {
            times: results.withoutCache,
            average: avgWithoutCache,
          },
          withCache: {
            times: results.withCache,
            average: avgWithCache,
          },
          improvement: `${improvement.toFixed(2)}%`,
        },
      });
    } catch (error) {
      logger.error({
        category: "FirestoreOptimizedTest",
        message: "Erreur lors du test de performance",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      addResult({
        operation: "Test performance",
        status: "error",
        error:
          error instanceof FirebaseError
            ? error.message
            : "Une erreur est survenue lors du test",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Test du module Firestore optimisé
      </h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection
          </label>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isRunning}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Document
          </label>
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isRunning}
            placeholder="Requis pour les tests de document"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={testDocumentCache}
          disabled={isRunning}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Cache Document
        </button>

        <button
          onClick={testQueryCache}
          disabled={isRunning}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Test Cache Requête
        </button>

        <button
          onClick={testErrorHandling}
          disabled={isRunning}
          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
        >
          Test Gestion Erreurs
        </button>

        <button
          onClick={testPerformance}
          disabled={isRunning}
          className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          Test Performance
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Résultats</h3>
        <button
          onClick={clearResults}
          disabled={isRunning}
          className="p-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          Effacer
        </button>
      </div>

      {isRunning && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          Test en cours d'exécution...
        </div>
      )}

      <div className="overflow-auto max-h-96 border rounded">
        {results.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            Aucun résultat à afficher. Lancez un test pour voir les résultats.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opération
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée (ms)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.operation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.status === "success"
                          ? "bg-green-100 text-green-800"
                          : result.status === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {result.status === "success"
                        ? "Succès"
                        : result.status === "error"
                        ? "Erreur"
                        : "En cours"}
                    </span>
                    {result.fromCache && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Cache
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.duration ? result.duration.toFixed(2) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {result.error ? (
                      <span className="text-red-500">{result.error}</span>
                    ) : result.data ? (
                      <details>
                        <summary className="cursor-pointer text-blue-500">
                          Voir les données
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FirestoreOptimizedTest;
