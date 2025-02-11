import { describe, it, expect, vi, beforeEach } from 'vitest';
import { securityMiddleware } from '../middleware';
import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { createPublicClient } from 'viem';
import { TokenForgeError } from '@/utils/errors';

// Mock Firebase Admin
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(),
    getUser: vi.fn()
  }))
}));

// Mock Viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn()
}));

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {}
    };

    mockNext = vi.fn();

    // Reset mocks
    vi.clearAllMocks();

    // Setup Firebase Admin mock
    vi.mocked(getAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com'
      }),
      getUser: vi.fn().mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
        customClaims: { isAdmin: false }
      })
    } as any);

    // Setup Viem mock
    vi.mocked(createPublicClient).mockReturnValue({
      getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000)),
      getBlockNumber: vi.fn().mockResolvedValue(BigInt(1000000))
    } as any);
  });

  describe('validateFirebaseToken', () => {
    it('validates a valid Firebase token', async () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token'
      };

      await securityMiddleware.validateFirebaseToken(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(getAuth().verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(mockRes.locals?.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects invalid Firebase token', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token'
      };

      vi.mocked(getAuth().verifyIdToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      await securityMiddleware.validateFirebaseToken(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it('handles missing authorization header', async () => {
      await securityMiddleware.validateFirebaseToken(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No authorization token provided' })
      );
    });
  });

  describe('validateWalletSignature', () => {
    it('validates a valid wallet signature', async () => {
      mockReq.body = {
        message: 'Test message',
        signature: '0x1234...',
        address: '0x5678...'
      };

      await securityMiddleware.validateWalletSignature(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.locals?.walletAddress).toBe('0x5678...');
      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects invalid wallet signature', async () => {
      mockReq.body = {
        message: 'Test message',
        signature: 'invalid-signature',
        address: '0x5678...'
      };

      await securityMiddleware.validateWalletSignature(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid wallet signature' })
      );
    });

    it('handles missing signature data', async () => {
      await securityMiddleware.validateWalletSignature(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Missing signature data' })
      );
    });
  });

  describe('requireAdmin', () => {
    it('allows admin users', async () => {
      mockRes.locals = {
        user: { uid: 'admin-uid' }
      };

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid: 'admin-uid',
        customClaims: { isAdmin: true }
      } as any);

      await securityMiddleware.requireAdmin(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects non-admin users', async () => {
      mockRes.locals = {
        user: { uid: 'user-uid' }
      };

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid: 'user-uid',
        customClaims: { isAdmin: false }
      } as any);

      await securityMiddleware.requireAdmin(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Admin access required' })
      );
    });
  });

  describe('rateLimit', () => {
    it('allows requests within rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        await securityMiddleware.rateLimit(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
    });

    it('blocks requests exceeding rate limit', async () => {
      for (let i = 0; i < 10; i++) {
        await securityMiddleware.rateLimit(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Too many requests' })
      );
    });
  });

  describe('validateChainId', () => {
    it('validates correct chain ID', async () => {
      mockReq.body = {
        chainId: 1 // Ethereum Mainnet
      };

      await securityMiddleware.validateChainId(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects incorrect chain ID', async () => {
      mockReq.body = {
        chainId: 999 // Invalid chain
      };

      await securityMiddleware.validateChainId(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unsupported chain ID' })
      );
    });
  });

  describe('errorHandler', () => {
    it('handles TokenForgeError correctly', () => {
      const error = new TokenForgeError('Custom error', 400);

      securityMiddleware.errorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Custom error' })
      );
    });

    it('handles unknown errors', () => {
      const error = new Error('Unknown error');

      securityMiddleware.errorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Internal server error' })
      );
    });
  });

  describe('configureServer', () => {
    it('configures security middleware correctly', () => {
      const app = {
        use: vi.fn()
      };

      securityMiddleware.configureServer(app as any);

      expect(app.use).toHaveBeenCalledTimes(6); // helmet, cors, etc.
    });
  });
});
