import {
  DocumentData,
  QueryConstraint,
  onSnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import { firestoreService } from "./firestore";
import { logger } from "@/core/logger";
import { handleFirebaseError } from "@/utils/error-handler";

// Type pour les options de mise en cache
interface CacheOptions {
  enabled: boolean;
  ttl: number; // Durée de vie en millisecondes
}

// Type pour les options de requête optimisée
interface OptimizedQueryOptions {
  cache?: CacheOptions;
  retry?: {
    count: number;
    delay: number; // Délai entre les tentatives en millisecondes
  };
  realtime?: boolean;
}

// Type pour les résultats mis en cache
interface CachedResult<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Cache en mémoire pour les documents et requêtes
const documentCache = new Map<string, CachedResult<DocumentData | null>>();
const queryCache = new Map<string, CachedResult<DocumentData[]>>();

// Gestionnaire d'abonnements en temps réel
const realtimeSubscriptions = new Map<string, () => void>();

/**
 * Génère une clé de cache unique pour un document
 */
const generateDocumentCacheKey = (
  collectionName: string,
  docId: string
): string => {
  return `${collectionName}/${docId}`;
};

/**
 * Génère une clé de cache unique pour une requête
 */
const generateQueryCacheKey = (
  collectionName: string,
  constraints: QueryConstraint[]
): string => {
  const constraintsStr = constraints.map((c) => c.type).join("-");
  return `${collectionName}/${constraintsStr}/${Date.now()}`;
};

/**
 * Vérifie si un résultat en cache est toujours valide
 */
const isCacheValid = <T>(
  cachedResult: CachedResult<T> | undefined
): boolean => {
  if (!cachedResult) return false;
  return Date.now() < cachedResult.expiry;
};

/**
 * Récupère un document avec des options d'optimisation
 */
export async function getDocumentOptimized(
  collectionName: string,
  docId: string,
  options: OptimizedQueryOptions = { cache: { enabled: true, ttl: 60000 } }
): Promise<DocumentData | null> {
  const cacheKey = generateDocumentCacheKey(collectionName, docId);

  // Vérifier le cache si activé
  if (options.cache?.enabled) {
    const cachedDoc = documentCache.get(cacheKey);
    if (cachedDoc && isCacheValid(cachedDoc)) {
      logger.debug({
        category: "FirestoreOptimized",
        message: "Document récupéré depuis le cache",
        data: { collectionName, docId },
      });
      return cachedDoc.data;
    }
  }

  // Fonction pour récupérer le document
  const fetchDocument = async (attempt = 1): Promise<DocumentData | null> => {
    try {
      const doc = await firestoreService.getDocument(collectionName, docId);

      // Mettre en cache si activé
      if (options.cache?.enabled) {
        documentCache.set(cacheKey, {
          data: doc,
          timestamp: Date.now(),
          expiry: Date.now() + (options.cache.ttl || 60000),
        });
      }

      return doc;
    } catch (error) {
      // Gérer les erreurs et les tentatives de récupération
      const { retry } = options;
      if (retry && attempt < retry.count) {
        logger.warn({
          category: "FirestoreOptimized",
          message: `Tentative ${attempt}/${retry.count} échouée, nouvelle tentative dans ${retry.delay}ms`,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        // Attendre avant de réessayer
        await new Promise((resolve) => setTimeout(resolve, retry.delay));
        return fetchDocument(attempt + 1);
      }

      // Gérer l'erreur finale
      handleFirebaseError(error);

      throw error;
    }
  };

  // Si l'option temps réel est activée, configurer un écouteur
  if (options.realtime) {
    // Annuler l'abonnement existant s'il y en a un
    if (realtimeSubscriptions.has(cacheKey)) {
      const unsubscribe = realtimeSubscriptions.get(cacheKey);
      if (unsubscribe) {
        unsubscribe();
      }
    }

    // Configurer un nouvel abonnement
    const docRef = await firestoreService.getDocumentRef(collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        const data = snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data() }
          : null;

        // Mettre à jour le cache
        if (options.cache?.enabled) {
          documentCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + (options.cache.ttl || 60000),
          });
        }

        logger.debug({
          category: "FirestoreOptimized",
          message: "Document mis à jour en temps réel",
          data: { collectionName, docId },
        });
      },
      (error: Error) => {
        logger.error({
          category: "FirestoreOptimized",
          message: "Erreur lors de l'écoute en temps réel",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    );

    // Stocker la fonction d'annulation
    realtimeSubscriptions.set(cacheKey, unsubscribe);
  }

  // Récupérer le document
  return fetchDocument();
}

/**
 * Exécute une requête optimisée avec mise en cache et gestion des erreurs
 */
export async function queryOptimized(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: OptimizedQueryOptions = { cache: { enabled: true, ttl: 30000 } }
): Promise<DocumentData[]> {
  const cacheKey = generateQueryCacheKey(collectionName, constraints);

  // Vérifier le cache si activé
  if (options.cache?.enabled) {
    const cachedQuery = queryCache.get(cacheKey);
    if (cachedQuery && isCacheValid(cachedQuery)) {
      logger.debug({
        category: "FirestoreOptimized",
        message: "Résultats de requête récupérés depuis le cache",
        data: { collectionName, constraintsCount: constraints.length },
      });
      return cachedQuery.data;
    }
  }

  // Fonction pour exécuter la requête
  const executeQuery = async (attempt = 1): Promise<DocumentData[]> => {
    try {
      const { results } = await firestoreService.advancedQuery(
        collectionName,
        constraints
      );

      // Mettre en cache si activé
      if (options.cache?.enabled) {
        queryCache.set(cacheKey, {
          data: results,
          timestamp: Date.now(),
          expiry: Date.now() + (options.cache.ttl || 30000),
        });
      }

      return results;
    } catch (error) {
      // Gérer les erreurs et les tentatives de récupération
      const { retry } = options;
      if (retry && attempt < retry.count) {
        logger.warn({
          category: "FirestoreOptimized",
          message: `Tentative ${attempt}/${retry.count} échouée, nouvelle tentative dans ${retry.delay}ms`,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        // Attendre avant de réessayer
        await new Promise((resolve) => setTimeout(resolve, retry.delay));
        return executeQuery(attempt + 1);
      }

      // Gérer l'erreur finale
      handleFirebaseError(error);

      throw error;
    }
  };

  // Si l'option temps réel est activée, configurer un écouteur
  if (options.realtime) {
    // Annuler l'abonnement existant s'il y en a un
    if (realtimeSubscriptions.has(cacheKey)) {
      const unsubscribe = realtimeSubscriptions.get(cacheKey);
      if (unsubscribe) {
        unsubscribe();
      }
    }

    // Configurer un nouvel abonnement
    const queryObj = await firestoreService.createQuery(
      collectionName,
      constraints
    );

    const unsubscribe = onSnapshot(
      queryObj,
      (snapshot: any) => {
        const results = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mettre à jour le cache
        if (options.cache?.enabled) {
          queryCache.set(cacheKey, {
            data: results,
            timestamp: Date.now(),
            expiry: Date.now() + (options.cache.ttl || 30000),
          });
        }

        logger.debug({
          category: "FirestoreOptimized",
          message: "Résultats de requête mis à jour en temps réel",
          data: { collectionName, resultsCount: results.length },
        });
      },
      (error: Error) => {
        logger.error({
          category: "FirestoreOptimized",
          message: "Erreur lors de l'écoute en temps réel de la requête",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    );

    // Stocker la fonction d'annulation
    realtimeSubscriptions.set(cacheKey, unsubscribe);
  }

  // Exécuter la requête
  return executeQuery();
}

/**
 * Invalide le cache pour un document spécifique
 */
export function invalidateDocumentCache(
  collectionName: string,
  docId: string
): void {
  const cacheKey = generateDocumentCacheKey(collectionName, docId);
  documentCache.delete(cacheKey);

  logger.debug({
    category: "FirestoreOptimized",
    message: "Cache de document invalidé",
    data: { collectionName, docId },
  });
}

/**
 * Invalide le cache pour une collection entière
 */
export function invalidateCollectionCache(collectionName: string): void {
  // Supprimer tous les documents de la collection du cache
  for (const key of documentCache.keys()) {
    if (key.startsWith(`${collectionName}/`)) {
      documentCache.delete(key);
    }
  }

  // Supprimer toutes les requêtes sur la collection du cache
  for (const key of queryCache.keys()) {
    if (key.startsWith(`${collectionName}/`)) {
      queryCache.delete(key);
    }
  }

  logger.debug({
    category: "FirestoreOptimized",
    message: "Cache de collection invalidé",
    data: { collectionName },
  });
}

/**
 * Annule tous les abonnements en temps réel
 */
export function unsubscribeAll(): void {
  for (const unsubscribe of realtimeSubscriptions.values()) {
    unsubscribe();
  }

  realtimeSubscriptions.clear();

  logger.debug({
    category: "FirestoreOptimized",
    message: "Tous les abonnements en temps réel ont été annulés",
  });
}

/**
 * Nettoie le cache (utile pour les tests ou lors de la déconnexion)
 */
export function clearCache(): void {
  documentCache.clear();
  queryCache.clear();

  logger.debug({
    category: "FirestoreOptimized",
    message: "Cache entièrement vidé",
  });
}
