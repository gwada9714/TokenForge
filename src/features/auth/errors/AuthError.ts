import { ErrorCode, AUTH_ERROR_CODES } from '../types';

export class AuthError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  static CODES = AUTH_ERROR_CODES;

  static create(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): AuthError {
    return new AuthError(code, message, details);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export const createAuthError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): AuthError => {
  return AuthError.create(code, message, details);
};
