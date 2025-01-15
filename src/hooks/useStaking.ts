import { useMemo } from 'react';
import { useContractRead, useContractWrite, useBalance } from 'wagmi';
import { useNetwork, useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Temporary ABI until we generate it
const TKNTokenABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakeInfo(address account) external view returns (uint256 stakedAmount, uint256 pendingRewards)",
  "function getStakingStats() external view returns (uint256 totalStaked, uint256 apy, uint256 stakersCount)"
] as const;

export interface StakingInfo {
  balance: bigint | undefined;
  stakedAmount: bigint;
  pendingRewards: bigint;
  stakingStats: {
    totalStaked: bigint;
    apy: number;
    stakersCount: number;
  };
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
  withdrawAmount: string;
  setWithdrawAmount: React.Dispatch<React.SetStateAction<string>>;
  stake: (amount: string) => void;
  withdraw: (amount: string) => void;
  claimRewards: () => void;
  isLoading: boolean;
  isStaking: boolean;
  isWithdrawing: boolean;
  isClaiming: boolean;
}

export const useStaking = (tokenAddress: `0x${string}`): StakingInfo => {
  const { address } = useAccount();
  
  // Lecture du solde TKN
  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
  });

  // Lecture des informations de staking
  const { data: stakeInfo } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: [address as `0x${string}`],
  });

  // Statistiques globales de staking
  const { data: stakingStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  });

  // Actions de staking
  const { write: stakeTokens, isLoading: isStaking } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { write: unstakeTokens, isLoading: isWithdrawing } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { write: claim, isLoading: isClaiming } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  const stake = (amount: string) => {
    if (!amount) return;
    stakeTokens({ args: [parseEther(amount)] });
  };

  const withdraw = (amount: string) => {
    if (!amount) return;
    unstakeTokens({ args: [parseEther(amount)] });
  };

  const claimRewards = () => {
    claim();
  };

  return {
    balance: balance?.value,
    stakedAmount: stakeInfo?.[0] || BigInt(0),
    pendingRewards: stakeInfo?.[1] || BigInt(0),
    stakingStats: {
      totalStaked: stakingStats?.[0] || BigInt(0),
      apy: Number(stakingStats?.[1] || 0),
      stakersCount: Number(stakingStats?.[2] || 0),
    },
    stakeAmount: '',
    setStakeAmount: () => {},
    withdrawAmount: '',
    setWithdrawAmount: () => {},
    stake,
    withdraw,
    claimRewards,
    isLoading: false,
    isStaking,
    isWithdrawing,
    isClaiming,
  };
};
