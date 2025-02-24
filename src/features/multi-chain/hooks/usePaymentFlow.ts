import { useState, useCallback } from 'react';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../services/payment/types/PaymentSession';
import { PaymentSessionService } from '../services/payment/PaymentSessionService';
import { usePaymentTracking } from './usePaymentTracking';

interface PaymentFlowState {
  network?: PaymentNetwork;
  token?: PaymentToken;
  status: PaymentStatus;
  txHash?: string;
  error?: string;
}

interface UsePaymentFlowProps {
  amount: bigint;
  serviceType: string;
  userId: string;
}

export const usePaymentFlow = ({ amount, serviceType, userId }: UsePaymentFlowProps) => {
  const [state, setState] = useState<PaymentFlowState>({
    status: 'PENDING',
  });

  const { trackPaymentStarted, trackPaymentCompleted, trackPaymentFailed } = usePaymentTracking();

  const sessionService = PaymentSessionService.getInstance();

  const selectNetwork = useCallback((network: PaymentNetwork) => {
    setState(prev => ({ ...prev, network, token: undefined }));
  }, []);

  const selectToken = useCallback((token: PaymentToken) => {
    setState(prev => ({ ...prev, token }));
  }, []);

  const startPayment = useCallback(async () => {
    if (!state.network || !state.token) {
      setState(prev => ({
        ...prev,
        error: 'Veuillez sélectionner un réseau et un token',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'PROCESSING', error: undefined }));
      trackPaymentStarted(state.network, state.token.symbol);

      const session = await sessionService.createSession({
        network: state.network,
        token: state.token,
        amount,
        serviceType,
        userId,
      });

      // Écouter les mises à jour de la session
      sessionService.onSessionUpdate(session.id, (updatedSession) => {
        setState(prev => ({
          ...prev,
          status: updatedSession.status,
          txHash: updatedSession.txHash,
          error: updatedSession.error,
        }));

        if (updatedSession.status === 'COMPLETED') {
          trackPaymentCompleted(session.id);
        } else if (updatedSession.status === 'FAILED') {
          trackPaymentFailed(session.id, updatedSession.error);
        }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      trackPaymentFailed('unknown', error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  }, [state.network, state.token, amount, serviceType, userId, trackPaymentStarted, trackPaymentCompleted, trackPaymentFailed]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, status: 'PENDING', error: undefined, txHash: undefined }));
  }, []);

  return {
    state,
    selectNetwork,
    selectToken,
    startPayment,
    retry,
  };
}; 