import { Middleware } from 'redux';
import { AuthError } from '../errors/AuthError';
import { setAuthError } from '../store/authSlice';
import { logger } from '@/utils/logger';
import { monitoringService } from '@/utils/monitoring';

export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    // Exécuter l'action
    const result = next(action);

    // Si l'action est une promesse, gérer les erreurs async
    if (result instanceof Promise) {
      return result.catch((error: unknown) => {
        handleError(store.dispatch, error);
        throw error; // Re-throw pour la gestion d'erreur en amont
      });
    }

    return result;
  } catch (error: unknown) {
    handleError(store.dispatch, error);
    throw error; // Re-throw pour la gestion d'erreur en amont
  }
};

const handleError = (dispatch: any, error: unknown) => {
  if (error instanceof AuthError) {
    // Logger l'erreur
    logger.error('Erreur d'authentification:', {
      code: error.code,
      message: error.message,
      details: error.details
    }, error);

    // Envoyer au service de monitoring
    monitoringService.trackAuthError(error);

    // Dispatcher l'erreur dans le store
    dispatch(setAuthError({
      code: error.code,
      message: error.message
    }));
  } else if (error instanceof Error) {
    // Logger l'erreur générique
    logger.error('Erreur non gérée:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    }, error);

    // Dispatcher une erreur générique
    dispatch(setAuthError({
      code: 'AUTH_999',
      message: 'Une erreur inattendue est survenue.'
    }));
  } else {
    // Logger l'erreur inconnue
    logger.error('Erreur inconnue:', {
      error
    });

    // Dispatcher une erreur générique
    dispatch(setAuthError({
      code: 'AUTH_999',
      message: 'Une erreur inconnue est survenue.'
    }));
  }
};
