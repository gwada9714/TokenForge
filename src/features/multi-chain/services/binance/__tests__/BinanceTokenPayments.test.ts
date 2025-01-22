import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { type Address, type Chain, type PublicClient, type WalletClient } from 'viem';
import { BinancePaymentService } from '../BinancePaymentService';
import { COMMON_TOKEN_ADDRESSES } from '../../payment/types/TokenConfig';
import { PaymentSessionService } from '../../payment/PaymentSessionService';
import { PaymentStatus } from '../../payment/types/PaymentSession';
import { PAYMENT_CONTRACT_ABI } from '../../payment/abis/TokenABI';

jest.mock('../../payment/PaymentSessionService');

describe('BinancePaymentService - Token Payments', () => {
  let paymentService: BinancePaymentService;
  let mockPublicClient: jest.Mocked<PublicClient>;
  let mockWalletClient: jest.Mocked<WalletClient>;
  let mockSessionService: jest.Mocked<PaymentSessionService>;

  beforeEach(() => {
    mockPublicClient = {
      chain: { id: 56 } as Chain,
      watchContractEvent: jest.fn().mockReturnValue(() => {}),
      readContract: jest.fn().mockImplementation(async (args: any) => {
        if (args.functionName === 'isTokenSupported') {
          return true;
        }
        throw new Error(`Unexpected contract function: ${args.functionName}`);
      }),
    } as unknown as jest.Mocked<PublicClient>;

    mockWalletClient = {
      account: { address: '0x1234...' as Address },
      signMessage: jest.fn(),
    } as unknown as jest.Mocked<WalletClient>;

    mockSessionService = {
      getInstance: jest.fn().mockReturnValue({
        updateSessionStatus: jest.fn(),
        getSession: jest.fn(),
        createSession: jest.fn(),
      }),
    } as unknown as jest.Mocked<PaymentSessionService>;

    (PaymentSessionService.getInstance as jest.Mock).mockReturnValue(mockSessionService);

    paymentService = BinancePaymentService.getInstance({
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
      contractAddress: '0xcontract...' as Address,
      receiverAddress: '0xreceiver...' as Address
    });
  });

  describe('USDT (BEP20) Payments', () => {
    it('should handle USDT payment creation', async () => {
      const amount = BigInt('1000000000000000000'); // 1 USDT (18 decimals)
      const sessionId = 'test-session-1';

      mockSessionService.updateSessionStatus = jest.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.BSC_USDT,
        amount,
        'TEST_SERVICE',
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: 'isTokenSupported',
          args: [COMMON_TOKEN_ADDRESSES.BSC_USDT],
        })
      );
    });
  });

  describe('BUSD Payments', () => {
    it('should handle BUSD payment creation', async () => {
      const amount = BigInt('1000000000000000000'); // 1 BUSD (18 decimals)
      const sessionId = 'test-session-2';

      mockSessionService.updateSessionStatus = jest.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.BSC_BUSD,
        amount,
        'TEST_SERVICE',
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: 'isTokenSupported',
          args: [COMMON_TOKEN_ADDRESSES.BSC_BUSD],
        })
      );
    });
  });

  describe('USDC (BEP20) Payments', () => {
    it('should handle USDC payment creation', async () => {
      const amount = BigInt('1000000000000000000'); // 1 USDC (18 decimals)
      const sessionId = 'test-session-3';

      mockSessionService.updateSessionStatus = jest.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.BSC_USDC,
        amount,
        'TEST_SERVICE',
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: 'isTokenSupported',
          args: [COMMON_TOKEN_ADDRESSES.BSC_USDC],
        })
      );
    });
  });
});
