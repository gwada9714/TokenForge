import { FirebaseError } from 'firebase/app';
import { Request, Response, NextFunction } from 'express';
import { Middleware } from '@reduxjs/toolkit';
import { AuthError, AuthErrorCode, handleUnknownError } from '../errors/AuthError';
import { logger, LogLevel } from '../../../utils/firebase-logger';

const LOG_CATEGORY = 'ErrorMiddleware';

// Express middleware pour gérer les erreurs d'authentification
export const handleAuthError = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(error instanceof AuthError)) {
    error = handleUnknownError(error);
  }

  let statusCode = 500;
  let errorResponse: AuthError;

  if (error instanceof AuthError) {
    errorResponse = error;
    switch (error.code) {
      case AuthErrorCode.INVALID_EMAIL:
      case AuthErrorCode.USER_NOT_FOUND:
      case AuthErrorCode.WRONG_PASSWORD:
        statusCode = 401;
        break;
      case AuthErrorCode.TOO_MANY_REQUESTS:
        statusCode = 403;
        break;
      case AuthErrorCode.EMAIL_ALREADY_IN_USE:
        statusCode = 409;
        break;
      default:
        statusCode = 500;
    }
  } else if (error instanceof FirebaseError) {
    errorResponse = new AuthError(
      AuthErrorCode.INTERNAL_ERROR,
      error.message,
      error
    );
  } else {
    errorResponse = new AuthError(
      AuthErrorCode.INTERNAL_ERROR,
      'Une erreur inattendue est survenue',
      error
    );
  }

  logger.error(`${LOG_CATEGORY}: [${req.method} ${req.path}]`, {
    code: errorResponse.code,
    message: errorResponse.message,
    originalError: error
  });

  res.status(statusCode).json({
    error: {
      code: errorResponse.code,
      message: errorResponse.message
    }
  });
};

// Express middleware pour attraper les erreurs non gérées
export const authErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (error) {
    handleAuthError(error, req, res, next);
  }
};

// Redux middleware pour la gestion des erreurs d'authentification
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Erreur Redux Auth:', { 
      error: errorMessage,
      actionType: (action as { type?: string }).type || 'unknown',
      stack
    });
    
    if (error instanceof AuthError) {
      store.dispatch({
        type: 'auth/setAuthError',
        payload: {
          code: error.code,
          message: error.message
        }
      });
    }
    
    throw error;
  }
};

export default errorMiddleware;
