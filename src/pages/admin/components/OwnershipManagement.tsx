import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import { TitledForgeCard } from '../../../components/common/TitledForgeCard';
import { ERROR_MESSAGES } from '../../../constants/errors';

interface OwnershipManagementProps {
  onAction: (message: string, severity: 'success' | 'error' | 'info') => void;
  onConfirm: (title: string, message: string, action: () => Promise<void>) => void;
  onError?: (error: string) => void;
}

export const OwnershipManagement: React.FC<OwnershipManagementProps> = ({ 
  onAction, 
  onConfirm,
  onError 
}) => {
  const { owner, transferOwnership } = useTokenForgeAdmin();
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [newOwnerAddressInput, setNewOwnerAddressInput] = useState('');
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleOpenTransferDialog = () => {
    setOpenTransferDialog(true);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setNewOwnerAddressInput(value);
    setErrorState(null);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setNewOwnerAddressInput('');
    setErrorState(null);
  };

  const handleTransferOwnership = async () => {
    if (!transferOwnership) {
      setErrorState(ERROR_MESSAGES.CONTRACT.NOT_OWNER);
      return;
    }

    try {
      const address = newOwnerAddressInput.trim();
      
      if (!address) {
        throw new Error(ERROR_MESSAGES.VALIDATION.EMPTY_ADDRESS);
      }

      if (!address.startsWith('0x') || address.length !== 42) {
        throw new Error(ERROR_MESSAGES.VALIDATION.INVALID_ADDRESS);
      }

      onConfirm(
        'Confirmation - Transfert de Propriété',
        `Êtes-vous sûr de vouloir transférer la propriété du contrat à l'adresse ${address} ? Cette action est irréversible.`,
        async () => {
          try {
            onAction('Transaction en cours...', 'info');
            await transferOwnership(address);
            onAction('La propriété a été transférée avec succès.', 'success');
            handleCloseTransferDialog();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Une erreur est survenue';
            onAction(message, 'error');
            throw error;
          }
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorState(error.message);
      }
    }
  };

  return (
    <>
      <TitledForgeCard title="Gestion de la Propriété">
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body1">
            Propriétaire actuel : {owner}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenTransferDialog}
          >
            Transférer la Propriété
          </Button>
        </Box>
      </TitledForgeCard>

      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog}>
        <DialogTitle>Transfert de Propriété</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              fullWidth
              label="Nouvelle adresse du propriétaire"
              value={newOwnerAddressInput}
              onChange={handleAddressChange}
              error={!!errorState}
              helperText={errorState}
              placeholder="0x..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Annuler</Button>
          <Button
            onClick={handleTransferOwnership}
            color="primary"
            disabled={!newOwnerAddressInput}
          >
            Transférer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
