import { useState, useCallback, useEffect } from 'react';
import { useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { useNetwork } from '../hooks/useNetwork';
import { type Address } from 'viem';
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

export const useLaunchpad = (poolId?: number) => {
  const [error, setError] = useState<string | null>(null);
  const [poolInfoState, setPoolInfoState] = useState<PoolInfo | null>(null);
  const [userContribution, setUserContribution] = useState<bigint>(0n);
  const [createPoolHash, setCreatePoolHash] = useState<string | null>(null);
  const [contributeHash, setContributeHash] = useState<string | null>(null);
  const [claimTokensHash, setClaimTokensHash] = useState<string | null>(null);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const launchpadAddress = getContractAddress('Launchpad', chain?.id);

  const launchpadConfig = {
    address: launchpadAddress,
    abi: launchpadABI,
  };

  const { data: poolInfo } = useContractRead({
    ...launchpadConfig,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
  });

  const { data: userContributionData } = useContractRead({
    ...launchpadConfig,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [BigInt(poolId), address as Address] : undefined,
  });

  const { writeContract: createPool } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'createPool',
  });

  const { writeContract: contribute } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'contribute',
  });

  const { writeContract: claimTokens } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'claimTokens',
  });

  const { isLoading: isCreatingPool, isSuccess: isCreatePoolSuccess } = useWaitForTransactionReceipt({
    hash: createPoolHash,
  });

  const { isLoading: isContributing, isSuccess: isContributeSuccess } = useWaitForTransactionReceipt({
    hash: contributeHash,
  });

  const { isLoading: isClaiming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTokensHash,
  });

  useEffect(() => {
    if (isCreatePoolSuccess) {
      // refetchPools?.();
    }
  }, [isCreatePoolSuccess]);

  useEffect(() => {
    if (isContributeSuccess) {
      // refetchUserContribution?.();
    }
  }, [isContributeSuccess]);

  useEffect(() => {
    if (isClaimSuccess) {
      // refetchUserContribution?.();
    }
  }, [isClaimSuccess]);

  const handleCreatePool = useCallback(async (
    tokenAddress: string,
    startTime: bigint,
    endTime: bigint,
    hardCap: bigint,
    softCap: bigint,
    tokenPrice: bigint
  ) => {
    try {
      if (!createPool) throw new Error('Contract write not ready');
      const result = await createPool({
        address: launchpadAddress,
        abi: launchpadABI,
        functionName: 'createPool',
        args: [tokenAddress as Address, startTime, endTime, hardCap, softCap, tokenPrice],
      });
      setCreatePoolHash(result.hash);
    } catch (error: unknown) {
      console.error('Error creating pool:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while creating pool');
      }
      // onError?.(error);
    }
  }, [createPool]);

  const handleContribute = useCallback(async (amount: bigint) => {
    try {
      if (!contribute) throw new Error('Contract write not ready');
      const result = await contribute({
        address: launchpadAddress,
        abi: launchpadABI,
        functionName: 'contribute',
        args: [amount],
      });
      setContributeHash(result.hash);
    } catch (error: unknown) {
      console.error('Error contributing:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while contributing');
      }
      // onError?.(error);
    }
  }, [contribute]);

  const handleClaim = useCallback(async () => {
    try {
      if (!claimTokens) throw new Error('Contract write not ready');
      const result = await claimTokens({
        address: launchpadAddress,
        abi: launchpadABI,
        functionName: 'claimTokens',
      });
      setClaimTokensHash(result.hash);
    } catch (error: unknown) {
      console.error('Error claiming:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while claiming');
      }
      // onError?.(error);
    }
  }, [claimTokens]);

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
    contribute: handleContribute,
    claim: handleClaim,
    isCreatingPool,
    isContributing,
    isClaiming,
    error,
  };
};