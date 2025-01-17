import { useContractWrite, useContractRead, useAccount, useNetwork } from 'wagmi';
import TokenForgeFactoryJSON from '../contracts/abi/TokenForgeFactory.json';
import { TokenForgePlansABI } from '../contracts/abis';
import { getContractAddress } from '../config/contracts';
import { toast } from 'react-hot-toast';
import { type Address } from 'viem';

export interface PlanStats {
  price: bigint;
  subscribers: number;
  revenue: bigint;
}

export interface PlanStatsMap {
  [key: number]: PlanStats;
}

export const useTokenForgeAdmin = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id ?? 11155111;

  const factoryAddress = getContractAddress('TOKEN_FACTORY', chainId);
  const plansAddress = getContractAddress('TOKEN_FORGE_PLANS', chainId);

  // Vérifier si l'utilisateur est admin
  const { data: isAdmin } = useContractRead({
    address: factoryAddress,
    abi: TokenForgeFactoryJSON.abi,
    functionName: 'owner',
    watch: true,
  });

  // Récupérer la liste des tokens créés
  const { data: tokenCount } = useContractRead({
    address: factoryAddress,
    abi: TokenForgeFactoryJSON.abi,
    functionName: 'getTokenCount',
    watch: true,
  });

  // Récupérer les statistiques des plans
  const { data: planStats } = useContractRead<typeof TokenForgePlansABI, 'getUserPlan', PlanStatsMap>({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
    watch: true,
  });

  // Fonction pour acheter un plan avec BNB
  const { writeAsync: purchasePlanWithBNB } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithBNB',
  });

  // Fonction pour mettre à jour les prix des plans
  const { writeAsync: updatePlanPrices } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'updatePlanPrices',
  });

  // Fonction pour mettre en pause/reprendre le contrat
  const { writeAsync: togglePause } = useContractWrite({
    address: factoryAddress,
    abi: TokenForgeFactoryJSON.abi,
    functionName: 'togglePause',
  });

  // Fonction pour transférer la propriété
  const { writeAsync: transferOwnership } = useContractWrite({
    address: factoryAddress,
    abi: TokenForgeFactoryJSON.abi,
    functionName: 'transferOwnership',
  });

  const handlePurchasePlanWithBNB = async (planId: number, price: bigint): Promise<{ hash: string }> => {
    try {
      const tx = await purchasePlanWithBNB({
        args: [planId],
        value: price
      });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre la confirmation
      toast.success('Plan acheté avec succès');
      return tx;
    } catch (error) {
      console.error('Erreur lors de l\'achat du plan:', error);
      toast.error('Erreur lors de l\'achat du plan');
      throw error;
    }
  };

  const handleUpdatePlanPrice = async (
    planType: number,
    newBnbPrice: bigint,
    newTknPrice: bigint
  ): Promise<{ hash: string }> => {
    try {
      const tx = await updatePlanPrices({
        args: [planType, newBnbPrice, newTknPrice]
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Prix du plan mis à jour avec succès');
      return tx;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des prix:', error);
      toast.error('Erreur lors de la mise à jour des prix');
      throw error;
    }
  };

  const handleTogglePause = async () => {
    try {
      const tx = await togglePause();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre la confirmation
      toast.success('État de pause modifié avec succès');
      return tx;
    } catch (error) {
      console.error('Erreur lors du changement d\'état de pause:', error);
      toast.error('Erreur lors du changement d\'état de pause');
      throw error;
    }
  };

  const handleTransferOwnership = async (newOwner: Address) => {
    try {
      const tx = await transferOwnership({ args: [newOwner] });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre la confirmation
      toast.success('Propriété transférée avec succès');
      return tx;
    } catch (error) {
      console.error('Erreur lors du transfert de propriété:', error);
      toast.error('Erreur lors du transfert de propriété');
      throw error;
    }
  };

  return {
    isAdmin: isAdmin === address,
    tokenCount: tokenCount ? Number(tokenCount) : 0,
    planStats: planStats || {},
    handlePurchasePlanWithBNB,
    handleUpdatePlanPrice,
    handleTogglePause,
    handleTransferOwnership,
  };
};
