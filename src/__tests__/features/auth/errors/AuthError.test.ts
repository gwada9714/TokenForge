import { describe, it, expect } from 'vitest';
import {
  AuthError,
  AuthErrorCode,
  createAuthError,
  AuthComponentNotRegisteredError,
  AuthIntegrityError
} from '../../../../features/auth/errors/AuthError';

describe('Auth Errors', () => {
  describe('AuthError', () => {
    it('should create AuthError with code and message', () => {
      const error = new AuthError(AuthErrorCode.SIGN_IN_ERROR);
      expect(error.code).toBe(AuthErrorCode.SIGN_IN_ERROR);
      expect(error.message).toContain('Authentication Error');
      expect(error.name).toBe('AuthError');
    });

    it('should store original error', () => {
      const originalError = new Error('Original error');
      const error = new AuthError(AuthErrorCode.SIGN_IN_ERROR, originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('createAuthError', () => {
    it('should create AuthError instance', () => {
      const error = createAuthError(AuthErrorCode.SIGN_IN_ERROR);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.SIGN_IN_ERROR);
    });

    it('should include original error when provided', () => {
      const originalError = new Error('Original error');
      const error = createAuthError(AuthErrorCode.SIGN_IN_ERROR, originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('AuthComponentNotRegisteredError', () => {
    it('should create error with custom message', () => {
      const message = 'Component not registered';
      const error = new AuthComponentNotRegisteredError(message);
      expect(error.message).toBe(message);
      expect(error.name).toBe('AuthComponentNotRegisteredError');
    });
  });

  describe('AuthIntegrityError', () => {
    it('should create error with custom message', () => {
      const message = 'Integrity check failed';
      const error = new AuthIntegrityError(message);
      expect(error.message).toBe(message);
      expect(error.name).toBe('AuthIntegrityError');
    });
  });

  describe('AuthErrorCode', () => {
    it('should contain all required error codes', () => {
      expect(AuthErrorCode).toHaveProperty('SIGN_IN_ERROR');
      expect(AuthErrorCode).toHaveProperty('GOOGLE_SIGN_IN_ERROR');
      expect(AuthErrorCode).toHaveProperty('CREATE_USER_ERROR');
      expect(AuthErrorCode).toHaveProperty('RESET_PASSWORD_ERROR');
      expect(AuthErrorCode).toHaveProperty('USER_NOT_FOUND');
      expect(AuthErrorCode).toHaveProperty('UPDATE_PROFILE_ERROR');
      expect(AuthErrorCode).toHaveProperty('SIGN_OUT_ERROR');
    });
  });
});
