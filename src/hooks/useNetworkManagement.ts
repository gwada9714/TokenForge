import { useEffect, useCallback, useState } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { toast } from 'react-hot-toast';
import { SUPPORTED_NETWORKS } from '../config/networks';

type SupportedChainId = typeof SUPPORTED_NETWORKS.MAINNET | typeof SUPPORTED_NETWORKS.SEPOLIA;

interface NetworkState {
  isSupported: boolean;
  isSwitching: boolean;
  currentChainId?: number;
  targetChainId?: SupportedChainId;
  error: string | null;
}

export const useNetworkManagement = (preferredNetwork: SupportedChainId = SUPPORTED_NETWORKS.SEPOLIA) => {
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitchingNetwork, error: switchError } = useSwitchNetwork();
  
  const [state, setState] = useState<NetworkState>({
    isSupported: false,
    isSwitching: false,
    error: null
  });

  // Vérifie si le réseau est supporté
  const checkNetworkSupport = useCallback((chainId?: number): boolean => {
    if (!chainId) return false;
    return chainId === SUPPORTED_NETWORKS.MAINNET || chainId === SUPPORTED_NETWORKS.SEPOLIA;
  }, []);

  // Tente de changer de réseau
  const switchToNetwork = useCallback(async (targetChainId: SupportedChainId) => {
    if (!switchNetwork) {
      toast.error('Changement de réseau non supporté par votre wallet');
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isSwitching: true,
        targetChainId,
        error: null
      }));

      await switchNetwork(targetChainId);
      toast.success('Réseau changé avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de réseau:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(`Erreur de changement de réseau: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isSwitching: false }));
    }
  }, [switchNetwork]);

  // Vérifie et met à jour l'état du réseau
  useEffect(() => {
    const currentChainId = chain?.id;
    const isSupported = checkNetworkSupport(currentChainId);

    setState(prev => ({
      ...prev,
      isSupported,
      currentChainId,
      error: switchError?.message || null
    }));

    // Si le réseau n'est pas supporté, suggérer le changement
    if (currentChainId && !isSupported) {
      toast.error(
        'Réseau non supporté. Veuillez utiliser Ethereum Mainnet ou Sepolia.',
        { duration: 5000 }
      );
    }

    // Si un réseau préféré est spécifié et qu'on n'est pas dessus
    if (currentChainId && currentChainId !== preferredNetwork && !state.isSwitching) {
      const networkName = preferredNetwork === SUPPORTED_NETWORKS.SEPOLIA ? 'Sepolia' : 'Mainnet';
      toast.error(
        `Réseau incorrect. Veuillez passer sur ${networkName} via le bouton de changement de réseau.`,
        { duration: 5000 }
      );
    }
  }, [chain, checkNetworkSupport, preferredNetwork, state.isSwitching, switchError?.message]);

  return {
    ...state,
    isSwitching: state.isSwitching || isSwitchingNetwork,
    switchToNetwork,
    supportedNetworks: SUPPORTED_NETWORKS
  };
};
