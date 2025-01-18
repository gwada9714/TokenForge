import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useContractEvent, useWaitForTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

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

export function useStaking(tokenAddress: `0x${string}`): StakingInfo {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakingHistory, setStakingHistory] = useState<StakingEvent[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const [lastStakeTime, setLastStakeTime] = useState<number>(0);
  const [timeUntilUnstake, setTimeUntilUnstake] = useState<number>(0);

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
  });

  const { data: stakeInfo, refetch: refetchStakeInfo } = useContractRead({
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

  const { data: stakingStats, refetch: refetchStats } = useContractRead({
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

  const { isLoading: isConfirming } = useWaitForTransaction({
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
      setLastStakeTime(Date.now());
    } catch (error) {
      console.error('Error staking:', error);
      if (error instanceof Error) {
        setError(`Failed to stake: ${error.message}`);
      } else {
        setError('Failed to stake: Unknown error');
      }
      throw error;
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
    } catch (error) {
      console.error('Error unstaking:', error);
      if (error instanceof Error) {
        setError(`Failed to unstake: ${error.message}`);
      } else {
        setError('Failed to unstake: Unknown error');
      }
      throw error;
    }
  };

  const claimRewards = async () => {
    try {
      if (!claimTokens.writeAsync) throw new Error('Contract write not ready');

      const tx = await claimTokens.writeAsync();
      setTxHash(tx.hash);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      if (error instanceof Error) {
        setError(`Failed to claim rewards: ${error.message}`);
      } else {
        setError('Failed to claim rewards: Unknown error');
      }
      throw error;
    }
  };

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Staked',
    listener(log) {
      setStakingHistory(prev => [...prev, {
        timestamp: Date.now(),
        action: 'stake',
        amount: log[0].args.amount as bigint
      }]);
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Unstaked',
    listener(log) {
      setStakingHistory(prev => [...prev, {
        timestamp: Date.now(),
        action: 'unstake',
        amount: log[0].args.amount as bigint
      }]);
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsClaimed',
    listener(log) {
      setStakingHistory(prev => [...prev, {
        timestamp: Date.now(),
        action: 'claim',
        amount: log[0].args.amount as bigint
      }]);
    },
  });

  useContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsUpdated',
    listener(log) {
      setRewardsHistory(prev => [...prev, {
        timestamp: Date.now(),
        rewards: log[0].args.newRewards as bigint
      }]);
    },
  });

  // Update time until unstake
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastStakeTime > 0) {
        const timeElapsed = Date.now() - lastStakeTime;
        const remaining = Math.max(0, STAKING_CONFIG.LOCK_PERIOD * 1000 - timeElapsed);
        setTimeUntilUnstake(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastStakeTime]);

  const canUnstake = timeUntilUnstake === 0;

  return {
    balance: balance?.value,
    stakedAmount: (stakeInfo as any)?.[0] ?? 0n,
    pendingRewards: (stakeInfo as any)?.[1] ?? 0n,
    stakingStats: {
      totalStaked: (stakingStats as any)?.[0] ?? 0n,
      apy: Number((stakingStats as any)?.[1] ?? 0n) / 100,
      stakersCount: Number((stakingStats as any)?.[2] ?? 0),
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake,
    withdraw,
    claimRewards,
    isLoading: isConfirming,
    error,
    canUnstake,
    timeUntilUnstake,
    stakingHistory,
    rewardsHistory,
  };
}
