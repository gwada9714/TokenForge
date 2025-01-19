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

interface StakingInfo {
  balance: bigint | undefined;
  stakedAmount: bigint;
  pendingRewards: bigint;
  stakingStats: {
    totalStaked: bigint;
    apy: number;
    stakersCount: number;
  };
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

export const useStaking = (tokenAddress: Address) => {
  const [error, setError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakingHistory, setStakingHistory] = useState<StakingEvent[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
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

  const { data: stakeData, writeAsync: stake } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { data: unstakeData, writeAsync: unstake } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { data: claimData, writeAsync: claim } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  const { data: stakeTx } = useTransaction({
    hash: stakeData?.hash,
  });

  const { data: unstakeTx } = useTransaction({
    hash: unstakeData?.hash,
  });

  const { data: claimTx } = useTransaction({
    hash: claimData?.hash,
  });

  const isStaking = stakeTx?.status === 'pending';
  const isUnstaking = unstakeTx?.status === 'pending';
  const isClaiming = claimTx?.status === 'pending';

  const stakeTokens = async (amount: string) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!stake) throw new Error('Contract write not ready');

      const tx = await stake({
        args: [parseEther(amount)],
      });
      setTxHash(tx.hash);
      setLastStakeTime(Date.now());
    } catch (error) {
      console.error('Error staking:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors du staking');
      }
    }
  };

  const withdrawTokens = async (amount: string) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!unstake) throw new Error('Contract write not ready');

      const tx = await unstake({
        args: [parseEther(amount)],
      });
      setTxHash(tx.hash);
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

      const tx = await claim();
      setTxHash(tx.hash);
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
    const handleStaked = (staker: string, amount: bigint) => {
      if (staker.toLowerCase() === address?.toLowerCase()) {
        setStakingHistory(prev => [...prev, {
          timestamp: Date.now(),
          action: 'stake',
          amount,
        }]);
        refetchStakeInfo();
        refetchStats();
      }
    };

    const handleUnstaked = (staker: string, amount: bigint) => {
      if (staker.toLowerCase() === address?.toLowerCase()) {
        setStakingHistory(prev => [...prev, {
          timestamp: Date.now(),
          action: 'unstake',
          amount,
        }]);
        refetchStakeInfo();
        refetchStats();
      }
    };

    const handleRewardsClaimed = (staker: string, amount: bigint) => {
      if (staker.toLowerCase() === address?.toLowerCase()) {
        setStakingHistory(prev => [...prev, {
          timestamp: Date.now(),
          action: 'claim',
          amount,
        }]);
        refetchStakeInfo();
      }
    };

    const handleRewardsUpdated = (staker: string, newRewards: bigint) => {
      if (staker.toLowerCase() === address?.toLowerCase()) {
        setRewardsHistory(prev => [...prev, {
          timestamp: Date.now(),
          rewards: newRewards,
        }]);
      }
    };

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'Staked',
      listener: handleStaked,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'Unstaked',
      listener: handleUnstaked,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'RewardsClaimed',
      listener: handleRewardsClaimed,
    });

    useWatchContractEvent({
      address: tokenAddress,
      abi: TKNTokenABI,
      eventName: 'RewardsUpdated',
      listener: handleRewardsUpdated,
    });

    return () => {
      // TODO: Remove event listeners when component unmounts
    };
  }, [tokenAddress, address, refetchStakeInfo, refetchStats]);

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
