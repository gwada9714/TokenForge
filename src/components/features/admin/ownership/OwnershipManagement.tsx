import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../../../hooks/useTokenForgeAdmin';
import { type Address, isAddress } from 'viem';

export const OwnershipManagement: React.FC = () => {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { transferOwnership, isTransferring, owner } = useTokenForgeAdmin();

  const validateAddress = (address: string): boolean => {
    if (!address) {
      setError('Address is required');
      return false;
    }
    if (!isAddress(address)) {
      setError('Invalid Ethereum address');
      return false;
    }
    if (address.toLowerCase() === owner?.toLowerCase()) {
      setError('New owner address must be different from current owner');
      return false;
    }
    setError(null);
    return true;
  };

  const handleTransfer = async () => {
    if (!validateAddress(newOwnerAddress)) return;

    try {
      await transferOwnership(newOwnerAddress as Address);
      setNewOwnerAddress('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error transferring ownership');
    }
  };

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
                Propriétaire actuel : {owner || 'Chargement...'}
              </Typography>
            </Box>

            <Box component="form" noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nouvelle adresse du propriétaire"
                value={newOwnerAddress}
                onChange={(e) => {
                  setNewOwnerAddress(e.target.value);
                  if (error) validateAddress(e.target.value);
                }}
                error={!!error}
                helperText={error}
                disabled={isTransferring}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleTransfer}
                disabled={isTransferring || !newOwnerAddress || !!error}
                fullWidth
              >
                {isTransferring ? 'Transfert en cours...' : 'Transférer la propriété'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OwnershipManagement;
