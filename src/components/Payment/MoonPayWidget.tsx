import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { moonpayService } from '../../services/moonpay';
import { MoonPayQuote } from '../../types/moonpay';
import { useAccount } from 'wagmi';

interface MoonPayWidgetProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const MoonPayWidget: React.FC<MoonPayWidgetProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const { address } = useAccount();
  const [quote, setQuote] = useState<MoonPayQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const newQuote = await moonpayService.getQuote(amount);
        setQuote(newQuote);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get quote');
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [amount, address, onError]);

  if (!address) {
    return (
      <Typography color="error">
        Please connect your wallet to continue with the payment
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!quote) {
    return null;
  }

  const widgetUrl = moonpayService.getWidgetUrl(address);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Summary
      </Typography>
      <Typography>
        Amount: ${amount}
      </Typography>
      <Typography>
        Estimated ETH: {quote.quoteCurrencyAmount.toFixed(6)} ETH
      </Typography>
      <Typography>
        Fees: ${quote.feeAmount + quote.extraFeeAmount + quote.networkFeeAmount}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Total: ${quote.totalAmount}
      </Typography>
      <iframe
        src={widgetUrl}
        height="600px"
        width="100%"
        title="MoonPay payment widget"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
        loading="lazy"
      />
    </Box>
  );
};
