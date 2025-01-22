import { ethers } from 'ethers';
import { PolygonPaymentService, PolygonPaymentConfig } from '../PolygonPaymentService';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../../payment/types/PaymentSession';

// Mock ethers
jest.mock('ethers');

describe('PolygonPaymentService', () => {
  let service: PolygonPaymentService;
  let mockProvider: jest.Mocked<ethers.providers.Provider>;
  let mockSigner: jest.Mocked<ethers.Signer>;
  let mockContract: any;
  let sessionService: PaymentSessionService;

  const mockConfig: PolygonPaymentConfig = {
    contractAddress: '0x1234567890123456789012345678901234567890',
    receiverAddress: '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A',
    provider: {} as ethers.providers.Provider,
    signer: {} as ethers.Signer,
    maxGasPrice: ethers.utils.parseUnits('500', 'gwei') // 500 gwei max
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 137 }), // Polygon chainId
    } as any;

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234'),
      provider: mockProvider,
    } as any;

    mockContract = {
      payWithMatic: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue(true)
      }),
      payWithToken: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue(true)
      }),
      isTokenSupported: jest.fn().mockResolvedValue(true),
      getGasPrice: jest.fn().mockResolvedValue(ethers.utils.parseUnits('100', 'gwei')),
      onPaymentReceived: jest.fn(),
    };

    // Initialize services
    sessionService = PaymentSessionService.getInstance();
    service = PolygonPaymentService.getInstance({
      ...mockConfig,
      provider: mockProvider,
      signer: mockSigner
    });
  });

  afterEach(() => {
    service.cleanup();
    sessionService.cleanup();
  });

  describe('payWithMatic', () => {
    it('should process MATIC payment successfully', async () => {
      const amount = ethers.utils.parseEther('1');
      const serviceType = 'token_creation';
      const userId = 'user123';

      const sessionId = await service.payWithMatic(amount, serviceType, userId);
      
      const session = sessionService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe(PaymentStatus.PROCESSING);
      expect(session?.token.network).toBe(PaymentNetwork.POLYGON);
      expect(session?.token.symbol).toBe('MATIC');
    });

    it('should reject when gas price is too high', async () => {
      mockContract.getGasPrice.mockResolvedValue(ethers.utils.parseUnits('600', 'gwei'));

      await expect(
        service.payWithMatic(
          ethers.utils.parseEther('1'),
          'token_creation',
          'user123'
        )
      ).rejects.toThrow('Gas price too high');
    });

    it('should handle payment failure', async () => {
      mockContract.payWithMatic.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.payWithMatic(
          ethers.utils.parseEther('1'),
          'token_creation',
          'user123'
        )
      ).rejects.toThrow('Failed to process MATIC payment');
    });
  });

  describe('payWithToken', () => {
    const mockToken = {
      symbol: 'USDC',
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
      network: PaymentNetwork.POLYGON
    };

    it('should process token payment successfully', async () => {
      const amount = ethers.utils.parseUnits('100', 6); // 100 USDC
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
          ethers.utils.parseUnits('100', 6),
          'token_creation',
          'user123',
          mockToken
        )
      ).rejects.toThrow('Token not supported');
    });

    it('should reject when gas price is too high', async () => {
      mockContract.getGasPrice.mockResolvedValue(ethers.utils.parseUnits('600', 'gwei'));

      await expect(
        service.payWithToken(
          mockToken.address,
          ethers.utils.parseUnits('100', 6),
          'token_creation',
          'user123',
          mockToken
        )
      ).rejects.toThrow('Gas price too high');
    });
  });

  describe('event handling', () => {
    it('should update session status on payment received', async () => {
      // Create a test session
      const session = sessionService.createSession(
        'user123',
        ethers.utils.parseEther('1'),
        {
          symbol: 'MATIC',
          address: ethers.constants.AddressZero,
          decimals: 18,
          network: PaymentNetwork.POLYGON
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
