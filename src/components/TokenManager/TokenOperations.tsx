import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { usePublicClient, useWalletClient } from 'wagmi';
import { TokenInfo } from '../../types/tokens';
import { isValidAddress } from '../../utils/address';
import { executeTokenOperation } from '../../services/tokenOperations';

interface TokenOperationsProps {
  token: TokenInfo;
  onOperationComplete?: () => void;
}

interface OperationCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const OperationCard: React.FC<OperationCardProps> = ({
  title,
  description,
  children,
}) => (
  <Grid item xs={12} md={6}>
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {description}
        </Typography>
        {children}
      </CardContent>
    </Card>
  </Grid>
);

export const TokenOperations: React.FC<TokenOperationsProps> = ({ token, onOperationComplete }) => {
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleOperation = async (operation: 'mint' | 'burn' | 'transfer') => {
    try {
      setLoading(true);
      setError(null);

      const amount = operation === 'mint' 
        ? mintAmount 
        : operation === 'burn' 
          ? burnAmount 
          : transferAmount;

      await executeTokenOperation(
        token,
        operation,
        amount,
        operation === 'transfer' ? transferAddress as `0x${string}` : undefined,
        publicClient,
        walletClient
      );

      setSuccess(`${operation.charAt(0).toUpperCase() + operation.slice(1)} operation successful!`);
      
      // Reset form
      if (operation === 'mint') setMintAmount('');
      if (operation === 'burn') setBurnAmount('');
      if (operation === 'transfer') {
        setTransferAmount('');
        setTransferAddress('');
      }

      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {token.mintable && (
          <OperationCard
            title="Mint Tokens"
            description="Create new tokens and add them to your balance."
          >
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleOperation('mint'); }}>
              <TextField
                fullWidth
                label="Amount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                type="number"
                margin="normal"
                disabled={loading}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleOperation('mint')}
                disabled={!mintAmount || loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Mint'}
              </Button>
            </Box>
          </OperationCard>
        )}

        {token.burnable && (
          <OperationCard
            title="Burn Tokens"
            description="Permanently destroy tokens from your balance."
          >
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleOperation('burn'); }}>
              <TextField
                fullWidth
                label="Amount"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                type="number"
                margin="normal"
                disabled={loading}
              />
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => handleOperation('burn')}
                disabled={!burnAmount || loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Burn'}
              </Button>
            </Box>
          </OperationCard>
        )}

        <OperationCard
          title="Transfer Tokens"
          description="Send tokens to another address."
        >
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleOperation('transfer'); }}>
            <TextField
              fullWidth
              label="Recipient Address"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              margin="normal"
              error={!!transferAddress && !isValidAddress(transferAddress)}
              helperText={transferAddress && !isValidAddress(transferAddress) ? 'Invalid address' : ''}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              type="number"
              margin="normal"
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => handleOperation('transfer')}
              disabled={!transferAmount || !isValidAddress(transferAddress) || loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Transfer'}
            </Button>
          </Box>
        </OperationCard>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};
