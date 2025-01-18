import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useState } from 'react';

export const ContractPauseStatus = () => {
  const { 
    isPaused, 
    pause, 
    unpause, 
    isPausing, 
    isUnpausing,
    isOwner,
    error: contractError
  } = useTokenForgeAdmin();

  const [error, setError] = useState<string | null>(null);

  const handlePause = async () => {
    try {
      setError(null);
      await pause();
    } catch (err) {
      console.error('Erreur lors de la mise en pause:', err);
      setError('Impossible de mettre le contrat en pause. Veuillez réessayer.');
    }
  };

  const handleUnpause = async () => {
    try {
      setError(null);
      await unpause();
    } catch (err) {
      console.error('Erreur lors de la reprise:', err);
      setError('Impossible de réactiver le contrat. Veuillez réessayer.');
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        État du contrat
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {contractError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Impossible de déterminer l'état du contrat. Certaines fonctionnalités peuvent être limitées.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>
            État actuel: {isPaused ? 'En pause' : 'Actif'}
          </Typography>
          
          {isPausing || isUnpausing ? (
            <CircularProgress size={24} />
          ) : (
            <Button
              variant="contained"
              onClick={isPaused ? handleUnpause : handlePause}
              color={isPaused ? "success" : "warning"}
              disabled={!!contractError}
            >
              {isPaused ? 'Réactiver' : 'Mettre en pause'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
