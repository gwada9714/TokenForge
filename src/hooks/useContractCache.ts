import { useEffect, useRef } from "react";
import { Address } from "viem";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

const DEFAULT_TTL = 30000; // 30 secondes par défaut

/**
 * Hook personnalisé pour mettre en cache les résultats des appels de contrat
 * @param key - Clé unique pour identifier les données en cache
 * @param fetcher - Fonction pour récupérer les données
 * @param config - Configuration du cache
 * @returns Les données en cache ou le résultat de fetcher
 */
export function useContractCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = { ttl: DEFAULT_TTL }
): { data: T | null; isLoading: boolean; error: Error | null } {
  const cache = useRef<Record<string, CacheEntry<T>>>({});
  const { ttl } = config;

  // Vérifie si les données en cache sont valides
  const isCacheValid = (entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < ttl;
  };

  // État local pour le chargement et les erreurs
  const loadingRef = useRef<boolean>(false);
  const errorRef = useRef<Error | null>(null);
  const dataRef = useRef<T | null>(null);

  // Fonction pour mettre à jour le cache
  const updateCache = (newData: T) => {
    cache.current[key] = {
      value: newData,
      timestamp: Date.now(),
    };
    dataRef.current = newData;
    loadingRef.current = false;
    errorRef.current = null;
  };

  // Effet pour gérer le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      // Si les données sont en cache et valides, on les utilise
      const cachedData = cache.current[key];
      if (cachedData && isCacheValid(cachedData)) {
        dataRef.current = cachedData.value;
        return;
      }

      // Sinon, on charge les nouvelles données
      loadingRef.current = true;
      try {
        const newData = await fetcher();
        updateCache(newData);
      } catch (err) {
        errorRef.current =
          err instanceof Error ? err : new Error("Unknown error");
        loadingRef.current = false;
      }
    };

    fetchData();

    // Nettoyage du cache à la fin
    return () => {
      delete cache.current[key];
    };
  }, [key, ttl, fetcher]);

  return {
    data: dataRef.current,
    isLoading: loadingRef.current,
    error: errorRef.current,
  };
}
