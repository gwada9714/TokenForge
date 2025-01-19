import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { useAccount } from 'wagmi';
import { useNetwork } from '../hooks/useNetwork';
import { type Address } from 'viem';
import { LAUNCHPAD_ABI, LAUNCHPAD_ADDRESS } from '../config/contracts';

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
  const [createPoolHash, setCreatePoolHash] = useState<`0x${string}` | undefined>(undefined);
  const [contributeHash, setContributeHash] = useState<`0x${string}` | undefined>(undefined);
  const [claimTokensHash, setClaimTokensHash] = useState<`0x${string}` | undefined>(undefined);
  
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data: poolInfo } = useContractRead({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
    enabled: !!poolId,
  });

  const { data: userContributionData } = useContractRead({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [BigInt(poolId), address as `0x${string}`] : undefined,
    enabled: !!poolId && !!address,
  });

  const { write: createPool, isLoading: isCreatingPool } = useContractWrite({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'createPool'
  });

  const { write: contribute, isLoading: isContributing } = useContractWrite({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'contribute'
  });

  const { write: claimTokens, isLoading: isClaiming } = useContractWrite({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: 'claimTokens'
  });

  const handleCreatePool = async (params: {
    token: `0x${string}`;
    tokenPrice: bigint;
    hardCap: bigint;
    softCap: bigint;
    startTime: bigint;
    endTime: bigint;
  }) => {
    try {
      const hash = await createPool({
        args: [params.token, params.tokenPrice, params.hardCap, params.softCap, params.startTime, params.endTime],
      });
      setCreatePoolHash(hash);
      return hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleContribute = async (amount: bigint) => {
    if (!poolId) throw new Error('Pool ID is required');
    try {
      const hash = await contribute({
        args: [BigInt(poolId), amount],
      });
      setContributeHash(hash);
      return hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleClaimTokens = async () => {
    if (!poolId) throw new Error('Pool ID is required');
    try {
      const hash = await claimTokens({
        args: [BigInt(poolId)],
      });
      setClaimTokensHash(hash);
      return hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

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

  useEffect(() => {
    if (createPoolHash) {
      // refetchPools?.();
    }
  }, [createPoolHash]);

  useEffect(() => {
    if (contributeHash) {
      // refetchUserContribution?.();
    }
  }, [contributeHash]);

  useEffect(() => {
    if (claimTokensHash) {
      // refetchUserContribution?.();
    }
  }, [claimTokensHash]);

  return {
    poolInfo: poolInfoState,
    userContribution,
    createPool: handleCreatePool,
    contribute: handleContribute,
    claim: handleClaimTokens,
    isCreatingPool,
    isContributing,
    isClaiming,
    error,
  };
};