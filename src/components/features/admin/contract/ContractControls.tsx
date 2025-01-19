import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import type { ButtonProps } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import { AdminComponentProps } from '../types';

export const ContractControls: React.FC<AdminComponentProps> = ({ onError }) => {
  const {
    isPaused,
    isPausing,
    isUnpausing,
    handleTogglePause: togglePause,
    contractAddress,
  } = useTokenForgeAdmin();

  const handleTogglePause = useCallback(async () => {
    try {
      await togglePause();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to toggle contract state');
    }
  }, [togglePause, onError]);

  const buttonProps: ButtonProps & { loading?: boolean; loadingPosition?: 'start' | 'end' | 'center' } = {
    variant: "contained",
    color: isPaused ? "success" : "warning",
    onClick: handleTogglePause,
    loading: isPausing || isUnpausing,
    loadingPosition: "start",
    startIcon: isPaused ? <PlayArrowIcon /> : <PauseIcon />,
    fullWidth: true,
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              État du Contrat
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary">Adresse du contrat</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {contractAddress}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography color="text.secondary">État</Typography>
              <Typography color={isPaused ? 'error' : 'success.main'}>
                {isPaused ? 'En pause' : 'Actif'}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <LoadingButton {...buttonProps}>
                {isPaused ? 'Réactiver le contrat' : 'Mettre en pause le contrat'}
              </LoadingButton>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default React.memo(ContractControls);
