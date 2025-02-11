import { Request, Response, NextFunction } from 'express';
import { AuthError, AuthErrorCode, handleUnknownError } from '../errors/AuthError';
import { logger, LogLevel } from '../../../utils/firebase-logger';

export const handleAuthError = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(error instanceof AuthError)) {
    error = handleUnknownError(error);
  }

  const authError = error as AuthError;
  
  // Log l'erreur avec les détails appropriés
  logger.log(LogLevel.ERROR, `Erreur d'authentification: ${authError.message}`, {
    code: authError.code,
    originalError: authError.originalError,
    path: req.path,
    method: req.method,
    headers: req.headers // Ajout des headers dans les logs
  });

  // Déterminer le code HTTP approprié
  let statusCode = 500;
  switch (authError.code) {
    case AuthErrorCode.INVALID_EMAIL:
    case AuthErrorCode.WRONG_PASSWORD:
    case AuthErrorCode.USER_NOT_FOUND:
      statusCode = 401;
      break;
    case AuthErrorCode.USER_DISABLED:
    case AuthErrorCode.TOO_MANY_REQUESTS:
      statusCode = 403;
      break;
    case AuthErrorCode.EMAIL_ALREADY_IN_USE:
      statusCode = 409;
      break;
    case AuthErrorCode.OPERATION_NOT_ALLOWED:
    case AuthErrorCode.INVALID_OPERATION:
      statusCode = 400;
      break;
    case AuthErrorCode.INTERNAL_ERROR:
    default:
      statusCode = 500;
  }

  // Envoyer la réponse
  res.status(statusCode).json({
    error: {
      code: authError.code,
      message: authError.message
    }
  });
};

// Middleware pour gérer les erreurs d'authentification non attrapées
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
