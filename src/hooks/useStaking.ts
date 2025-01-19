import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useWatchContractEvent, useAccount } from 'wagmi';
import { type Address, Hash } from 'viem';
import { TKNTokenABI } from '../contracts/abis/TKNToken';

interface StakingEvent {
  timestamp: number;
  type: 'stake' | 'unstake' | 'claim';
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

export const useStaking = (tokenAddress: `0x${string}` | undefined, address: `0x${string}` | undefined) => {
  const [error, setError] = useState<string | null>(null);
  const [stakingHistory, setStakingHistory] = useState<Array<{
    timestamp: number;
    type: 'stake' | 'unstake' | 'claim';
    amount: bigint;
  }>>([]);

  const [rewardsHistory, setRewardsHistory] = useState<Array<{
    timestamp: number;
    rewards: bigint;
  }>>([]);

  const [lastStakeTime, setLastStakeTime] = useState<number>(0);
  const [timeUntilUnstake, setTimeUntilUnstake] = useState<number>(0);

  const { address: accountAddress } = useAccount();

  const { data: balance } = useBalance({
    address: accountAddress,
    token: tokenAddress,
  });

  const { data: stakeInfo, refetch: refetchStakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress
    }
  });

  const { data: stats, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
    query: {
      enabled: !!tokenAddress
    }
  });

  const { writeContract: stake, isPending: isStaking } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'stake'
  });

  const { writeContract: unstake, isPending: isUnstaking } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'unstake'
  });

  const { writeContract: claim, isPending: isClaiming } = useContractWrite({
    abi: TKNTokenABI,
    functionName: 'claimRewards'
  });

  useWatchContractEvent({
    address: tokenAddress,
    abi: TKNTokenABI,
    eventName: 'Staked',
    onLogs(logs) {
      logs.forEach(log => {
        const { user, amount } = log.args as { user: `0x${string}`; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            type: 'stake',
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
    onLogs(logs) {
      logs.forEach(log => {
        const { user, amount } = log.args as { user: `0x${string}`; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            type: 'unstake',
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
    onLogs(logs) {
      logs.forEach(log => {
        const { user, amount } = log.args as { user: `0x${string}`; amount: bigint };
        if (user === address) {
          setStakingHistory(prev => [...prev, {
            timestamp: Date.now(),
            type: 'claim',
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
    onLogs(logs) {
      logs.forEach(log => {
        const { user, newRewards } = log.args as { user: `0x${string}`; newRewards: bigint };
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

  const handleStake = async (amount: string) => {
    try {
      if (!tokenAddress) return;
      const tx = await stake({
        address: tokenAddress,
        args: [amount]
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleUnstake = async (amount: string) => {
    try {
      if (!tokenAddress) return;
      const tx = await unstake({
        address: tokenAddress,
        args: [amount]
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleClaim = async () => {
    try {
      if (!tokenAddress) return;
      const tx = await claim({
        address: tokenAddress,
        args: []
      });
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    balance,
    stakeInfo,
    stats,
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
