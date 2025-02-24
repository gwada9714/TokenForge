import { Middleware } from '@reduxjs/toolkit';
import { BaseLogger } from '../../core/logger';

const logger = new BaseLogger('ErrorMiddleware');

export const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    logger.error('Error in Redux action', {
      action: action.type,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
