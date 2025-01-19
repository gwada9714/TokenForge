import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction } from 'wagmi';
import { useNetwork } from '/useNetwork';
import { parseEther, Address } from 'viem';
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

export function useLaunchpad(poolId?: number) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chain?.id !== 11155111) {
      setError('Please connect to Sepolia network');
      setEnabled(false);
      return;
    }
    setError(null);
  }, [chain?.id]);

  const launchpadAddress = getContractAddress('TOKEN_FACTORY', chain?.id ?? 11155111) as Address;

  useEffect(() => {
    if (error) return;
    setEnabled(Boolean(poolId !== undefined && launchpadAddress));
  }, [poolId, launchpadAddress, error]);

  const { data: poolInfo } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
    enabled,
    onError: (error: unknown) => {
      console.error('Pool info error:', error);
      if (error instanceof Error) {
        setError(`Failed to read pool info: ${error.message}`);
      } else {
        setError('Failed to read pool info: Unknown error');
      }
    }
  }) as { data: PoolInfo | undefined };

  const { data: userContributionData } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [BigInt(poolId), address] : undefined,
    enabled: enabled && Boolean(address),
    onError: (error: unknown) => {
      console.error('User contribution error:', error);
      if (error instanceof Error) {
        setError(`Failed to read user contribution: ${error.message}`);
      } else {
        setError('Failed to read user contribution: Unknown error');
      }
    }
  });

  const { write: createPool, data: createPoolData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'createPool',
  });

  const { write: invest, data: investData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'invest',
  });

  const { write: claim, data: claimData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'claim',
  });

  const [poolInfoState, setPoolInfoState] = useState<PoolInfo>({
    token: ZERO_ADDRESS,
    tokenPrice: 0n,
    hardCap: 0n,
    softCap: 0n,
    totalRaised: 0n,
    startTime: 0n,
    endTime: 0n,
    finalized: false,
    cancelled: false,
  });

  const [userContribution, setUserContribution] = useState<bigint>(0n);

  const handleCreatePool = useCallback(async (
    token: `0x${string}`,
    tokenPrice: string,
    hardCap: string,
    softCap: string,
    startTime: number,
    endTime: number
  ) => {
    if (!createPool) return;
    
    try {
      await createPool({
        args: [
          token,
          BigInt(parseEther(tokenPrice)),
          BigInt(parseEther(hardCap)),
          BigInt(parseEther(softCap)),
          BigInt(startTime),
          BigInt(endTime)
        ],
      });
    } catch (error) {
      console.error('Error creating pool:', error);
      if (error instanceof Error) {
        setError(`Failed to create pool: ${error.message}`);
      } else {
        setError('Failed to create pool: Unknown error');
      }
      throw error;
    }
  }, [createPool]);

  const { isLoading: isCreating } = useWaitForTransaction({
    hash: createPoolData?.hash,
  });

  const { isLoading: isInvesting } = useWaitForTransaction({
    hash: investData?.hash,
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  useEffect(() => {
    if (poolInfo) {
      setPoolInfoState({
        token: poolInfo.token,
        tokenPrice: poolInfo.tokenPrice,
        hardCap: poolInfo.hardCap,
        softCap: poolInfo.softCap,
        totalRaised: poolInfo.totalRaised,
        startTime: poolInfo.startTime,
        endTime: poolInfo.endTime,
        finalized: poolInfo.finalized,
        cancelled: poolInfo.cancelled,
      });
    }
  }, [poolInfo]);

  useEffect(() => {
    if (userContributionData) {
      setUserContribution(userContributionData as bigint);
    }
  }, [userContributionData]);

  return {
    poolInfo: poolInfoState,
    userContribution,

    createPool: handleCreatePool,
    invest,
    claim,

    isCreating,
    isInvesting,
    isClaiming,

    error,
  };
}