import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction, useNetwork } from 'wagmi';
import { parseEther, formatEther } from 'viem'; 
import { getContractAddress } from '../config/contracts';
import { stakingABI } from '../contracts/abis';

interface StakeInfo {
  amount: string;
  since: number;
  claimedRewards: string;
}

interface PoolInfo {
  totalStaked: string;
  rewardRate: string;
  lastUpdateTime: number;
}

/**
 * Hook for interacting with the staking contract
 * @param _tokenAddress The address of the token being staked (reserved for future multi-token staking support)
 */
export function useStaking(_tokenAddress: string) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const stakingAddress = chain ? getContractAddress('STAKING_CONTRACT', chain.id) : null;

  const [userStake, setUserStake] = useState<StakeInfo>({
    amount: '0',
    since: 0,
    claimedRewards: '0',
  });

  const [poolInfo, setPoolInfo] = useState<PoolInfo>({
    totalStaked: '0',
    rewardRate: '0',
    lastUpdateTime: 0,
  });

  // Only proceed with contract interactions if we have a valid staking address
  const enabled = Boolean(stakingAddress && address);

  const { data: userStakeData } = useContractRead({
    address: stakingAddress ?? undefined,
    abi: stakingABI,
    functionName: 'getUserStake',
    args: [address],
    enabled,
  });

  const { data: poolInfoData } = useContractRead({
    address: stakingAddress ?? undefined,
    abi: stakingABI,
    functionName: 'getPoolInfo',
    enabled,
  });

  const { data: rewardsData } = useContractRead({
    address: stakingAddress ?? undefined,
    abi: stakingABI,
    functionName: 'calculateRewards',
    args: [address],
    enabled,
  });

  // Stake tokens
  const { write: stake, data: stakeData } = useContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'stake',
  });

  // Withdraw tokens
  const { write: withdraw, data: withdrawData } = useContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'withdraw',
  });

  // Claim rewards
  const { write: claimRewards, data: claimData } = useContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'claimRewards',
  });

  // Wait for transactions
  const { isLoading: isStaking } = useWaitForTransaction({
    hash: stakeData?.hash,
  });

  const { isLoading: isWithdrawing } = useWaitForTransaction({
    hash: withdrawData?.hash,
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  useEffect(() => {
    if (userStakeData && Array.isArray(userStakeData)) {
      setUserStake({
        amount: formatEther(BigInt(userStakeData[0].toString())),
        since: Number(userStakeData[1]),
        claimedRewards: formatEther(BigInt(userStakeData[2].toString())),
      });
    }
  }, [userStakeData]);

  useEffect(() => {
    if (poolInfoData && Array.isArray(poolInfoData)) {
      setPoolInfo({
        totalStaked: formatEther(BigInt(poolInfoData[0].toString())),
        rewardRate: formatEther(BigInt(poolInfoData[1].toString())),
        lastUpdateTime: Number(poolInfoData[2]),
      });
    }
  }, [poolInfoData]);

  // Handlers
  const handleStake = useCallback((amount: string) => {
    stake({ args: [parseEther(amount)] });
  }, [stake]);

  const handleWithdraw = useCallback((amount: string) => {
    withdraw({ args: [parseEther(amount)] });
  }, [withdraw]);

  const handleClaimRewards = useCallback(() => {
    claimRewards({ args: [] });
  }, [claimRewards]);

  return {
    userStake,
    poolInfo,
    rewards: rewardsData ? formatEther(rewardsData as unknown as bigint) : '0',
    stake: handleStake,
    withdraw: handleWithdraw,
    claimRewards: handleClaimRewards,
    isStaking,
    isWithdrawing,
    isClaiming,
  };
};
