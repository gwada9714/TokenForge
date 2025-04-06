import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Step,
  Stepper,
  StepLabel,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { PaymentNetwork } from "../../services/payment/types/PaymentSession";
import { NetworkSelector } from "./NetworkSelector";
import { TokenSelector } from "./TokenSelector";
import { PaymentConfirmation } from "./PaymentConfirmation";
import { PaymentStatus } from "./PaymentStatus";
import { usePayment } from "../../hooks/usePayment";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  serviceType: string;
  onSuccess: (sessionId: string) => void;
  onError: (error: Error) => void;
}

const steps = [
  "Select Network",
  "Select Token",
  "Confirm Payment",
  "Processing",
];

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  amount,
  serviceType,
  onSuccess,
  onError,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork | null>(
    null
  );
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { initiatePayment, paymentStatus, isProcessing } = usePayment();

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);

  const handleNetworkSelect = useCallback(
    (network: PaymentNetwork) => {
      setSelectedNetwork(network);
      setSelectedToken(null); // Reset token selection when network changes
      handleNext();
    },
    [handleNext]
  );

  const handleTokenSelect = useCallback(
    (tokenAddress: string) => {
      setSelectedToken(tokenAddress);
      handleNext();
    },
    [handleNext]
  );

  const handleConfirmPayment = useCallback(async () => {
    if (!selectedNetwork || !selectedToken) return;

    try {
      handleNext();
      const sessionId = await initiatePayment({
        network: selectedNetwork,
        tokenAddress: selectedToken,
        amount,
        serviceType,
      });
      onSuccess(sessionId);
    } catch (error) {
      onError(error instanceof Error ? error : new Error("Payment failed"));
      handleBack();
    }
  }, [
    selectedNetwork,
    selectedToken,
    amount,
    serviceType,
    initiatePayment,
    onSuccess,
    onError,
    handleNext,
    handleBack,
  ]);

  const renderStepContent = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onSelect={handleNetworkSelect}
            />
          );
        case 1:
          return (
            <TokenSelector
              network={selectedNetwork!}
              selectedToken={selectedToken}
              onSelect={handleTokenSelect}
            />
          );
        case 2:
          return (
            <PaymentConfirmation
              network={selectedNetwork!}
              token={selectedToken!}
              amount={amount}
              serviceType={serviceType}
            />
          );
        case 3:
          return (
            <PaymentStatus status={paymentStatus} isProcessing={isProcessing} />
          );
        default:
          return null;
      }
    },
    [
      selectedNetwork,
      selectedToken,
      amount,
      serviceType,
      paymentStatus,
      isProcessing,
      handleNetworkSelect,
      handleTokenSelect,
    ]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" align="center">
          Payment
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isProcessing ? <CircularProgress /> : renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={isProcessing}>
          Cancel
        </Button>

        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack} disabled={isProcessing}>
            Back
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            color="primary"
            disabled={isProcessing}
          >
            Confirm Payment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
