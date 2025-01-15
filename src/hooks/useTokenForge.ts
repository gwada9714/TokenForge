import { useMemo } from 'react';
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { 
  TKN_TOKEN_ADDRESS,
  BASIC_TIER_PRICE,
  PREMIUM_TIER_PRICE,
  TKN_PAYMENT_DISCOUNT 
} from '@/constants/tokenforge';
import TokenForgeFactoryJSON from '../contracts/abi/TokenForgeFactory.json';
import TKNTokenJSON from '../contracts/abi/TKNToken.json';
import { useNetwork } from 'wagmi';

export const TokenForgeFactoryABI = TokenForgeFactoryJSON.abi;
export const TKNTokenABI = TKNTokenJSON.abi;

export const useTokenForge = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1;

  const factoryAddress = useMemo(() => {
    // Retourner l'adresse de la factory pour le réseau actuel
    return '0x...' as `0x${string}`; // À remplacer par l'adresse réelle
  }, [chainId]);

  // Lecture des statistiques globales
  const { data: globalStats } = useContractRead({
    address: factoryAddress,
    abi: TokenForgeFactoryABI,
    functionName: 'getAllTokens',
  });

  // Création d'un nouveau token
  const { write: createToken, data: createTokenData } = useContractWrite({
    address: factoryAddress,
    abi: TokenForgeFactoryABI,
    functionName: 'createToken',
  });

  // Attendre la confirmation de la création
  const { isLoading: isCreating, isSuccess: isCreated } = useWaitForTransaction({
    hash: createTokenData?.hash,
  });

  // Approbation du token TKN pour le paiement
  const { write: approveTokens } = useContractWrite({
    address: TKN_TOKEN_ADDRESS[chainId],
    abi: TKNTokenABI,
    functionName: 'approve',
  });

  const calculatePrice = (isPremium: boolean, payWithTKN: boolean) => {
    const basePrice = isPremium ? PREMIUM_TIER_PRICE : BASIC_TIER_PRICE;
    if (payWithTKN) {
      return basePrice - (basePrice * BigInt(TKN_PAYMENT_DISCOUNT) / 10000n);
    }
    return basePrice;
  };

  const handleCreateToken = async ({
    name,
    symbol,
    decimals,
    initialSupply,
    features,
    isPremium,
    payWithTKN,
  }: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: bigint;
    features: {
      mintable: boolean;
      burnable: boolean;
      pausable: boolean;
    };
    isPremium: boolean;
    payWithTKN: boolean;
  }) => {
    try {
      const price = calculatePrice(isPremium, payWithTKN);

      // Approuver les tokens TKN si nécessaire
      if (payWithTKN) {
        await approveTokens({
          args: [factoryAddress, price],
        });
      }

      // Créer le token
      await createToken({
        args: [
          name,
          symbol,
          decimals,
          initialSupply,
          features.mintable,
          features.burnable,
          features.pausable,
          isPremium,
        ],
        value: payWithTKN ? 0n : price,
      });

      return true;
    } catch (error) {
      console.error('Error creating token:', error);
      return false;
    }
  };

  return {
    globalStats,
    createToken: handleCreateToken,
    isCreating,
    isCreated,
    calculatePrice,
  };
};

export default useTokenForge;
