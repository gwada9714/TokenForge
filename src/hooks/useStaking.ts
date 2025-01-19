import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useWatchContractEvent, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { type Address } from 'viem';

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
  const [stakeHash, setStakeHash] = useState<`0x${string}` | undefined>(undefined);
  const [unstakeHash, setUnstakeHash] = useState<`0x${string}` | undefined>(undefined);
  const [claimHash, setClaimHash] = useState<`0x${string}` | undefined>(undefined);

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

  const { writeContract: stake } = useContractWrite({
    abi: TKNTokenABI,
    address: tokenAddress,
    functionName: 'stake',
  });

  const { writeContract: unstake } = useContractWrite({
    abi: TKNTokenABI,
    address: tokenAddress,
    functionName: 'unstake',
  });

  const { writeContract: claim } = useContractWrite({
    abi: TKNTokenABI,
    address: tokenAddress,
    functionName: 'claimRewards',
  });

  const { isLoading: isStaking, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  const { isLoading: isUnstaking, isSuccess: isUnstakeSuccess } = useWaitForTransactionReceipt({
    hash: unstakeHash,
  });

  const { isLoading: isClaiming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  useEffect(() => {
    if (isStakeSuccess) {
      refetchStakeInfo();
      refetchStats();
      setLastStakeTime(Date.now());
    }
  }, [isStakeSuccess, refetchStakeInfo, refetchStats]);

  useEffect(() => {
    if (isUnstakeSuccess) {
      refetchStakeInfo();
      refetchStats();
    }
  }, [isUnstakeSuccess, refetchStakeInfo, refetchStats]);

  useEffect(() => {
    if (isClaimSuccess) {
      refetchStakeInfo();
      refetchStats();
    }
  }, [isClaimSuccess, refetchStakeInfo, refetchStats]);

  const handleStake = async (amount: bigint) => {
    try {
      if (!stake) throw new Error('Contract write not ready');
      const tx = await stake({
        args: [amount],
      });
      if (tx?.hash) {
        setStakeHash(tx.hash);
      }
    } catch (error: unknown) {
      console.error('Error staking:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while staking');
      }
    }
  };

  const handleUnstake = async (amount: bigint) => {
    try {
      if (!unstake) throw new Error('Contract write not ready');
      const tx = await unstake({
        args: [amount],
      });
      if (tx?.hash) {
        setUnstakeHash(tx.hash);
      }
    } catch (error: unknown) {
      console.error('Error unstaking:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while unstaking');
      }
    }
  };

  const handleClaimRewards = async () => {
    try {
      if (!claim) throw new Error('Contract write not ready');
      const tx = await claim({
        args: [],
      });
      if (tx?.hash) {
        setClaimHash(tx.hash);
      }
    } catch (error: unknown) {
      console.error('Error claiming rewards:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while claiming rewards');
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
    stake: handleStake,
    withdraw: handleUnstake,
    claimRewards: handleClaimRewards,
    isLoading: isStaking || isUnstaking || isClaiming,
    error,
    canUnstake: timeUntilUnstake === 0,
    timeUntilUnstake,
    stakingHistory,
    rewardsHistory,
  };
};
