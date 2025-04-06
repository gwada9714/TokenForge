import { useState, useCallback } from "react";
import { SubscriptionService } from "../services/subscriptionService";
import { SubscriptionTier, Subscription } from "../types";

export const useSubscription = () => {
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscriptionService = new SubscriptionService();

  const subscribe = useCallback(
    async (tier: SubscriptionTier, txHash: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const details = subscriptionService.getSubscriptionDetails(tier);
        const isValid = await subscriptionService.verifyPayment(
          txHash,
          details.price.amount
        );

        if (!isValid) {
          throw new Error("Payment verification failed");
        }

        setCurrentSubscription(details);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Subscription failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkFeature = useCallback(
    (feature: keyof Subscription["features"]): boolean => {
      return !!currentSubscription?.features[feature];
    },
    [currentSubscription]
  );

  return {
    currentSubscription,
    isLoading,
    error,
    subscribe,
    checkFeature,
  };
};
