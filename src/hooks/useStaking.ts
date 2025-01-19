import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useWatchContractEvent, useTransaction, useAccount } from 'wagmi';
import { parseEther, type Address } from 'viem';

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
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
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
    args: address ? [address as Address] : undefined,
  });

  const { data: stakingStatsData, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  });

  const { data: stakeResult, writeContract: stake } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { data: unstakeResult, writeContract: unstake } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { data: claimResult, writeContract: claim } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  const { isLoading: isStaking } = useTransaction({
    hash: stakeResult?.hash,
    onSuccess(data) {
      refetchStakeInfo();
      refetchStats();
      setLastStakeTime(Date.now());
    },
  });

  const { isLoading: isUnstaking } = useTransaction({
    hash: unstakeResult?.hash,
    onSuccess(data) {
      refetchStakeInfo();
      refetchStats();
    },
  });

  const { isLoading: isClaiming } = useTransaction({
    hash: claimResult?.hash,
    onSuccess(data) {
      refetchStakeInfo();
    },
  });

  const stakeTokens = async (amount: string) => {
    try {
      if (!stake) throw new Error('Contract write not ready');

      const result = await stake({
        args: [parseEther(amount)],
      });
      return result;
    } catch (error) {
      console.error('Error staking:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    }
  };

  const withdrawTokens = async (amount: string) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!unstake) throw new Error('Contract write not ready');

      const result = await unstake({
        args: [parseEther(amount)],
      });
    } catch (error) {
      console.error('Error unstaking:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors du unstaking');
      }
    }
  };

  const claimRewards = async () => {
    try {
      if (!claim) throw new Error('Contract write not ready');

      const result = await claim();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la réclamation des récompenses');
      }
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

  useEffect(() => {
    const handleStaked = (logs: any) => {
      const newEvent: StakingEvent = {
        timestamp: Date.now(),
        action: 'stake',
        amount: logs[0].args.amount as bigint,
      };
      setStakingHistory(prev => [...prev, newEvent]);
      refetchStakeInfo();
      refetchStats();
    };

    const handleUnstaked = (logs: any) => {
      const newEvent: StakingEvent = {
        timestamp: Date.now(),
        action: 'unstake',
        amount: logs[0].args.amount as bigint,
      };
      setStakingHistory(prev => [...prev, newEvent]);
      refetchStakeInfo();
      refetchStats();
    };

    const handleRewardsClaimed = (logs: any) => {
      const newEvent: StakingEvent = {
        timestamp: Date.now(),
        action: 'claim',
        amount: logs[0].args.amount as bigint,
      };
      setStakingHistory(prev => [...prev, newEvent]);
      refetchStakeInfo();
    };

    const handleRewardsUpdated = (logs: any) => {
      const newReward: RewardHistory = {
        timestamp: Date.now(),
        rewards: logs[0].args.newRewards as bigint,
      };
      setRewardsHistory(prev => [...prev, newReward]);
    };

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'Staked',
      onLogs: handleStaked,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'Unstaked',
      onLogs: handleUnstaked,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'RewardsClaimed',
      onLogs: handleRewardsClaimed,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'RewardsUpdated',
      onLogs: handleRewardsUpdated,
    });

    return () => {
      // TODO: Remove event listeners when component unmounts
    };
  }, [tokenAddress, refetchStakeInfo, refetchStats]);

  return {
    balance: balance?.value,
    stakedAmount: (stakeInfoData as any)?.[0] ?? 0n,
    pendingRewards: (stakeInfoData as any)?.[1] ?? 0n,
    stakingStats: {
      totalStaked: (stakingStatsData as any)?.[0] ?? 0n,
      apy: Number((stakingStatsData as any)?.[1] ?? 0n) / 100,
      stakersCount: Number((stakingStatsData as any)?.[2] ?? 0),
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake: stakeTokens,
    withdraw: withdrawTokens,
    claimRewards,
    isLoading: isStaking || isUnstaking || isClaiming,
    error,
    canUnstake: timeUntilUnstake === 0,
    timeUntilUnstake,
    stakingHistory,
    rewardsHistory,
  };
};
