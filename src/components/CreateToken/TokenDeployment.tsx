import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Button,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Box,
  Snackbar
} from '@mui/material';
import { TokenConfig } from '@/types/token';

interface TokenDeploymentProps {
  tokenConfig: TokenConfig;
}

const deploymentSteps = [
  'Préparation du contrat',
  'Compilation',
  'Déploiement sur la blockchain',
  'Vérification du contrat',
  'Finalisation',
];

const TokenDeployment: React.FC<TokenDeploymentProps> = React.memo(({ tokenConfig }) => {
  const [deploymentState, setDeploymentState] = useState({
    isDeploying: false,
    deploymentStep: 0,
    error: null as string | null,
    snackbarOpen: false,
    snackbarMessage: ''
  });

  const handleDeploy = useCallback(async () => {
    setDeploymentState(prev => ({ ...prev, isDeploying: true, error: null }));

    try {
      console.log('Deploying token with config:', tokenConfig);
      
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentState(prev => ({ ...prev, deploymentStep: i }));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setDeploymentState(prev => ({
        ...prev,
        snackbarMessage: 'Déploiement réussi!',
        snackbarOpen: true
      }));
      
    } catch (err) {
      setDeploymentState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Une erreur est survenue lors du déploiement',
        snackbarMessage: 'Erreur lors du déploiement',
        snackbarOpen: true
      }));
    } finally {
      setDeploymentState(prev => ({ ...prev, isDeploying: false }));
    }
  }, [tokenConfig]);

  const handleCloseSnackbar = useCallback(() => {
    setDeploymentState(prev => ({ ...prev, snackbarOpen: false }));
  }, []);

  const progress = useMemo(() => {
    return (deploymentState.deploymentStep + 1) * (100 / deploymentSteps.length);
  }, [deploymentState.deploymentStep]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>Déploiement du Token</Typography>

      {deploymentState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erreur</AlertTitle>
          {deploymentState.error}
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 2 }}>
        {deploymentState.isDeploying && (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {deploymentSteps[deploymentState.deploymentStep]}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
            />
          </>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleDeploy}
        disabled={deploymentState.isDeploying}
        sx={{ mt: 2 }}
      >
        {deploymentState.isDeploying ? 'Déploiement en cours...' : 'Déployer le Token'}
      </Button>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Le déploiement peut prendre quelques minutes. Veuillez ne pas fermer cette fenêtre.
      </Typography>

      <Snackbar
        open={deploymentState.snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={deploymentState.snackbarMessage}
      />
    </Stack>
  );
});

export default TokenDeployment;
