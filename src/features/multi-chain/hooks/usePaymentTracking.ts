import { useCallback } from "react";
import { PaymentNetwork } from "../services/payment/types/PaymentSession";

export const usePaymentTracking = () => {
  const trackPaymentStarted = useCallback(
    (network: PaymentNetwork, tokenSymbol: string) => {
      // TODO: Implémenter le tracking des événements de paiement
      console.log("Payment started:", { network, tokenSymbol });
    },
    []
  );

  const trackPaymentCompleted = useCallback((sessionId: string) => {
    console.log("Payment completed:", { sessionId });
  }, []);

  const trackPaymentFailed = useCallback(
    (sessionId: string, error?: string) => {
      console.log("Payment failed:", { sessionId, error });
    },
    []
  );

  return {
    trackPaymentStarted,
    trackPaymentCompleted,
    trackPaymentFailed,
  };
};
