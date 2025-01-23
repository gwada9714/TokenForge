import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { SolanaPaymentService } from '../SolanaPaymentService';
import { createSolanaConnectionMock } from './solana-mocks';
import { PROGRAM_ID_STR, RECEIVER_STR } from './test-constants';

export interface TestContext {
  service: SolanaPaymentService;
  sessionService: PaymentSessionService;
  connection: Connection;
  wallet: Keypair;
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

export function setupTestContext(): TestContext {
  const wallet = Keypair.generate();
  const connection = createSolanaConnectionMock();
  
  const config = {
    programId: new PublicKey(PROGRAM_ID_STR),
    connection,
    wallet,
    receiverAddress: new PublicKey(RECEIVER_STR)
  };

  const sessionService = PaymentSessionService.getInstance();
  const service = SolanaPaymentService.getInstance(config);

  return {
    service,
    sessionService,
    connection,
    wallet
  };
}

export function mockSessionService(sessionService: PaymentSessionService) {
  const mockSession = createTestSession();
  const confirmedSession = createTestSession({ status: PaymentStatus.CONFIRMED });

  vi.spyOn(sessionService, 'createSession').mockReturnValue(mockSession);
  vi.spyOn(sessionService, 'updateSessionStatus').mockReturnValue(confirmedSession);

  return {
    mockSession,
    confirmedSession
  };
}
