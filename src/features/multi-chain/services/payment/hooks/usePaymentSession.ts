import { useState, useEffect, useCallback } from "react";
import { PaymentSession, PaymentStatus, PaymentToken } from "../types";
import { AbstractChainService } from "../base/AbstractChainService";

interface UsePaymentSessionProps {
  chainService: AbstractChainService;
  userId: string;
  token?: PaymentToken;
  amount?: string;
}

interface UsePaymentSessionResult {
  session: PaymentSession | null;
  status: PaymentStatus | null;
  error: Error | null;
  createSession: (token: PaymentToken, amount: string) => Promise<void>;
  processPayment: () => Promise<void>;
  isLoading: boolean;
}

export function usePaymentSession({
  chainService,
  userId,
  token,
  amount,
}: UsePaymentSessionProps): UsePaymentSessionResult {
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(
    async (paymentToken: PaymentToken, paymentAmount: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const newSession = await chainService.createPaymentSession({
          userId,
          token: paymentToken,
          amount: paymentAmount,
        });
        setSession(newSession);
        setStatus(newSession.status);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [chainService, userId]
  );

  const processPayment = useCallback(async () => {
    if (!session) {
      setError(new Error("Aucune session active"));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedSession = await chainService.processPayment(session);
      setSession(updatedSession);
      setStatus(updatedSession.status);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [chainService, session]);

  useEffect(() => {
    if (token && amount) {
      createSession(token, amount);
    }
  }, [token, amount, createSession]);

  useEffect(() => {
    if (session?.id) {
      const intervalId = setInterval(async () => {
        try {
          const currentStatus = await chainService.getPaymentStatus(session.id);
          setStatus(currentStatus);
        } catch (err) {
          console.error("Erreur lors de la mise à jour du statut:", err);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [chainService, session?.id]);

  return {
    session,
    status,
    error,
    createSession,
    processPayment,
    isLoading,
  };
}
