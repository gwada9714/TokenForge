import { useCallback } from 'react';
import { ZodError } from 'zod';
import {
  validateSessionInfo,
  validateUser,
  validateStoredAuthState,
  validateAuthState,
  validatePartialUser,
  validatePartialSessionInfo,
  type SessionInfo,
  type User,
  type StoredAuthState,
  type AuthState
} from '../schemas/auth.schema';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { logger, LogLevel } from '@/core/logger';

export const useAuthValidation = () => {
  const validateData = useCallback(<T>(
    validator: (data: unknown) => T,
    data: unknown,
    context: string
  ): T => {
    try {
      return validator(data);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.log(LogLevel.ERROR, `Erreur de validation (${context}):`, {
          errors: error.errors,
          data
        });

        throw createAuthError(
          AUTH_ERROR_CODES.INVALID_DATA,
          `Données invalides pour ${context}: ${error.errors.map(e => e.message).join(', ')}`,
          { zodErrors: error.errors }
        );
      }
      throw error;
    }
  }, []);

  const validateUserData = useCallback((data: unknown): User => {
    return validateData(validateUser, data, 'user');
  }, [validateData]);

  const validateSessionData = useCallback((data: unknown): SessionInfo => {
    return validateData(validateSessionInfo, data, 'session');
  }, [validateData]);

  const validateStoredState = useCallback((data: unknown): StoredAuthState => {
    return validateData(validateStoredAuthState, data, 'stored state');
  }, [validateData]);

  const validateCurrentState = useCallback((data: unknown): AuthState => {
    return validateData(validateAuthState, data, 'current state');
  }, [validateData]);

  const validatePartialUserData = useCallback((data: unknown): Partial<User> => {
    return validateData(validatePartialUser, data, 'partial user');
  }, [validateData]);

  const validatePartialSessionData = useCallback((data: unknown): Partial<SessionInfo> => {
    return validateData(validatePartialSessionInfo, data, 'partial session');
  }, [validateData]);

  return {
    validateUserData,
    validateSessionData,
    validateStoredState,
    validateCurrentState,
    validatePartialUserData,
    validatePartialSessionData
  };
};
