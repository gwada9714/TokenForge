import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction, useNetwork } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { getContractAddress } from '../config/contracts';
import { launchpadABI } from '../contracts/abis';

interface PoolInfo {
  token: Address;
  tokenPrice: string;
  hardCap: string;
  softCap: string;
  totalRaised: string;
  startTime: number;
  endTime: number;
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
    args: poolId !== undefined ? [poolId] : undefined,
    enabled,
  }) as { data: PoolInfo | undefined };

  // Read user contribution
  const { data: userContributionData } = useContractRead({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'getUserContribution',
    args: poolId !== undefined && address ? [poolId, address] : undefined,
    enabled: enabled && Boolean(address),
  });

  // Create pool
  const { write: createPool, data: createPoolData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'createPool',
  });

  // Contribute to pool
  const { write: contribute, data: contributeData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'contribute',
  });

  // Finalize pool
  const { write: finalizePool, data: finalizeData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'finalizePool',
  });

  // Cancel pool
  const { write: cancelPool, data: cancelData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'cancelPool',
  });

  // Claim tokens
  const { write: claimTokens, data: claimData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'claimTokens',
  });

  // Claim refund
  const { write: claimRefund, data: refundData } = useContractWrite({
    address: launchpadAddress,
    abi: launchpadABI,
    functionName: 'claimRefund',
  });

  const [poolInfoState, setPoolInfoState] = useState<PoolInfo>({
    token: ZERO_ADDRESS,
    tokenPrice: '0',
    hardCap: '0',
    softCap: '0',
    totalRaised: '0',
    startTime: 0,
    endTime: 0,
    finalized: false,
    cancelled: false,
  });

  const [userContribution, setUserContribution] = useState('0');

  const handleCreatePool = useCallback(async (
    token: Address,
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
          parseEther(tokenPrice),
          parseEther(hardCap),
          parseEther(softCap),
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

  const { isLoading: isContributing } = useWaitForTransaction({
    hash: contributeData?.hash,
  });

  const { isLoading: isFinalizing } = useWaitForTransaction({
    hash: finalizeData?.hash,
  });

  const { isLoading: isCancelling } = useWaitForTransaction({
    hash: cancelData?.hash,
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  const { isLoading: isRefunding } = useWaitForTransaction({
    hash: refundData?.hash,
  });

  // Update state when data changes
  useEffect(() => {
    if (poolInfo && Array.isArray(poolInfo)) {
      setPoolInfoState({
        token: poolInfo[0] as Address,
        tokenPrice: formatEther(poolInfo[1] as bigint),
        hardCap: formatEther(poolInfo[2] as bigint),
        softCap: formatEther(poolInfo[3] as bigint),
        totalRaised: formatEther(poolInfo[4] as bigint),
        startTime: Number(poolInfo[5]),
        endTime: Number(poolInfo[6]),
        finalized: poolInfo[7] as boolean,
        cancelled: poolInfo[8] as boolean,
      });
    }
  }, [poolInfo]);

  useEffect(() => {
    if (userContributionData) {
      setUserContribution(formatEther(userContributionData as bigint));
    }
  }, [userContributionData]);

  // Handlers
  const handleContribute = useCallback((amount: string) => {
    if (poolId === undefined) return;
    contribute({
      args: [poolId],
      value: parseEther(amount),
    });
  }, [contribute, poolId]);

  const handleFinalizePool = useCallback(() => {
    if (poolId === undefined) return;
    finalizePool({ args: [poolId] });
  }, [finalizePool, poolId]);

  const handleCancelPool = useCallback(() => {
    if (poolId === undefined) return;
    cancelPool({ args: [poolId] });
  }, [cancelPool, poolId]);

  const handleClaimTokens = useCallback(() => {
    if (poolId === undefined) return;
    claimTokens({ args: [poolId] });
  }, [claimTokens, poolId]);

  const handleClaimRefund = useCallback(() => {
    if (poolId === undefined) return;
    claimRefund({ args: [poolId] });
  }, [claimRefund, poolId]);

  return {
    poolInfo: poolInfoState,
    userContribution,
    isCreating,
    isContributing,
    isFinalizing,
    isCancelling,
    isClaiming,
    isRefunding,
    createPool: handleCreatePool,
    contribute: handleContribute,
    finalizePool: handleFinalizePool,
    cancelPool: handleCancelPool,
    claimTokens: handleClaimTokens,
    claimRefund: handleClaimRefund,
  };
}