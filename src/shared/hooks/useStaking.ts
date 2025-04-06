import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@core/web3/Web3Context";

// Define the staking pool type
export interface StakingPool {
  id: string;
  name: string;
  token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  rewardToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  totalStaked: string;
  apr: number;
  lockDuration: number; // in days
  userStaked?: string;
  userRewards?: string;
  userUnlockTime?: number;
}

// Define the staking transaction type
export interface StakingTransaction {
  id: string;
  type: "stake" | "unstake" | "claim";
  amount: string;
  timestamp: number;
  hash: string;
  poolId: string;
}

// Define the hook return type
interface UseStakingReturn {
  pools: StakingPool[];
  transactions: StakingTransaction[];
  isLoading: boolean;
  error: string | null;
  stake: (poolId: string, amount: string) => Promise<boolean>;
  unstake: (poolId: string, amount: string) => Promise<boolean>;
  claimRewards: (poolId: string) => Promise<boolean>;
  refreshPools: () => Promise<void>;
}

/**
 * Hook for interacting with staking pools
 * @returns Functions and state for staking
 */
export const useStaking = (): UseStakingReturn => {
  const { isConnected, account } = useWeb3();
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [transactions, setTransactions] = useState<StakingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch staking pools
  const fetchPools = useCallback(async (): Promise<void> => {
    if (!isConnected || !account) {
      setPools([]);
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would fetch staking pools from the blockchain
      // For now, we'll simulate some staking pools
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockPools: StakingPool[] = [
        {
          id: "1",
          name: "TKN Staking Pool",
          token: {
            address: "0x" + "1".repeat(40),
            symbol: "TKN",
            decimals: 18,
          },
          rewardToken: {
            address: "0x" + "1".repeat(40),
            symbol: "TKN",
            decimals: 18,
          },
          totalStaked: "1000000",
          apr: 12.5,
          lockDuration: 30,
          userStaked: "100",
          userRewards: "5.2",
          userUnlockTime: Date.now() / 1000 + 86400 * 15, // 15 days from now
        },
        {
          id: "2",
          name: "LP Staking Pool",
          token: {
            address: "0x" + "2".repeat(40),
            symbol: "LP",
            decimals: 18,
          },
          rewardToken: {
            address: "0x" + "1".repeat(40),
            symbol: "TKN",
            decimals: 18,
          },
          totalStaked: "500000",
          apr: 25,
          lockDuration: 90,
          userStaked: "50",
          userRewards: "3.8",
          userUnlockTime: Date.now() / 1000 + 86400 * 45, // 45 days from now
        },
      ];

      const mockTransactions: StakingTransaction[] = [
        {
          id: "1",
          type: "stake",
          amount: "100",
          timestamp: Date.now() / 1000 - 86400 * 15, // 15 days ago
          hash: "0x" + "1".repeat(64),
          poolId: "1",
        },
        {
          id: "2",
          type: "stake",
          amount: "50",
          timestamp: Date.now() / 1000 - 86400 * 45, // 45 days ago
          hash: "0x" + "2".repeat(64),
          poolId: "2",
        },
        {
          id: "3",
          type: "claim",
          amount: "2.5",
          timestamp: Date.now() / 1000 - 86400 * 7, // 7 days ago
          hash: "0x" + "3".repeat(64),
          poolId: "1",
        },
      ];

      setPools(mockPools);
      setTransactions(mockTransactions);
    } catch (err) {
      console.error("Error fetching staking pools:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Fetch pools on mount and when account changes
  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  // Stake tokens
  const stake = useCallback(
    async (poolId: string, amount: string): Promise<boolean> => {
      if (!isConnected || !account) {
        setError("Wallet not connected");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would stake tokens in the pool
        // For now, we'll simulate a successful stake
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the pool with the new stake
        setPools((prevPools) =>
          prevPools.map((pool) => {
            if (pool.id === poolId) {
              const userStaked = pool.userStaked
                ? (parseFloat(pool.userStaked) + parseFloat(amount)).toString()
                : amount;
              return {
                ...pool,
                totalStaked: (
                  parseFloat(pool.totalStaked) + parseFloat(amount)
                ).toString(),
                userStaked,
              };
            }
            return pool;
          })
        );

        // Add a new transaction
        const newTransaction: StakingTransaction = {
          id: Date.now().toString(),
          type: "stake",
          amount,
          timestamp: Date.now() / 1000,
          hash: "0x" + Math.random().toString(16).substring(2) + "0".repeat(40),
          poolId,
        };
        setTransactions((prev) => [newTransaction, ...prev]);

        return true;
      } catch (err) {
        console.error("Error staking tokens:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account]
  );

  // Unstake tokens
  const unstake = useCallback(
    async (poolId: string, amount: string): Promise<boolean> => {
      if (!isConnected || !account) {
        setError("Wallet not connected");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would unstake tokens from the pool
        // For now, we'll simulate a successful unstake
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the pool with the new unstake
        setPools((prevPools) =>
          prevPools.map((pool) => {
            if (pool.id === poolId) {
              const userStaked = pool.userStaked
                ? Math.max(
                    0,
                    parseFloat(pool.userStaked) - parseFloat(amount)
                  ).toString()
                : "0";
              return {
                ...pool,
                totalStaked: Math.max(
                  0,
                  parseFloat(pool.totalStaked) - parseFloat(amount)
                ).toString(),
                userStaked,
              };
            }
            return pool;
          })
        );

        // Add a new transaction
        const newTransaction: StakingTransaction = {
          id: Date.now().toString(),
          type: "unstake",
          amount,
          timestamp: Date.now() / 1000,
          hash: "0x" + Math.random().toString(16).substring(2) + "0".repeat(40),
          poolId,
        };
        setTransactions((prev) => [newTransaction, ...prev]);

        return true;
      } catch (err) {
        console.error("Error unstaking tokens:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account]
  );

  // Claim rewards
  const claimRewards = useCallback(
    async (poolId: string): Promise<boolean> => {
      if (!isConnected || !account) {
        setError("Wallet not connected");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would claim rewards from the pool
        // For now, we'll simulate a successful claim
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the pool and rewards
        const pool = pools.find((p) => p.id === poolId);
        if (!pool || !pool.userRewards) {
          setError("Pool not found or no rewards available");
          return false;
        }

        // Update the pool with the claimed rewards
        setPools((prevPools) =>
          prevPools.map((p) => {
            if (p.id === poolId) {
              return {
                ...p,
                userRewards: "0",
              };
            }
            return p;
          })
        );

        // Add a new transaction
        const newTransaction: StakingTransaction = {
          id: Date.now().toString(),
          type: "claim",
          amount: pool.userRewards,
          timestamp: Date.now() / 1000,
          hash: "0x" + Math.random().toString(16).substring(2) + "0".repeat(40),
          poolId,
        };
        setTransactions((prev) => [newTransaction, ...prev]);

        return true;
      } catch (err) {
        console.error("Error claiming rewards:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, account, pools]
  );

  // Refresh pools
  const refreshPools = useCallback(async (): Promise<void> => {
    await fetchPools();
  }, [fetchPools]);

  return {
    pools,
    transactions,
    isLoading,
    error,
    stake,
    unstake,
    claimRewards,
    refreshPools,
  };
};
