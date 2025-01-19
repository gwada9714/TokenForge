import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useWatchContractEvent, useAccount } from 'wagmi';
import { type Address, Hash } from 'viem';

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
};

export const useStaking = (tokenAddress: Address) => {
  const [error, setError] = useState<string | null>(null);
  const [stakingHistory, setStakingHistory] = useState<StakingEvent[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [lastStakeTime, setLastStakeTime] = useState<number>(0);
  const [timeUntilUnstake, setTimeUntilUnstake] = useState<number>(0);

  const { address } = useAccount();

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
  });

  const { data: stakeInfoData, refetch: refetchStakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const { data: stakingStatsData, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  });

  const { writeAsync: stake, isLoading: isStaking } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'stake',
    address: tokenAddress,
  });

  const { writeAsync: unstake, isLoading: isUnstaking } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'unstake',
    address: tokenAddress,
  });

  const { writeAsync: claim, isLoading: isClaiming } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'claimRewards',
    address: tokenAddress,
  });

  const handleStake = async (amount: bigint) => {
    try {
      const tx = await stake({
        args: [amount.toString()],
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleUnstake = async (amount: bigint) => {
    try {
      const tx = await unstake({
        args: [amount.toString()],
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleClaim = async () => {
    try {
      const tx = await claim({
        args: [],
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const updateUnstakeTimer = () => {
      if (lastStakeTime === 0) {
        setTimeUntilUnstake(0);
        return;
      }

      const now = Date.now();
      const timePassed = Math.floor((now - lastStakeTime) / 1000);
      const timeLeft = Math.max(0, STAKING_CONFIG.LOCK_PERIOD - timePassed);
      setTimeUntilUnstake(timeLeft);
    };

    const timer = setInterval(updateUnstakeTimer, 1000);
    return () => clearInterval(timer);
  }, [lastStakeTime]);

  useWatchContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Staked',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount } = log.args as { user: string; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            action: 'stake',
            amount
          }]);
          setLastStakeTime(Date.now());
          refetchStakeInfo?.();
          refetchStats?.();
        }
      });
    }
  });

  useWatchContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Unstaked',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount } = log.args as { user: string; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            action: 'unstake',
            amount
          }]);
          refetchStakeInfo?.();
          refetchStats?.();
        }
      });
    }
  });

  useWatchContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsClaimed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount } = log.args as { user: string; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            action: 'claim',
            amount
          }]);
          refetchStakeInfo?.();
        }
      });
    }
  });

  useWatchContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'RewardsUpdated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, newRewards } = log.args as { user: string; newRewards: bigint };
        if (user === address) {
          setRewardsHistory(prev => [...prev, {
            timestamp: Date.now(),
            rewards: newRewards
          }]);
          refetchStakeInfo?.();
        }
      });
    }
  });

  return {
    balance,
    stakeInfo: stakeInfoData,
    stakingStats: stakingStatsData,
    stakingHistory,
    rewardsHistory,
    lastStakeTime,
    timeUntilUnstake,
    stake: handleStake,
    unstake: handleUnstake,
    claim: handleClaim,
    isStaking,
    isUnstaking,
    isClaiming,
    error,
  };
};
