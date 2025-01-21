import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sessionService } from '../sessionService';
import { notificationService } from '../notificationService';
import { tabSyncService } from '../tabSyncService';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../../../config/firebase';

// Mocks
vi.mock('../notificationService');
vi.mock('../tabSyncService');
vi.mock('../../../../config/firebase', () => ({
  auth: {
    currentUser: null
  }
}));

describe('SessionService', () => {
  let mockUser: Partial<FirebaseUser>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock user
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn()
    };

    // Mock auth.currentUser
    (auth.currentUser as any) = mockUser;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Nettoyer les intervalles et timeouts
    vi.clearAllTimers();
    // Reset auth.currentUser
    (auth.currentUser as any) = null;
  });

  describe('initSession', () => {
    it('devrait initialiser une nouvelle session', async () => {
      const mockToken = 'mock-token';
      const mockTokenResult = {
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      };

      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue(mockTokenResult);

      await sessionService.initSession();
      
      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(mockUser.getIdTokenResult).toHaveBeenCalled();
      expect(tabSyncService.subscribe).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs d\'initialisation', async () => {
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Token error'));
      
      await expect(sessionService.initSession())
        .rejects.toThrow('Failed to initialize session');
    });
  });

  describe('session timeout', () => {
    it('devrait déconnecter après timeout d\'inactivité', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      
      await sessionService.initSession();
      
      // Avance le temps de 31 minutes (plus que SESSION_TIMEOUT)
      vi.advanceTimersByTime(31 * 60 * 1000);
      
      expect(notificationService.notify).toHaveBeenCalledWith(
        'Session expirée',
        'Vous avez été déconnecté pour inactivité'
      );
    });

    it('devrait rafraîchir la session sur activité', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      
      await sessionService.initSession();
      
      // Avance de 25 minutes
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      // Simule activité utilisateur
      await sessionService.refreshSession();
      
      // Avance encore de 25 minutes
      vi.advanceTimersByTime(25 * 60 * 1000);
      
      // La session ne devrait pas avoir expiré
      expect(notificationService.notify).not.toHaveBeenCalled();
    });
  });

  describe('token refresh', () => {
    it('devrait rafraîchir le token avant expiration', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      
      await sessionService.initSession();
      
      // Avance jusqu'à 6 minutes avant expiration
      vi.advanceTimersByTime((3600000 - 6 * 60 * 1000));
      
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  describe('tab sync', () => {
    it('devrait synchroniser l\'état entre les onglets', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      
      await sessionService.initSession();
      
      expect(tabSyncService.subscribe).toHaveBeenCalled();
      
      // Simule un message de synchronisation
      const syncMessage = {
        type: 'session',
        timestamp: Date.now(),
        tabId: 'other-tab'
      };
      
      // Déclenche le callback de synchronisation
      ((tabSyncService.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0] as Function)(syncMessage);
      
      expect(notificationService.info).toHaveBeenCalledWith('Session synchronized across tabs');
    });
  });
});
