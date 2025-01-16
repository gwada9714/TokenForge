import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { formatEther, parseEther } from 'ethers';
import { type PremiumService } from '@/types/premium';

interface ServiceSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  service?: PremiumService;
  onSubscribe: (serviceId: string, months: number) => Promise<void>;
  calculateCost: (serviceId: string, months: number) => string;
}

export const ServiceSubscriptionModal: React.FC<ServiceSubscriptionModalProps> = ({
  open,
  onClose,
  service,
  onSubscribe,
  calculateCost
}) => {
  const theme = useTheme();
  const [months, setMonths] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  if (!service) return null;

  const totalCost = calculateCost(service.id, months);
  
  const handleSubscribe = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await onSubscribe(service.id, months);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Souscrire à {service.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            {service.description}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Durée de l'abonnement</InputLabel>
          <Select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            label="Durée de l'abonnement"
          >
            {[1, 3, 6, 12].map((m) => (
              <MenuItem key={m} value={m}>
                {m} {m === 1 ? 'mois' : 'mois'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ 
          bgcolor: theme.palette.background.default,
          p: 2,
          borderRadius: 1,
          mb: 3
        }}>
          <Typography variant="subtitle1" gutterBottom>
            Résumé des coûts
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Prix de base
            </Typography>
            <Typography variant="body2">
              {formatEther(service.pricing.basePrice)} ETH
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Frais de configuration
            </Typography>
            <Typography variant="body2">
              {formatEther(service.pricing.setupFee)} ETH
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Frais mensuels ({months} mois)
            </Typography>
            <Typography variant="body2">
              {formatEther(BigInt(service.pricing.monthlyFee) * BigInt(months))} ETH
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 1,
            mt: 1
          }}>
            <Typography variant="subtitle1">
              Total
            </Typography>
            <Typography variant="subtitle1" color="primary">
              {formatEther(totalCost)} ETH
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubscribe}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'En cours...' : 'Confirmer la souscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
