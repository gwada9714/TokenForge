import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Stack,
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';
import { PaymentSession, PaymentNetwork } from '@/features/multi-chain/services/payment/types';

interface PaymentConfirmationProps {
  session: PaymentSession;
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  estimatedGas?: string;
  estimatedTime?: number;
}

/**
 * Composant de confirmation de paiement
 * Affiche un récapitulatif et permet de confirmer/annuler
 * @component
 */
export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  session,
  isProcessing,
  onConfirm,
  onCancel,
  estimatedGas,
  estimatedTime
}) => {
  const theme = useTheme();
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const getNetworkIcon = (network: PaymentNetwork) => {
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return '🔷';
      case PaymentNetwork.POLYGON:
        return '💜';
      case PaymentNetwork.BINANCE:
        return '💛';
      case PaymentNetwork.SOLANA:
        return '🟣';
      default:
        return '🔗';
    }
  };

  const getEstimatedTimeText = (minutes: number) => {
    if (minutes < 1) return 'Moins d\'une minute';
    if (minutes === 1) return 'Environ 1 minute';
    return `Environ ${minutes} minutes`;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        bgcolor: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <Typography variant="h6" gutterBottom>
        Confirmation du Paiement
      </Typography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="textSecondary">Réseau</Typography>
          <Typography>
            {getNetworkIcon(session.network)} {session.network}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="textSecondary">Token</Typography>
          <Typography>{session.token.symbol}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="textSecondary">Montant</Typography>
          <Typography>
            {session.amount} {session.token.symbol}
          </Typography>
        </Box>

        {estimatedGas && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="textSecondary">Frais estimés</Typography>
            <Typography>{estimatedGas}</Typography>
          </Box>
        )}

        <Divider />

        {estimatedTime && (
          <Typography variant="body2" color="textSecondary" align="center">
            Temps estimé : {getEstimatedTimeText(estimatedTime)}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isProcessing}
            fullWidth
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={isProcessing}
            fullWidth
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Confirmer'
            )}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
