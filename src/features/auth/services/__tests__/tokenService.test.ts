import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenService } from '../tokenService';
import { notificationService } from '../notificationService';
import { storageService } from '../storageService';
import { AuthError } from '../../errors/AuthError';
import type { User } from 'firebase/auth';

vi.mock('../notificationService');
vi.mock('../storageService', () => ({
  storageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('TokenService', () => {
  let mockUser: vi.Mocked<User>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock de l'utilisateur Firebase
    mockUser = {
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
    } as unknown as vi.Mocked<User>;

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
      mockUser.getIdToken.mockResolvedValue(mockToken);
      mockUser.getIdTokenResult.mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser);

      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(mockUser.getIdTokenResult).toHaveBeenCalled();
    });

    it('devrait nettoyer le service lorsqu\'initialisé avec un utilisateur null', async () => {
      await tokenService.initialize(null);
      
      const token = await tokenService.getToken().catch(e => e);
      expect(token).toBeInstanceOf(AuthError);
      expect(token.code).toBe(AuthError.CODES.SESSION_EXPIRED);
    });
  });

  describe('refreshToken', () => {
    it('devrait rafraîchir le token avec succès', async () => {
      const mockToken = 'new-token';
      mockUser.getIdToken.mockResolvedValue(mockToken);
      mockUser.getIdTokenResult.mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser);
      
      // Avancer le temps pour déclencher un rafraîchissement
      vi.advanceTimersByTime(45 * 60 * 1000 + 1000);
      
      await Promise.resolve(); // Laisser le temps au rafraîchissement de s'exécuter
      
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2); // Initial + rafraîchissement
    });

    it('devrait notifier lorsque le token est sur le point d\'expirer', async () => {
      const mockToken = 'mock-token';
      mockUser.getIdToken.mockResolvedValue(mockToken);
      mockUser.getIdTokenResult.mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser);

      expect(notificationService.warning).toHaveBeenCalledWith(
        'Votre session va bientôt expirer'
      );
    });
  });

  describe('getToken', () => {
    it('devrait retourner un token valide', async () => {
      const mockToken = 'mock-token';
      mockUser.getIdToken.mockResolvedValue(mockToken);
      mockUser.getIdTokenResult.mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser);
      
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
      mockUser.getIdToken.mockResolvedValue(mockToken);
      mockUser.getIdTokenResult.mockResolvedValue({
        token: mockToken,
        claims: { admin: true },
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        signInProvider: 'custom'
      });

      await tokenService.initialize(mockUser);
      tokenService.cleanup();
      
      await expect(tokenService.getToken()).rejects.toThrow('No token available');
    });
  });
});
