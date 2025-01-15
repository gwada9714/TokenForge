import { useCallback } from 'react';
import { useContractWrite, useContractRead, useAccount } from 'wagmi';
import { TokenForgePlansABI } from '../contracts/abis';
import { UserLevel, DEFAULT_PLANS } from '../types/plans';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = ''; // À remplir après le déploiement

export const useTokenForgePlans = () => {
  const { address } = useAccount();

  // Lecture du plan actuel de l'utilisateur
  const { data: userPlanData, isError, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  // Achat avec BNB
  const { writeAsync: purchasePlanWithBNB } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithBNB',
  });

  // Achat avec TKN
  const { writeAsync: purchasePlanWithTKN } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithTKN',
  });

  const getUserPlan = useCallback(async (userAddress: string): Promise<UserLevel> => {
    if (!userAddress) return UserLevel.APPRENTICE;
    
    try {
      if (isError) throw new Error('Failed to fetch user plan');
      if (isLoading) return UserLevel.APPRENTICE;
      
      // Conversion de la réponse du contrat en UserLevel
      const planLevel = userPlanData as number;
      switch (planLevel) {
        case 0:
          return UserLevel.APPRENTICE;
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

  const upgradeToPlan = useCallback(async (newLevel: UserLevel, paymentMethod: 'BNB' | 'TKN' = 'BNB') => {
    try {
      const plan = DEFAULT_PLANS[newLevel];
      
      if (paymentMethod === 'BNB') {
        await purchasePlanWithBNB({
          args: [Object.values(UserLevel).indexOf(newLevel)],
          value: parseEther(plan.price.bnb.toString()),
        });
      } else {
        await purchasePlanWithTKN({
          args: [Object.values(UserLevel).indexOf(newLevel)],
        });
      }

      toast.success(`Plan ${plan.name} acheté avec succès!`);
    } catch (error) {
      console.error('Erreur lors de l\'achat du plan:', error);
      toast.error('Erreur lors de l\'achat du plan');
      throw error;
    }
  }, [purchasePlanWithBNB, purchasePlanWithTKN]);

  return {
    getUserPlan,
    upgradeToPlan,
    isLoading,
    isError
  };
};
