import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';

const ContractDebugger: React.FC = () => {
  const {
    isOwner,
    isPaused,
    pause,
    unpause,
    isLoading,
    error,
    owner
  } = useTokenForgeAdmin();

  const handlePause = async () => {
    try {
      await pause();
    } catch (error: any) {
      console.error('Erreur lors de la pause:', error);
    }
  };

  const handleUnpause = async () => {
    try {
      await unpause();
    } catch (error: any) {
      console.error('Erreur lors de la dépause:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Débogage du Contrat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Propriétaire: {owner || 'Non disponible'}
        </Typography>
        <Typography variant="body1">
          Statut: {isPaused ? 'En pause' : 'Actif'}
        </Typography>
        <Typography variant="body1">
          Droits d'administration: {isOwner ? 'Oui' : 'Non'}
        </Typography>
      </Box>

      {isOwner && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color={isPaused ? "success" : "warning"}
            onClick={isPaused ? handleUnpause : handlePause}
            disabled={isLoading}
          >
            {isLoading ? 'En cours...' : isPaused ? 'Réactiver' : 'Mettre en pause'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ContractDebugger;
