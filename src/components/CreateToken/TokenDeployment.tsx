import React, { useState } from 'react';
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

const TokenDeployment: React.FC<TokenDeploymentProps> = ({ tokenConfig }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const deploymentSteps = [
    'Préparation du contrat',
    'Compilation',
    'Déploiement sur la blockchain',
    'Vérification du contrat',
    'Finalisation',
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      // Log token configuration before deployment
      console.log('Deploying token with config:', tokenConfig);
      
      // Simulation des étapes de déploiement
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentStep(i);
        // Simuler le temps de traitement
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setSnackbarMessage('Déploiement réussi!');
      setSnackbarOpen(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du déploiement');
      setSnackbarMessage('Erreur lors du déploiement');
      setSnackbarOpen(true);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>Déploiement du Token</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 2 }}>
        {isDeploying && (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {deploymentSteps[deploymentStep]}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(deploymentStep + 1) * (100 / deploymentSteps.length)}
            />
          </>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleDeploy}
        disabled={isDeploying}
        sx={{ mt: 2 }}
      >
        {isDeploying ? 'Déploiement en cours...' : 'Déployer le Token'}
      </Button>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Le déploiement peut prendre quelques minutes. Veuillez ne pas fermer cette fenêtre.
      </Typography>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Stack>
  );
};

export default TokenDeployment;
