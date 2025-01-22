import { ethers } from 'ethers';
import { BinancePaymentService, BinancePaymentConfig } from '../BinancePaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';

// Mock ethers
jest.mock('ethers');

describe('BinancePaymentService', () => {
  let service: BinancePaymentService;
  let mockProvider: jest.Mocked<ethers.providers.Provider>;
  let mockSigner: jest.Mocked<ethers.Signer>;
  let mockContract: any;
  let sessionService: PaymentSessionService;

  const mockConfig: BinancePaymentConfig = {
    contractAddress: '0x1234567890123456789012345678901234567890',
    receiverAddress: '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A',
    provider: {} as ethers.providers.Provider,
    signer: {} as ethers.Signer
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 56 }), // BSC chainId
    } as any;

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234'),
      provider: mockProvider,
    } as any;

    mockContract = {
      payWithBNB: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue(true)
      }),
      payWithToken: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue(true)
      }),
      isTokenSupported: jest.fn().mockResolvedValue(true),
      onPaymentReceived: jest.fn(),
    };

    // Initialize services
    sessionService = PaymentSessionService.getInstance();
    service = BinancePaymentService.getInstance({
      ...mockConfig,
      provider: mockProvider,
      signer: mockSigner
    });
  });

  afterEach(() => {
    service.cleanup();
    sessionService.cleanup();
  });

  describe('payWithBNB', () => {
    it('should process BNB payment successfully', async () => {
      const amount = ethers.utils.parseEther('1');
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithBNB(amount, serviceType, userId);
      
      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token.network).toBe(PaymentNetwork.BINANCE);
      expect(session?.token.symbol).toBe('BNB');
    });

    it('should handle payment failure', async () => {
      mockContract.payWithBNB.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.payWithBNB(
          ethers.utils.parseEther('1'),
          'token_creation',
          'user123'
        )
      ).rejects.toThrow('Failed to process BNB payment');
    });
  });

  describe('payWithToken', () => {
    const mockToken = {
      symbol: 'BUSD',
      address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      decimals: 18,
      network: PaymentNetwork.BINANCE
    };

    it('should process token payment successfully', async () => {
      const amount = ethers.utils.parseUnits('100', 18); // 100 BUSD
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithToken(
        mockToken.address,
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

    it('should reject unsupported tokens', async () => {
      mockContract.isTokenSupported.mockResolvedValue(false);

      await expect(
        service.payWithToken(
          mockToken.address,
          ethers.utils.parseUnits('100', 18),
          'token_creation',
          'user123',
          mockToken
        )
      ).rejects.toThrow('Token not supported');
    });
  });

  describe('event handling', () => {
    it('should update session status on payment received', async () => {
      // Create a test session
      const session = sessionService.createSession(
        'user123',
        ethers.utils.parseEther('1'),
        {
          symbol: 'BNB',
          address: ethers.constants.AddressZero,
          decimals: 18,
          network: PaymentNetwork.BINANCE
        },
        'token_creation'
      );

      // Simulate payment received event
      const mockEvent = {
        payer: '0x1234',
        token: ethers.constants.AddressZero,
        amount: ethers.utils.parseEther('1'),
        serviceType: 'token_creation',
        sessionId: session.id
      };

      // Get the callback function
      const callback = mockContract.onPaymentReceived.mock.calls[0][0];
      
      // Call the callback with mock event
      await callback(mockEvent);

      // Verify session was updated
      const updatedSession = sessionService.getSession(session.id);
      expect(updatedSession?.status).toBe(PaymentStatus.CONFIRMED);
      expect(updatedSession?.txHash).toBe('0x1234');
    });
  });
});
