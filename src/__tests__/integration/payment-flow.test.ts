import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EthereumPaymentService } from '@/features/multi-chain/services/ethereum/EthereumPaymentService';
import { PaymentStatus, PaymentNetwork, PaymentToken } from '@/features/multi-chain/services/payment/types';
import { renderHook, act } from '@testing-library/react-hooks';
import { usePaymentSession } from '@/features/multi-chain/services/payment/hooks/usePaymentSession';

describe('Payment Flow Integration', () => {
  let ethService: EthereumPaymentService;
  const mockUserId = 'test-user-123';
  const mockAmount = '1.5';
  const mockToken: PaymentToken = {
    address: '0x1234567890123456789012345678901234567890',
    symbol: 'TEST',
    decimals: 18,
    network: PaymentNetwork.ETHEREUM
  };

  beforeEach(() => {
    ethService = new EthereumPaymentService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Hook Integration', () => {
    it('devrait gérer le flux complet de paiement via le hook', async () => {
      const { result } = renderHook(() => usePaymentSession({
        chainService: ethService,
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      }));

      // Vérifier l'état initial
      expect(result.current.session).toBeNull();
      expect(result.current.status).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      // Créer une session
      await act(async () => {
        await result.current.createSession(mockToken, mockAmount);
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.session?.status).toBe(PaymentStatus.PENDING);
      expect(result.current.isLoading).toBe(false);

      // Traiter le paiement
      await act(async () => {
        await result.current.processPayment();
      });

      expect(result.current.session?.status).toBe(PaymentStatus.CONFIRMED);
      expect(result.current.error).toBeNull();
    });

    it('devrait gérer les erreurs correctement', async () => {
      // Simuler une erreur réseau
      vi.spyOn(ethService, 'processPayment').mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => usePaymentSession({
        chainService: ethService,
        userId: mockUserId
      }));

      await act(async () => {
        await result.current.createSession(mockToken, mockAmount);
        await result.current.processPayment();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.session?.status).toBe(PaymentStatus.FAILED);
    });

    it('devrait mettre à jour le statut périodiquement', async () => {
      const { result } = renderHook(() => usePaymentSession({
        chainService: ethService,
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      }));

      await act(async () => {
        await result.current.createSession(mockToken, mockAmount);
      });

      const initialStatus = result.current.status;

      // Simuler un changement de statut après 5 secondes
      vi.spyOn(ethService, 'getPaymentStatus').mockResolvedValueOnce(PaymentStatus.PROCESSING);
      
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.status).toBe(PaymentStatus.PROCESSING);
      expect(result.current.status).not.toBe(initialStatus);
    });
  });

  describe('Service Integration', () => {
    it('devrait valider les montants correctement', async () => {
      const invalidAmounts = ['0', '-1', 'abc'];
      const validAmounts = ['0.1', '1.5', '1000'];

      for (const amount of invalidAmounts) {
        await expect(
          ethService.createPaymentSession({
            userId: mockUserId,
            token: mockToken,
            amount
          })
        ).rejects.toThrow();
      }

      for (const amount of validAmounts) {
        const session = await ethService.createPaymentSession({
          userId: mockUserId,
          token: mockToken,
          amount
        });
        expect(session).toBeDefined();
        expect(session.amount).toBe(amount);
      }
    });

    it('devrait gérer les timeouts de transaction', async () => {
      const session = await ethService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      });

      // Simuler une transaction lente
      vi.spyOn(ethService as any, 'sendTransaction').mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 11000))
      );

      const result = await ethService.processPayment(session, { timeout: 5000 });
      expect(result.status).toBe(PaymentStatus.TIMEOUT);
    });

    it('devrait valider les transactions', async () => {
      const session = await ethService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      });

      const processedSession = await ethService.processPayment(session);
      expect(processedSession.txHash).toBeDefined();

      const isValid = await ethService.validateTransaction(processedSession.txHash!);
      expect(isValid).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('devrait gérer la reprise après erreur réseau', async () => {
      const session = await ethService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      });

      // Simuler une erreur réseau suivie d'un succès
      vi.spyOn(ethService as any, 'sendTransaction')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('0xtxhash');

      const result = await ethService.processPayment(session);
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(result.retryCount).toBeGreaterThan(0);
    });

    it('devrait limiter les tentatives de reprise', async () => {
      const session = await ethService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: mockAmount
      });

      // Simuler des erreurs réseau persistantes
      vi.spyOn(ethService as any, 'sendTransaction')
        .mockRejectedValue(new Error('Network error'));

      const result = await ethService.processPayment(session);
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.retryCount).toBeLessThanOrEqual(3);
    });
  });
}); 