import { describe, it, expect, beforeEach } from "vitest";
import { SubscriptionService } from "../services/subscriptionService";
import { SubscriptionTier } from "../types";

describe("SubscriptionService", () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService();
  });

  describe("getSubscriptionDetails", () => {
    it("should return correct details for Apprenti tier", () => {
      const details = service.getSubscriptionDetails(SubscriptionTier.APPRENTI);
      expect(details.tier).toBe(SubscriptionTier.APPRENTI);
      expect(details.features.canDeployMainnet).toBe(false);
      expect(details.price.amount).toBe("0");
    });

    it("should return correct details for Forgeron tier", () => {
      const details = service.getSubscriptionDetails(SubscriptionTier.FORGERON);
      expect(details.tier).toBe(SubscriptionTier.FORGERON);
      expect(details.features.canDeployMainnet).toBe(true);
      expect(details.price.amount).toBe("0.2");
    });

    it("should return correct details for Maitre tier", () => {
      const details = service.getSubscriptionDetails(SubscriptionTier.MAITRE);
      expect(details.tier).toBe(SubscriptionTier.MAITRE);
      expect(details.features.prioritySupport).toBe(true);
      expect(details.price.amount).toBe("0.5");
    });
  });
});
