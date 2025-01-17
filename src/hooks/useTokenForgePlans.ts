import { useCallback, useEffect } from 'react';
import { useContractWrite, useContractRead, useAccount, useNetwork, useWaitForTransaction, useContractEvent } from 'wagmi';
import { TokenForgePlansABI } from '../contracts/abis';
import { PlanType, DEFAULT_PLANS, getPlanPriceInWei } from '../types/plans';
import { type Address } from 'viem';
import { toast } from 'react-hot-toast';
import { getContractAddress } from '../config/contracts';

export const useTokenForgePlans = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id ?? 11155111; // Default to Sepolia
  const plansAddress = getContractAddress('TOKEN_FORGE_PLANS', chainId);

  // Lecture du plan actuel de l'utilisateur
  const { data: userPlanData, isError, isLoading: isReadLoading, refetch: refetchUserPlan } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Lecture des features du plan
  const { data: planFeaturesData } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getPlanFeatures',
    args: userPlanData !== undefined ? [userPlanData] : undefined,
    enabled: userPlanData !== undefined,
  });

  // Achat avec BNB
  const { 
    writeAsync: purchasePlanWithBNB,
    data: purchaseData,
    isLoading: isPurchaseLoading,
    error: purchaseError
  } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithBNB',
  });

  // Attendre la confirmation de la transaction
  const { isLoading: isWaitingTransaction } = useWaitForTransaction({
    hash: purchaseData?.hash,
    onSuccess: () => {
      refetchUserPlan();
      toast.success('Plan acheté avec succès !');
    },
    onError: (error) => {
      console.error('Erreur lors de la confirmation:', error);
      toast.error('Erreur lors de la confirmation de la transaction');
    }
  });

  // Écouter l'événement PlanPurchased
  useContractEvent({
    address: plansAddress,
    abi: TokenForgePlansABI,
    eventName: 'PlanPurchased',
    listener(log) {
      console.log('Plan acheté:', log);
    },
  });

  const getUserPlan = useCallback(async (userAddress: string): Promise<PlanType> => {
    if (!userAddress) return PlanType.Apprenti;
    
    try {
      if (isError) throw new Error('Failed to fetch user plan');
      if (isReadLoading) return PlanType.Apprenti;
      
      return userPlanData as PlanType;
    } catch (error) {
      console.error('Error fetching user plan:', error);
      return PlanType.Apprenti;
    }
  }, [userPlanData, isError, isReadLoading]);

  const buyPlan = useCallback(async (planType: PlanType) => {
    try {
      if (!address) throw new Error('Wallet non connecté');
      if (!chain) throw new Error('Réseau non supporté');
      
      console.log('Achat du plan...', {
        planType,
        chainId,
        plansAddress,
        userAddress: address
      });

      // Convertir le prix en wei
      const priceInWei = getPlanPriceInWei(planType);
      
      console.log('Prix du plan:', {
        planType,
        priceInWei: priceInWei.toString()
      });

      const tx = await purchasePlanWithBNB({ 
        args: [planType],
        value: priceInWei
      });

      console.log('Transaction envoyée:', tx);
      
      return tx;
    } catch (error) {
      console.error('Error purchasing plan:', error);
      if (purchaseError) {
        console.error('Contract error:', purchaseError);
      }
      throw error;
    }
  }, [address, chain, chainId, purchasePlanWithBNB, purchaseError]);

  return {
    getUserPlan,
    buyPlan,
    isLoading: isReadLoading || isPurchaseLoading || isWaitingTransaction,
    isError,
    planFeatures: planFeaturesData,
    currentPlan: userPlanData as PlanType
  };
};
