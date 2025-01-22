import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PaymentStatus as Status } from '../../services/payment/types/PaymentSession';

interface PaymentStatusProps {
  status: Status;
  isProcessing: boolean;
  error?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  isProcessing,
  error,
}) => {
  const renderContent = () => {
    if (isProcessing) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6">Processing Payment</Typography>
          <Typography color="text.secondary">
            Please wait while we process your transaction
          </Typography>
        </Box>
      );
    }

    switch (status) {
      case Status.CONFIRMED:
        return (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            sx={{
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
            }}
          >
            <AlertTitle>Payment Successful</AlertTitle>
            Your payment has been confirmed and processed successfully.
          </Alert>
        );

      case Status.FAILED:
        return (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon fontSize="large" />}
            sx={{
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
            }}
          >
            <AlertTitle>Payment Failed</AlertTitle>
            {error || 'There was an error processing your payment. Please try again.'}
          </Alert>
        );

      case Status.PENDING:
        return (
          <Alert
            severity="info"
            sx={{
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
            }}
          >
            <AlertTitle>Payment Pending</AlertTitle>
            Your payment is being processed. This may take a few minutes.
          </Alert>
        );

      case Status.EXPIRED:
        return (
          <Alert
            severity="warning"
            sx={{
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
            }}
          >
            <AlertTitle>Payment Expired</AlertTitle>
            The payment session has expired. Please start a new payment.
          </Alert>
        );

      default:
        return (
          <Alert
            severity="info"
            sx={{
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
            }}
          >
            <AlertTitle>Unknown Status</AlertTitle>
            The payment status is unknown. Please contact support if this persists.
          </Alert>
        );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderContent()}
    </Box>
  );
};
