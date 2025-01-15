import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { useLaunchpad } from '../../hooks/useLaunchpad';

export const CreatePool: React.FC = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success' | 'info' | 'warning'
  });
  const { createPool, isCreating } = useLaunchpad();

  const [formData, setFormData] = useState({
    token: '',
    tokenPrice: '',
    hardCap: '',
    softCap: '',
    minContribution: '',
    maxContribution: '',
    startTime: '',
    endTime: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.token || !formData.tokenPrice || !formData.softCap || !formData.hardCap || !formData.maxContribution) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    const startTimestamp = new Date(formData.startTime).getTime() / 1000;
    const endTimestamp = new Date(formData.endTime).getTime() / 1000;

    if (startTimestamp >= endTimestamp) {
      setSnackbar({
        open: true,
        message: 'End time must be after start time',
        severity: 'error'
      });
      return;
    }

    try {
      await createPool(
        formData.token,
        formData.tokenPrice,
        formData.hardCap,
        formData.softCap,
        formData.minContribution,
        formData.maxContribution,
        startTimestamp,
        endTimestamp
      );
      
      setSnackbar({
        open: true,
        message: 'Pool created successfully',
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create pool',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Create Launchpad Pool
            </Typography>

            <FormControl>
              <FormLabel>Token Address</FormLabel>
              <TextField
                fullWidth
                name="token"
                value={formData.token}
                onChange={handleInputChange}
                placeholder="Token contract address"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Token Price</FormLabel>
              <TextField
                fullWidth
                name="tokenPrice"
                type="number"
                value={formData.tokenPrice}
                onChange={handleInputChange}
                placeholder="Price per token"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Hard Cap</FormLabel>
              <TextField
                fullWidth
                name="hardCap"
                type="number"
                value={formData.hardCap}
                onChange={handleInputChange}
                placeholder="Maximum amount to raise"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Soft Cap</FormLabel>
              <TextField
                fullWidth
                name="softCap"
                type="number"
                value={formData.softCap}
                onChange={handleInputChange}
                placeholder="Minimum amount to raise"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Minimum Contribution</FormLabel>
              <TextField
                fullWidth
                name="minContribution"
                type="number"
                value={formData.minContribution}
                onChange={handleInputChange}
                placeholder="Minimum contribution amount"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Maximum Contribution</FormLabel>
              <TextField
                fullWidth
                name="maxContribution"
                type="number"
                value={formData.maxContribution}
                onChange={handleInputChange}
                placeholder="Maximum contribution amount"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Start Time</FormLabel>
              <TextField
                fullWidth
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>End Time</FormLabel>
              <TextField
                fullWidth
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              sx={{ mt: 2 }}
            >
              {isCreating ? 'Creating...' : 'Create Pool'}
            </Button>
          </Stack>
        </form>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};
