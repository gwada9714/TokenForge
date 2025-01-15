import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction, useNetwork } from 'wagmi';
import { parseEther, formatEther } from 'viem'; 
import { STAKING_CONTRACT_ADDRESS, SUPPORTED_NETWORKS } from '../config/contracts';
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

const getStakingAddress = (chainId: number) => {
  switch (chainId) {
    case SUPPORTED_NETWORKS.SEPOLIA:
      return STAKING_CONTRACT_ADDRESS.sepolia;
    case SUPPORTED_NETWORKS.MAINNET:
      return STAKING_CONTRACT_ADDRESS.mainnet;
    case SUPPORTED_NETWORKS.LOCAL:
      return STAKING_CONTRACT_ADDRESS.local;
    default:
      throw new Error('Unsupported network');
  }
};

/**
 * Hook for interacting with the staking contract
 * @param _tokenAddress The address of the token being staked (reserved for future multi-token staking support)
 */
export function useStaking(_tokenAddress: string) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const stakingAddress = chain ? getStakingAddress(chain.id) : undefined;

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

  // Read user stake info
  const { data: stakeInfo } = useContractRead({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'getUserStake',
    args: [address],
    watch: true,
  });

  // Read pool info
  const { data: poolData } = useContractRead({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'getPoolInfo',
    watch: true,
  });

  // Calculate rewards
  const { data: rewards } = useContractRead({
    address: stakingAddress,
    abi: stakingABI,
    functionName: 'calculateRewards',
    args: [address],
    watch: true,
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
    if (stakeInfo && Array.isArray(stakeInfo)) {
      setUserStake({
        amount: formatEther(BigInt(stakeInfo[0].toString())),
        since: Number(stakeInfo[1]),
        claimedRewards: formatEther(BigInt(stakeInfo[2].toString())),
      });
    }
  }, [stakeInfo]);

  useEffect(() => {
    if (poolData && Array.isArray(poolData)) {
      setPoolInfo({
        totalStaked: formatEther(BigInt(poolData[0].toString())),
        rewardRate: formatEther(BigInt(poolData[1].toString())),
        lastUpdateTime: Number(poolData[2]),
      });
    }
  }, [poolData]);

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
    rewards: rewards ? formatEther(rewards as unknown as bigint) : '0',
    stake: handleStake,
    withdraw: handleWithdraw,
    claimRewards: handleClaimRewards,
    isStaking,
    isWithdrawing,
    isClaiming,
  };
};
