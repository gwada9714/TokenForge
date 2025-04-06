import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePublicClient,
} from "wagmi";
import { type Address, type Hash } from "viem";
import { TokenForgeFactoryABI } from "../abi/TokenForgeFactory";
import { useContract } from "../contexts/ContractContext";
import type { TokenForgeAdminHookReturn } from "../types/hooks";
import { toast } from "react-toastify";

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const { address } = useAccount();
  const { contractAddress, networkStatus } = useContract();
  const publicClient = usePublicClient();
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lecture du propriétaire du contrat
  const { data: ownerAddress, isLoading: ownerLoading } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: "owner",
    query: {
      enabled: !!contractAddress && networkStatus === "connected",
      staleTime: 30_000,
    },
  });

  // Lecture de l'état de pause
  const { data: isPaused = false } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: "paused",
    query: {
      enabled: !!contractAddress && networkStatus === "connected",
      staleTime: 30_000,
    },
  });

  // Hooks d'écriture
  const { writeAsync: pauseContract } = useContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: "pause",
  });

  const { writeAsync: unpauseContract } = useContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: "unpause",
  });

  const { writeAsync: transferContract } = useContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: "transferOwnership",
  });

  const waitForTransaction = async (hash: Hash) => {
    if (!publicClient) throw new Error("Public client not available");
    await publicClient.waitForTransactionReceipt({ hash });
  };

  // Gestion de la pause
  const handleTogglePause = async () => {
    if (!contractAddress || !pauseContract || !unpauseContract) return;

    try {
      setIsProcessing(true);
      if (isPaused) {
        setIsUnpausing(true);
        const tx = await unpauseContract({
          address: contractAddress as Address,
        });
        if (tx?.hash) {
          await waitForTransaction(tx.hash);
        }
        setIsUnpausing(false);
        toast.success("Contract unpaused");
      } else {
        setIsPausing(true);
        const tx = await pauseContract({
          address: contractAddress as Address,
        });
        if (tx?.hash) {
          await waitForTransaction(tx.hash);
        }
        setIsPausing(false);
        toast.success("Contract paused");
      }
    } catch (error) {
      console.error("Error toggling pause:", error);
      toast.error("Failed to toggle pause state");
    } finally {
      setIsProcessing(false);
      setIsPausing(false);
      setIsUnpausing(false);
    }
  };

  // Transfert de propriété
  const transferOwnership = async (newOwner: Address) => {
    if (!contractAddress || !transferContract) return;

    try {
      setIsTransferring(true);
      const tx = await transferContract({
        address: contractAddress as Address,
        args: [newOwner],
      });
      if (tx?.hash) {
        await waitForTransaction(tx.hash);
      }
      toast.success("Ownership transferred successfully");
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast.error("Failed to transfer ownership");
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    error: null,
    isPaused,
    isOwner: ownerAddress === address,
    owner: ownerAddress as Address | undefined,
    networkStatus: {
      isConnected: networkStatus === "connected",
      isCorrectNetwork: networkStatus === "connected",
      requiredNetwork: "mainnet",
      networkName: networkStatus === "connected" ? "mainnet" : undefined,
      error: networkStatus === "wrong_network" ? "Wrong network" : undefined,
    },
    isLoading:
      ownerLoading ||
      isPausing ||
      isUnpausing ||
      isTransferring ||
      isProcessing,
    transferOwnership,
    isTransferring,
    isPausing,
    isUnpausing,
    isProcessing,
    handleTogglePause,
    contractAddress: contractAddress as Address | undefined,
    contract: contractAddress
      ? {
          address: contractAddress as Address,
          abi: TokenForgeFactoryABI.abi,
        }
      : undefined,
  };
};
