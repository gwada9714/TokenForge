import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { StyledButton } from "@/components/ui/Button";
import { isAddress } from "viem";

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void;
  isLoading?: boolean;
}

const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [newAddress, setNewAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!isAddress(newAddress)) {
      setError("L'adresse entrée n'est pas une adresse Ethereum valide");
      return;
    }
    onConfirm(newAddress);
    setNewAddress("");
    setError(null);
  };

  const handleClose = () => {
    setNewAddress("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transférer la Propriété</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          Entrez l&apos;adresse du nouveau propriétaire :
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Adresse Ethereum"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          error={!!error}
          disabled={isLoading}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <StyledButton
          $variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
          $isLoading={isLoading}
        >
          Annuler
        </StyledButton>
        <StyledButton
          $variant="primary"
          onClick={handleConfirm}
          disabled={!newAddress || isLoading}
          $isLoading={isLoading}
        >
          {isLoading ? "Transfert en cours..." : "Confirmer"}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default TransferOwnershipModal;
