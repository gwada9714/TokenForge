import { useCallback, useEffect, useState } from 'react';
import { useContractWrite, useContractRead, useAccount, useNetwork, useWaitForTransaction, useContractEvent, useBalance } from 'wagmi';
import { TokenForgePlansABI } from '../contracts/abis';
import { PlanType, PLAN_PRICES, validatePlanPrice, formatPlanPrice } from '../types/plans';
import { type Address } from 'viem';
import { toast } from 'react-hot-toast';
import { getContractAddress } from '../config/contracts';

export const useTokenForgePlans = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id ?? 11155111;
  const plansAddress = getContractAddress('TOKEN_FORGE_PLANS', chainId);

  // États
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Obtenir le solde du wallet
  const { data: balance } = useBalance({
    address: address as Address,
    enabled: !!address,
  });

  // Lecture du plan actuel
  const { data: userPlanData, isError, isLoading: isReadLoading, refetch: refetchUserPlan } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
    enabled: !!address,
    onError: (error) => {
      console.log('Erreur lors de la lecture du plan:', error);
      // Ne pas afficher d'erreur à l'utilisateur car c'est probablement juste qu'il n'a pas de plan
    }
  });

  // Détermine le plan actuel de l'utilisateur
  const userPlan = userPlanData !== undefined ? Number(userPlanData) : null;

  // Transaction d'achat
  const { 
    writeAsync: purchasePlanWithBNB,
    data: purchaseData,
    isLoading: isContractLoading,
    error: purchaseError
  } = useContractWrite({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'purchasePlanWithBNB',
  });

  // Attendre la confirmation de la transaction
  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: transactionHash as `0x${string}`,
    onSuccess: () => {
      toast.success('Plan acheté avec succès !');
      refetchUserPlan();
      setTransactionHash(null);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error('Erreur lors de la confirmation: ' + error.message);
      setTransactionHash(null);
      setIsProcessing(false);
    },
    enabled: !!transactionHash,
  });

  // Écouter l'événement PlanPurchased
  useContractEvent({
    address: plansAddress,
    abi: TokenForgePlansABI,
    eventName: 'PlanPurchased',
    listener(logs) {
      if (logs && logs.length > 0) {
        const event = logs[0];
        const { args } = event;
        if (args && args.user === address) {
          toast.success(`Plan ${PlanType[Number(args.planType)]} activé !`);
          refetchUserPlan();
        }
      }
    },
  });

  const buyPlan = useCallback(async (planType: PlanType) => {
    try {
      if (!purchasePlanWithBNB) {
        throw new Error('Contract write not initialized');
      }

      if (!chain) {
        throw new Error('Réseau non détecté');
      }

      // Vérifier si le réseau est supporté
      if (chain.id !== 1 && chain.id !== 11155111) {
        throw new Error(`Réseau non supporté. Veuillez vous connecter à ${chain.id === 1 ? 'Mainnet' : 'Sepolia'}`);
      }

      // Vérifier si le contrat est déployé sur ce réseau
      const contractAddress = getContractAddress('TOKEN_FORGE_PLANS', chain.id);
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contrat non déployé sur ce réseau');
      }

      setIsProcessing(true);
      setTransactionHash(null);

      if (!address) throw new Error('Wallet non connecté');

      const priceInWei = PLAN_PRICES[planType].priceInWei;
      
      console.log('État avant transaction:', {
        address,
        chainId: chain.id,
        planType,
        priceInWei: priceInWei.toString(),
        balance: balance?.value.toString(),
        contractAddress,
        isContractLoading,
        isProcessing,
        isConfirming
      });

      // Vérifier le solde
      if (balance && balance.value < priceInWei) {
        throw new Error(`Solde insuffisant. Vous avez besoin de ${formatPlanPrice(planType)}`);
      }

      console.log('Préparation de la transaction avec:', {
        planType,
        value: priceInWei.toString(),
        contract: plansAddress
      });

      // Envoyer la transaction
      const tx = await purchasePlanWithBNB({
        args: [planType],
        value: priceInWei
      });

      console.log('Transaction envoyée:', {
        hash: tx.hash,
        planType,
        value: priceInWei.toString()
      });

      setTransactionHash(tx.hash);
      return tx;
    } catch (error: any) {
      console.error('Erreur détaillée achat plan:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details || {},
        data: error.data || {}
      });
      
      setIsProcessing(false);
      
      if (error.code === 4001) {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else if (error.code === -32603) {
        throw new Error('Erreur de transaction. Vérifiez votre solde et les frais de gas');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Solde insuffisant pour couvrir le prix et les frais de gas');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Erreur de connexion au réseau. Vérifiez votre connexion internet');
      }
      
      throw new Error(error.message || 'Erreur lors de l\'achat du plan');
    }
  }, [address, chain, balance, purchasePlanWithBNB, plansAddress, isContractLoading, isProcessing, isConfirming]);

  // État de chargement global
  const isLoading = isProcessing || isContractLoading || isConfirming || isReadLoading;

  return {
    buyPlan,
    isLoading,
    userPlan,
    refetchUserPlan
  };
};
