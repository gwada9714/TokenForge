import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useContractRead, useContractWrite, usePublicClient, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import TokenForgeFactory from '../../contracts/abi/TokenForgeFactory.json';

const CONTRACT_ADDRESS = '0xB0B6ED3e12f9Bb24b1bBC3413E3bb374A6e8B2E5' as const;

export const ContractDebugger: React.FC = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Lecture du propriétaire du contrat
  const { data: owner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TokenForgeFactory.abi,
    functionName: 'owner'
  }) as { data: string | undefined };

  // Lecture de l'état de pause
  const { data: isPaused } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TokenForgeFactory.abi,
    functionName: 'paused'
  }) as { data: boolean | undefined };

  // Configuration de la fonction de pause
  const { write: pauseContract, isLoading: isPausing } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    gas: BigInt(300000),
  });

  // Configuration de la fonction de dépause
  const { write: unpauseContract, isLoading: isUnpausing } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    gas: BigInt(300000),
  });

  const handlePause = async () => {
    try {
      const gasPrice = await publicClient.getGasPrice();
      pauseContract?.({
        gasPrice: BigInt(Number(gasPrice) * 1.1)
      });
    } catch (error) {
      console.error('Erreur lors de la pause:', error);
    }
  };

  const handleUnpause = async () => {
    try {
      const gasPrice = await publicClient.getGasPrice();
      unpauseContract?.({
        gasPrice: BigInt(Number(gasPrice) * 1.1)
      });
    } catch (error) {
      console.error('Erreur lors de la dépause:', error);
    }
  };

  const isOwner = owner === address;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Débogage du Contrat</Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography>Adresse du contrat: {CONTRACT_ADDRESS}</Typography>
        <Typography>Propriétaire du contrat: {owner || 'Chargement...'}</Typography>
        <Typography>Votre adresse: {address || 'Non connecté'}</Typography>
        <Typography>Vous êtes {isOwner ? '' : 'PAS'} le propriétaire</Typography>
        <Typography>État de pause: {isPaused === undefined ? 'Chargement...' : isPaused ? 'Pausé' : 'Actif'}</Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {isOwner && (
          <>
            <Button
              variant="contained"
              onClick={handlePause}
              disabled={Boolean(isPausing || isPaused)}
              sx={{ mr: 1 }}
            >
              {isPausing ? 'Pause en cours...' : 'Mettre en pause'}
            </Button>
            <Button
              variant="contained"
              onClick={handleUnpause}
              disabled={Boolean(isUnpausing || !isPaused)}
            >
              {isUnpausing ? 'Dépause en cours...' : 'Réactiver'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ContractDebugger;
