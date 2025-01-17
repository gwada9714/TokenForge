import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useNetwork } from 'wagmi';
import { useState, useEffect } from 'react';
import TokenForgeFactoryABI from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';

export const useTokenForgeAdmin = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress, isLoading: contractLoading } = useContract();
  const [newOwnerAddress, setNewOwnerAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPauseAvailable, setIsPauseAvailable] = useState(false);

  // Lecture du propriétaire du contrat avec gestion du réseau
  const { data: owner, isSuccess: ownerLoaded, isError: ownerError } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: !!contractAddress && !!chain?.id,
    chainId: chain?.id,
  });

  // Lecture de l'état de pause avec gestion du réseau
  const { data: paused, isError: pausedError } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: !!contractAddress && !!chain?.id && isPauseAvailable,
    chainId: chain?.id,
    onError(error) {
      console.error('Error reading paused state:', error);
      setIsPauseAvailable(false);
    },
    onSuccess() {
      setIsPauseAvailable(true);
    }
  });

  // Vérification de la disponibilité des fonctions de pause
  useEffect(() => {
    if (!contractAddress || !chain?.id) {
      setIsPauseAvailable(false);
      return;
    }

    // Vérifie si la fonction existe dans l'ABI
    const hasPauseFunction = TokenForgeFactoryABI.abi.some(
      (item) => item.type === 'function' && item.name === 'paused'
    );

    setIsPauseAvailable(hasPauseFunction);
  }, [contractAddress, chain?.id]);

  // Gestion des erreurs avec le réseau
  useEffect(() => {
    if (!chain?.id) {
      setError('Please connect to a network');
    } else if (contractLoading) {
      setError('Loading contract...');
    } else if (!contractAddress) {
      setError('Contract address not found');
    } else if (ownerError || pausedError) {
      setError('Failed to read contract state');
      setIsPauseAvailable(false);
    } else {
      setError(null);
    }
  }, [chain?.id, contractLoading, contractAddress, ownerError, pausedError]);

  // Préparation de la fonction pause avec gestion du réseau
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause',
    enabled: !!contractAddress && !!chain?.id && isPauseAvailable && !paused,
    chainId: chain?.id,
  });

  // Préparation de la fonction unpause avec gestion du réseau
  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause',
    enabled: !!contractAddress && !!chain?.id && isPauseAvailable && !!paused,
    chainId: chain?.id,
  });

  // Préparation de la fonction de transfert avec gestion du réseau
  const { config: transferConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    args: [newOwnerAddress],
    enabled: !!contractAddress && !!chain?.id && !!newOwnerAddress,
    chainId: chain?.id,
  });

  // Préparation de la fonction de renonciation avec gestion du réseau
  const { config: renounceConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'renounceOwnership',
    enabled: !!contractAddress && !!chain?.id,
    chainId: chain?.id,
  });

  const { write: transferOwnership, isLoading: isTransferring } = useContractWrite(transferConfig);
  const { write: renounceOwnership, isLoading: isRenouncing } = useContractWrite(renounceConfig);
  const { write: pause, isLoading: isPausing } = useContractWrite(pauseConfig);
  const { write: unpause, isLoading: isUnpausing } = useContractWrite(unpauseConfig);

  return {
    isAdmin: address === owner,
    owner,
    paused: paused ?? false,
    pauseAvailable: isPauseAvailable,
    transferOwnership,
    renounceOwnership,
    pause: isPauseAvailable ? pause : undefined,
    unpause: isPauseAvailable ? unpause : undefined,
    isPausing,
    isUnpausing,
    isTransferring,
    isRenouncing,
    error,
    setNewOwnerAddress,
    newOwnerAddress,
    chainId: chain?.id
  };
};
