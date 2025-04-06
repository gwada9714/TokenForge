import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  Alert,
  AlertColor,
  Divider,
} from "@mui/material";
import { useContract } from "../../../hooks/useContract";
import { ethers } from "ethers";

const OwnershipManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [currentOwner, setCurrentOwner] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { contract } = useContract("token");

  const handleTransferOwnership = useCallback(async () => {
    if (!contract || !ethers.isAddress(newOwner)) return;

    setLoading(true);
    try {
      const tx = await contract.transferOwnership(newOwner);
      await tx.wait();

      setCurrentOwner(newOwner);
      setOpenDialog(false);
      setNewOwner("");
      setSnackbar({
        open: true,
        message: "Ownership transferred successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to transfer ownership",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [contract, newOwner]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewOwner("");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const isValidAddress = newOwner && ethers.isAddress(newOwner);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ownership Management
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Current Owner
              </Typography>
              {currentOwner ? (
                <Chip
                  label={`${currentOwner.slice(0, 6)}...${currentOwner.slice(
                    -4
                  )}`}
                  color="primary"
                />
              ) : (
                <Typography color="text.secondary">Loading...</Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Transfer Ownership
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                disabled={loading}
              >
                Transfer to New Owner
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Transfer Ownership</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Owner Address"
            fullWidth
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            error={!!newOwner && !isValidAddress}
            helperText={
              newOwner && !isValidAddress
                ? "Please enter a valid Ethereum address"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleTransferOwnership}
            disabled={!isValidAddress || loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OwnershipManagement;
