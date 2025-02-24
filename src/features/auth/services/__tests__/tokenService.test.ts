import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenService } from '../tokenService';
import { logService } from '../logService';
import { notificationService } from '../notificationService';
import { createAuthError, AUTH_ERROR_CODES } from '../../errors/AuthError';
import type { User } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn()
}));

// Mock services
vi.mock('../logService', () => ({
  logService: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../notificationService', () => ({
  notificationService: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../retryService', () => ({
  retryService: {
    withRetry: vi.fn().mockImplementation(async (fn, config, retryableErrors) => {
      if (typeof fn === 'function') {
        try {
          return await fn();
        } catch (error) {
          // Si l'erreur est retryable et qu'il reste des tentatives, on réessaie
          if (retryableErrors?.includes((error as any)?.code) && config?.maxAttempts > 1) {
            return await fn();
          }
          throw error;
        }
      }
      throw new Error('fn is not a function');
    }),
    withTimeout: vi.fn().mockImplementation(async (promise, _timeout, operation) => {
      if (promise instanceof Promise || typeof promise === 'string') {
        try {
          return await promise;
        } catch (error) {
          logService.error('RetryService', `Operation ${operation} timed out`, error as Error);
          throw error;
        }
      }
      return promise;
    })
  },
  DEFAULT_RETRYABLE_ERRORS: ['network-error', 'timeout']
}));

describe('TokenService', () => {
  let mockUser: User;
  const mockToken = 'test-token';
  const mockExpirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

  beforeEach(() => {
    vi.useFakeTimers();
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      displayName: null,
      photoURL: null,
      phoneNumber: null,
      providerId: 'password',
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: vi.fn(),
      getIdToken: vi.fn().mockResolvedValue(mockToken),
      getIdTokenResult: vi.fn().mockResolvedValue({
        token: mockToken,
        claims: {},
        signInProvider: 'password',
        signInSecondFactor: null,
        issuedAtTime: new Date().toISOString(),
        authTime: new Date().toISOString(),
        expirationTime: mockExpirationTime
      }),
      reload: vi.fn(),
      toJSON: vi.fn(),
      isAnonymous: false
    } as User;

    // Reset mocks and service
    vi.clearAllMocks();
    tokenService.cleanup();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('initialize', () => {
    it('should initialize with a user', async () => {
      await tokenService.initialize(mockUser);

      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
      expect(logService.info).toHaveBeenCalledWith(
        'TokenService',
        'Token service initialized successfully',
        expect.any(Object)
      );
    });

    it('should handle initialization with null user', async () => {
      await tokenService.initialize(null);

      expect(logService.info).toHaveBeenCalledWith(
        'TokenService',
        'Token service cleaned up due to null user'
      );
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Token error');
      vi.mocked(mockUser.getIdToken).mockRejectedValue(error);
      vi.mocked(mockUser.getIdTokenResult).mockRejectedValue(error);

      await expect(tokenService.initialize(mockUser)).rejects.toBe(error);
      
      expect(logService.error).toHaveBeenCalledWith(
        'TokenService',
        'Failed to initialize token service',
        error
      );
    });

    it('should start refresh timer after initialization', async () => {
      const mockToken1 = 'token1';
      const mockToken2 = 'token2';
      
      vi.mocked(mockUser.getIdToken)
        .mockResolvedValueOnce(mockToken1)
        .mockResolvedValueOnce(mockToken2);

      vi.mocked(mockUser.getIdTokenResult)
        .mockResolvedValue({
          token: mockToken1,
          claims: {},
          signInProvider: 'password',
          signInSecondFactor: null,
          issuedAtTime: new Date().toISOString(),
          authTime: new Date().toISOString(),
          expirationTime: mockExpirationTime
        });

      await tokenService.initialize(mockUser);
      
      // Avance le temps de 45 minutes (TOKEN_REFRESH_INTERVAL)
      await vi.advanceTimersByTimeAsync(45 * 60 * 1000);
      
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2);
    });

    it('should handle token expiration', async () => {
      const nearExpiryTime = new Date(Date.now() + 4 * 60 * 1000).toISOString();
      vi.mocked(mockUser.getIdToken).mockResolvedValue(mockToken);
      vi.mocked(mockUser.getIdTokenResult).mockResolvedValue({
        token: mockToken,
        claims: {},
        signInProvider: 'password',
        signInSecondFactor: null,
        issuedAtTime: new Date().toISOString(),
        authTime: new Date().toISOString(),
        expirationTime: nearExpiryTime
      });

      await tokenService.initialize(mockUser);

      expect(logService.warn).toHaveBeenCalledWith(
        'TokenService',
        'Token expiration approaching',
        expect.any(Object)
      );
      expect(notificationService.warning).toHaveBeenCalledWith('Votre session va bientôt expirer');
    });

    it('should handle session expired error', async () => {
      const sessionError = createAuthError(AUTH_ERROR_CODES.SESSION_EXPIRED, 'Session expired');
      vi.mocked(mockUser.getIdToken).mockRejectedValue(sessionError);
      vi.mocked(mockUser.getIdTokenResult).mockRejectedValue(sessionError);

      await expect(tokenService.initialize(mockUser)).rejects.toBe(sessionError);
      
      expect(logService.error).toHaveBeenCalledWith(
        'TokenService',
        'Failed to initialize token service',
        expect.any(Error)
      );
    });
  });
});
