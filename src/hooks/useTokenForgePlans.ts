import { useCallback } from 'react';
import { useContractWrite, useContractRead, useAccount, useNetwork } from 'wagmi';
import { TokenForgePlansABI } from '../contracts/abis';
import { UserLevel, DEFAULT_PLANS } from '../types/plans';
import { parseEther, type Address } from 'viem';
import { toast } from 'react-hot-toast';
import { getContractAddress } from '../config/contracts';

export const useTokenForgePlans = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const plansAddress = getContractAddress('TOKEN_FORGE_PLANS', chain?.id ?? 1) as Address;

  // Lecture du plan actuel de l'utilisateur
  const { data: userPlanData, isError, isLoading } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Achat avec BNB
  const { writeAsync: purchasePlan } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlan',
  });

  // Achat avec TKN
  const { writeAsync: purchaseWithToken } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithToken',
  });

  const getUserPlan = useCallback(async (userAddress: string): Promise<UserLevel> => {
    if (!userAddress) return UserLevel.APPRENTICE;
    
    try {
      if (isError) throw new Error('Failed to fetch user plan');
      if (isLoading) return UserLevel.APPRENTICE;
      
      const plan = Number(userPlanData);
      switch (plan) {
        case 1:
          return UserLevel.BASIC;
        case 2:
          return UserLevel.PREMIUM;
        default:
          return UserLevel.APPRENTICE;
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
      return UserLevel.APPRENTICE;
    }
  }, [userPlanData, isError, isLoading]);

  const buyPlan = useCallback(async (level: UserLevel, paymentMethod: 'BNB' | 'TKN') => {
    try {
      const plan = DEFAULT_PLANS[level];
      if (!plan) throw new Error('Invalid plan level');

      let planIndex: bigint;
      switch (level) {
        case UserLevel.BASIC:
          planIndex = BigInt(1);
          break;
        case UserLevel.PREMIUM:
          planIndex = BigInt(2);
          break;
        default:
          throw new Error('Invalid plan level');
      }
      
      if (paymentMethod === 'BNB') {
        const value = parseEther(plan.price.bnb.toString());
        await purchasePlan({ args: [planIndex], value });
        toast.success('Plan acheté avec succès !');
      } else {
        await purchaseWithToken({ args: [planIndex] });
        toast.success('Plan acheté avec TKN avec succès !');
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      toast.error('Échec de l\'achat du plan');
      throw error;
    }
  }, [purchasePlan, purchaseWithToken]);

  return {
    getUserPlan,
    buyPlan,
    isLoading,
    isError
  };
};
