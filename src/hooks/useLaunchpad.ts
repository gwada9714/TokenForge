import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useTransaction } from 'wagmi';
import { useNetwork } from '../hooks/useNetwork';
import { Address } from 'viem';
import { getContractAddress } from '../config/contracts';
import { launchpadABI } from '../contracts/abis';

interface PoolInfo {
  token: Address;
  tokenPrice: bigint;
  hardCap: bigint;
  softCap: bigint;
  totalRaised: bigint;
  startTime: bigint;
  endTime: bigint;
  finalized: boolean;
  cancelled: boolean;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export const useLaunchpad = (poolId?: number) => {
  const [error, setError] = useState<string | null>(null);
  const [poolInfoState, setPoolInfoState] = useState<PoolInfo | null>(null);
  const [userContribution, setUserContribution] = useState<bigint>(0n);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const launchpadAddress = getContractAddress('Launchpad', chain?.id);

  const { data: poolInfo } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
  });

  const { data: userContributionData } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [BigInt(poolId), address as Address] : undefined,
  });

  const { data: createPoolData, writeAsync: createPool } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'createPool',
    chainId: chain?.id,
  });

  const { data: investData, writeAsync: invest } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'invest',
    chainId: chain?.id,
  });

  const { data: claimData, writeAsync: claim } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'claim',
    chainId: chain?.id,
  });

  const { isLoading: isCreating } = useTransaction({
    hash: createPoolData?.hash,
  });

  const { isLoading: isInvesting } = useTransaction({
    hash: investData?.hash,
  });

  const { isLoading: isClaiming } = useTransaction({
    hash: claimData?.hash,
  });

  const handleCreatePool = useCallback(async (
    token: Address,
    tokenPrice: string,
    hardCap: string,
    softCap: string,
    startTime: number,
    endTime: number
  ) => {
    if (!createPool) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await createPool({
        args: [
          token,
          BigInt(tokenPrice),
          BigInt(hardCap),
          BigInt(softCap),
          BigInt(startTime),
          BigInt(endTime)
        ],
      });
      return tx;
    } catch (error) {
      console.error('Error creating pool:', error);
      throw error;
    }
  }, [createPool]);

  const handleInvest = useCallback(async (amount: string) => {
    if (!invest) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await invest({
        args: [BigInt(amount)],
      });
      return tx;
    } catch (error) {
      console.error('Error investing:', error);
      throw error;
    }
  }, [invest]);

  const handleClaim = useCallback(async () => {
    if (!claim) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await claim();
      return tx;
    } catch (error) {
      console.error('Error claiming:', error);
      throw error;
    }
  }, [claim]);

  useEffect(() => {
    if (poolInfo && typeof poolInfo === 'object') {
      const typedPoolInfo = poolInfo as unknown as PoolInfo;
      setPoolInfoState({
        token: typedPoolInfo.token,
        tokenPrice: typedPoolInfo.tokenPrice,
        hardCap: typedPoolInfo.hardCap,
        softCap: typedPoolInfo.softCap,
        totalRaised: typedPoolInfo.totalRaised,
        startTime: typedPoolInfo.startTime,
        endTime: typedPoolInfo.endTime,
        finalized: typedPoolInfo.finalized,
        cancelled: typedPoolInfo.cancelled,
      });
    }
  }, [poolInfo]);

  useEffect(() => {
    if (userContributionData) {
      setUserContribution(userContributionData as bigint);
    }
  }, [userContributionData]);

  useEffect(() => {
    if (chain?.id !== 11155111) {
      setError('Please connect to Sepolia network');
    } else {
      setError(null);
    }
  }, [chain?.id]);

  return {
    poolInfo: poolInfoState,
    userContribution,
    createPool: handleCreatePool,
    invest: handleInvest,
    claim: handleClaim,
    isCreating,
    isInvesting,
    isClaiming,
    error,
  };
};