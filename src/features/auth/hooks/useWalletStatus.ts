import {
  WalletConnectionState,
  WalletConnectionStatus,
} from "../../../types/authTypes";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useConnect,
  useDisconnect,
  useWalletClient,
} from "wagmi";
import { useState, useEffect } from "react";
import { logger } from "../../../core/logger";

// Types pour les providers de wallet
interface WalletProvider {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
}

// Interface pour l'objet ethereum injecté dans window
interface EthereumProvider {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  providers?: WalletProvider[];
  request?: (...args: any[]) => Promise<any>;
  enable?: () => Promise<any>;
  selectedAddress?: string;
}

// Étendre l'interface Window pour inclure ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function useWalletStatus(): {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: `0x${string}` | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  hasInjectedProvider: boolean;
  walletClient: ReturnType<typeof useWalletClient>["data"];
  walletState: WalletConnectionState;
} {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [hasInjectedProvider, setHasInjectedProvider] =
    useState<boolean>(false);

  /**
   * Vérifie si un wallet est disponible dans le navigateur
   */
  const checkWalletAvailability = async (): Promise<boolean> => {
    try {
      // Vérifier si ethereum est injecté dans window
      const hasEthereum =
        typeof window !== "undefined" && window.ethereum !== undefined;

      // Vérifier si des connecteurs sont disponibles via wagmi
      const hasConnectors = connectors && connectors.length > 0;

      if (hasEthereum) {
        // Vérifier les propriétés spécifiques des wallets
        const isMetaMask = window.ethereum?.isMetaMask === true;
        const isTrust = window.ethereum?.isTrust === true;
        const isCoinbase = window.ethereum?.isCoinbaseWallet === true;
        const isWalletConnect = window.ethereum?.isWalletConnect === true;
        const hasRequest = typeof window.ethereum?.request === "function";
        const hasEnable = typeof window.ethereum?.enable === "function";
        const hasSelectedAddress = Boolean(window.ethereum?.selectedAddress);

        // Vérifier s'il y a un provider de wallet supporté
        const hasProvider =
          isMetaMask || isTrust || isCoinbase || isWalletConnect;

        // Vérification complète : nous avons besoin d'au moins UN provider supporté
        // ET soit la méthode request soit la méthode enable pour considérer qu'un wallet est disponible
        const providerFunctionsAvailable = hasRequest || hasEnable;

        logger.debug({
          category: "Wallet",
          message: "Vérification du wallet",
          data: {
            isMetaMask,
            isTrust,
            isCoinbase,
            isWalletConnect,
            hasRequest,
            hasEnable,
            hasSelectedAddress,
            hasProvider,
            providerFunctionsAvailable,
            hasConnectors,
            connectorCount: connectors?.length || 0,
          },
        });

        // Mettre à jour l'état en fonction de la disponibilité réelle
        // Il faut avoir à la fois un provider reconnu ET des méthodes disponibles
        const injectedProviderFound = hasProvider && providerFunctionsAvailable;
        setHasInjectedProvider(injectedProviderFound);

        return injectedProviderFound;
      } else if (hasConnectors) {
        // Si window.ethereum n'est pas disponible mais qu'il y a des connecteurs,
        // vérifier plus spécifiquement leur type et leur état

        const validConnectors = connectors.filter(
          (connector) => connector.ready || connector.id === "walletConnect" // WalletConnect est toujours "ready"
        );

        const hasValidConnectors = validConnectors.length > 0;

        logger.info({
          category: "Wallet",
          message: hasValidConnectors
            ? "Connecteurs valides disponibles sans window.ethereum"
            : "Connecteurs présents mais aucun n'est prêt",
          data: {
            connectorCount: connectors.length,
            validConnectorCount: validConnectors.length,
            connectorIds: connectors.map((c) => c.id),
            validConnectorIds: validConnectors.map((c) => c.id),
          },
        });

        setHasInjectedProvider(hasValidConnectors);
        return hasValidConnectors;
      }

      logger.warn({
        category: "Wallet",
        message: "Aucun provider de wallet détecté",
      });

      // Ne PAS définir hasInjectedProvider à true quand il n'y a pas de provider
      setHasInjectedProvider(false);
      return false;
    } catch (error) {
      logger.error({
        category: "Wallet",
        message: "Erreur lors de la vérification du wallet",
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // En cas d'erreur, ne pas définir hasInjectedProvider à true
      setHasInjectedProvider(false);
      return false;
    }
  };

  // Vérifier la disponibilité d'un provider injecté au chargement
  useEffect(() => {
    const checkInjectedProvider = async () => {
      await checkWalletAvailability();
    };

    // Exécuter la vérification initiale
    checkInjectedProvider();

    // Vérifier aussi après un court délai pour s'assurer que les extensions ont eu le temps de s'initialiser
    const timeoutId = setTimeout(() => {
      checkInjectedProvider();
    }, 1000);

    // Surveiller les changements dans l'objet ethereum
    const handleEthereumChanged = () => {
      checkInjectedProvider();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("ethereum#initialized", handleEthereumChanged);
    }

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "ethereum#initialized",
          handleEthereumChanged
        );
      }
    };
  }, []);

  // Déterminer si le réseau actuel est correct (pour l'instant, nous acceptons tous les réseaux)
  // Dans une utilisation réelle, vous devriez vérifier par rapport à une liste de chaînes valides
  const isCorrectNetwork = true;

  // État combiné du wallet pour faciliter les vérifications dans l'interface
  const walletStatus = !hasInjectedProvider
    ? WalletConnectionStatus.NO_WALLET
    : !isConnected
    ? WalletConnectionStatus.DISCONNECTED
    : !isCorrectNetwork
    ? WalletConnectionStatus.WRONG_NETWORK
    : WalletConnectionStatus.CONNECTED;

  // Construire l'objet d'état complet du wallet
  const walletState: WalletConnectionState = {
    isConnected,
    address: address || null,
    chainId: chainId || null,
    isCorrectNetwork,
    walletClient: walletClient || null,
    status: walletStatus,
  };

  /**
   * Se connecter au wallet
   */
  const connect = async (): Promise<void> => {
    try {
      if (!hasInjectedProvider) {
        logger.error({
          category: "Wallet",
          message: "Tentative de connexion sans provider disponible",
        });
        throw new Error(
          "Aucun wallet détecté. Veuillez installer MetaMask ou un wallet compatible."
        );
      }

      // Trouver le premier connecteur disponible
      const availableConnector = connectors.find(
        (c) => c.ready || c.id === "walletConnect"
      );

      if (!availableConnector) {
        throw new Error("Aucun connecteur disponible");
      }

      logger.info({
        category: "Wallet",
        message: "Tentative de connexion au wallet",
        data: { connector: availableConnector.id },
      });

      // Connexion via wagmi
      await connectAsync({ connector: availableConnector });

      logger.info({
        category: "Wallet",
        message: "Connecté au wallet avec succès",
      });
    } catch (error) {
      logger.error({
        category: "Wallet",
        message: "Erreur lors de la connexion au wallet",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  };

  /**
   * Se déconnecter du wallet
   */
  const disconnect = async (): Promise<void> => {
    try {
      await disconnectAsync();
      logger.info({
        category: "Wallet",
        message: "Déconnecté du wallet avec succès",
      });
    } catch (error) {
      logger.error({
        category: "Wallet",
        message: "Erreur lors de la déconnexion du wallet",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  };

  /**
   * Changer de réseau
   */
  const switchNetwork = async (targetChainId: number): Promise<void> => {
    try {
      await switchChain({ chainId: targetChainId });
      logger.info({
        category: "Wallet",
        message: "Changement de réseau réussi",
        data: { chainId: targetChainId },
      });
    } catch (error) {
      logger.error({
        category: "Wallet",
        message: "Erreur lors du changement de réseau",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  };

  return {
    isConnected,
    isCorrectNetwork,
    address: address || null,
    connect,
    disconnect,
    switchNetwork,
    hasInjectedProvider,
    walletClient,
    walletState,
  };
}
