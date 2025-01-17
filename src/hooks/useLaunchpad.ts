import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction, useNetwork } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
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

  const launchpadAddress = getContractAddress('LAUNCHPAD', chain?.id ?? 1) as Address;

  useEffect(() => {
    setEnabled(Boolean(poolId !== undefined && launchpadAddress));
  }, [poolId, launchpadAddress]);

  // Read pool info
  const { data: poolInfo } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
    enabled,
  }) as { data: PoolInfo | undefined };

  // Read user contribution
  const { data: userContributionData } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [BigInt(poolId), address] : undefined,
    enabled: enabled && Boolean(address),
  });

  // Create pool
  const { write: createPool, data: createPoolData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'createPool',
  });

  // Invest in pool
  const { write: invest, data: investData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'invest',
  });

  // Claim
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
      throw error;
    }
  }, [createPool]);

  // Wait for transactions
  const { isLoading: isCreating } = useWaitForTransaction({
    hash: createPoolData?.hash,
  });

  const { isLoading: isInvesting } = useWaitForTransaction({
    hash: investData?.hash,
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Update states when data changes
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
    // Pool info
    poolInfo: poolInfoState,
    userContribution,

    // Actions
    createPool: handleCreatePool,
    invest,
    claim,

    // Loading states
    isCreating,
    isInvesting,
    isClaiming,
  };
}