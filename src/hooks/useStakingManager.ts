import { useState, useEffect, useCallback } from "react";
import { useWeb3Provider } from "./useWeb3Provider";
import { Contract, EventLog } from "ethers";
import { formatValue, parseValue } from "@/utils/web3Adapters";
import { STAKING_ABI } from "@/constants/abis";
import { STAKING_CONTRACT_ADDRESS } from "@/constants/addresses";
import { useAccount } from "wagmi";

interface StakingState {
  stakedAmount: bigint;
  rewards: bigint;
  apr: number;
  totalStaked: bigint;
  stakingHistory: Array<{
    timestamp: number;
    action: "stake" | "unstake" | "claim";
    amount: bigint;
  }>;
  isLoading: boolean;
  error: Error | null;
  networkInfo: {
    chainId: number;
    name: string;
  } | null;
}

export const useStakingManager = () => {
  const { provider, signer } = useWeb3Provider();
  const { address } = useAccount();
  const [contract, setContract] = useState<Contract | null>(null);
  const [state, setState] = useState<StakingState>({
    stakedAmount: 0n,
    rewards: 0n,
    apr: 0,
    totalStaked: 0n,
    stakingHistory: [],
    isLoading: false,
    error: null,
    networkInfo: null,
  });

  // Enhanced APR calculation
  const calculateAPR = useCallback(
    async (totalStaked: bigint): Promise<number> => {
      if (!contract) return 0;

      try {
        const rewardRate = await contract.rewardRate();
        const annualRewards = rewardRate * BigInt(365 * 24 * 60 * 60);
        return Number(formatValue((annualRewards * 100n) / totalStaked));
      } catch (error) {
        console.error("Error calculating APR:", error);
        return 0;
      }
    },
    [contract]
  );

  const getNetworkInfo = useCallback(async () => {
    if (!provider) return null;
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  }, [provider]);

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      if (!provider || !signer || !address) {
        setContract(null);
        return;
      }

      try {
        const networkInfo = await getNetworkInfo();
        setState((prev) => ({ ...prev, networkInfo }));

        const newContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_ABI,
          signer
        );
        setContract(newContract);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setContract(null);
      }
    };

    initializeContract();
  }, [provider, signer, address, getNetworkInfo]);

  // Enhanced staking history loading
  const loadStakingHistory = useCallback(async () => {
    if (!contract || !address) return [];

    try {
      const filter = contract.filters.StakingAction(address);
      const events = await contract.queryFilter(filter);
      return events.map((event) => {
        const log = event as EventLog;
        return {
          timestamp: Number(log.args[3]),
          action: log.args[1] as "stake" | "unstake" | "claim",
          amount: log.args[2] as bigint,
        };
      });
    } catch (error) {
      console.error("Error loading staking history:", error);
      return [];
    }
  }, [contract, address]);

  // Load staking data
  const loadData = useCallback(async () => {
    if (!contract || !address || !state.networkInfo) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [stakedAmount, rewards, totalStaked] = await Promise.all([
        contract.stakedAmount(address),
        contract.pendingRewards(address),
        contract.totalStaked(),
      ]);

      const history = await loadStakingHistory();
      const apr = await calculateAPR(totalStaked);

      setState((prev) => ({
        ...prev,
        stakedAmount,
        rewards,
        totalStaked,
        stakingHistory: history,
        apr,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error loading staking data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to load staking data"),
      }));
    }
  }, [contract, address, state.networkInfo, loadStakingHistory, calculateAPR]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Enhanced staking actions
  const stake = async (amount: string) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const parsedAmount = parseValue(amount);
      const tx = await contract.stake(parsedAmount);
      await tx.wait();
      await loadData();
    } catch (error) {
      console.error("Stake transaction failed:", error);
      throw error;
    }
  };

  const unstake = async (amount: string) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const parsedAmount = parseValue(amount);
      const tx = await contract.unstake(parsedAmount);
      await tx.wait();
      await loadData();
    } catch (error) {
      console.error("Unstake transaction failed:", error);
      throw error;
    }
  };

  const claimRewards = async () => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const tx = await contract.claimRewards();
      await tx.wait();
      await loadData();
    } catch (error) {
      console.error("Claim rewards transaction failed:", error);
      throw error;
    }
  };

  return {
    ...state,
    stake,
    unstake,
    claimRewards,
    refreshStakingData: loadData,
  };
};
