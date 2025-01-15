import { useState, useEffect, useMemo } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction, useBalance } from 'wagmi';
import { TKN_TOKEN_ADDRESS, STAKING_CONFIG } from '@/constants/tokenforge';
import { TKNTokenABI } from '@/contracts/abi/TKNToken';
import { useNetwork, useAccount } from 'wagmi';

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

export const useStaking = (tokenAddress: string): StakingInfo => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const chainId = chain?.id || 1;
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

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
    args: [address],
  });

  // Statistiques globales de staking
  const { data: stakingStats } = useContractRead({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'getStakingStats',
  });

  // Actions de staking
  const { write: stakeTokens, isLoading: isStaking, data: stakeData } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { write: unstakeTokens, isLoading: isWithdrawing, data: unstakeData } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { write: claim, isLoading: isClaiming, data: claimData } = useContractWrite({
    address: tokenAddress,
    abi: TKNTokenABI,
    functionName: 'claimRewards',
  });

  const stake = (amount: string) => {
    if (!amount) return;
    stakeTokens({ args: [BigInt(amount)] });
  };

  const withdraw = (amount: string) => {
    if (!amount) return;
    unstakeTokens({ args: [BigInt(amount)] });
  };

  const claimRewards = () => {
    claim();
  };

  return {
    balance: balance?.value,
    stakedAmount: stakeInfo?.stakedAmount || BigInt(0),
    pendingRewards: stakeInfo?.pendingRewards || BigInt(0),
    stakingStats: {
      totalStaked: stakingStats?.totalStaked || BigInt(0),
      apy: stakingStats?.apy || 0,
      stakersCount: stakingStats?.stakersCount || 0,
    },
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    stake,
    withdraw,
    claimRewards,
    isLoading: false,
    isStaking,
    isWithdrawing,
    isClaiming,
  };
};
