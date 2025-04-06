import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useSubscription } from "../hooks/useSubscription";
import { SubscriptionTier } from "../types";

// Mock SubscriptionService
vi.mock("../services/subscriptionService", () => ({
  SubscriptionService: vi.fn().mockImplementation(() => ({
    getSubscriptionDetails: vi.fn().mockReturnValue({
      tier: SubscriptionTier.FORGERON,
      features: {
        canDeployMainnet: true,
        hasMintBurn: true,
        hasBlacklist: true,
        hasAdvancedFeatures: false,
        maxCustomTax: 1.5,
        prioritySupport: false,
      },
      price: { amount: "0.2", currency: "BNB" },
    }),
    verifyPayment: vi.fn().mockResolvedValue(true),
  })),
}));

describe("useSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null subscription", () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.currentSubscription).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle successful subscription", async () => {
    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      const success = await result.current.subscribe(
        SubscriptionTier.FORGERON,
        "0xtxhash"
      );
      expect(success).toBe(true);
    });

    expect(result.current.currentSubscription?.tier).toBe(
      SubscriptionTier.FORGERON
    );
    expect(result.current.error).toBeNull();
  });

  it("should check features correctly", async () => {
    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      await result.current.subscribe(SubscriptionTier.FORGERON, "0xtxhash");
    });

    expect(result.current.checkFeature("canDeployMainnet")).toBe(true);
    expect(result.current.checkFeature("prioritySupport")).toBe(false);
  });
});
