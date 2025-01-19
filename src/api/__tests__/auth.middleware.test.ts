import { Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { verifyMessage } from 'ethers';

jest.mock('ethers', () => ({
  verifyMessage: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();
    mockJson.mockClear();
    mockStatus.mockClear();
    (verifyMessage as jest.Mock).mockClear();
  });

  it('should return 401 when no authorization header', async () => {
    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'No authorization header',
    });
  });

  it('should return 401 when invalid authorization format', async () => {
    mockReq.headers = { authorization: 'Invalid Format' };

    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid authorization header format',
    });
  });

  it('should return 401 when invalid token format', async () => {
    mockReq.headers = { authorization: 'Bearer invalid.token' };

    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token format',
    });
  });

  it('should return 401 when token is expired', async () => {
    const expiredTimestamp = Date.now() - 20 * 60 * 1000; // 20 minutes ago
    mockReq.headers = {
      authorization: `Bearer 0x1234.${expiredTimestamp}.signature`,
    };

    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired',
    });
  });

  it('should return 401 when signature is invalid', async () => {
    const timestamp = Date.now();
    const address = '0x1234567890123456789012345678901234567890';
    mockReq.headers = {
      authorization: `Bearer ${address}.${timestamp}.invalid_signature`,
    };

    (verifyMessage as jest.Mock).mockReturnValue('0x9999999999999999999999999999999999999999');

    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid signature',
    });
  });

  it('should call next() when authentication is successful', async () => {
    const timestamp = Date.now();
    const address = '0x1234567890123456789012345678901234567890';
    mockReq.headers = {
      authorization: `Bearer ${address}.${timestamp}.valid_signature`,
    };

    (verifyMessage as jest.Mock).mockReturnValue(address);

    await authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      address,
      timestamp,
    });
  });
});
