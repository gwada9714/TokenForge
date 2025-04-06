import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
} from "@mui/material";
import { useTokenForgeAdmin } from "../../../../hooks/useTokenForgeAdmin";
import { AdminComponentProps } from "../types";
import { isValidAddress } from "../../../../utils/web3";

export const OwnershipManagement: React.FC<AdminComponentProps> = ({
  onError,
}) => {
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { transferOwnership, currentOwner, isTransferring } =
    useTokenForgeAdmin();

  const handleAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewOwnerAddress(event.target.value);
      if (error) setError(null);
    },
    [error]
  );

  const handleOpenDialog = useCallback(() => {
    if (!isValidAddress(newOwnerAddress)) {
      onError("Invalid Ethereum address");
      return;
    }
    setOpenDialog(true);
  }, [newOwnerAddress, onError]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleTransferOwnership = useCallback(async () => {
    try {
      await transferOwnership(newOwnerAddress);
      setOpenDialog(false);
      setNewOwnerAddress("");
      setError(null);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to transfer ownership"
      );
    }
  }, [transferOwnership, newOwnerAddress, onError]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gestion de la propriété
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Propriétaire actuel : {currentOwner}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Nouvelle adresse du propriétaire"
                value={newOwnerAddress}
                onChange={handleAddressChange}
                placeholder="0x..."
                error={!!error}
                helperText={error}
                disabled={isTransferring}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                variant="contained"
                onClick={handleOpenDialog}
                disabled={!newOwnerAddress || !!error || isTransferring}
              >
                Transférer
              </Button>
            </Box>
          </CardContent>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Confirmer le transfert de propriété</DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir transférer la propriété à :
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, wordBreak: "break-all" }}
              >
                {newOwnerAddress}
              </Typography>
              <Typography color="error" sx={{ mt: 2 }}>
                Attention : Cette action est irréversible !
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Annuler</Button>
              <Button onClick={handleTransferOwnership} color="error">
                Transférer la propriété
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      </Grid>
    </Grid>
  );
};

export default React.memo(OwnershipManagement);
