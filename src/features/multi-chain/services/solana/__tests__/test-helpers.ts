import { vi } from "vitest";
import {
  PaymentNetwork,
  PaymentSession,
} from "../../payment/types/PaymentSession";
import { PaymentSessionService } from "../../payment/PaymentSessionService";
import { RECEIVER_STR } from "./test-constants";
import { MockedConnection } from "./test-types";

export interface TestContext {
  service: unknown;
  sessionService: PaymentSessionService;
  connection: MockedConnection;
  wallet: unknown;
}

export function createTestSession(overrides = {}): PaymentSession {
  return {
    id: "test-session-id",
    userId: "test-user-id",
    amount: BigInt(1000000),
    token: {
      address: RECEIVER_STR,
      symbol: "USDC",
      decimals: 6,
    },
    serviceType: "TEST_SERVICE",
    status: "PENDING",
    network: PaymentNetwork.SOLANA,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    retryCount: 0,
    ...overrides,
  };
}

export function mockSessionService(sessionService: PaymentSessionService) {
  const mockSession = createTestSession();
  const confirmedSession = createTestSession({ status: "COMPLETED" });

  vi.spyOn(sessionService, "createSession").mockResolvedValue(mockSession);
  vi.spyOn(sessionService, "getSession").mockResolvedValue(mockSession);
  vi.spyOn(sessionService, "updateSessionStatus").mockResolvedValue();

  return {
    mockSession,
    confirmedSession,
  };
}
