import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../../services/auth/AuthService';
import { FirebaseService } from '../../services/firebase/FirebaseService';
import type { ErrorCode } from '../../types/errors';

describe('Authentication Security', () => {
  let firebaseService: FirebaseService;

  beforeEach(() => {
    firebaseService = new FirebaseService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Authentification', () => {
    it('devrait initialiser correctement le service d\'authentification', async () => {
      await expect(authService.initialize()).resolves.not.toThrow();
    });

    it('devrait gérer correctement le changement d\'état d\'authentification', async () => {
      const mockAuthStateChange = vi.fn();
      const mockAuth = {
        onAuthStateChanged: vi.fn((callback) => {
          mockAuthStateChange.mockImplementation(() => callback({ email: 'test@example.com' }));
          return () => {};
        })
      };

      vi.spyOn(firebaseService, 'getAuth').mockReturnValue(mockAuth as any);
      await authService.initialize();
      
      mockAuthStateChange();
      expect(mockAuth.onAuthStateChanged).toHaveBeenCalled();
    });

    it('devrait nettoyer correctement les ressources', async () => {
      await expect(authService.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Gestion des Erreurs', () => {
    it('devrait gérer les erreurs d\'initialisation', async () => {
      vi.spyOn(firebaseService, 'getAuth').mockImplementation(() => {
        throw new Error('Firebase non initialisé');
      });

      await expect(authService.initialize()).rejects.toThrow('Firebase non initialisé');
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      const mockAuth = {
        onAuthStateChanged: vi.fn((_, errorCallback) => {
          errorCallback(new Error('Erreur d\'authentification'));
          return () => {};
        })
      };

      vi.spyOn(firebaseService, 'getAuth').mockReturnValue(mockAuth as any);
      await expect(authService.initialize()).resolves.not.toThrow();
    });
  });
}); 