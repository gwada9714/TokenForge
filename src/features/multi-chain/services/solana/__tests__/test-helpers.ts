import { vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { RECEIVER_STR } from './test-constants';
import { MockedConnection } from './test-types';

export interface TestContext {
  service: any;
  sessionService: PaymentSessionService;
  connection: MockedConnection;
  wallet: any;
}

export function createTestSession(overrides = {}) {
  return {
    id: 'test-session-id',
    userId: 'test-user-id',
    amount: BigInt(1000000),
    token: {
      address: new PublicKey(RECEIVER_STR),
      network: PaymentNetwork.SOLANA,
      symbol: 'USDC',
      decimals: 6
    },
    serviceType: 'TEST_SERVICE',
    status: PaymentStatus.PENDING,
    network: PaymentNetwork.SOLANA,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    retryCount: 0,
    ...overrides
  };
}

export function mockSessionService(sessionService: PaymentSessionService) {
  const mockSession = createTestSession();
  const confirmedSession = createTestSession({ status: PaymentStatus.CONFIRMED });
  
  vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSession);
  vi.spyOn(sessionService, 'getSession').mockResolvedValue(mockSession);
  vi.spyOn(sessionService, 'updateSessionStatus').mockResolvedValue(confirmedSession);
  
  return {
    mockSession,
    confirmedSession
  };
}
