import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useEffect, useState } from 'react';
import TokenForgeFactoryABI from '../contracts/abi/TokenForgeFactory.json';

export const useTokenForgeAdmin = () => {
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);

  // Lecture du propriétaire du contrat
  const { data: owner } = useContractRead({
    address: process.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    watch: true,
  });

  // Vérification si l'utilisateur connecté est l'administrateur
  useEffect(() => {
    if (owner && address) {
      setIsAdmin(owner.toLowerCase() === address.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  }, [owner, address]);

  // Préparation de la fonction de transfert de propriété
  const { config: transferConfig } = usePrepareContractWrite({
    address: process.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    enabled: isAdmin,
  });

  // Préparation de la fonction de pause/reprise
  const { config: togglePauseConfig } = usePrepareContractWrite({
    address: process.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'togglePause',
    enabled: isAdmin,
  });

  // Fonctions d'écriture du contrat
  const { writeAsync: transferOwnership } = useContractWrite(transferConfig);
  const { writeAsync: togglePause } = useContractWrite(togglePauseConfig);

  // Gestionnaires d'événements
  const handleTransferOwnership = async (newOwner: `0x${string}`) => {
    if (!transferOwnership) throw new Error("La fonction n'est pas disponible");
    await transferOwnership({ args: [newOwner] });
  };

  const handleTogglePause = async () => {
    if (!togglePause) throw new Error("La fonction n'est pas disponible");
    await togglePause();
  };

  return {
    isAdmin,
    handleTogglePause,
    handleTransferOwnership,
  };
};
