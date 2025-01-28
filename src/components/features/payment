import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useMoonPay } from '../../hooks/useMoonPay';
import { MoonPayTransaction } from '../../services/moonpayService';

interface MoonPayProps {
  amount: string;
  onSuccess: (transactionHash: string) => void;
  onError: (error: Error) => void;
  disabled?: boolean;
}

const steps = ['Initialisation', 'Paiement', 'Confirmation'];

const validateAmount = (amount: string): boolean => {
  const parsedAmount = parseFloat(amount);
  return !isNaN(parsedAmount) && parsedAmount > 0;
};

export const MoonPay: React.FC<MoonPayProps> = ({ 
  amount, 
  onSuccess, 
  onError,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [transaction, setTransaction] = useState<MoonPayTransaction | null>(null);
  const { initiatePayment, checkTransactionStatus, loading, error } = useMoonPay();
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (transaction?.id && transaction.status === 'pending') {
      intervalId = setInterval(async () => {
        try {
          const updatedTransaction = await checkTransactionStatus(transaction.id);
          if (updatedTransaction?.status === 'completed' && updatedTransaction.transactionHash) {
            onSuccess(updatedTransaction.transactionHash);
            handleClose();
          } else if (updatedTransaction?.status === 'failed') {
            throw new Error('La transaction a échoué. Veuillez réessayer.');
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Erreur lors de la vérification de la transaction');
          onError(error);
          handleClose();
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transaction, checkTransactionStatus, onSuccess, onError]);

  const handleOpen = () => {
    setValidationError(null);
    if (!validateAmount(amount)) {
      setValidationError('Le montant doit être supérieur à 0');
      return;
    }
    setIsOpen(true);
    setActiveStep(0);
    setTransaction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveStep(0);
    setTransaction(null);
    setValidationError(null);
  };

  const handleInitiatePayment = async () => {
    try {
      setValidationError(null);
      const newTransaction = await initiatePayment(amount);
      setTransaction(newTransaction);
      setActiveStep(1);

      // Configuration MoonPay
      const moonpayConfig = {
        apiKey: import.meta.env.VITE_MOONPAY_API_KEY,
        baseUrl: import.meta.env.VITE_MOONPAY_BASE_URL,
        currencyCode: 'eth',
        walletAddress: newTransaction.tempWalletAddress,
        baseCurrencyAmount: amount,
      };

      // TODO: Implémenter l'ouverture du widget MoonPay
      console.log('MoonPay config:', moonpayConfig);

      setActiveStep(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation du paiement';
      setValidationError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
        disabled={loading || disabled}
      >
        Payer avec Carte Bancaire
      </Button>

      {validationError && !isOpen && (
        <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
          {validationError}
        </Typography>
      )}

      <Dialog 
        open={isOpen} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="moonpay-dialog-title"
      >
        <DialogTitle id="moonpay-dialog-title">
          Paiement par Carte Bancaire via MoonPay
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error?.message || validationError}
            </Alert>
          )}

          <Typography variant="body1" gutterBottom>
            Vous allez être redirigé vers MoonPay pour effectuer votre paiement de {amount} ETH
          </Typography>

          {transaction?.tempWalletAddress && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Adresse du portefeuille temporaire : {transaction.tempWalletAddress}
            </Typography>
          )}

          {transaction?.status === 'pending' && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                En attente de la confirmation du paiement...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          {activeStep === 0 && (
            <Button
              onClick={handleInitiatePayment}
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Continuer vers MoonPay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
