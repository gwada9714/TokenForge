import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { SolanaPaymentService, SolanaPaymentConfig } from '../SolanaPaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';

// Mock @solana/web3.js
jest.mock('@solana/web3.js');

// Mock @project-serum/anchor
jest.mock('@project-serum/anchor', () => ({
  Program: {
    at: jest.fn().mockResolvedValue({
      methods: {
        payWithSol: jest.fn().mockReturnValue({
          accounts: jest.fn().mockReturnValue({
            transaction: jest.fn().mockResolvedValue({})
          })
        }),
        payWithToken: jest.fn().mockReturnValue({
          accounts: jest.fn().mockReturnValue({
            transaction: jest.fn().mockResolvedValue({})
          })
        })
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })
  },
  AnchorProvider: jest.fn(),
  BN: jest.fn(),
}));

describe('SolanaPaymentService', () => {
  let service: SolanaPaymentService;
  let mockConnection: jest.Mocked<Connection>;
  let sessionService: PaymentSessionService;
  
  const mockKeypair = {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    secretKey: new Uint8Array(32),
  } as Keypair;

  const mockConfig: SolanaPaymentConfig = {
    programId: new PublicKey('TokenForgePay1111111111111111111111111111111111'),
    connection: new Connection('http://localhost:8899'),
    payer: mockKeypair,
    receiver: new PublicKey('22222222222222222222222222222222'),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup connection mock
    mockConnection = {
      getBalance: jest.fn().mockResolvedValue(1000000000),
      getTokenAccountBalance: jest.fn().mockResolvedValue({
        value: { uiAmount: 100 }
      }),
    } as any;

    // Initialize services
    sessionService = PaymentSessionService.getInstance();
    service = SolanaPaymentService.getInstance({
      ...mockConfig,
      connection: mockConnection,
    });
  });

  afterEach(() => {
    service.cleanup();
    sessionService.cleanup();
  });

  describe('payWithSol', () => {
    it('should process SOL payment successfully', async () => {
      const amount = 1000000000; // 1 SOL
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithSol(amount, serviceType, userId);
      
      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token.network).toBe(PaymentNetwork.SOLANA);
      expect(session?.token.symbol).toBe('SOL');
    });

    it('should handle payment failure', async () => {
      // Mock transaction failure
      (SystemProgram as any).transfer.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.payWithSol(
          1000000000,
          'token_creation',
          'user123'
        )
      ).rejects.toThrow('Failed to process SOL payment');
    });
  });

  describe('payWithToken', () => {
    const mockToken = {
      symbol: 'USDC',
      address: (new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).toBase58(),
      decimals: 6,
      network: PaymentNetwork.SOLANA
    };

    it('should process token payment successfully', async () => {
      const amount = 100000000; // 100 USDC
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithToken(
        new PublicKey(mockToken.address),
        amount,
        serviceType,
        userId,
        mockToken
      );

      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token).toEqual(mockToken);
    });
  });

  describe('event handling', () => {
    it('should update session status on payment received', async () => {
      // Create a test session
      const session = sessionService.createSession(
        'user123',
        new BN(1000000000),
        {
          symbol: 'SOL',
          address: SystemProgram.programId.toBase58(),
          decimals: 9,
          network: PaymentNetwork.SOLANA
        },
        'token_creation'
      );

      // Simulate payment received event
      const mockEvent = {
        payer: new PublicKey('11111111111111111111111111111111'),
        token: null,
        amount: new BN(1000000000),
        serviceType: 'token_creation',
        sessionId: session.id
      };

      // Get event handler
      const eventHandler = (service as any).handlePaymentReceived.bind(service);
      
      // Call event handler with mock event
      await eventHandler(mockEvent);

      // Verify session was updated
      const updatedSession = sessionService.getSession(session.id);
      expect(updatedSession?.status).toBe(PaymentStatus.CONFIRMED);
      expect(updatedSession?.txHash).toBe('11111111111111111111111111111111');
    });
  });

  describe('balance queries', () => {
    it('should get SOL balance', async () => {
      const balance = await service.getBalance(mockKeypair.publicKey);
      expect(balance).toBe(1000000000);
    });

    it('should get token balance', async () => {
      const tokenMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      const balance = await service.getTokenBalance(tokenMint, mockKeypair.publicKey);
      expect(balance).toBe(100);
    });
  });
});
