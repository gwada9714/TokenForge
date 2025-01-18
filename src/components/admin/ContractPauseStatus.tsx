import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';

export const ContractPauseStatus = () => {
  const { 
    isPaused, 
    pause, 
    unpause, 
    isPausing, 
    isUnpausing,
    isOwner,
    error
  } = useTokenForgeAdmin();

  const handlePause = async () => {
    try {
      await pause();
    } catch (err) {
      console.error('Erreur lors de la mise en pause:', err);
    }
  };

  const handleUnpause = async () => {
    try {
      await unpause();
    } catch (err) {
      console.error('Erreur lors de la reprise:', err);
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
      
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
            >
              {isPaused ? 'Réactiver' : 'Mettre en pause'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
