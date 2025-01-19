import React from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import { ForgeCard } from '../../../components/common/ForgeCard';

interface ContractControlsProps {
  onAction: (message: string, severity: 'success' | 'error' | 'info') => void;
  onConfirm: (title: string, message: string, action: () => Promise<void>) => void;
  onError?: (error: string) => void;
}

export const ContractControls: React.FC<ContractControlsProps> = ({ 
  onAction, 
  onConfirm,
  onError 
}) => {
  const {
    paused,
    pause,
    unpause,
    error: adminError,
    pauseAvailable,
    isPausing,
    isUnpausing,
    isLoading: adminLoading,
  } = useTokenForgeAdmin({ onError });

  const handlePauseToggle = () => {
    const action = paused ? unpause : pause;
    const actionName = paused ? 'réactiver' : 'mettre en pause';
    
    onConfirm(
      `Confirmation - ${paused ? 'Réactivation' : 'Mise en Pause'} du Contrat`,
      `Êtes-vous sûr de vouloir ${actionName} le contrat ? Cette action affectera toutes les opérations en cours.`,
      async () => {
        try {
          onAction('Transaction en cours...', 'info');
          await action();
          onAction(`Le contrat a été ${paused ? 'réactivé' : 'mis en pause'} avec succès.`, 'success');
        } catch (error) {
          onError?.(error instanceof Error ? error.message : 'Une erreur est survenue');
          onAction(
            `Erreur lors de la ${paused ? 'réactivation' : 'mise en pause'} du contrat`,
            'error'
          );
        }
      }
    );
  };

  if (adminLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (adminError) {
    return (
      <Box p={3}>
        <Alert severity="error">{adminError}</Alert>
      </Box>
    );
  }

  return (
    <ForgeCard title="Contrôle du Contrat">
      <Box display="flex" gap={2} alignItems="center">
        <Button
          variant="contained"
          color={paused ? "primary" : "secondary"}
          onClick={handlePauseToggle}
          disabled={!pauseAvailable || isPausing || isUnpausing}
        >
          {paused ? "Réactiver le Contrat" : "Mettre en Pause"}
          {(isPausing || isUnpausing) && (
            <CircularProgress size={24} sx={{ ml: 1 }} />
          )}
        </Button>
        <Typography variant="body2" color="textSecondary">
          État actuel : {paused ? "En pause" : "Actif"}
        </Typography>
      </Box>
    </ForgeCard>
  );
};
