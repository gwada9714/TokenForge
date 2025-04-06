import { useState, useEffect } from "react";
import { useContractWrite, useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { useNetwork } from "../hooks/useNetwork";
import { type Address } from "viem";
import { LAUNCHPAD_ABI } from "../contracts/abis/Launchpad";

const LAUNCHPAD_ADDRESS = process.env
  .NEXT_PUBLIC_LAUNCHPAD_ADDRESS as `0x${string}`;

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

export const useLaunchpad = (poolId?: string, address?: `0x${string}`) => {
  const [error, setError] = useState<string | null>(null);
  const [poolInfoState, setPoolInfoState] = useState<PoolInfo | null>(null);
  const [userContribution, setUserContribution] = useState<bigint>(0n);
  const [createPoolHash, setCreatePoolHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [contributeHash, setContributeHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [claimTokensHash, setClaimTokensHash] = useState<
    `0x${string}` | undefined
  >(undefined);

  const { address: userAddress } = useAccount();
  const { chain } = useNetwork();

  const { data: poolInfo } = useContractRead({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: "getPoolInfo",
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
    query: {
      enabled: !!poolId,
    },
  });

  const { data: userContributionData } = useContractRead({
    address: LAUNCHPAD_ADDRESS,
    abi: LAUNCHPAD_ABI,
    functionName: "getUserContribution",
    args:
      poolId !== undefined && address ? [BigInt(poolId), address] : undefined,
    query: {
      enabled: !!poolId && !!address,
    },
  });

  const { writeContract: createPool, isPending: isCreatingPool } =
    useContractWrite({
      abi: LAUNCHPAD_ABI,
      functionName: "createPool",
    });

  const { writeContract: contribute, isPending: isContributing } =
    useContractWrite({
      abi: LAUNCHPAD_ABI,
      functionName: "contribute",
    });

  const { writeContract: claimTokens, isPending: isClaiming } =
    useContractWrite({
      abi: LAUNCHPAD_ABI,
      functionName: "claimTokens",
    });

  const handleCreatePool = async (params: {
    token: `0x${string}`;
    startTime: bigint;
    endTime: bigint;
    tokenPrice: bigint;
    softCap: bigint;
    hardCap: bigint;
  }) => {
    if (!LAUNCHPAD_ADDRESS) return;
    try {
      const hash = await createPool({
        address: LAUNCHPAD_ADDRESS,
        args: [
          params.token,
          params.startTime,
          params.endTime,
          params.tokenPrice,
          params.softCap,
          params.hardCap,
        ],
      });
      setCreatePoolHash(hash);
      return hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleContribute = async (amount: bigint) => {
    if (!LAUNCHPAD_ADDRESS || !poolId) return;
    try {
      const hash = await contribute({
        address: LAUNCHPAD_ADDRESS,
        args: [BigInt(poolId), amount],
      });
      setContributeHash(hash);
      return hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleClaim = async () => {
    if (!LAUNCHPAD_ADDRESS || !poolId) return;
    try {
      const hash = await claimTokens({
        address: LAUNCHPAD_ADDRESS,
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
    if (poolInfo && typeof poolInfo === "object") {
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
      setError("Please connect to Sepolia network");
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
    claim: handleClaim,
    isCreatingPool,
    isContributing,
    isClaiming,
    error,
  };
};
