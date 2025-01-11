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
} from '@mui/material';
import { TokenInfo } from '../../types/tokens';
import { isValidAddress } from '../../utils/address';

interface TokenOperationsProps {
  token: TokenInfo;
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

export const TokenOperations: React.FC<TokenOperationsProps> = ({ token }) => {
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMint = async () => {
    if (!token.mintable) {
      setError('Ce token ne peut pas être minté');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter la logique de mint
      setSuccess('Tokens mintés avec succès');
    } catch (err) {
      setError('Erreur lors du mint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!token.burnable) {
      setError('Ce token ne peut pas être brûlé');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter la logique de burn
      setSuccess('Tokens brûlés avec succès');
    } catch (err) {
      setError('Erreur lors du burn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!isValidAddress(transferAddress)) {
      setError('Adresse de destination invalide');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter la logique de transfer
      setSuccess('Tokens transférés avec succès');
    } catch (err) {
      setError('Erreur lors du transfert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        {token.mintable && (
          <OperationCard
            title="Minter des Tokens"
            description="Créer de nouveaux tokens et les ajouter à une adresse"
          >
            <TextField
              fullWidth
              label="Montant"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              type="number"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleMint}
              disabled={loading || !mintAmount}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Minter'}
            </Button>
          </OperationCard>
        )}

        {token.burnable && (
          <OperationCard
            title="Brûler des Tokens"
            description="Détruire définitivement des tokens"
          >
            <TextField
              fullWidth
              label="Montant"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              type="number"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={handleBurn}
              disabled={loading || !burnAmount}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Brûler'}
            </Button>
          </OperationCard>
        )}

        <OperationCard
          title="Transférer des Tokens"
          description="Envoyer des tokens à une autre adresse"
        >
          <TextField
            fullWidth
            label="Adresse de destination"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Montant"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            type="number"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={loading || !transferAmount || !transferAddress}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Transférer'}
          </Button>
        </OperationCard>
      </Grid>
    </Box>
  );
};
