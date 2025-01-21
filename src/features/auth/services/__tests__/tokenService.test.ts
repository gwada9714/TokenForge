import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenService } from '../tokenService';
import { notificationService } from '../notificationService';
import { AUTH_ERROR_CODES, AuthError } from '../../errors/AuthError';
import type { User } from 'firebase/auth';

// Mocks
vi.mock('../notificationService');
vi.mock('../storageService', () => ({
  storageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('../../errors/AuthError', () => ({
  AUTH_ERROR_CODES: {
    NETWORK_MISMATCH: 'AUTH_002',
    PROVIDER_ERROR: 'AUTH_009',
    SESSION_EXPIRED: 'AUTH_004'
  },
  AuthError: {
    CODES: {
      NETWORK_MISMATCH: 'AUTH_002',
      PROVIDER_ERROR: 'AUTH_009',
      SESSION_EXPIRED: 'AUTH_004'
    }
  },
  createAuthError: vi.fn((code, message) => {
    return {
      code,
      message,
      name: 'AuthError'
    };
  })
}));

describe('TokenService', () => {
  let mockUser: Partial<User>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock de l'utilisateur Firebase
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
      providerData: [],
      refreshToken: 'mock-refresh-token'
    };

    // Reset des mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    tokenService.cleanup();
  });

  describe('initialize', () => {
    it('devrait initialiser le service avec un utilisateur', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser as User);

      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(mockUser.getIdTokenResult).toHaveBeenCalled();
    });

    it('devrait nettoyer le service lorsqu\'initialisé avec un utilisateur null', async () => {
      await tokenService.initialize(null);
      
      const token = await tokenService.getToken().catch(e => e);
      expect(token).toBeInstanceOf(AuthError);
      expect(token.code).toBe(AUTH_ERROR_CODES.SESSION_EXPIRED);
    });
  });

  describe('refreshToken', () => {
    it('devrait rafraîchir le token avec succès', async () => {
      const mockToken = 'new-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser as User);
      
      // Avancer le temps pour déclencher un rafraîchissement
      vi.advanceTimersByTime(45 * 60 * 1000 + 1000);
      
      await Promise.resolve(); // Laisser le temps au rafraîchissement de s'exécuter
      
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2); // Initial + rafraîchissement
    });

    it('devrait notifier lorsque le token est sur le point d\'expirer', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser as User);

      expect(notificationService.warning).toHaveBeenCalledWith(
        'Votre session va bientôt expirer'
      );
    });
  });

  describe('getToken', () => {
    it('devrait retourner un token valide', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser as User);
      
      const result = await tokenService.getToken();
      expect(result).toBe(mockToken);
    });

    it('devrait lancer une erreur lorsque aucun token n\'est disponible', async () => {
      await tokenService.initialize(null);
      
      await expect(tokenService.getToken()).rejects.toThrow('No token available');
    });
  });

  describe('cleanup', () => {
    it('devrait nettoyer les informations de token et arrêter le minuteur de rafraîchissement', async () => {
      const mockToken = 'mock-token';
      (mockUser.getIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockToken);
      (mockUser.getIdTokenResult as ReturnType<typeof vi.fn>).mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser as User);
      tokenService.cleanup();
      
      await expect(tokenService.getToken()).rejects.toThrow('No token available');
    });
  });
});
