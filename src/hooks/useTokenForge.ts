import { useMemo } from 'react';
import { useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { keccak256, toUtf8Bytes } from 'ethers';
import { parseEther, isAddress, formatEther } from 'viem';
import TokenForgeFactoryJSON from '../contracts/abi/TokenForgeFactory.json';
import TKNTokenJSON from '../contracts/abi/TKNToken.json';
import { TokenForgePlansABI } from '../contracts/abis';
import { useNetwork, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'react-hot-toast';
import { getContractAddress } from '../config/contracts';

export const TokenForgeFactoryABI = TokenForgeFactoryJSON.abi;
export const TKNTokenABI = TKNTokenJSON.abi;

interface TokenDeployParams {
  name: string;
  symbol: string;
  initialSupply: string;
  isMintable: boolean;
}

export const useTokenForge = () => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const chainId = chain?.id || sepolia.id;

  const factoryAddress = useMemo(() => {
    try {
      const selectedAddress = getContractAddress('TOKEN_FACTORY', chainId);
      
      console.log('Chain ID:', chainId);
      console.log('Network Status:', {
        isConnected,
        chainName: chain?.name,
        chainId: chain?.id,
        userAddress: address,
        factoryAddress: selectedAddress
      });
      
      if (!isAddress(selectedAddress)) {
        console.error('Adresse de factory invalide pour le réseau:', chainId);
        return undefined;
      }
      
      return selectedAddress;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse du factory:', error);
      return undefined;
    }
  }, [chainId, chain, isConnected, address]);

  const plansAddress = useMemo(() => {
    try {
      return getContractAddress('TOKEN_FORGE_PLANS', chainId);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse des plans:', error);
      return undefined;
    }
  }, [chainId]);

  // Lecture du plan actuel
  const { data: userPlanData } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
    enabled: !!address && !!plansAddress,
  });

  const { write: writeContract, data: createTokenData } = useContractWrite({
    address: factoryAddress,
    abi: TokenForgeFactoryABI,
    functionName: 'createERC20',
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: createTokenData?.hash,
    onSuccess: () => {
      console.log('Token créé avec succès !');
    },
    onError: (error) => {
      console.error('Erreur lors de la création du token:', error);
    },
  });

  const createToken = async (params: TokenDeployParams) => {
    try {
      if (!writeContract) {
        throw new Error('Contract write not ready');
      }

      if (!factoryAddress) {
        throw new Error('Adresse du contrat factory invalide');
      }

      if (!address) {
        throw new Error('Veuillez connecter votre wallet');
      }

      // Vérifier le plan de l'utilisateur
      const userPlan = userPlanData !== undefined ? Number(userPlanData) : null;
      console.log('Plan de l\'utilisateur:', userPlan);

      if (userPlan === null || userPlan === 0) {
        throw new Error('Vous devez avoir un plan actif pour créer un token');
      }

      // Convertir initialSupply en BigInt avec 18 décimales
      const initialSupplyStr = String(params.initialSupply);
      console.log('Initial supply (avant parseEther):', initialSupplyStr);
      
      let initialSupplyWei;
      try {
        initialSupplyWei = parseEther(initialSupplyStr);
        console.log('Initial supply (après parseEther):', formatEther(initialSupplyWei), 'ETH');
      } catch (error) {
        console.error('Erreur lors de la conversion de initialSupply:', error);
        throw new Error('Montant initial invalide');
      }

      // Générer un salt unique basé sur les paramètres du token et un timestamp
      const saltInput = `${params.name}${params.symbol}${initialSupplyStr}${Date.now()}`;
      const saltBytes = keccak256(toUtf8Bytes(saltInput));

      console.log('Paramètres de création:', {
        name: params.name,
        symbol: params.symbol,
        decimals: 18n,
        initialSupply: initialSupplyWei.toString(),
        maxSupply: initialSupplyWei.toString(),
        mintable: params.isMintable,
        salt: saltBytes,
        factoryAddress,
        userPlan
      });

      await writeContract({
        args: [
          params.name,
          params.symbol,
          18n,
          initialSupplyWei,
          initialSupplyWei,
          params.isMintable,
          saltBytes
        ],
      });

      toast.success('Transaction envoyée !');
    } catch (error) {
      console.error('Erreur détaillée lors de la création du token:', error);
      
      // Gestion spécifique des erreurs
      if (error instanceof Error) {
        if (error.message.includes('InsufficientBalance')) {
          toast.error('Balance insuffisante pour déployer le token');
        } else if (error.message.includes('InvalidInitialSupply')) {
          toast.error('Montant initial invalide');
        } else if (error.message.includes('InvalidMaxSupply')) {
          toast.error('Montant maximum invalide');
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      } else {
        toast.error('Erreur lors de la création du token');
      }
      
      throw error;
    }
  };

  return {
    createToken,
    isCreating: isLoading,
    isSuccess,
    factoryAddress,
    userPlan: userPlanData !== undefined ? Number(userPlanData) : null
  };
};
