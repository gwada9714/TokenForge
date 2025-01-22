import { useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

import { PaymentNetwork } from '../services/payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../services/payment/types/PaymentService';
import { EthereumPaymentService } from '../services/ethereum/EthereumPaymentService';
import { SolanaPaymentService } from '../services/solana/SolanaPaymentService';
import { PolygonPaymentService } from '../services/polygon/PolygonPaymentService';
import { BinancePaymentService } from '../services/binance/BinancePaymentService';

export const usePayment = () => {
  const { provider } = useWeb3React<Web3Provider>();
  const { publicKey, signTransaction } = useWallet();

  const paymentServices = useMemo(() => {
    if (!provider && !publicKey) return null;

    const services: Partial<Record<PaymentNetwork, BasePaymentService>> = {};

    if (provider) {
      services[PaymentNetwork.ETHEREUM] = EthereumPaymentService.getInstance({
        provider,
        signer: provider.getSigner(),
        contractAddress: process.env.REACT_APP_ETHEREUM_PAYMENT_CONTRACT!,
        receiverAddress: process.env.REACT_APP_PAYMENT_RECEIVER!
      });

      services[PaymentNetwork.POLYGON] = PolygonPaymentService.getInstance({
        provider,
        signer: provider.getSigner(),
        contractAddress: process.env.REACT_APP_POLYGON_PAYMENT_CONTRACT!,
        receiverAddress: process.env.REACT_APP_PAYMENT_RECEIVER!
      });

      services[PaymentNetwork.BINANCE] = BinancePaymentService.getInstance({
        provider,
        signer: provider.getSigner(),
        contractAddress: process.env.REACT_APP_BINANCE_PAYMENT_CONTRACT!,
        receiverAddress: process.env.REACT_APP_PAYMENT_RECEIVER!
      });
    }

    if (publicKey && signTransaction) {
      services[PaymentNetwork.SOLANA] = SolanaPaymentService.getInstance({
        connection: provider as any,
        wallet: {
          publicKey,
          signTransaction
        } as any,
        programId: new PublicKey(process.env.REACT_APP_SOLANA_PAYMENT_PROGRAM!),
        receiverAddress: new PublicKey(process.env.REACT_APP_PAYMENT_RECEIVER!)
      });
    }

    return services;
  }, [provider, publicKey, signTransaction]);

  const pay = useCallback(async (
    network: PaymentNetwork,
    tokenAddress: string | PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions = {}
  ) => {
    if (!paymentServices) {
      throw new Error('Payment services not initialized');
    }

    const service = paymentServices[network];
    if (!service) {
      throw new Error(`Payment service not found for network: ${network}`);
    }

    return service.payWithToken(tokenAddress, amount, serviceType, userId, options);
  }, [paymentServices]);

  const isTokenSupported = useCallback(async (
    network: PaymentNetwork,
    tokenAddress: string | PublicKey
  ): Promise<boolean> => {
    if (!paymentServices) {
      return false;
    }

    const service = paymentServices[network];
    if (!service || !service.isTokenSupported) {
      return false;
    }

    return service.isTokenSupported(tokenAddress);
  }, [paymentServices]);

  return {
    pay,
    isTokenSupported,
    isReady: !!paymentServices
  };
};
