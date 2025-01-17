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
    enabled: !!contractAddress && !!chain?.id && !contractLoading,
    chainId: chain?.id,
    watch: true,
    onError(error) {
      console.error('Error reading owner:', error);
    },
    onSuccess(data) {
      console.log('Owner read success:', data);
    }
  });

  // Lecture de l'état de pause avec gestion du réseau
  const { data: paused, isError: pausedError, isLoading: pausedLoading } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: !!contractAddress && !!chain?.id && !contractLoading && isPauseAvailable,
    chainId: chain?.id,
    watch: true,
    onError(error) {
      console.error('Error reading paused state:', error);
      setIsPauseAvailable(false);
    },
    onSuccess(data) {
      console.log('Paused state read success:', data);
      setIsPauseAvailable(true);
    }
  });

  // Vérification de la disponibilité des fonctions de pause et admin
  useEffect(() => {
    if (!contractAddress || !chain?.id || contractLoading) {
      setIsPauseAvailable(false);
      return;
    }

    // Vérifie si les fonctions existent dans l'ABI
    const hasPauseFunction = TokenForgeFactoryABI.abi.some(
      (item) => item.type === 'function' && (item.name === 'paused' || item.name === 'pause' || item.name === 'unpause')
    );

    console.log('Pause function availability check:', {
      hasPauseFunction,
      contractAddress,
      chainId: chain.id
    });

    setIsPauseAvailable(hasPauseFunction);
  }, [contractAddress, chain?.id, contractLoading]);

  // Vérification de l'adresse admin
  useEffect(() => {
    if (address && owner && typeof owner === 'string' && isAddress(owner as Address)) {
      const isOwner = address.toLowerCase() === (owner as string).toLowerCase();
      console.log('Admin check:', {
        userAddress: address,
        ownerAddress: owner,
        isOwner
      });
      if (!isOwner) {
        setError('You are not the contract owner');
      } else {
        setError(null);
      }
    }
  }, [address, owner]);

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
