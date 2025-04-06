import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { ServiceType, ServiceRequest, ServiceQuote } from '../types/services';
import { NetworkConfig } from '@/features/auth/types/wallet';
import { getNetwork } from '@/config/networks';
import { serviceManager } from '../services/serviceManager';
import { logger } from '@/core/logger';

export interface UseServiceReturn {
  configureService: (type: ServiceType, config: any) => Promise<void>;
  getQuote: (type: ServiceType, amount?: number) => Promise<ServiceQuote>;
  error: string | null;
  isProcessing: boolean;
  currentRequest: ServiceRequest | null;
}

export const useService = (): UseServiceReturn => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);

  const getNetworkConfig = useCallback((chainId: number): NetworkConfig | undefined => {
    const network = getNetwork(chainId);
    if (!network) return undefined;

    return {
      chainId: network.chain.id,
      name: network.name,
      rpcUrls: [network.rpcUrl],
      nativeCurrency: network.chain.nativeCurrency,
      blockExplorers: {
        default: {
          name: 'Explorer',
          url: network.explorerUrl
        }
      }
    };
  }, []);

  const getQuote = useCallback(async (
    type: ServiceType,
    amount?: number
  ): Promise<ServiceQuote> => {
    if (!chainId) {
      throw new Error('Réseau non connecté');
    }

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      throw new Error('Configuration réseau non trouvée');
    }

    try {
      const quote = await serviceManager.getServiceQuote(
        type,
        networkConfig,
        amount
      );
      
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la demande de devis';
      setError(errorMessage);
      throw error;
    }
  }, [chainId, getNetworkConfig]);

  const configureService = useCallback(async (
    type: ServiceType,
    config: any
  ) => {
    if (!address || !chainId) {
      setError('Wallet non connecté');
      navigate('/connect-wallet');
      return;
    }

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      setError('Configuration réseau non trouvée');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Obtenir un devis pour le service
      const quote = await getQuote(type);

      // Créer la demande de service
      const request = await serviceManager.requestService(
        type,
        networkConfig,
        {
          ...config,
          quote
        }
      );

      setCurrentRequest(request);

      // Rediriger vers la page de paiement
      navigate('/payment', { 
        state: { 
          serviceType: type,
          requestId: request.createdAt,
          amount: quote.totalAmount,
          currency: quote.currency
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la configuration du service';
      setError(errorMessage);
      logger.error('Erreur lors de la configuration du service', { error: err });
    } finally {
      setIsProcessing(false);
    }
  }, [address, chainId, navigate, getQuote, getNetworkConfig]);

  return {
    configureService,
    getQuote,
    error,
    isProcessing,
    currentRequest
  };
}; 