import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useBalance, useWatchContractEvent, useAccount } from 'wagmi';
import { type Address } from 'viem';
import { TKNTokenABI } from '../contracts/abis/TKNToken';

export const STAKING_CONFIG = {
  LOCK_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  MIN_STAKE_AMOUNT: '100', // 100 tokens
  MAX_STAKE_AMOUNT: '1000000', // 1M tokens
  REFRESH_INTERVAL: 60 * 1000, // 1 minute in milliseconds
  SAFETY_MARGIN: 60 // 60 seconds safety margin
};

interface StakeInfo {
  amount: bigint;
  lastStakeTime: bigint;
  rewards: bigint;
}

interface StakingStats {
  totalStaked: bigint;
  totalStakers: bigint;
  rewardRate: bigint;
}

export const useStaking = (tokenAddress: Address | undefined, address: Address | undefined) => {
  const [error, setError] = useState<string | null>(null);
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
    enabled: !!address && !!tokenAddress,
  });

  const { data: stats, refetch: refetchStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
    enabled: !!tokenAddress,
  });

  const { writeAsync: stake, isPending: isStaking } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { writeAsync: unstake, isPending: isUnstaking } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { writeAsync: claim, isPending: isClaiming } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  useEffect(() => {
    if (!stakeInfo) return;
    setLastStakeTime(Number(stakeInfo.lastStakeTime));
  }, [stakeInfo]);

  useEffect(() => {
    if (!lastStakeTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const unlockTime = lastStakeTime + STAKING_CONFIG.LOCK_PERIOD;
      const timeLeft = Math.max(0, unlockTime - now);
      setTimeUntilUnstake(timeLeft);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, STAKING_CONFIG.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [lastStakeTime]);

  const handleStake = async (amount: bigint) => {
    if (!tokenAddress) {
      setError('Token address is required');
      return;
    }

    if (amount < BigInt(STAKING_CONFIG.MIN_STAKE_AMOUNT) || amount > BigInt(STAKING_CONFIG.MAX_STAKE_AMOUNT)) {
      setError('Invalid stake amount');
      return;
    }

    try {
      await stake({ args: [amount] });
      await refetchStakeInfo();
      await refetchStats();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stake failed');
    }
  };

  const handleUnstake = async (amount: bigint) => {
    if (!tokenAddress) {
      setError('Token address is required');
      return;
    }

    if (timeUntilUnstake > STAKING_CONFIG.SAFETY_MARGIN) {
      setError('Staking period not finished');
      return;
    }

    try {
      await unstake({ args: [amount] });
      await refetchStakeInfo();
      await refetchStats();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unstake failed');
    }
  };

  const handleClaim = async () => {
    if (!tokenAddress) {
      setError('Token address is required');
      return;
    }

    try {
      await claim({ args: [] });
      await refetchStakeInfo();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    }
  };

  return {
    balance,
    stakeInfo: stakeInfo as StakeInfo | undefined,
    stats: stats as StakingStats | undefined,
    timeUntilUnstake,
    error,
    isStaking,
    isUnstaking,
    isClaiming,
    handleStake,
    handleUnstake,
    handleClaim,
  };
};
