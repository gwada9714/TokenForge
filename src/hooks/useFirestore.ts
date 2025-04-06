import { useState, useEffect, useCallback } from "react";
import {
  getDocumentOptimized,
  queryOptimized,
  invalidateDocumentCache,
  invalidateCollectionCache,
  unsubscribeAll,
} from "@/lib/firebase/firestore-optimized";
import { DocumentData, QueryConstraint } from "firebase/firestore";
import { logger } from "@/core/logger";

// Type pour l'état de chargement
type LoadingState = "idle" | "loading" | "success" | "error";

// Options pour les hooks Firestore
interface FirestoreHookOptions {
  realtime?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  retry?: {
    count: number;
    delay: number;
  };
}

// Résultat pour le hook de document
interface DocumentHookResult<T = DocumentData> {
  data: T | null;
  loading: LoadingState;
  error: Error | null;
  reload: () => Promise<void>;
  invalidateCache: () => void;
}

// Résultat pour le hook de requête
interface QueryHookResult<T = DocumentData> {
  data: T[];
  loading: LoadingState;
  error: Error | null;
  reload: () => Promise<void>;
  invalidateCache: () => void;
}

/**
 * Hook pour récupérer un document Firestore avec optimisation
 * @param collectionName Nom de la collection
 * @param docId ID du document (null pour désactiver la requête)
 * @param options Options de configuration
 */
export function useDocument<T = DocumentData>(
  collectionName: string,
  docId: string | null,
  options: FirestoreHookOptions = {}
): DocumentHookResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);

  // Configuration par défaut
  const {
    realtime = true,
    cacheEnabled = true,
    cacheTTL = 60000,
    retry = { count: 3, delay: 1000 },
  } = options;

  // Fonction pour charger les données
  const fetchData = useCallback(async () => {
    if (!docId) {
      setData(null);
      return;
    }

    setLoading("loading");
    setError(null);

    try {
      const result = await getDocumentOptimized(collectionName, docId, {
        cache: { enabled: cacheEnabled, ttl: cacheTTL },
        retry,
        realtime,
      });

      setData(result as T | null);
      setLoading("success");
    } catch (err) {
      logger.error({
        category: "useDocument",
        message: `Erreur lors de la récupération du document ${collectionName}/${docId}`,
        error: err instanceof Error ? err : new Error(String(err)),
      });

      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading("error");
    }
  }, [collectionName, docId, cacheEnabled, cacheTTL, realtime, retry]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    if (docId) {
      invalidateDocumentCache(collectionName, docId);
    }
  }, [collectionName, docId]);

  // Effet pour charger les données
  useEffect(() => {
    if (docId) {
      fetchData();
    } else {
      setData(null);
      setLoading("idle");
      setError(null);
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (realtime) {
        unsubscribeAll();
      }
    };
  }, [docId, fetchData, realtime]);

  return {
    data,
    loading,
    error,
    reload: fetchData,
    invalidateCache,
  };
}

/**
 * Hook pour exécuter une requête Firestore avec optimisation
 * @param collectionName Nom de la collection
 * @param constraints Contraintes de la requête
 * @param options Options de configuration
 */
export function useQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: FirestoreHookOptions = {}
): QueryHookResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);

  // Configuration par défaut
  const {
    realtime = true,
    cacheEnabled = true,
    cacheTTL = 30000,
    retry = { count: 3, delay: 1000 },
  } = options;

  // Clé unique pour la requête (pour éviter les re-rendus inutiles)
  const queryKey = JSON.stringify({
    collection: collectionName,
    constraints: constraints.map((c) => c.type),
  });

  // Fonction pour charger les données
  const fetchData = useCallback(async () => {
    setLoading("loading");
    setError(null);

    try {
      const results = await queryOptimized(collectionName, constraints, {
        cache: { enabled: cacheEnabled, ttl: cacheTTL },
        retry,
        realtime,
      });

      setData(results as T[]);
      setLoading("success");
    } catch (err) {
      logger.error({
        category: "useQuery",
        message: `Erreur lors de l'exécution de la requête sur ${collectionName}`,
        error: err instanceof Error ? err : new Error(String(err)),
      });

      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading("error");
    }
  }, [queryKey, cacheEnabled, cacheTTL, realtime, retry]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    invalidateCollectionCache(collectionName);
  }, [collectionName]);

  // Effet pour charger les données
  useEffect(() => {
    fetchData();

    // Nettoyage lors du démontage du composant
    return () => {
      if (realtime) {
        unsubscribeAll();
      }
    };
  }, [fetchData, realtime]);

  return {
    data,
    loading,
    error,
    reload: fetchData,
    invalidateCache,
  };
}

/**
 * Hook pour gérer une collection Firestore avec des opérations CRUD optimisées
 * @param collectionName Nom de la collection
 */
export function useCollection(collectionName: string) {
  const { firestoreService } = require("@/lib/firebase");

  // Fonction pour ajouter un document
  const addDocument = useCallback(
    async (data: Record<string, unknown>, docId?: string) => {
      let id = docId;
      try {
        if (docId) {
          await firestoreService.setDocument(collectionName, docId, data);
        } else {
          id = await firestoreService.addDocument(collectionName, data);
        }

        // Invalider le cache de la collection après modification
        invalidateCollectionCache(collectionName);

        return id;
      } catch (error) {
        logger.error({
          category: "useCollection",
          message: `Erreur lors de l'ajout d'un document dans ${collectionName}`,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    },
    [collectionName]
  );

  // Fonction pour mettre à jour un document
  const updateDocument = useCallback(
    async (docId: string, data: Record<string, unknown>) => {
      try {
        await firestoreService.updateDocument(collectionName, docId, data);

        // Invalider le cache du document après modification
        invalidateDocumentCache(collectionName, docId);

        return true;
      } catch (error) {
        logger.error({
          category: "useCollection",
          message: `Erreur lors de la mise à jour du document ${collectionName}/${docId}`,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    },
    [collectionName]
  );

  // Fonction pour supprimer un document
  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        await firestoreService.deleteDocument(collectionName, docId);

        // Invalider le cache du document après suppression
        invalidateDocumentCache(collectionName, docId);

        return true;
      } catch (error) {
        logger.error({
          category: "useCollection",
          message: `Erreur lors de la suppression du document ${collectionName}/${docId}`,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    },
    [collectionName]
  );

  return {
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
