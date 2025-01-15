import { useState, useEffect, useMemo } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction, useBalance } from 'wagmi';
import { TKN_TOKEN_ADDRESS, STAKING_CONFIG } from '@/constants/tokenforge';
import { TKNTokenABI } from '@/contracts/abi/TKNToken';
import { useNetwork, useAccount } from 'wagmi';

export const useStaking = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const chainId = chain?.id || 1;
  const [stakeAmount, setStakeAmount] = useState('');

  // Lecture du solde TKN
  const { data: tokenBalance } = useBalance({
    address,
    token: TKN_TOKEN_ADDRESS[chainId],
  });

  // Lecture des informations de staking
  const { data: stakeInfo } = useContractRead({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'getStakeInfo',
    args: [address],
  });

  // Statistiques globales de staking
  const { data: totalStaked } = useContractRead({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'totalStaked',
  });

  // Actions de staking
  const { write: stakeTokens, data: stakeData } = useContractWrite({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'stake',
  });

  const { write: unstakeTokens, data: unstakeData } = useContractWrite({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'unstake',
  });

  const { write: claimRewardsAction, data: claimData } = useContractWrite({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'claimReward',
  });

  // Attendre les confirmations des transactions
  const { isLoading: isStaking } = useWaitForTransaction({
    hash: stakeData?.hash,
  });

  const { isLoading: isUnstaking } = useWaitForTransaction({
    hash: unstakeData?.hash,
  });

  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Calcul du temps restant avant de pouvoir unstake
  const timeUntilUnstake = useMemo(() => {
    if (!stakeInfo?.timestamp) return 0;
    const lockEnd = Number(stakeInfo.timestamp) + STAKING_CONFIG.LOCK_PERIOD;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, lockEnd - now);
  }, [stakeInfo?.timestamp]);

  // Vérifier si l'unstake est possible
  const canUnstake = useMemo(() => {
    return timeUntilUnstake === 0;
  }, [timeUntilUnstake]);

  // Actions
  const stake = async (amount: bigint) => {
    try {
      await stakeTokens({ args: [amount] });
      return true;
    } catch (error) {
      console.error('Staking error:', error);
      return false;
    }
  };

  const unstake = async () => {
    try {
      await unstakeTokens();
      return true;
    } catch (error) {
      console.error('Unstaking error:', error);
      return false;
    }
  };

  const claimRewards = async () => {
    try {
      await claimRewardsAction();
      return true;
    } catch (error) {
      console.error('Claim rewards error:', error);
      return false;
    }
  };

  return {
    // États
    balance: tokenBalance?.value,
    stakedAmount: stakeInfo?.amount,
    pendingRewards: stakeInfo?.pendingReward,
    stakingStats: {
      totalStaked: totalStaked || 0n,
      apy: STAKING_CONFIG.APY,
      stakersCount: 0, // À implémenter via un nouveau appel de contrat
    },
    stakeAmount,
    setStakeAmount,
    timeUntilUnstake,
    canUnstake,

    // Actions
    stake,
    unstake,
    claimRewards,

    // États de chargement
    isLoading: isStaking || isUnstaking || isClaiming,
  };
};
