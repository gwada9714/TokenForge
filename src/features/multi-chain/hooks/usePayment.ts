import { useState, useCallback } from 'react';
import { PaymentNetwork, PaymentStatus } from '../services/payment/types/PaymentSession';
import { EthereumPaymentService } from '../services/ethereum/EthereumPaymentService';
import { BinancePaymentService } from '../services/binance/BinancePaymentService';
import { PolygonPaymentService } from '../services/polygon/PolygonPaymentService';
import { SolanaPaymentService } from '../services/solana/SolanaPaymentService';
import { PublicKey } from '@solana/web3.js';
import { PaymentOptions } from '../services/payment/types/PaymentService';
import { BasePaymentService } from '../services/payment/BasePaymentService';

interface PaymentParams {
  network: PaymentNetwork;
  tokenAddress: string;
  amount: number;
  serviceType: string;
  options?: PaymentOptions;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [error, setError] = useState<string | null>(null);

  const getServiceForNetwork = useCallback((network: PaymentNetwork): BasePaymentService => {
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return EthereumPaymentService.getInstance();
      case PaymentNetwork.BINANCE:
        return BinancePaymentService.getInstance();
      case PaymentNetwork.POLYGON:
        return PolygonPaymentService.getInstance();
      case PaymentNetwork.SOLANA:
        return SolanaPaymentService.getInstance();
      default:
        throw new Error('Unsupported network');
    }
  }, []);

  const initiatePayment = useCallback(async (params: PaymentParams): Promise<string> => {
    setIsProcessing(true);
    setError(null);
    setPaymentStatus(PaymentStatus.PENDING);

    try {
      const service = getServiceForNetwork(params.network);
      const tokenAddress = params.network === PaymentNetwork.SOLANA ? 
        new PublicKey(params.tokenAddress) : 
        params.tokenAddress;

      const sessionId = await service.payWithToken(
        tokenAddress,
        params.amount,
        params.serviceType,
        'user123', // TODO: Get actual user ID
        params.options || {}
      );

      setPaymentStatus(PaymentStatus.PROCESSING);
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setPaymentStatus(PaymentStatus.FAILED);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [getServiceForNetwork]);

  return {
    initiatePayment,
    paymentStatus,
    isProcessing,
    error,
  };
};
