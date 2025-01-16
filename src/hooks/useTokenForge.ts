import { useMemo } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { keccak256, toUtf8Bytes, concat } from 'ethers';
import { 
  TKN_TOKEN_ADDRESS,
  BASIC_TIER_PRICE,
  PREMIUM_TIER_PRICE,
  TKN_PAYMENT_DISCOUNT 
} from '@/constants/tokenforge';
import TokenForgeFactoryJSON from '../contracts/abi/TokenForgeFactory.json';
import TKNTokenJSON from '../contracts/abi/TKNToken.json';
import { useNetwork, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const TokenForgeFactoryABI = TokenForgeFactoryJSON.abi;
export const TKNTokenABI = TKNTokenJSON.abi;

interface TokenDeployParams {
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
}

export const useTokenForge = () => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const chainId = chain?.id || sepolia.id;

  const factoryAddress = useMemo(() => {
    const factoryAddresses: Record<number, `0x${string}`> = {
      1: import.meta.env.VITE_TOKEN_FACTORY_MAINNET as `0x${string}`,
      11155111: import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA as `0x${string}`,
    };
    
    console.log('Chain ID:', chainId);
    console.log('Network Status:', {
      isConnected,
      chainName: chain?.name,
      chainId: chain?.id,
      userAddress: address
    });
    
    const selectedAddress = factoryAddresses[chainId];
    console.log('Selected Factory Address:', selectedAddress);
    
    if (!selectedAddress || selectedAddress === '0x0000000000000000000000000000000000000000') {
      console.error('Adresse de factory invalide pour le réseau:', chainId);
      throw new Error(`Adresse de factory non configurée pour le réseau ${chain?.name || chainId}`);
    }
    
    return selectedAddress;
  }, [chainId, chain, isConnected, address]);

  const { write: createERC20, data: createTokenData } = useContractWrite({
    address: factoryAddress,
    abi: TokenForgeFactoryABI,
    functionName: 'createERC20',
    onError: (error) => {
      console.error('Erreur lors de la création du token:', error);
    },
    onSuccess: (data) => {
      console.log('Token créé avec succès:', data);
    },
  });

  const { isLoading: isCreating, isSuccess: isCreated } = useWaitForTransaction({
    hash: createTokenData?.hash,
  });

  const handleCreateToken = async (params: TokenDeployParams) => {
    try {
      if (!isConnected) {
        throw new Error('Wallet non connecté');
      }

      if (!address) {
        throw new Error('Adresse utilisateur non disponible');
      }

      console.log('Déploiement du token avec les paramètres:', {
        ...params,
        network: chain?.name,
        chainId: chain?.id,
        factoryAddress
      });
      
      // Générer un salt unique basé sur le timestamp et l'adresse
      const saltData = concat([
        toUtf8Bytes(Date.now().toString()),
        toUtf8Bytes(address),
        toUtf8Bytes(params.name)
      ]);
      const salt = keccak256(saltData);

      // Définir maxSupply comme le double de l'initialSupply si mintable est true
      const maxSupply = params.features.mintable ? params.initialSupply * BigInt(2) : params.initialSupply;
      
      console.log('Paramètres de création:', {
        name: params.name,
        symbol: params.symbol,
        decimals: params.decimals,
        initialSupply: params.initialSupply.toString(),
        maxSupply: maxSupply.toString(),
        mintable: params.features.mintable,
        salt
      });

      await createERC20({
        args: [
          params.name,
          params.symbol,
          params.decimals,
          params.initialSupply,
          maxSupply,
          params.features.mintable,
          salt
        ],
      });

      return true;
    } catch (error) {
      console.error('Erreur dans handleCreateToken:', error);
      throw error;
    }
  };

  return {
    createToken: handleCreateToken,
    isCreating,
    isCreated,
    factoryAddress,
  };
};

export default useTokenForge;
