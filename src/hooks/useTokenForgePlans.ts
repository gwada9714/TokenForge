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
    functionName: 'purchasePlan',
  });

  const getUserPlan = useCallback(async (userAddress: string): Promise<UserLevel> => {
    if (!userAddress) return UserLevel.APPRENTICE;
    
    try {
      if (isError) throw new Error('Failed to fetch user plan');
      if (isLoading) return UserLevel.APPRENTICE;
      
      const plan = Number(userPlanData);
      switch (plan) {
        case 1:
          return UserLevel.FORGE;
        case 2:
          return UserLevel.MASTER;
        case 3:
          return UserLevel.DEVELOPER;
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

      const planIndex = Object.values(UserLevel).indexOf(level) + 1;
      
      if (paymentMethod === 'BNB') {
        const value = parseEther(plan.price.bnb.toString());
        await purchasePlan({ args: [planIndex], value });
      } else {
        await purchaseWithToken({ args: [planIndex] });
      }

      toast.success('Plan purchased successfully!');
    } catch (error) {
      console.error('Error purchasing plan:', error);
      toast.error('Failed to purchase plan');
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
