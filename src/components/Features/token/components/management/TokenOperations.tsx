import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import { TokenConfig } from '../../types';

interface TokenOperationsProps {
  tokenAddress: string;
  tokenConfig: TokenConfig;
}

export const TokenOperations: React.FC<TokenOperationsProps> = ({
  tokenAddress,
  tokenConfig,
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  const {
    operations,
    mint,
    burn,
    pause,
    unpause,
    transfer,
  } = useTokenOperations(tokenAddress);

  const handleOperation = async (operation: string) => {
    try {
      setCurrentOperation(operation);
      switch (operation) {
        case 'mint':
          await mint(recipient, amount);
          break;
        case 'burn':
          await burn(amount);
          break;
        case 'pause':
          await pause();
          break;
        case 'unpause':
          await unpause();
          break;
        case 'transfer':
          await transfer(recipient, amount);
          break;
      }
      setOpenDialog(false);
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setCurrentOperation(null);
    }
  };

  const latestOperation = operations[operations.length - 1];

  return (
    <Box>
      <Grid container spacing={2}>
        {tokenConfig.features.mintable && (
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setCurrentOperation('mint');
                setOpenDialog(true);
              }}
            >
              Mint Tokens
            </Button>
          </Grid>
        )}

        {tokenConfig.features.burnable && (
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => {
                setCurrentOperation('burn');
                setOpenDialog(true);
              }}
            >
              Burn Tokens
            </Button>
          </Grid>
        )}

        {tokenConfig.features.pausable && (
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={() => handleOperation('pause')}
            >
              Pause Token
            </Button>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              setCurrentOperation('transfer');
              setOpenDialog(true);
            }}
          >
            Transfer Tokens
          </Button>
        </Grid>
      </Grid>

      {latestOperation && latestOperation.status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {latestOperation.error || 'Operation failed'}
        </Alert>
      )}

      {latestOperation && latestOperation.status === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Operation completed successfully!
          {latestOperation.txHash && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Transaction: {latestOperation.txHash}
            </Typography>
          )}
        </Alert>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentOperation ? `${currentOperation.charAt(0).toUpperCase()}${currentOperation.slice(1)} Tokens` : 'Token Operation'}
        </DialogTitle>
        <DialogContent>
          {(currentOperation === 'mint' || currentOperation === 'transfer') && (
            <TextField
              fullWidth
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleOperation(currentOperation!)}
            variant="contained"
            disabled={!amount || (currentOperation === 'transfer' && !recipient)}
          >
            {currentOperation === 'processing' ? (
              <CircularProgress size={24} />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(TokenOperations);
