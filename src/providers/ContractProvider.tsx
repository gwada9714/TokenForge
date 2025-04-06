import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { getContractAddress } from "../config/contracts";
import { CircularProgress, Box, Alert, Button } from "@mui/material";
import { sepolia } from "viem/chains";

// Types spécifiques pour la gestion des erreurs
type ContractError =
  | "WALLET_DISCONNECTED"
  | "NETWORK_NOT_DETECTED"
  | "WRONG_NETWORK"
  | "CONTRACT_LOAD_ERROR"
  | "NETWORK_SWITCH_ERROR";

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
  error: ContractError | null;
  switchToSepolia?: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType>({
  contractAddress: null,
  isLoading: true,
  error: null,
});

export const useContract = () => useContext(ContractContext);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ContractError | null>(null);

  // Fonction pour basculer vers Sepolia
  const switchToSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
      setError(null);
    } catch (err) {
      setError("NETWORK_SWITCH_ERROR");
    }
  };

  useEffect(() => {
    const loadContract = async () => {
      try {
        setIsLoading(true);

        if (!isConnected) {
          setError("WALLET_DISCONNECTED");
          return;
        }

        if (!chainId) {
          setError("NETWORK_NOT_DETECTED");
          return;
        }

        if (chainId !== sepolia.id) {
          setError("WRONG_NETWORK");
          return;
        }

        const address = await getContractAddress("TOKEN_FACTORY", chainId);
        if (!address || !address.startsWith("0x")) {
          throw new Error("Invalid contract address format");
        }
        setContractAddress(address as `0x${string}`);
        setError(null);
      } catch (err) {
        setError("CONTRACT_LOAD_ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [chainId, isConnected]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error === "WALLET_DISCONNECTED") {
    return (
      <Alert severity="warning">Please connect your wallet to continue.</Alert>
    );
  }

  if (error === "WRONG_NETWORK") {
    return (
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={switchToSepolia}>
            Switch to Sepolia
          </Button>
        }
      >
        Please switch to the Sepolia network to continue.
      </Alert>
    );
  }

  if (error === "NETWORK_NOT_DETECTED") {
    return (
      <Alert severity="error">
        Unable to detect network. Please check your wallet connection.
      </Alert>
    );
  }

  if (error === "CONTRACT_LOAD_ERROR") {
    return (
      <Alert severity="error">
        Failed to load smart contract. Please try again later.
      </Alert>
    );
  }

  if (error === "NETWORK_SWITCH_ERROR") {
    return (
      <Alert severity="error">
        Failed to switch network. Please try manually switching to Sepolia in
        your wallet.
      </Alert>
    );
  }

  return (
    <ContractContext.Provider
      value={{ contractAddress, isLoading, error, switchToSepolia }}
    >
      {children}
    </ContractContext.Provider>
  );
};
