import React, { useCallback } from 'react';
import {
  Stack,
  Button,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Box,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useTokenCreation } from '@/store/hooks';
import { startDeployment, deploymentSuccess, deploymentError, setDeploymentStatus } from '@/store/slices/tokenCreationSlice';
import { useWallet } from '@/store/hooks';
import { deployToken } from '@/services/tokenDeployment';

const deploymentSteps = [
  'Préparation du contrat',
  'Compilation',
  'Déploiement sur la blockchain',
  'Vérification du contrat',
  'Finalisation',
] as const;

type DeploymentStatus = 'pending' | 'success' | 'deploying' | 'failed';

interface DeploymentState {
  status: DeploymentStatus;
  step: number;
  message: string;
}

export const TokenDeployment: React.FC = () => {
  const { tokenConfig, isDeploying, deploymentError: error, deploymentStatus, dispatch } = useTokenCreation();
  const { address, isConnected, chainId } = useWallet();

  const handleDeploy = useCallback(async () => {
    if (!isConnected || !address) {
      dispatch(deploymentError('Veuillez connecter votre portefeuille'));
      return;
    }

    if (!tokenConfig.network || tokenConfig.network.chain.id !== chainId) {
      dispatch(deploymentError('Veuillez sélectionner le bon réseau'));
      return;
    }

    dispatch({ type: 'SET_DEPLOYMENT_STATUS', payload: 'deploying' });

    try {
      dispatch({ type: 'SET_DEPLOYMENT_STATUS', payload: 'deploying' });

      for (let i = 0; i < deploymentSteps.length; i++) {
        dispatch({ 
          type: 'UPDATE_DEPLOYMENT_PROGRESS',
          payload: {
            step: i,
            message: deploymentSteps[i]
          }
        });

        // Simulation du déploiement pour l'exemple
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      dispatch({ type: 'SET_DEPLOYMENT_STATUS', payload: 'success' });
      
    } catch (err) {
      dispatch({ type: 'SET_DEPLOYMENT_STATUS', payload: 'failed' });
      dispatch(deploymentError(err instanceof Error ? err.message : 'Une erreur est survenue lors du déploiement'));
    }
  }, [tokenConfig, dispatch, address, isConnected, chainId]);

  const progress = deploymentStatus 
    ? ((deploymentStatus.step + 1) * (100 / deploymentSteps.length))
    : 0;

  const canDeploy = isConnected && 
    address && 
    tokenConfig.network && 
    tokenConfig.network.chain.id === chainId;

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Déploiement du Token
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Attention</AlertTitle>
          Veuillez connecter votre portefeuille pour déployer le token
        </Alert>
      )}

      {isConnected && tokenConfig.network && tokenConfig.network.chain.id !== chainId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Attention</AlertTitle>
          Veuillez changer de réseau pour {tokenConfig.network.name}
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 2 }}>
        {isDeploying && (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {deploymentStatus?.message || 'Déploiement en cours...'}
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
        disabled={isDeploying || !canDeploy}
        startIcon={isDeploying ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isDeploying ? 'Déploiement en cours...' : 'Déployer le Token'}
      </Button>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          * Le déploiement nécessite des frais de gas sur le réseau sélectionné
        </Typography>
      </Box>
    </Stack>
  );
};
