import { useState, useEffect } from "react";
import { cacheInstance } from "@/utils/cache";

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): { data: T | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = cacheInstance.get<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return;
        }

        // If not in cache, fetch new data
        const newData = await fetcher();

        // Store in cache
        cacheInstance.set(key, newData, ttl);

        setData(newData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [key, ttl]);

  return { data, isLoading, error };
}
