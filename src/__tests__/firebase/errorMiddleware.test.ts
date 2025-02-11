import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { handleAuthError } from '../../features/auth/middleware/errorMiddleware';
import { AuthError, AuthErrorCode } from '../../features/auth/errors/AuthError';
import { logger, LogLevel } from '../../utils/firebase-logger';
import type { Mock } from 'vitest';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    locals: Record<string, unknown>;
    setHeader: ReturnType<typeof vi.fn>;
    getHeader: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  let nextFunction: Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
      headers: {
        'user-agent': 'test-agent'
      },
      query: {},
      params: {}
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
      setHeader: vi.fn().mockReturnThis(),
      getHeader: vi.fn(),
      end: vi.fn()
    };

    nextFunction = vi.fn();
    vi.spyOn(logger, 'log').mockImplementation(() => {});
  });

  it('should handle AuthError with correct status code', () => {
    const error = new AuthError(AuthErrorCode.INVALID_EMAIL);
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.INVALID_EMAIL,
        message: expect.stringContaining('INVALID_EMAIL')
      }
    });
  });

  it('should convert unknown errors to AuthError', () => {
    const error = new Error('Unknown error');
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.INTERNAL_ERROR,
        message: expect.stringContaining('INTERNAL_ERROR')
      }
    });
  });

  it('should log errors with correct level and details', () => {
    const originalError = new Error('Original error');
    const error = new AuthError(AuthErrorCode.SIGN_IN_ERROR, originalError);
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(logger.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      expect.stringContaining("Erreur d'authentification"),
      expect.objectContaining({
        code: AuthErrorCode.SIGN_IN_ERROR,
        originalError,
        path: '/test',
        method: 'GET'
      })
    );
  });

  it('should handle rate limiting errors with 403', () => {
    const error = new AuthError(AuthErrorCode.TOO_MANY_REQUESTS);
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.TOO_MANY_REQUESTS,
        message: expect.stringContaining('TOO_MANY_REQUESTS')
      }
    });
  });

  it('should handle email conflict with 409', () => {
    const error = new AuthError(AuthErrorCode.EMAIL_ALREADY_IN_USE);
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.EMAIL_ALREADY_IN_USE,
        message: expect.stringContaining('EMAIL_ALREADY_IN_USE')
      }
    });
  });

  it('should include request details in error log', () => {
    const error = new AuthError(AuthErrorCode.INVALID_OPERATION);
    
    handleAuthError(error, mockRequest as Request, mockResponse as unknown as Response, nextFunction as unknown as NextFunction);
    
    expect(logger.log).toHaveBeenCalledWith(
      LogLevel.ERROR,
      expect.stringContaining("Erreur d'authentification"),
      expect.objectContaining({
        code: AuthErrorCode.INVALID_OPERATION,
        headers: expect.objectContaining({
          'user-agent': 'test-agent'
        }),
        path: '/test',
        method: 'GET'
      })
    );
  });
});
