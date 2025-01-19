import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { type Address } from 'viem';

export const OwnershipManagement: React.FC = () => {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const { transferOwnership, isTransferring, owner } = useTokenForgeAdmin();

  const handleTransfer = async () => {
    try {
      await transferOwnership(newOwnerAddress as Address);
      setNewOwnerAddress('');
    } catch (error) {
      console.error('Error transferring ownership:', error);
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
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Propriétaire actuel : {owner || 'Chargement...'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nouvelle adresse du propriétaire"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                disabled={isTransferring}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransfer}
                disabled={isTransferring || !newOwnerAddress}
                sx={{ mt: 2 }}
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
