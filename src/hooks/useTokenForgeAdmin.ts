import { useContractRead, useContractWrite, usePrepareContractWrite, useAccount, useNetwork, useWaitForTransaction } from 'wagmi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TokenForgeFactory from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';
import { Address, getAddress, isAddress } from 'viem';

interface TokenForgeAdminHook {
  isOwner: boolean;
  isPaused: unknown;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  error: string | null;
  isCorrectNetwork: boolean;
  isWaitingForTx: boolean;
  isValidContract: boolean;
  isAdmin: boolean;
  owner: Address | undefined;
  paused: unknown;
  transferOwnership: ((address: string) => Promise<void>) | null;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  setNewOwnerAddress: ((address: string) => void) | null;
  isLoading: boolean;
  pauseAvailable: boolean;
}

export const useTokenForgeAdmin = (): TokenForgeAdminHook => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress } = useContract();
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Vérifier si nous sommes sur le bon réseau
  const isCorrectNetwork = useMemo(() => {
    const isOnSepolia = chain?.id === 11155111;
    console.log('Network check:', { 
      chainId: chain?.id, 
      chainName: chain?.name,
      isOnSepolia,
      expectedChainId: 11155111
    });
    return isOnSepolia;
  }, [chain]);

  // Vérifier si l'adresse du contrat est valide
  const isValidContract = useMemo(() => {
    if (!contractAddress) {
      console.log('Contract address is missing');
      return false;
    }
    try {
      const isValid = isAddress(contractAddress);
      console.log('Contract address validation:', { 
        contractAddress, 
        isValid 
      });
      return isValid;
    } catch (err) {
      console.error('Invalid contract address:', err);
      return false;
    }
  }, [contractAddress]);

  // Attendre la confirmation de la transaction
  const { isLoading: isWaitingForTx } = useWaitForTransaction({
    hash: txHash,
    onSuccess: () => {
      console.log('Transaction confirmed successfully:', txHash);
      setTxHash(undefined);
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Transaction failed:', { 
        error: err, 
        message: errorMessage,
        txHash 
      });
      setError(`Transaction failed: ${errorMessage}`);
      setTxHash(undefined);
    },
  });

  // Lecture du propriétaire du contrat
  const { data: owner, isError: ownerError } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'owner',
    enabled: isValidContract && isCorrectNetwork,
    onSuccess: (data) => {
      console.log('Contract owner read successfully:', data);
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error reading owner:', { 
        error: err, 
        message: errorMessage,
        contractAddress 
      });
      setError(`Failed to read contract owner: ${errorMessage}`);
    }
  }) as { data: Address | undefined, isError: boolean };

  // Vérifier si l'utilisateur actuel est le propriétaire
  const isOwner = useMemo(() => {
    if (!address || !owner || !isCorrectNetwork || !isValidContract) {
      console.log('Owner check prerequisites not met:', { 
        hasAddress: !!address, 
        hasOwner: !!owner,
        isCorrectNetwork,
        isValidContract
      });
      return false;
    }
    try {
      const normalizedOwner = getAddress(owner);
      const normalizedAddress = getAddress(address);
      const result = normalizedOwner === normalizedAddress;
      console.log('Owner check:', { 
        normalizedOwner, 
        normalizedAddress, 
        result,
        contractAddress 
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error comparing addresses:', { 
        error: err, 
        message: errorMessage,
        owner,
        address 
      });
      setError(`Error verifying ownership: ${errorMessage}`);
      return false;
    }
  }, [owner, address, isCorrectNetwork, isValidContract, contractAddress]);

  // État du contrat (paused)
  const { data: isPaused, isError: pausedError } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    enabled: isValidContract && isCorrectNetwork,
    onSuccess: (data) => {
      console.log('Contract paused state read successfully:', data);
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error reading paused state:', { 
        error: err, 
        message: errorMessage,
        contractAddress 
      });
      setError(`Failed to read contract state: ${errorMessage}`);
    }
  });

  // Préparation de la fonction pause
  const { config: pauseConfig, error: pausePrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    enabled: isValidContract && isOwner && isCorrectNetwork,
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error preparing pause:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        isOwner,
        isCorrectNetwork 
      });
      setError(`Failed to prepare pause transaction: ${errorMessage}`);
    }
  });

  // Préparation de la fonction unpause
  const { config: unpauseConfig, error: unpausePrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    enabled: isValidContract && isOwner && isCorrectNetwork,
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error preparing unpause:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        isOwner,
        isCorrectNetwork 
      });
      setError(`Failed to prepare unpause transaction: ${errorMessage}`);
    }
  });

  // Fonction pause
  const { writeAsync: pauseContract } = useContractWrite(pauseConfig);

  // Fonction unpause
  const { writeAsync: unpauseContract } = useContractWrite(unpauseConfig);

  const pause = useCallback(async () => {
    if (!isCorrectNetwork) {
      const errorMessage = `Please connect to Sepolia network (current: ${chain?.name})`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isValidContract) {
      const errorMessage = `Invalid contract address: ${contractAddress}`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isOwner) {
      const errorMessage = 'Only owner can pause the contract';
      console.error(errorMessage, { address, owner });
      setError(errorMessage);
      return;
    }
    if (!pauseContract) {
      const errorMessage = 'Pause function not available';
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }

    try {
      setError(null);
      const tx = await pauseContract();
      setTxHash(tx.hash);
      console.log('Pause transaction sent:', { 
        hash: tx.hash,
        from: address,
        to: contractAddress 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in pause:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        from: address 
      });
      setError(`Failed to pause contract: ${errorMessage}`);
      throw err;
    }
  }, [pauseContract, isOwner, isCorrectNetwork, isValidContract, chain?.name, contractAddress, address, owner]);

  const unpause = useCallback(async () => {
    if (!isCorrectNetwork) {
      const errorMessage = `Please connect to Sepolia network (current: ${chain?.name})`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isValidContract) {
      const errorMessage = `Invalid contract address: ${contractAddress}`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isOwner) {
      const errorMessage = 'Only owner can unpause the contract';
      console.error(errorMessage, { address, owner });
      setError(errorMessage);
      return;
    }
    if (!unpauseContract) {
      const errorMessage = 'Unpause function not available';
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }

    try {
      setError(null);
      const tx = await unpauseContract();
      setTxHash(tx.hash);
      console.log('Unpause transaction sent:', { 
        hash: tx.hash,
        from: address,
        to: contractAddress 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in unpause:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        from: address 
      });
      setError(`Failed to unpause contract: ${errorMessage}`);
      throw err;
    }
  }, [unpauseContract, isOwner, isCorrectNetwork, isValidContract, chain?.name, contractAddress, address, owner]);

  // État pour la nouvelle adresse du propriétaire
  const [newOwnerAddress, setNewOwnerAddress] = useState<Address>();

  // Préparation de la fonction transferOwnership
  const { config: transferConfig, error: transferPrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'transferOwnership',
    args: newOwnerAddress ? [newOwnerAddress] : undefined,
    enabled: isValidContract && isOwner && isCorrectNetwork && !!newOwnerAddress,
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error preparing transfer ownership:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        isOwner,
        isCorrectNetwork,
        newOwnerAddress
      });
      setError(`Failed to prepare transfer ownership: ${errorMessage}`);
    }
  });

  // Fonction transferOwnership
  const { writeAsync: transferOwnershipContract } = useContractWrite(transferConfig);

  const transferOwnership = useCallback(async (address: string) => {
    if (!isCorrectNetwork) {
      const errorMessage = `Please connect to Sepolia network (current: ${chain?.name})`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isValidContract) {
      const errorMessage = `Invalid contract address: ${contractAddress}`;
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    if (!isOwner) {
      const errorMessage = 'Only owner can transfer ownership';
      console.error(errorMessage, { address: address, owner });
      setError(errorMessage);
      return;
    }
    if (!address || !isAddress(address)) {
      const errorMessage = 'Valid new owner address is required';
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }

    try {
      setError(null);
      const formattedAddress = getAddress(address);
      setNewOwnerAddress(formattedAddress);
      
      if (!transferOwnershipContract) {
        throw new Error('Transfer ownership function not available');
      }

      const tx = await transferOwnershipContract();
      setTxHash(tx.hash);
      console.log('Transfer ownership transaction sent:', { 
        hash: tx.hash,
        from: address,
        to: contractAddress,
        newOwner: formattedAddress
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in transfer ownership:', { 
        error: err, 
        message: errorMessage,
        contractAddress,
        from: address 
      });
      setError(`Failed to transfer ownership: ${errorMessage}`);
      throw err;
    }
  }, [transferOwnershipContract, isOwner, isCorrectNetwork, isValidContract, chain?.name, contractAddress, owner]);

  // Gestion des erreurs
  useEffect(() => {
    if (!isCorrectNetwork) {
      setError(`Please connect to Sepolia network (current: ${chain?.name})`);
    } else if (!isValidContract) {
      setError(`Invalid contract address: ${contractAddress}`);
    } else if (ownerError || pausedError || pausePrepError || unpausePrepError || transferPrepError) {
      const errorMessage = pausePrepError?.message || unpausePrepError?.message || transferPrepError?.message || 'Error interacting with contract';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [isCorrectNetwork, isValidContract, ownerError, pausedError, pausePrepError, unpausePrepError, transferPrepError, chain?.name, contractAddress]);

  return {
    isOwner,
    isPaused,
    pause,
    unpause,
    error,
    isCorrectNetwork,
    isWaitingForTx,
    isValidContract,
    isAdmin: isOwner,
    owner,
    paused: isPaused,
    transferOwnership,
    isPausing: isWaitingForTx && txHash !== undefined,
    isUnpausing: isWaitingForTx && txHash !== undefined,
    isTransferring: isWaitingForTx && txHash !== undefined,
    setNewOwnerAddress: (address: string) => {
      try {
        if (!isAddress(address)) {
          throw new Error('Invalid address format');
        }
        setNewOwnerAddress(address as Address);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid address';
        console.error('Error setting new owner address:', {
          error: err,
          message: errorMessage,
          address
        });
        setError(`Invalid address: ${errorMessage}`);
      }
    },
    isLoading: isWaitingForTx,
    pauseAvailable: isOwner && !isPaused && isCorrectNetwork && isValidContract
  };
};
