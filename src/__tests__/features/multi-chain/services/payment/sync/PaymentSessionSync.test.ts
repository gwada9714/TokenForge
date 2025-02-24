import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentSessionSync } from '@/features/multi-chain/services/payment/sync/PaymentSessionSync';
import { PaymentSession, PaymentStatus, PaymentNetwork } from '@/features/multi-chain/services/payment/types';

describe('PaymentSessionSync', () => {
  let sync: PaymentSessionSync;
  let mockSession: PaymentSession;

  beforeEach(() => {
    // Mock BroadcastChannel
    global.BroadcastChannel = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      close: vi.fn(),
      onmessage: null
    }));

    sync = new PaymentSessionSync();
    mockSession = {
      id: 'test-session-1',
      userId: 'test-user',
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.ETHEREUM,
      token: {
        address: '0x1234',
        symbol: 'TEST',
        decimals: 18,
        network: PaymentNetwork.ETHEREUM
      },
      amount: '1.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0
    };
  });

  afterEach(() => {
    sync.cleanup();
    vi.clearAllMocks();
  });

  describe('Session Management', () => {
    it('devrait mettre à jour une session', () => {
      const sessionUpdatedSpy = vi.fn();
      sync.on('sessionUpdated', sessionUpdatedSpy);

      sync.updateSession(mockSession);

      expect(sessionUpdatedSpy).toHaveBeenCalledWith(mockSession);
      expect(sync.getSession(mockSession.id)).toEqual(mockSession);
    });

    it('devrait mettre à jour le statut d\'une session', () => {
      const statusUpdatedSpy = vi.fn();
      sync.on('statusUpdated', statusUpdatedSpy);

      sync.updateSession(mockSession);
      sync.updateStatus(mockSession.id, PaymentStatus.CONFIRMED);

      const updatedSession = sync.getSession(mockSession.id);
      expect(updatedSession?.status).toBe(PaymentStatus.CONFIRMED);
      expect(statusUpdatedSpy).toHaveBeenCalled();
    });

    it('devrait supprimer une session', () => {
      const sessionDeletedSpy = vi.fn();
      sync.on('sessionDeleted', sessionDeletedSpy);

      sync.updateSession(mockSession);
      sync.deleteSession(mockSession.id);

      expect(sync.getSession(mockSession.id)).toBeUndefined();
      expect(sessionDeletedSpy).toHaveBeenCalledWith(mockSession.id);
    });
  });

  describe('Synchronisation', () => {
    it('devrait gérer les messages de mise à jour de session', () => {
      const sessionUpdatedSpy = vi.fn();
      sync.on('sessionUpdated', sessionUpdatedSpy);

      const channel = new BroadcastChannel('payment_sync');
      channel.onmessage?.({
        data: {
          type: 'SESSION_UPDATE',
          payload: mockSession,
          timestamp: Date.now()
        }
      } as MessageEvent);

      expect(sessionUpdatedSpy).toHaveBeenCalledWith(mockSession);
    });

    it('devrait ignorer les mises à jour plus anciennes', () => {
      const oldTimestamp = Date.now() - 1000;
      const newTimestamp = Date.now();

      sync.updateSession({ ...mockSession, updatedAt: newTimestamp });

      const channel = new BroadcastChannel('payment_sync');
      channel.onmessage?.({
        data: {
          type: 'SESSION_UPDATE',
          payload: { ...mockSession, status: PaymentStatus.FAILED },
          timestamp: oldTimestamp
        }
      } as MessageEvent);

      const session = sync.getSession(mockSession.id);
      expect(session?.status).not.toBe(PaymentStatus.FAILED);
    });
  });

  describe('Nettoyage', () => {
    it('devrait nettoyer correctement les ressources', () => {
      const channelCloseSpy = vi.fn();
      const channel = new BroadcastChannel('payment_sync');
      channel.close = channelCloseSpy;

      sync.cleanup();

      expect(channelCloseSpy).toHaveBeenCalled();
      expect(sync.getSession(mockSession.id)).toBeUndefined();
    });
  });
}); 