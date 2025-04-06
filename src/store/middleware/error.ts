import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { logger } from '@/core/logger';

/**
 * Middleware pour logger les erreurs RTK Query
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    logger.error({
      category: 'RTK Query',
      message: 'API Error',
      error: action.payload,
      endpoint: action.meta.arg.endpointName,
    });
  }

  return next(action);
}; 