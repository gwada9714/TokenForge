import { useState } from 'react';
import { useContractRead, useContractWrite, useBalance, useContractEvent } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Temporary ABI until we generate it
const TKNTokenABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakeInfo(address account) external view returns (uint256 stakedAmount, uint256 pendingRewards)",
  "function getStakingStats() external view returns (uint256 totalStaked, uint256 apy, uint256 stakersCount)",
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

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
  });

  const { data: stakeInfo, refetch: refetchStakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: [address!],
    enabled: !!address,
  });

  const { data: stakingStats, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  });

  const { writeAsync: stakeTokens, isLoading: isStaking } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { writeAsync: unstakeTokens, isLoading: isUnstaking } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { writeAsync: claim, isLoading: isClaiming } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

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

  const stake = async (amount: string) => {
    if (!amount) return;
    await stakeTokens({ args: [parseEther(amount)] });
  };

  const withdraw = async (amount: string) => {
    if (!amount) return;
    await unstakeTokens({ args: [parseEther(amount)] });
  };

  const claimRewards = async () => {
    await claim();
  };

  const canUnstake = lastStakeTime === 0 || 
    Date.now() / 1000 - lastStakeTime >= STAKING_CONFIG.LOCK_PERIOD;

  const timeUntilUnstake = Math.max(
    0,
    lastStakeTime + STAKING_CONFIG.LOCK_PERIOD - Date.now() / 1000
  );

  return {
    balance: balance?.value,
    stakedAmount: (stakeInfo as StakeInfo)?.stakedAmount ?? 0n,
    pendingRewards: (stakeInfo as StakeInfo)?.pendingRewards ?? 0n,
    stakingStats: stakingStats as StakingStats ?? {
      totalStaked: 0n,
      apy: 0,
      stakersCount: 0,
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake,
    withdraw,
    claimRewards,
    isLoading: isStaking || isUnstaking || isClaiming,
    canUnstake,
    timeUntilUnstake,
    stakingHistory,
    rewardsHistory,
  };
};
