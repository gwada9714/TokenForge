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

export const OwnershipManagement: React.FC = () => {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const { handleTransferOwnership } = useTokenForgeAdmin();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transfert de Propriété
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nouvelle adresse du propriétaire"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="0x..."
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (newOwnerAddress) {
                    handleTransferOwnership(newOwnerAddress);
                    setNewOwnerAddress('');
                  }
                }}
                fullWidth
              >
                Transférer la propriété
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OwnershipManagement;
