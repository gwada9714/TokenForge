import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTokenForgeContract } from '../../../hooks/useTokenForgeContract';
import { isAddress, type Address } from 'viem';

interface OwnershipManagementProps {
  onError: (message: string) => void;
}

const OwnershipManagement: React.FC<OwnershipManagementProps> = ({ onError }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  const { transferOwnership } = useTokenForgeContract();

  const handleTransfer = async () => {
    if (!isAddress(newOwnerAddress)) {
      onError('Invalid Ethereum address');
      return;
    }

    try {
      await transferOwnership(newOwnerAddress as Address);
      setIsDialogOpen(false);
      setNewOwnerAddress('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to transfer ownership');
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
        Transfer Ownership
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Transfer Contract Ownership</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Owner Address"
            fullWidth
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value)}
            error={newOwnerAddress !== '' && !isAddress(newOwnerAddress)}
            helperText={newOwnerAddress !== '' && !isAddress(newOwnerAddress) ? 'Invalid Ethereum address' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setNewOwnerAddress('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer} 
            variant="contained"
            disabled={!isAddress(newOwnerAddress)}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnershipManagement;
