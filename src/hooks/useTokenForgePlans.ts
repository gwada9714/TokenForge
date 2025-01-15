import { useCallback } from 'react';
import { useContractWrite, useContractRead, useAccount } from 'wagmi';
import { TokenForgePlansABI } from '../contracts/abis';
import { PlanType } from '../contracts/types';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = ''; // À remplir après le déploiement

export const useTokenForgePlans = () => {
  const { address } = useAccount();

  const { data: userPlan } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { writeAsync: purchasePlan } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlan',
  });

  const handlePurchasePlan = useCallback(async (planType: PlanType) => {
    try {
      const prices = {
        [PlanType.Apprenti]: '0',
        [PlanType.Forgeron]: '0.3',
        [PlanType.MaitreForgeron]: '1',
      };

      await purchasePlan({
        args: [planType],
        value: parseEther(prices[planType]),
      });

      toast.success('Plan acheté avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'achat du plan:', error);
      toast.error('Erreur lors de l\'achat du plan');
    }
  }, [purchasePlan]);

  return {
    userPlan,
    purchasePlan: handlePurchasePlan,
  };
};
