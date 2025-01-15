import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransaction, useNetwork } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress } from '../config/contracts';
import { launchpadABI } from '../contracts/abis';

interface PoolInfo {
  token: string;
  tokenPrice: string;
  hardCap: string;
  softCap: string;
  totalRaised: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
  cancelled: boolean;
}

export function useLaunchpad(poolId?: number) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id || 11155111; // Default to Sepolia

  const [poolInfo, setPoolInfo] = useState<PoolInfo>({
    token: '',
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

  // Read pool info
  const { data: poolData } = useContractRead({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'getPoolInfo',
    args: [poolId],
    enabled: poolId !== undefined,
    watch: true,
  });

  // Read user contribution
  const { data: contributionData } = useContractRead({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'getContribution',
    args: [poolId, address],
    enabled: poolId !== undefined && address !== undefined,
    watch: true,
  });

  // Create pool
  const { write: createPool, data: createPoolData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'createPool',
  });

  // Contribute to pool
  const { write: contribute, data: contributeData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'contribute',
  });

  // Finalize pool
  const { write: finalizePool, data: finalizeData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'finalizePool',
  });

  // Cancel pool
  const { write: cancelPool, data: cancelData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'cancelPool',
  });

  // Claim tokens
  const { write: claimTokens, data: claimData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'claimTokens',
  });

  // Claim refund
  const { write: claimRefund, data: refundData } = useContractWrite({
    address: getContractAddress('LAUNCHPAD', chainId),
    abi: launchpadABI,
    functionName: 'claimRefund',
  });

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
    if (poolData && Array.isArray(poolData)) {
      setPoolInfo({
        token: poolData[0] as string,
        tokenPrice: formatEther(poolData[1] as bigint),
        hardCap: formatEther(poolData[2] as bigint),
        softCap: formatEther(poolData[3] as bigint),
        totalRaised: formatEther(poolData[4] as bigint),
        startTime: Number(poolData[5]),
        endTime: Number(poolData[6]),
        finalized: poolData[7] as boolean,
        cancelled: poolData[8] as boolean,
      });
    }
  }, [poolData]);

  useEffect(() => {
    if (contributionData) {
      setUserContribution(formatEther(contributionData as bigint));
    }
  }, [contributionData]);

  // Handlers
  const handleCreatePool = useCallback((
    token: string,
    tokenPrice: string,
    hardCap: string,
    softCap: string,
    minContribution: string,
    maxContribution: string,
    startTime: number,
    endTime: number
  ) => {
    createPool({
      args: [
        token,
        parseEther(tokenPrice),
        parseEther(hardCap),
        parseEther(softCap),
        parseEther(minContribution),
        parseEther(maxContribution),
        BigInt(startTime),
        BigInt(endTime),
      ],
    });
  }, [createPool]);

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
    poolInfo,
    userContribution,
    createPool: handleCreatePool,
    contribute: handleContribute,
    finalizePool: handleFinalizePool,
    cancelPool: handleCancelPool,
    claimTokens: handleClaimTokens,
    claimRefund: handleClaimRefund,
    isCreating,
    isContributing,
    isFinalizing,
    isCancelling,
    isClaiming,
    isRefunding,
  };
}