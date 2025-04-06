import { useState, useCallback } from "react";
import { useContract } from "../../../../hooks/useContract";
import type {
  MarketplaceItem,
  MarketplaceFilters,
  MarketplaceStats,
} from "../types";

export const useMarketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalItems: 0,
    totalVolume: "0",
    activeItems: 0,
    soldItems: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { contract } = useContract("marketplace");

  const loadItems = useCallback(
    async (filters?: MarketplaceFilters) => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);

        // TODO: Implémenter la logique de chargement des items
        const marketplaceItems = await contract.getItems(filters);
        setItems(marketplaceItems);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load marketplace items"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const loadStats = useCallback(async () => {
    if (!contract) return;

    try {
      // TODO: Implémenter la logique de chargement des statistiques
      const marketplaceStats = await contract.getStats();
      setStats(marketplaceStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load marketplace stats"
      );
    }
  }, [contract]);

  const createItem = useCallback(
    async (
      item: Omit<MarketplaceItem, "id" | "status" | "createdAt" | "updatedAt">
    ) => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);

        // TODO: Implémenter la logique de création d'item
        await contract.createItem(item);
        await loadItems();
        await loadStats();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create marketplace item"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, loadItems, loadStats]
  );

  return {
    items,
    stats,
    isLoading,
    error,
    loadItems,
    loadStats,
    createItem,
  };
};
