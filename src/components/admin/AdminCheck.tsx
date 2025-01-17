import React from 'react';
import { useContractRead, useAccount } from 'wagmi';
import { Box, Typography, Button } from '@mui/material';
import TokenForgeFactoryJSON from '../../contracts/abi/TokenForgeFactory.json';
import { getContractAddress } from '../../config/contracts';
import { Address } from 'viem';

export const AdminCheck = () => {
  const { address } = useAccount();
  const factoryAddress = getContractAddress('TOKEN_FACTORY');

  const { data: ownerAddress, isError, isLoading } = useContractRead({
    address: factoryAddress,
    abi: TokenForgeFactoryJSON.abi,
    functionName: 'owner',
    watch: true,
  }) as { data: Address | undefined; isError: boolean; isLoading: boolean };

  if (isLoading) {
    return <Typography>Chargement des informations d'administration...</Typography>;
  }

  if (isError) {
    return <Typography color="error">Erreur lors de la lecture du contrat</Typography>;
  }

  const isAdmin = address && ownerAddress ? 
    address.toLowerCase() === ownerAddress.toLowerCase() : 
    false;

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Informations d'administration
      </Typography>
      
      <Typography>
        Votre adresse : {address || 'Non connecté'}
      </Typography>
      
      <Typography>
        Adresse du propriétaire : {ownerAddress || 'Non disponible'}
      </Typography>
      
      <Typography>
        Adresse du contrat : {factoryAddress}
      </Typography>
      
      <Typography sx={{ mt: 2, fontWeight: 'bold', color: isAdmin ? 'success.main' : 'error.main' }}>
        Statut : {isAdmin ? 'Vous êtes administrateur' : 'Vous n\'êtes pas administrateur'}
      </Typography>
    </Box>
  );
};

export default AdminCheck;
