import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { RewriteFrames } from '@sentry/integrations';
import { Integrations } from '@sentry/tracing';
import { logger } from '../core/logger';

const LOG_CATEGORY = 'Sentry';

export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/tokenforge\.app/],
        }),
        new RewriteFrames(),
        new Integrations.BrowserTracing(),
      ],
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // Ne pas envoyer les erreurs en développement
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      },
    });

    logger.info(LOG_CATEGORY, 'Sentry initialized successfully');
  } else {
    logger.warn(LOG_CATEGORY, 'Sentry DSN not found, error tracking disabled');
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  logger.error(LOG_CATEGORY, 'Error captured', { error, context });
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }
};

export const setUserContext = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    email: email,
  });
};
