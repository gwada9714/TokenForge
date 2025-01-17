import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useNetwork } from 'wagmi';
import { useState, useEffect } from 'react';
import TokenForgeFactoryABI from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';
import { isAddress, Address } from 'viem';

export const useTokenForgeAdmin = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress, isLoading: contractLoading } = useContract();
  const [newOwnerAddress, setNewOwnerAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPauseAvailable, setIsPauseAvailable] = useState(false);

  // Log initial state
  useEffect(() => {
    console.log('TokenForgeAdmin Hook State:', {
      address,
      chainId: chain?.id,
      contractAddress,
      contractLoading,
      isPauseAvailable
    });
  }, [address, chain?.id, contractAddress, contractLoading, isPauseAvailable]);

  // Lecture du propriétaire du contrat avec gestion du réseau
  const { data: owner, isSuccess: ownerLoaded, isError: ownerError, isLoading: ownerLoading } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && chain?.id === 11155111,
    chainId: chain?.id,
    watch: true,
    onError(error) {
      console.error('Error reading owner:', error);
      setError('Failed to read contract state. Please verify your network connection and contract deployment.');
    },
    onSuccess(data) {
      console.log('Owner read success:', {
        owner: data,
        currentAddress: address,
        contractAddress,
        chainId: chain?.id,
        isAdmin: data === address,
        network: chain?.network,
      });
      setError(null);
    }
  });

  // Lecture de l'état de pause avec gestion du réseau
  const { data: paused, isError: pausedError, isLoading: pausedLoading } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && chain?.id === 11155111 && isPauseAvailable,
    chainId: chain?.id,
    watch: true,
    onError(error) {
      console.error('Error reading paused state:', error);
      setIsPauseAvailable(false);
      setError('Failed to read contract pause state. The contract may not be properly initialized.');
    },
    onSuccess(data) {
      console.log('Paused state read success:', {
        paused: data,
        contractAddress,
        chainId: chain?.id,
        network: chain?.network,
      });
      setIsPauseAvailable(true);
      setError(null);
    }
  });

  // Vérification de l'état du contrat et du réseau
  useEffect(() => {
    if (!chain) {
      setError('Please connect to a network');
      return;
    }

    if (chain.id !== 11155111) {
      setError(`Please switch to Sepolia network. Current network: ${chain.name}`);
      return;
    }

    const expectedOwner = import.meta.env.VITE_DEPLOYMENT_OWNER;
    if (!expectedOwner) {
      console.error('VITE_DEPLOYMENT_OWNER not configured in environment');
      setError('Contract owner configuration missing');
      return;
    }

    if (owner && typeof owner === 'string' && owner.toLowerCase() !== expectedOwner.toLowerCase()) {
      console.error('Contract owner mismatch:', {
        currentOwner: owner,
        expectedOwner,
        contractAddress
      });
      setError('Contract owner verification failed');
      return;
    }

    setError(null);
  }, [chain, owner, contractAddress]);

  // Vérification des fonctions de pause
  useEffect(() => {
    if (!contractAddress || !chain?.id || contractLoading) {
      setIsPauseAvailable(false);
      return;
    }

    const pauseFunctions = TokenForgeFactoryABI.abi.filter(
      (item) => item.type === 'function' && ['paused', 'pause', 'unpause'].includes(item.name || '')
    );

    console.log('Contract functions check:', {
      contractAddress,
      chainId: chain.id,
      pauseFunctions: pauseFunctions.map(f => f.name),
      rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
      owner: import.meta.env.VITE_DEPLOYMENT_OWNER
    });

    const hasPauseFunction = pauseFunctions.length === 3;
    setIsPauseAvailable(hasPauseFunction);

    if (!hasPauseFunction) {
      setError('Contract pause functions not available');
    }
  }, [contractAddress, chain?.id, contractLoading]);

  // Vérification de l'adresse admin
  useEffect(() => {
    if (address && owner && typeof owner === 'string' && isAddress(owner as Address)) {
      const isOwner = address.toLowerCase() === (owner as string).toLowerCase();
      console.log('Admin check:', {
        userAddress: address,
        ownerAddress: owner,
        isOwner,
        contractAddress,
        chainId: chain?.id
      });
      if (!isOwner) {
        setError('You are not the contract owner');
      } else {
        setError(null);
      }
    }
  }, [address, owner, chain?.id]);

  // Gestion des erreurs avec le réseau
  useEffect(() => {
    if (!chain?.id) {
      setError('Please connect to a network');
    } else if (contractLoading || ownerLoading || pausedLoading) {
      setError('Loading contract...');
    } else if (!contractAddress) {
      setError('Contract address not found');
    } else if (ownerError || pausedError) {
      console.error('Contract errors:', { ownerError, pausedError });
      setError('Failed to read contract state');
      setIsPauseAvailable(false);
    }
  }, [chain?.id, contractLoading, ownerLoading, pausedLoading, contractAddress, ownerError, pausedError]);

  // Préparation de la fonction pause avec gestion du réseau
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && isPauseAvailable && !paused && address === owner,
    chainId: chain?.id,
  });

  // Préparation de la fonction unpause avec gestion du réseau
  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && isPauseAvailable && !!paused && address === owner,
    chainId: chain?.id,
  });

  // Préparation de la fonction de transfert avec gestion du réseau
  const { config: transferConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    args: [newOwnerAddress],
    enabled: !!contractAddress && !!chain?.id && !contractLoading && !!newOwnerAddress && address === owner,
    chainId: chain?.id,
  });

  // Préparation de la fonction de renonciation avec gestion du réseau
  const { config: renounceConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'renounceOwnership',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && address === owner,
    chainId: chain?.id,
  });

  const { write: transferOwnership, isLoading: isTransferring } = useContractWrite(transferConfig);
  const { write: renounceOwnership, isLoading: isRenouncing } = useContractWrite(renounceConfig);
  const { write: pause, isLoading: isPausing } = useContractWrite(pauseConfig);
  const { write: unpause, isLoading: isUnpausing } = useContractWrite(unpauseConfig);

  const ownerAddress = typeof owner === 'string' ? owner : undefined;
  const currentAddress = address?.toLowerCase();
  const ownerAddressLower = ownerAddress?.toLowerCase();

  return {
    isAdmin: currentAddress === ownerAddressLower,
    owner: ownerAddress,
    paused: paused ?? false,
    pauseAvailable: isPauseAvailable,
    transferOwnership,
    renounceOwnership,
    pause: isPauseAvailable && !paused ? pause : undefined,
    unpause: isPauseAvailable && paused ? unpause : undefined,
    isPausing,
    isUnpausing,
    isTransferring,
    isRenouncing,
    error,
    setNewOwnerAddress,
    newOwnerAddress,
    chainId: chain?.id,
    isLoading: contractLoading || ownerLoading || pausedLoading
  };
};
