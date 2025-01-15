import { useState } from 'react';
import { useContractRead, useContractWrite, useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Temporary ABI until we generate it
const TKNTokenABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakeInfo(address account) external view returns (uint256 stakedAmount, uint256 pendingRewards)",
  "function getStakingStats() external view returns (uint256 totalStaked, uint256 apy, uint256 stakersCount)"
] as const;

interface StakeInfo {
  stakedAmount: bigint;
  pendingRewards: bigint;
}

interface StakingStats {
  totalStaked: bigint;
  apy: number;
  stakersCount: number;
}

export interface StakingInfo {
  balance: bigint | undefined;
  stakedAmount: bigint;
  pendingRewards: bigint;
  stakingStats: StakingStats;
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
  withdrawAmount: string;
  setWithdrawAmount: React.Dispatch<React.SetStateAction<string>>;
  stake: (amount: string) => void;
  withdraw: (amount: string) => void;
  claimRewards: () => void;
  isLoading: boolean;
  canUnstake: boolean;
  timeUntilUnstake: number;
}

export function useStaking(tokenAddress: `0x${string}`): StakingInfo {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: stakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: [address as `0x${string}`],
  }) as { data: StakeInfo };

  const { data: stakingStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  }) as { data: StakingStats };

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
  });

  // Contract writes
  const { write: stake } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { write: withdraw } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { write: claimRewards } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  return {
    balance: balance?.value,
    stakedAmount: stakeInfo?.stakedAmount ?? BigInt(0),
    pendingRewards: stakeInfo?.pendingRewards ?? BigInt(0),
    stakingStats: stakingStats ?? {
      totalStaked: BigInt(0),
      apy: 0,
      stakersCount: 0,
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake: (amount: string) => stake({ args: [parseEther(amount)] }),
    withdraw: (amount: string) => withdraw({ args: [parseEther(amount)] }),
    claimRewards: () => claimRewards(),
    isLoading: false,
    canUnstake: true,
    timeUntilUnstake: 0,
  };
}
