import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { PaymentSessionService } from "../PaymentSessionService";
import {
  PaymentNetwork,
  PaymentStatus,
  PaymentToken,
} from "../types/PaymentSession";
import { PaymentSyncService } from "../PaymentSyncService";

describe("PaymentSessionService", () => {
  let service: PaymentSessionService;
  let syncService: PaymentSyncService;

  const mockToken: PaymentToken = {
    symbol: "USDT",
    address: "0x1234567890123456789012345678901234567890",
    decimals: 18,
    network: PaymentNetwork.ETHEREUM,
  };

  const ONE_ETH = BigInt("1000000000000000000"); // 1 ETH en wei

  beforeEach(() => {
    service = PaymentSessionService.getInstance();
    syncService = PaymentSyncService.getInstance(service);
    syncService.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.cleanup();
    vi.useRealTimers();
  });

  describe("createSession", () => {
    it("should create a new payment session", async () => {
      const params = {
        userId: "user123",
        amount: BigInt(1000000),
        network: PaymentNetwork.ETHEREUM,
        token: {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
        },
        serviceType: "SUBSCRIPTION",
      };

      const session = await service.createSession(params);

      expect(session).toMatchObject({
        userId: params.userId,
        amount: params.amount,
        network: params.network,
        token: params.token,
        serviceType: params.serviceType,
        status: "PENDING",
        retryCount: 0,
      });

      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("updateSessionStatus", () => {
    it("should update session status and emit event", async () => {
      const params = {
        userId: "user123",
        amount: BigInt(1000000),
        network: PaymentNetwork.ETHEREUM,
        token: {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
        },
        serviceType: "SUBSCRIPTION",
      };

      const session = await service.createSession(params);
      const txHash = "0x123456789";

      let eventEmitted = false;
      service.onSessionUpdate(session.id, (updatedSession) => {
        expect(updatedSession.status).toBe("COMPLETED");
        expect(updatedSession.txHash).toBe(txHash);
        eventEmitted = true;
      });

      service.updateSessionStatus(session.id, "COMPLETED", txHash);
      expect(eventEmitted).toBe(true);

      const updatedSession = service.getSession(session.id);
      expect(updatedSession).toBeUndefined(); // Session should be cleaned up after completion
    });

    it("should handle session expiry", async () => {
      jest.useFakeTimers();

      const params = {
        userId: "user123",
        amount: BigInt(1000000),
        network: PaymentNetwork.ETHEREUM,
        token: {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
        },
        serviceType: "SUBSCRIPTION",
      };

      const session = await service.createSession(params);
      let eventEmitted = false;

      service.onSessionUpdate(session.id, (updatedSession) => {
        expect(updatedSession.status).toBe("FAILED");
        expect(updatedSession.error).toBe("Session expired");
        eventEmitted = true;
      });

      jest.advanceTimersByTime(30 * 60 * 1000 + 1000); // 30 minutes + 1 second
      expect(eventEmitted).toBe(true);

      const expiredSession = service.getSession(session.id);
      expect(expiredSession).toBeUndefined();

      jest.useRealTimers();
    });
  });

  describe("getAllUserSessions", () => {
    it("should return all sessions for a user", async () => {
      const userId = "user123";
      const params = {
        userId,
        amount: BigInt(1000000),
        network: PaymentNetwork.ETHEREUM,
        token: {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
        },
        serviceType: "SUBSCRIPTION",
      };

      await service.createSession(params);
      await service.createSession(params);

      const userSessions = service.getAllUserSessions(userId);
      expect(userSessions).toHaveLength(2);
      expect(userSessions[0].userId).toBe(userId);
      expect(userSessions[1].userId).toBe(userId);
    });
  });

  describe("retryPayment", () => {
    it("should allow retry within limit", async () => {
      const session = service.createSession(
        "user123",
        ONE_ETH,
        mockToken,
        "token_creation"
      );

      const canRetry = await service.retryPayment(session.id);
      const updatedSession = service.getSession(session.id);

      expect(canRetry).toBe(true);
      expect(updatedSession?.retryCount).toBe(1);
      expect(updatedSession?.status).toBe(PaymentStatus.PENDING);
    });

    it("should fail after retry limit", async () => {
      const session = service.createSession(
        "user123",
        ONE_ETH,
        mockToken,
        "token_creation"
      );

      // Perform 3 retries
      await service.retryPayment(session.id);
      await service.retryPayment(session.id);
      await service.retryPayment(session.id);
      const canRetry = await service.retryPayment(session.id);
      const updatedSession = service.getSession(session.id);

      expect(canRetry).toBe(false);
      expect(updatedSession?.status).toBe(PaymentStatus.FAILED);
      expect(updatedSession?.error).toBe("Retry limit exceeded");
    });
  });

  describe("payment timeout", () => {
    it("should timeout pending payments after TIMEOUT_MS", () => {
      const session = service.createSession(
        "user123",
        ONE_ETH,
        mockToken,
        "token_creation"
      );

      // Fast-forward time by 10 seconds
      vi.advanceTimersByTime(10000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
      expect(timedOutSession?.error).toBe("Payment timeout exceeded");
    });

    it("should not timeout confirmed payments", () => {
      const session = service.createSession(
        "user123",
        ONE_ETH,
        mockToken,
        "token_creation"
      );

      // Confirm the payment
      service.updateSessionStatus(
        session.id,
        PaymentStatus.CONFIRMED,
        "0xtxhash"
      );

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      const confirmedSession = service.getSession(session.id);
      expect(confirmedSession?.status).toBe(PaymentStatus.CONFIRMED);
    });

    it("should reset timeout on retry", async () => {
      const session = service.createSession(
        "user123",
        ONE_ETH,
        mockToken,
        "token_creation"
      );

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);

      // Retry payment
      await service.retryPayment(session.id);

      // Advance time by 5 more seconds (should not timeout yet)
      vi.advanceTimersByTime(5000);

      const activeSession = service.getSession(session.id);
      expect(activeSession?.status).toBe(PaymentStatus.PENDING);

      // Advance time to trigger timeout
      vi.advanceTimersByTime(5000);

      const timedOutSession = service.getSession(session.id);
      expect(timedOutSession?.status).toBe(PaymentStatus.TIMEOUT);
    });
  });
});
