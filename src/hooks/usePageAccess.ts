import { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useContract } from "../contexts/ContractContext";
import { useTokenForgeAdmin } from "./useTokenForgeAdmin";
import { useAccount } from "wagmi";

interface PageAccessState {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePageAccess = (requireAdmin: boolean = false) => {
  const { isConnected, isCorrectNetwork } = useWeb3();
  const { address } = useAccount();
  const { networkStatus, isLoading: contractLoading } = useContract();
  const { isOwner, isLoading: adminLoading } = useTokenForgeAdmin();
  const [state, setState] = useState<PageAccessState>({
    canAccess: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Vérifier la connexion du wallet
        if (!isConnected || !address) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Veuillez connecter votre wallet",
          });
          return;
        }

        // Vérifier le réseau
        if (!isCorrectNetwork || networkStatus === "wrong_network") {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Veuillez vous connecter au réseau Ethereum ou Sepolia",
          });
          return;
        }

        // Si admin requis, vérifier les droits admin
        if (requireAdmin && !isOwner) {
          setState({
            canAccess: false,
            isLoading: false,
            error: "Accès non autorisé",
          });
          return;
        }

        // Tout est OK
        setState({
          canAccess: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          canAccess: false,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        });
      }
    };

    // Ne vérifier l'accès que lorsque toutes les dépendances sont chargées
    if (!contractLoading && (!requireAdmin || !adminLoading)) {
      checkAccess();
    }
  }, [
    isConnected,
    address,
    isCorrectNetwork,
    networkStatus,
    requireAdmin,
    isOwner,
    contractLoading,
    adminLoading,
  ]);

  return state;
};
