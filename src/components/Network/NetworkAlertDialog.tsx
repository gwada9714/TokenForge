import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { SUPPORTED_NETWORKS } from '../../config/networks';

interface NetworkAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetNetwork: typeof SUPPORTED_NETWORKS.MAINNET | typeof SUPPORTED_NETWORKS.SEPOLIA;
  isLoading: boolean;
}

export const NetworkAlertDialog: React.FC<NetworkAlertDialogProps> = ({
  open,
  onClose,
  onConfirm,
  targetNetwork,
  isLoading
}) => {
  const networkName = targetNetwork === SUPPORTED_NETWORKS.SEPOLIA ? 'Sepolia' : 'Mainnet';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="network-alert-dialog-title"
      aria-describedby="network-alert-dialog-description"
    >
      <DialogTitle id="network-alert-dialog-title">
        Changement de réseau requis
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="network-alert-dialog-description">
          Pour continuer, vous devez passer sur le réseau {networkName}.
          Voulez-vous changer de réseau maintenant ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Annuler
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Changement en cours...' : 'Changer de réseau'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
