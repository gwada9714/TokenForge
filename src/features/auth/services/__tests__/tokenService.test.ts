import { tokenService } from '../tokenService';
import { notificationService } from '../notificationService';
import { AuthError } from '../../errors/AuthError';
import { User } from 'firebase/auth';

jest.mock('../notificationService');

describe('TokenService', () => {
  let mockUser: jest.Mocked<User>;
  
  beforeEach(() => {
    jest.useFakeTimers();
    
    // Mock de l'utilisateur Firebase
    mockUser = {
      getIdToken: jest.fn(),
      getIdTokenResult: jest.fn(),
    } as unknown as jest.Mocked<User>;

    // Reset des mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    tokenService.cleanup();
  });

  describe('initialize', () => {
    it('should initialize with user and start refresh timer', async () => {
      const token = 'mock-token';
      const expirationTime = new Date(Date.now() + 3600000).toISOString();
      
      mockUser.getIdToken.mockResolvedValue(token);
      mockUser.getIdTokenResult.mockResolvedValue({
        expirationTime,
        token,
        claims: {},
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      });

      await tokenService.initialize(mockUser);

      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(mockUser.getIdTokenResult).toHaveBeenCalled();
    });

    it('should cleanup when initialized with null user', async () => {
      await tokenService.initialize(null);
      
      const token = await tokenService.getToken().catch(e => e);
      expect(token).toBeInstanceOf(AuthError);
      expect(token.code).toBe(AuthError.CODES.SESSION_EXPIRED);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const token = 'new-token';
      const expirationTime = new Date(Date.now() + 3600000).toISOString();
      
      mockUser.getIdToken.mockResolvedValue(token);
      mockUser.getIdTokenResult.mockResolvedValue({
        expirationTime,
        token,
        claims: {},
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      });

      await tokenService.initialize(mockUser);
      
      // Avancer le temps pour déclencher un refresh
      jest.advanceTimersByTime(45 * 60 * 1000 + 1000);
      
      await Promise.resolve(); // Laisser le temps au refresh de s'exécuter
      
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('should notify when token is about to expire', async () => {
      const token = 'mock-token';
      const expirationTime = new Date(Date.now() + 4 * 60 * 1000).toISOString(); // 4 minutes
      
      mockUser.getIdToken.mockResolvedValue(token);
      mockUser.getIdTokenResult.mockResolvedValue({
        expirationTime,
        token,
        claims: {},
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      });

      await tokenService.initialize(mockUser);

      expect(notificationService.warning).toHaveBeenCalledWith(
        'Votre session va bientôt expirer'
      );
    });
  });

  describe('getToken', () => {
    it('should return valid token', async () => {
      const token = 'mock-token';
      const expirationTime = new Date(Date.now() + 3600000).toISOString();
      
      mockUser.getIdToken.mockResolvedValue(token);
      mockUser.getIdTokenResult.mockResolvedValue({
        expirationTime,
        token,
        claims: {},
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      });

      await tokenService.initialize(mockUser);
      
      const result = await tokenService.getToken();
      expect(result).toBe(token);
    });

    it('should throw when no token is available', async () => {
      await tokenService.initialize(null);
      
      await expect(tokenService.getToken()).rejects.toThrow('No token available');
    });
  });

  describe('cleanup', () => {
    it('should clear token info and stop refresh timer', async () => {
      const token = 'mock-token';
      const expirationTime = new Date(Date.now() + 3600000).toISOString();
      
      mockUser.getIdToken.mockResolvedValue(token);
      mockUser.getIdTokenResult.mockResolvedValue({
        expirationTime,
        token,
        claims: {},
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
      });

      await tokenService.initialize(mockUser);
      tokenService.cleanup();
      
      await expect(tokenService.getToken()).rejects.toThrow('No token available');
    });
  });
});
