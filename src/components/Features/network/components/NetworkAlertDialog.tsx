import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';

interface NetworkAlertDialogProps {
  open: boolean;
  error: string | null;
  onClose: () => void;
}

export const NetworkAlertDialog: React.FC<NetworkAlertDialogProps> = ({
  open,
  error,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="network-alert-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="network-alert-dialog-title">
        Network Switch Error
      </DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to switch network
        </Alert>
        <Typography variant="body1">
          {error || 'An error occurred while switching networks. Please try again.'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Make sure your wallet is properly connected and you have the network configured in your wallet.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(NetworkAlertDialog);
