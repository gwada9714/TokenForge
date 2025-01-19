import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTokenForgeContract } from '../../../hooks/useTokenForgeContract';
import { isAddress } from 'ethers/lib/utils';

interface OwnershipManagementProps {
  onError: (message: string) => void;
}

const OwnershipManagement: React.FC<OwnershipManagementProps> = ({ onError }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const { transferOwnership } = useTokenForgeContract();

  const handleTransfer = async () => {
    if (!isAddress(newOwnerAddress)) {
      onError('Invalid Ethereum address');
      return;
    }

    try {
      await transferOwnership(newOwnerAddress);
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnershipManagement;
