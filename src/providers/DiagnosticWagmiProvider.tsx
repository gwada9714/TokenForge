import React from "react";
import { logger } from "../core/logger";

// Interface pour simuler le contexte Wagmi
const MockWagmiContext = React.createContext({});

/**
 * Un provider de diagnostic pour Wagmi qui fournit des valeurs par défaut
 * et évite les erreurs lors du chargement des composants qui dépendent de Wagmi
 */
export const DiagnosticWagmiProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  logger.info({
    category: "DiagnosticWagmiProvider",
    message: "Initialisation du provider Wagmi de diagnostic",
  });

  // Fournit un contexte simulé pour éviter les erreurs
  return (
    <MockWagmiContext.Provider value={{}}>{children}</MockWagmiContext.Provider>
  );
};

// Mocks des hooks Wagmi courants
export const useConfig = () => {
  logger.info({
    category: "DiagnosticWagmiProvider",
    message: "Utilisation du hook useConfig simulé",
  });
  return {};
};

export const usePublicClient = () => {
  logger.info({
    category: "DiagnosticWagmiProvider",
    message: "Utilisation du hook usePublicClient simulé",
  });
  return {};
};

export const useWalletClient = () => {
  logger.info({
    category: "DiagnosticWagmiProvider",
    message: "Utilisation du hook useWalletClient simulé",
  });
  return {};
};

export const useAccount = () => {
  logger.info({
    category: "DiagnosticWagmiProvider",
    message: "Utilisation du hook useAccount simulé",
  });
  return {
    address: "0x0000000000000000000000000000000000000000",
    isConnected: false,
    connector: null,
    status: "disconnected",
  };
};

// Objet exporté pour remplacer l'import de wagmi
const wagmi = {
  useConfig,
  usePublicClient,
  useWalletClient,
  useAccount,
};

export default wagmi;
