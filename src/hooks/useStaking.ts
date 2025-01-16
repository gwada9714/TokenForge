import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useContractEvent, useWaitForTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import type { Hash } from 'viem';

// Temporary ABI until we generate it
const TKNTokenABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakeInfo(address account) external view returns (uint256 stakedAmount, uint256 pendingRewards)",
  "function getStakingStats() external view returns (uint256 totalStaked, uint256 apy, uint256 stakersCount)",
  "function totalStaked() external view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
  "event RewardsUpdated(address indexed user, uint256 newRewards)",
] as const;

interface StakeInfo {
  stakedAmount: bigint;
  pendingRewards: bigint;
}

interface StakingStats {
  totalStaked: bigint;
  apy: number;
  stakersCount: number;
}

interface StakingEvent {
  timestamp: number;
  action: 'stake' | 'unstake' | 'claim';
  amount: bigint;
}

interface RewardHistory {
  timestamp: number;
  rewards: bigint;
}

export const STAKING_CONFIG = {
  LOCK_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  MIN_STAKE_AMOUNT: '100', // 100 tokens
  MAX_STAKE_AMOUNT: '1000000' // 1M tokens
} as const;

export interface StakingInfo {
  balance: bigint | undefined;
  stakedAmount: bigint;
  pendingRewards: bigint;
  stakingStats: StakingStats;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  stake: (amount: string) => Promise<void>;
  withdraw: (amount: string) => Promise<void>;
  claimRewards: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  canUnstake: boolean;
  timeUntilUnstake: number;
  stakingHistory: StakingEvent[];
  rewardsHistory: RewardHistory[];
}

export const useStaking = (tokenAddress: `0x${string}`): StakingInfo => {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakingHistory, setStakingHistory] = useState<StakingEvent[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [lastStakeTime, setLastStakeTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    token: tokenAddress,
    enabled: !!address,
    onError: (error) => {
      console.error('Error loading balance:', error);
      setError('Failed to load token balance');
    }
  });

  const { data: stakeInfo, isLoading: isStakeInfoLoading, error: stakeInfoError, refetch: refetchStakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    enabled: !!address,
    onError: (error) => {
      console.error('Error loading stake info:', error);
      setError('Failed to load staking information');
    }
  });

  const { data: stakingStats, isLoading: isStatsLoading, error: statsError, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
    enabled: !!tokenAddress,
    onError: (error) => {
      console.error('Error loading staking stats:', error);
      setError('Failed to load staking statistics');
    }
  });

  const stakeTokens = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const unstakeTokens = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const claimTokens = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: txHash,
    onSuccess: async () => {
      await refetchStakeInfo();
      await refetchStats();
      setStakeAmount('');
      setWithdrawAmount('');
      setTxHash(undefined);
    },
  });

  const stake = async (amount: string) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!stakeTokens.writeAsync) throw new Error('Contract write not ready');
      
      const tx = await stakeTokens.writeAsync({
        args: [parseEther(amount)]
      });
      
      setTxHash(tx.hash);
    } catch (err: any) {
      console.error('Erreur lors du stake:', err);
      setError(err.message || 'Une erreur est survenue lors du stake');
    }
  };

  const withdraw = async (amount: string) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!unstakeTokens.writeAsync) throw new Error('Contract write not ready');
      
      const tx = await unstakeTokens.writeAsync({
        args: [parseEther(amount)]
      });
      
      setTxHash(tx.hash);
    } catch (err: any) {
      console.error('Erreur lors du unstake:', err);
      setError(err.message || 'Une erreur est survenue lors du unstake');
    }
  };

  const claimRewards = async () => {
    try {
      if (!claimTokens.writeAsync) throw new Error('Contract write not ready');
      
      const tx = await claimTokens.writeAsync();
      
      setTxHash(tx.hash);
    } catch (err: any) {
      console.error('Erreur lors de la réclamation des récompenses:', err);
      setError(err.message || 'Une erreur est survenue lors de la réclamation des récompenses');
    }
  };

  useEffect(() => {
    if (stakeInfoError || statsError) {
      setError(stakeInfoError?.message || statsError?.message || 'Une erreur est survenue lors du chargement des données');
    } else {
      setError(null);
    }
  }, [stakeInfoError, statsError]);

  const isLoading = isBalanceLoading || isStakeInfoLoading || isStatsLoading || isConfirming;

  // Event listeners
  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Staked',
    listener(logs) {
      const log = Array.isArray(logs) ? logs[0] : logs;
      const args = (log as unknown as { args: { user: string; amount: bigint } }).args;
      const blockTimestamp = (log as unknown as { blockTimestamp?: bigint }).blockTimestamp ?? BigInt(Date.now() / 1000);
      
      if (args.user === address) {
        setStakingHistory(prev => [
          {
            timestamp: Number(blockTimestamp),
            action: 'stake',
            amount: args.amount,
          },
          ...prev,
        ]);
        setLastStakeTime(Number(blockTimestamp));
        refetchStakeInfo();
        refetchStats();
      }
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Unstaked',
    listener(logs) {
      const log = Array.isArray(logs) ? logs[0] : logs;
      const args = (log as unknown as { args: { user: string; amount: bigint } }).args;
      const blockTimestamp = (log as unknown as { blockTimestamp?: bigint }).blockTimestamp ?? BigInt(Date.now() / 1000);
      
      if (args.user === address) {
        setStakingHistory(prev => [
          {
            timestamp: Number(blockTimestamp),
            action: 'unstake',
            amount: args.amount,
          },
          ...prev,
        ]);
        refetchStakeInfo();
        refetchStats();
      }
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsClaimed',
    listener(logs) {
      const log = Array.isArray(logs) ? logs[0] : logs;
      const args = (log as unknown as { args: { user: string; amount: bigint } }).args;
      const blockTimestamp = (log as unknown as { blockTimestamp?: bigint }).blockTimestamp ?? BigInt(Date.now() / 1000);
      
      if (args.user === address) {
        setStakingHistory(prev => [
          {
            timestamp: Number(blockTimestamp),
            action: 'claim',
            amount: args.amount,
          },
          ...prev,
        ]);
        refetchStakeInfo();
      }
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsUpdated',
    listener(logs) {
      const log = Array.isArray(logs) ? logs[0] : logs;
      const args = (log as unknown as { args: { user: string; newRewards: bigint } }).args;
      const blockTimestamp = (log as unknown as { blockTimestamp?: bigint }).blockTimestamp ?? BigInt(Date.now() / 1000);
      
      if (args.user === address) {
        setRewardsHistory(prev => [
          {
            timestamp: Number(blockTimestamp),
            rewards: args.newRewards,
          },
          ...prev,
        ]);
      }
    },
  });

  return {
    balance: balance?.value,
    stakedAmount: (stakeInfo as StakeInfo)?.stakedAmount || BigInt(0),
    pendingRewards: (stakeInfo as StakeInfo)?.pendingRewards || BigInt(0),
    stakingStats: stakingStats as StakingStats || {
      totalStaked: BigInt(0),
      apy: 0,
      stakersCount: 0
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake,
    withdraw,
    claimRewards,
    isLoading,
    error,
    canUnstake: Date.now() / 1000 - lastStakeTime > STAKING_CONFIG.LOCK_PERIOD,
    timeUntilUnstake: Math.max(0, STAKING_CONFIG.LOCK_PERIOD - (Date.now() / 1000 - lastStakeTime)),
    stakingHistory,
    rewardsHistory,
  };
};
