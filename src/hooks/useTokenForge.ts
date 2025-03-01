import { useMemo, useState } from 'react';
import { useContractRead, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { keccak256, toUtf8Bytes } from 'ethers';
import { parseEther, isAddress, formatEther } from 'viem';
import TokenForgeFactoryJSON from '../contracts/abi/TokenForgeFactory.json';
import TKNTokenJSON from '../contracts/abi/TKNToken.json';
import { TokenForgePlansABI } from '../contracts/abis';
import { useNetwork } from './useNetwork';
import { sepolia } from 'wagmi/chains';
import { toast } from 'react-hot-toast';
import { getContractAddress } from '../config/contracts';
import { logger } from '@/utils/logger';

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
      
      logger.info('TokenForge', `Chain ID: ${chainId}`);
      logger.info('TokenForge', 'Network Status:', {
        isConnected,
        chainName: chain?.name,
        chainId: chain?.id,
        userAddress: address,
        factoryAddress: selectedAddress
      });
      
      if (!isAddress(selectedAddress)) {
        logger.error('TokenForge', `Adresse de factory invalide pour le réseau: ${chainId}`);
        return undefined;
      }
      
      return selectedAddress;
    } catch (error) {
      logger.error('TokenForge', 'Erreur lors de la récupération de l\'adresse du factory:', error);
      return undefined;
    }
  }, [chainId, chain, isConnected, address]);

  const plansAddress = useMemo(() => {
    try {
      return getContractAddress('TOKEN_FORGE_PLANS', chainId);
    } catch (error) {
      logger.error('TokenForge', 'Erreur lors de la récupération de l\'adresse des plans:', error);
      return undefined;
    }
  }, [chainId]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Lecture du plan actuel
  const { data: userPlanData } = useContractRead({
    address: plansAddress,
    abi: TokenForgePlansABI,
    functionName: 'getUserPlan',
    args: address ? [address] : undefined,
  });

  const createToken = async (params: TokenDeployParams) => {
    try {
      setIsLoading(true);
      setIsSuccess(false);

      if (!walletClient) {
        throw new Error('Wallet non connecté');
      }

      if (!publicClient) {
        throw new Error('Client public non disponible');
      }

      if (!factoryAddress) {
        throw new Error('Adresse du contrat factory invalide');
      }

      if (!address) {
        throw new Error('Veuillez connecter votre wallet');
      }

      // Vérifier le plan de l'utilisateur
      const userPlan = userPlanData !== undefined ? Number(userPlanData) : null;
      logger.info('TokenForge', `Plan de l'utilisateur: ${userPlan}`);

      if (userPlan === null || userPlan === 0) {
        throw new Error('Vous devez avoir un plan actif pour créer un token');
      }

      // Convertir initialSupply en BigInt avec 18 décimales
      const initialSupplyStr = String(params.initialSupply);
      
      let initialSupplyWei;
      try {
        initialSupplyWei = parseEther(initialSupplyStr);
        logger.info('TokenForge', `Initial supply: ${formatEther(initialSupplyWei)} ETH`);
      } catch (error) {
        logger.error('TokenForge', 'Erreur lors de la conversion de initialSupply', error);
        throw new Error('Montant initial invalide');
      }

      // Générer un salt unique basé sur les paramètres du token et un timestamp
      const saltInput = `${params.name}${params.symbol}${initialSupplyStr}${Date.now()}`;
      const saltBytes = keccak256(toUtf8Bytes(saltInput));

      logger.info('TokenForge', 'Paramètres de création', {
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

      const hash = await walletClient.writeContract({
        address: factoryAddress,
        abi: TokenForgeFactoryABI,
        functionName: 'createERC20',
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
      
      // Attendre la confirmation de la transaction
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      logger.info('TokenForge', 'Token créé avec succès !');
      setIsSuccess(true);
      return receipt;
    } catch (error) {
      logger.error('TokenForge', 'Erreur détaillée lors de la création du token:', error);
      
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
    } finally {
      setIsLoading(false);
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
